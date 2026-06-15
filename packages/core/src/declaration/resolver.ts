import fs from 'node:fs';
import path from 'node:path';
import { MANIFEST_PROTOCOL_VERSION } from '../manifest-json';
import type { PackageRecord, ReadDeclarationResult } from './reader';
import { readPackageRecord } from './reader';
import { parseSemver, satisfiesRange } from './semver';
import { type Diagnostic, DiagnosticCode } from './types';

/** A resolved mount-table entry (RFC §6). */
export interface ResolvedMount {
    name: string;
    /** Package root directory (realpath'd for auto-mounts). */
    root: string;
    /** Artifact directory, `<root>/dist` for auto-mounts. */
    artifactDir: string;
    /** Whether `dist/client/manifest.json` exists. */
    built: boolean;
}

/**
 * Winner of the recursive supply merge for one (package, major) group
 * (RFC §7, per-major amendment): elections are keyed by the MAJOR of the
 * provider's resolved version, so coexisting majors are isolated islands,
 * each with its own winner.
 */
export interface SupplyGroup {
    /** Major of the group's resolved version; 'unknown' when unresolvable. */
    major: number | 'unknown';
    provider: string;
    /** Provider's resolved installed version, null when unresolvable. */
    version: string | null;
}

/** Per-package election result: one winner per major group. */
export interface SupplyEntry {
    /** Group winners, highest major first ('unknown' last). */
    groups: SupplyGroup[];
}

export interface ResolveMountsResult {
    supply: Record<string, SupplyEntry>;
    mounts: Record<string, ResolvedMount>;
    diagnostics: Diagnostic[];
}

export interface ResolverEnvLinks {
    [moduleName: string]: string;
}

/** Walks up from `fromDir` through node_modules, Node-resolution style. */
function resolvePackageDir(fromDir: string, name: string): string | null {
    let dir = path.resolve(fromDir);
    for (;;) {
        const candidate = path.join(dir, 'node_modules', name);
        if (fs.existsSync(path.join(candidate, 'package.json'))) {
            return candidate;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return null;
        }
        dir = parent;
    }
}

function resolveInstalledVersion(
    fromDir: string,
    packageName: string
): string | null {
    const packageDir = resolvePackageDir(fromDir, packageName);
    if (!packageDir) {
        return null;
    }
    const record = readPackageRecord(packageDir);
    return record && record.version !== '' ? record.version : null;
}

interface ManifestInfo {
    /** Manifest protocol version; absent in pre-v2 manifests → 1. */
    protocol: number;
}

function readManifestInfo(artifactDir: string): ManifestInfo | null {
    // Boundary adapter: read only the manifest protocol version (the linker
    // rejects manifests newer than itself, §5). Absence or malformed JSON
    // means "no protocol info"; the caller skips the check.
    let json: unknown;
    try {
        json = JSON.parse(
            fs.readFileSync(
                path.join(artifactDir, 'client/manifest.json'),
                'utf-8'
            )
        );
    } catch {
        return null;
    }
    if (typeof json !== 'object' || json === null) {
        return null;
    }
    const manifest = json as Record<string, unknown>;
    const protocol =
        typeof manifest.protocol === 'number' ? manifest.protocol : 1;
    return { protocol };
}

function isWorkspacePlaceholderRange(range: string): boolean {
    return /^(workspace|file|link|portal):/.test(range);
}

/** Group winner before final shaping into SupplyGroup. */
interface GroupWinner {
    provider: string;
    version: string | null;
}

/** pkg → majorKey ('2', '3', 'unknown') → elected winner of that group. */
type GroupedSupply = Record<string, Record<string, GroupWinner>>;

function majorKeyOf(version: string | null): string {
    const parsed = version ? parseSemver(version) : null;
    return parsed ? String(parsed.major) : 'unknown';
}

/** Numeric majors descending, 'unknown' last. */
function sortedMajorKeys(groups: Record<string, GroupWinner>): string[] {
    return Object.keys(groups).sort((a, b) => {
        if (a === 'unknown') {
            return 1;
        }
        if (b === 'unknown') {
            return -1;
        }
        return Number(b) - Number(a);
    });
}

/**
 * Single-owner merge (RFC §7): a given (package, major) may have exactly ONE
 * provider in the closure. Merging a second, DISTINCT provider for the same
 * (package, major) is a conflict reported via `onConflict` (the caller emits
 * E_DUP_PROVIDER); the existing owner is kept so resolution stays
 * deterministic while the error gates the build. The SAME provider reaching
 * via multiple paths (diamonds) is not a conflict — identity is compared.
 */
function mergeGrouped(
    into: GroupedSupply,
    from: GroupedSupply,
    onConflict: (
        packageName: string,
        majorKey: string,
        existing: string,
        incoming: string
    ) => void
): void {
    for (const [packageName, groups] of Object.entries(from)) {
        const target = into[packageName] ?? (into[packageName] = {});
        for (const [majorKey, winner] of Object.entries(groups)) {
            const existing = target[majorKey];
            if (existing) {
                if (existing.provider !== winner.provider) {
                    onConflict(
                        packageName,
                        majorKey,
                        existing.provider,
                        winner.provider
                    );
                }
                continue;
            }
            target[majorKey] = winner;
        }
    }
}

/**
 * Consumer-side group selection (RFC §7, per-major amendment): the group
 * whose winner satisfies `range`; multiple satisfying groups → highest
 * major; no range (or a workspace placeholder) → highest major group;
 * range satisfied by no group → highest major group (the caller diagnoses
 * the violation as E_VERSION). Groups whose version cannot be checked
 * against the range (unparsable either side) rank after satisfying groups
 * but before violating ones, per the RFC §11 skip-the-gate rule.
 */
export function selectSupplyGroup(
    entry: SupplyEntry,
    range?: string
): SupplyGroup | null {
    if (entry.groups.length === 0) {
        return null;
    }
    if (range === undefined || isWorkspacePlaceholderRange(range)) {
        return entry.groups[0];
    }
    let unknownFallback: SupplyGroup | null = null;
    for (const group of entry.groups) {
        const satisfied = group.version
            ? satisfiesRange(group.version, range)
            : null;
        if (satisfied === true) {
            return group;
        }
        if (satisfied === null && unknownFallback === null) {
            unknownFallback = group;
        }
    }
    return unknownFallback ?? entry.groups[0];
}

/**
 * Resolves the mount table and the recursive supply merge for a root
 * module's declaration (RFC §6 + §7 phases 1–2).
 *
 * - `envLinks` entries override auto-mounting; their values follow today's
 *   `ModuleConfig.links` semantics (artifact directory, resolved relative
 *   to `rootDir`).
 * - Auto-mounts resolve via Node resolution from the DECLARING module's
 *   own location and are realpath'd once.
 */
export function resolveMounts(
    rootDir: string,
    rootPackage: ReadDeclarationResult,
    envLinks?: ResolverEnvLinks
): ResolveMountsResult {
    const diagnostics: Diagnostic[] = [...rootPackage.diagnostics];
    const mounts: Record<string, ResolvedMount> = {};
    const records = new Map<string, PackageRecord>([
        [rootPackage.name, rootPackage]
    ]);
    const supplyMemo = new Map<string, GroupedSupply>();
    const usedSupplyMemo = new Map<string, GroupedSupply>();
    const visiting = new Set<string>();
    // A uses cycle makes the merge result order-dependent (which member the
    // traversal enters first decides the winner). RFC P3 forbids emitting an
    // arbitrary-but-usable artifact alongside an error, so a cycle hard-stops
    // resolution: supply is withheld and only the E_CYCLE error remains,
    // which fails the build instead of wiring a coin-flip.
    let cyclic = false;
    /** De-dupes E_DUP_PROVIDER so one conflict is reported once. */
    const reportedDupes = new Set<string>();

    function reportDupProvider(
        consumer: string,
        packageName: string,
        majorKey: string,
        existing: string,
        incoming: string
    ): void {
        const key = `${packageName}@${majorKey}`;
        if (reportedDupes.has(key)) {
            return;
        }
        reportedDupes.add(key);
        diagnostics.push({
            code: DiagnosticCode.E_DUP_PROVIDER,
            severity: 'error',
            module: consumer,
            package: packageName,
            found: `${existing}, ${incoming}`,
            message: `Package "${packageName}" (major ${majorKey}) is provided by both "${existing}" and "${incoming}" in the closure of "${consumer}" — a shared dependency must have a single owner.`,
            fix: `Consolidate "${packageName}" into one shared module that both consume via "uses", or give one copy a distinct package identity (an npm alias provided under its own name) if same-major coexistence is intended.`
        });
    }

    function mountUsed(
        name: string,
        consumer: PackageRecord
    ): PackageRecord | null {
        const known = records.get(name);
        if (known) {
            return known;
        }
        let packageRoot: string | null = null;
        let artifactDir: string | null = null;
        const envLink = envLinks?.[name];
        if (envLink !== undefined) {
            artifactDir = path.isAbsolute(envLink)
                ? envLink
                : path.resolve(rootDir, envLink);
            packageRoot = path.dirname(artifactDir);
        } else {
            const resolved = resolvePackageDir(consumer.root, name);
            if (resolved) {
                packageRoot = fs.realpathSync(resolved);
                artifactDir = path.join(packageRoot, 'dist');
            }
        }
        const record = packageRoot ? readPackageRecord(packageRoot) : null;
        if (!record || !artifactDir || !packageRoot) {
            diagnostics.push({
                code: DiagnosticCode.E_NOT_LINKED,
                severity: 'error',
                module: consumer.name,
                package: name,
                message: `Module "${consumer.name}" uses "${name}" but it is absent from the mount table (not installed and no explicit link).`,
                fix: `Install "${name}" into node_modules, or add an explicit links entry pointing at its artifact directory.`
            });
            return null;
        }
        diagnostics.push(...record.diagnostics);
        const built = fs.existsSync(
            path.join(artifactDir, 'client/manifest.json')
        );
        if (!built) {
            diagnostics.push({
                code: DiagnosticCode.E_NOT_BUILT,
                severity: 'error',
                module: consumer.name,
                package: name,
                message: `Module "${name}" is mounted at ${artifactDir} but has no built artifact (dist/client/manifest.json missing). Manifest-dependent checks are skipped.`,
                fix: `Build "${name}" first, then rebuild "${consumer.name}".`
            });
        } else {
            // RFC §5: the linker rejects manifests whose protocol is HIGHER
            // than its own — a newer toolchain produced facts this resolver
            // cannot interpret.
            const info = readManifestInfo(artifactDir);
            if (info && info.protocol > MANIFEST_PROTOCOL_VERSION) {
                diagnostics.push({
                    code: DiagnosticCode.E_PROTOCOL,
                    severity: 'error',
                    module: consumer.name,
                    package: name,
                    found: String(info.protocol),
                    required: `<= ${MANIFEST_PROTOCOL_VERSION}`,
                    message: `Module "${name}" was built with manifest protocol ${info.protocol}, but this linker supports up to ${MANIFEST_PROTOCOL_VERSION}.`,
                    fix: `Upgrade esmx in "${consumer.name}", or rebuild "${name}" with a toolchain emitting protocol <= ${MANIFEST_PROTOCOL_VERSION}.`
                });
            }
        }
        mounts[name] = { name, root: packageRoot, artifactDir, built };
        records.set(name, record);
        return record;
    }

    function checkUsedVersion(
        consumer: PackageRecord,
        used: PackageRecord
    ): void {
        const range =
            consumer.dependencies[used.name] ??
            consumer.peerDependencies[used.name];
        if (range === undefined || isWorkspacePlaceholderRange(range)) {
            return;
        }
        // Private/workspace placeholder versions skip the gate (RFC §11).
        if (used.private) {
            return;
        }
        const satisfied = satisfiesRange(used.version, range);
        if (satisfied === false) {
            diagnostics.push({
                code: DiagnosticCode.E_VERSION,
                severity: 'error',
                module: consumer.name,
                package: used.name,
                check: 'intent',
                found: used.version,
                required: range,
                message: `Module "${consumer.name}" requires "${used.name}@${range}" but the mounted module is version ${used.version}.`,
                fix: `Update the "${used.name}" range in "${consumer.name}" dependencies, or mount a matching version.`
            });
        }
    }

    function supplyOf(record: PackageRecord): GroupedSupply {
        const memoized = supplyMemo.get(record.name);
        if (memoized) {
            return memoized;
        }
        if (visiting.has(record.name)) {
            cyclic = true;
            diagnostics.push({
                code: DiagnosticCode.E_CYCLE,
                severity: 'error',
                module: record.name,
                message: `The uses chain revisits module "${record.name}" — a uses cycle is an architecture error.`,
                fix: `Break the cycle by removing one of the "uses" edges that closes it.`
            });
            return {};
        }
        visiting.add(record.name);
        const onConflict = (
            packageName: string,
            majorKey: string,
            existing: string,
            incoming: string
        ) =>
            reportDupProvider(
                record.name,
                packageName,
                majorKey,
                existing,
                incoming
            );
        const fromUses: GroupedSupply = {};
        for (const usedName of record.declaration?.uses ?? []) {
            const used = mountUsed(usedName, record);
            if (!used) {
                continue;
            }
            checkUsedVersion(record, used);
            mergeGrouped(fromUses, supplyOf(used), onConflict);
        }
        usedSupplyMemo.set(record.name, fromUses);
        const merged: GroupedSupply = {};
        mergeGrouped(merged, fromUses, onConflict);
        // Self-provides layer on top — but a sibling already owning this
        // (package, major) is a single-owner conflict, not a self-override.
        for (const provided of record.declaration?.provides ?? []) {
            const version = resolveInstalledVersion(record.root, provided);
            const majorKey = majorKeyOf(version);
            const existing = merged[provided]?.[majorKey];
            if (existing && existing.provider !== record.name) {
                reportDupProvider(
                    record.name,
                    provided,
                    majorKey,
                    existing.provider,
                    record.name
                );
                continue;
            }
            merged[provided] = {
                ...merged[provided],
                [majorKey]: { provider: record.name, version }
            };
        }
        visiting.delete(record.name);
        supplyMemo.set(record.name, merged);
        return merged;
    }

    // A1 (root-only): the module's own declared entry/exports target files
    // must exist on disk — a build-free authoring check that catches typo'd
    // or renamed paths before the build does. Root-only because mounted deps
    // ship dist (not src), so their `./src/*` targets are legitimately absent.
    // Fork sides set to `false` are skipped.
    const targetChecks: Array<[string, string]> = [];
    const rootEntry = rootPackage.declaration.entry;
    if (rootEntry?.client) {
        targetChecks.push(['entry.client', rootEntry.client]);
    }
    if (rootEntry?.server) {
        targetChecks.push(['entry.server', rootEntry.server]);
    }
    for (const [name, value] of Object.entries(
        rootPackage.declaration.exports ?? {}
    )) {
        if (typeof value === 'string') {
            targetChecks.push([`exports['${name}']`, value]);
        } else {
            if (typeof value.client === 'string') {
                targetChecks.push([`exports['${name}'].client`, value.client]);
            }
            if (typeof value.server === 'string') {
                targetChecks.push([`exports['${name}'].server`, value.server]);
            }
        }
    }
    for (const [label, relativePath] of targetChecks) {
        if (!fs.existsSync(path.resolve(rootPackage.root, relativePath))) {
            diagnostics.push({
                code: DiagnosticCode.E_TARGET_MISSING,
                severity: 'error',
                module: rootPackage.name,
                found: relativePath,
                message: `Declared ${label} target "${relativePath}" does not exist in module "${rootPackage.name}".`,
                fix: `Create the file, or fix the path in the "esmx" declaration.`
            });
        }
    }

    const groupedSupply = supplyOf(rootPackage);
    // Cycle hard-stop (RFC P3): the supply table built during a cyclic walk
    // is a function of traversal order, not of declarations. Withhold it so no
    // caller can wire on an arbitrary result; the E_CYCLE error in
    // `diagnostics` fails the build.
    if (cyclic) {
        return { supply: {}, mounts, diagnostics };
    }
    const supply: Record<string, SupplyEntry> = {};
    for (const [packageName, groups] of Object.entries(groupedSupply)) {
        supply[packageName] = {
            groups: sortedMajorKeys(groups).map((majorKey) => ({
                major: majorKey === 'unknown' ? 'unknown' : Number(majorKey),
                provider: groups[majorKey].provider,
                version: groups[majorKey].version
            }))
        };
    }

    // W_MULTI_MAJOR: informational visibility for same-name multi-major
    // coexistence — never an error, cross-major rewiring cannot happen.
    for (const [packageName, entry] of Object.entries(supply)) {
        if (entry.groups.length < 2) {
            continue;
        }
        const summary = entry.groups
            .map(
                (group) =>
                    `${group.major} → "${group.provider}"@${group.version ?? 'unresolved'}`
            )
            .join(', ');
        diagnostics.push({
            code: DiagnosticCode.W_MULTI_MAJOR,
            severity: 'warning',
            module: rootPackage.name,
            package: packageName,
            found: summary,
            message: `Package "${packageName}" has coexisting major versions: ${summary}. Each major is an isolated island with its own winner; every consumer wires to the group satisfying its own range.`,
            fix: `No action needed if coexistence is intended. Otherwise align the providers' installed "${packageName}" majors.`
        });
    }

    /**
     * The group a layer wires to: a module providing the package itself
     * runs on (and wires to) its own major group — instance consistency,
     * RFC §4.1 — otherwise its dependencies ∪ peerDependencies range
     * selects the satisfying group.
     */
    function wiredGroupFor(
        record: PackageRecord,
        packageName: string,
        entry: SupplyEntry
    ): SupplyGroup | null {
        if (record.declaration?.provides?.includes(packageName)) {
            const selfKey = majorKeyOf(
                resolveInstalledVersion(record.root, packageName)
            );
            const own = entry.groups.find(
                (group) => String(group.major) === selfKey
            );
            if (own) {
                return own;
            }
        }
        const range =
            record.dependencies[packageName] ??
            record.peerDependencies[packageName];
        return selectSupplyGroup(entry, range);
    }

    // Intent check: the wired group winner's resolved version must satisfy
    // each layer's dependencies ∪ peerDependencies range for the package —
    // validated against the group the layer wires to, never an unrelated
    // major.
    for (const record of records.values()) {
        for (const [packageName, entry] of Object.entries(supply)) {
            const range =
                record.dependencies[packageName] ??
                record.peerDependencies[packageName];
            if (range === undefined || isWorkspacePlaceholderRange(range)) {
                continue;
            }
            const group = wiredGroupFor(record, packageName, entry);
            if (!group?.version) {
                continue;
            }
            const satisfied = satisfiesRange(group.version, range);
            if (satisfied === false) {
                diagnostics.push({
                    code: DiagnosticCode.E_VERSION,
                    severity: 'error',
                    module: record.name,
                    package: packageName,
                    check: 'intent',
                    found: group.version,
                    required: range,
                    message: `Layer "${record.name}" declares "${packageName}@${range}" but its wired group winner "${group.provider}" resolves ${group.version}.`,
                    fix: `Update the "${packageName}" range in "${record.name}", or change the winning provider's installed version.`
                });
            }
        }
    }

    // W_NO_RANGE: a layer whose uses subtree supplies a package it declares
    // no range for, in dependencies ∪ peerDependencies ∪ devDependencies.
    for (const record of records.values()) {
        const usedSupply = usedSupplyMemo.get(record.name);
        if (!usedSupply) {
            continue;
        }
        for (const packageName of Object.keys(usedSupply)) {
            const hasRange =
                packageName in record.dependencies ||
                packageName in record.peerDependencies ||
                packageName in record.devDependencies;
            if (hasRange) {
                continue;
            }
            diagnostics.push({
                code: DiagnosticCode.W_NO_RANGE,
                severity: 'warning',
                module: record.name,
                package: packageName,
                message: `Layer "${record.name}" receives "${packageName}" from its uses chain but declares no version range for it.`,
                fix: `Add "${packageName}" to "${record.name}" dependencies or peerDependencies with the intended range.`
            });
        }
    }

    // W_TYPE_DRIFT: a layer's local devDependencies copy (its types source)
    // diverges from the elected winner's resolved version.
    for (const record of records.values()) {
        for (const [packageName, entry] of Object.entries(supply)) {
            if (!(packageName in record.devDependencies)) {
                continue;
            }
            const group = wiredGroupFor(record, packageName, entry);
            if (!group?.version) {
                continue;
            }
            const localVersion = resolveInstalledVersion(
                record.root,
                packageName
            );
            if (localVersion && localVersion !== group.version) {
                diagnostics.push({
                    code: DiagnosticCode.W_TYPE_DRIFT,
                    severity: 'warning',
                    module: record.name,
                    package: packageName,
                    found: localVersion,
                    required: group.version,
                    message: `Layer "${record.name}" types against its local "${packageName}@${localVersion}" but the code runs on the wired group winner's ${group.version}.`,
                    fix: `Align the "${packageName}" devDependencies copy in "${record.name}" with the winner's version ${group.version}.`
                });
            }
        }
    }

    return { supply, mounts, diagnostics };
}
