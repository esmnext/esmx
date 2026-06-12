import fs from 'node:fs';
import path from 'node:path';
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

/** Winner of the recursive supply merge for one bare package (RFC §7). */
export interface SupplyEntry {
    provider: string;
    /** Provider's resolved installed version, null when unresolvable. */
    version: string | null;
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

function readManifestProvides(
    artifactDir: string
): Record<string, string> | null {
    // Boundary adapter: manifest absence or malformed JSON simply means
    // "no built-against data"; substitution-safety then skips (RFC Phase 3).
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
    const provides = (json as Record<string, unknown>).provides;
    if (typeof provides !== 'object' || provides === null) {
        return null;
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(provides)) {
        if (typeof value === 'string') {
            result[key] = value;
        }
    }
    return result;
}

function isWorkspacePlaceholderRange(range: string): boolean {
    return /^(workspace|file|link|portal):/.test(range);
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
    const supplyMemo = new Map<string, Record<string, SupplyEntry>>();
    const usedSupplyMemo = new Map<string, Record<string, SupplyEntry>>();
    const visiting = new Set<string>();
    /** Per-package provider candidates in merge order. */
    const candidates = new Map<string, string[]>();

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

    function recordCandidate(packageName: string, provider: string): void {
        const list = candidates.get(packageName);
        if (!list) {
            candidates.set(packageName, [provider]);
            return;
        }
        if (!list.includes(provider)) {
            list.push(provider);
        }
    }

    function supplyOf(record: PackageRecord): Record<string, SupplyEntry> {
        const memoized = supplyMemo.get(record.name);
        if (memoized) {
            return memoized;
        }
        if (visiting.has(record.name)) {
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
        let merged: Record<string, SupplyEntry> = {};
        for (const usedName of record.declaration?.uses ?? []) {
            const used = mountUsed(usedName, record);
            if (!used) {
                continue;
            }
            checkUsedVersion(record, used);
            merged = { ...merged, ...supplyOf(used) };
        }
        usedSupplyMemo.set(record.name, merged);
        const own: Record<string, SupplyEntry> = {};
        for (const provided of record.declaration?.provides ?? []) {
            own[provided] = {
                provider: record.name,
                version: resolveInstalledVersion(record.root, provided)
            };
            recordCandidate(provided, record.name);
        }
        merged = { ...merged, ...own };
        visiting.delete(record.name);
        supplyMemo.set(record.name, merged);
        return merged;
    }

    const supply = supplyOf(rootPackage);

    for (const [packageName, providers] of candidates) {
        const winner = supply[packageName]?.provider;
        if (!winner || providers.length < 2) {
            continue;
        }
        const losers = providers.filter((provider) => provider !== winner);
        if (losers.length === 0) {
            continue;
        }
        diagnostics.push({
            code: DiagnosticCode.W_MULTI_CANDIDATE,
            severity: 'warning',
            module: rootPackage.name,
            package: packageName,
            found: losers.join(', '),
            required: winner,
            message: `Package "${packageName}" has multiple providers: winner "${winner}" overrides loser(s) ${losers.map((l) => `"${l}"`).join(', ')}; the whole closure is rewired to the winner.`,
            fix: `If the winner is unintended, reorder "uses" (later entries override earlier ones) or remove the extra "provides" entry.`
        });
        validateSubstitutionSafety(packageName, winner, losers);
    }

    function validateSubstitutionSafety(
        packageName: string,
        winner: string,
        losers: string[]
    ): void {
        const winnerVersion = supply[packageName]?.version;
        const parsedWinner = winnerVersion ? parseSemver(winnerVersion) : null;
        if (!parsedWinner || !winnerVersion) {
            return;
        }
        for (const loser of losers) {
            const mount = mounts[loser];
            // Activates only when the losing provider's manifest carries
            // built-against `provides` versions (RFC Phase 3); otherwise
            // skip silently.
            const manifestProvides = mount
                ? readManifestProvides(mount.artifactDir)
                : null;
            const builtAgainst = manifestProvides?.[packageName];
            if (!builtAgainst) {
                continue;
            }
            const parsedBuilt = parseSemver(builtAgainst);
            if (!parsedBuilt) {
                continue;
            }
            if (parsedBuilt.major !== parsedWinner.major) {
                diagnostics.push({
                    code: DiagnosticCode.E_VERSION,
                    severity: 'error',
                    module: loser,
                    package: packageName,
                    check: 'substitution-safety',
                    found: winnerVersion,
                    required: `built against ${builtAgainst} (same major)`,
                    message: `Module "${loser}" was built against "${packageName}@${builtAgainst}" but its chunks are rewired onto winner "${winner}" providing ${winnerVersion} — a different major.`,
                    fix: `Align "${packageName}" majors between "${loser}" and "${winner}", or rebuild "${loser}" against the winner's version.`
                });
            }
        }
    }

    // Intent check: the winner's resolved version must satisfy every
    // layer's dependencies ∪ peerDependencies range for the package.
    for (const record of records.values()) {
        for (const [packageName, entry] of Object.entries(supply)) {
            if (!entry.version) {
                continue;
            }
            const range =
                record.dependencies[packageName] ??
                record.peerDependencies[packageName];
            if (range === undefined || isWorkspacePlaceholderRange(range)) {
                continue;
            }
            const satisfied = satisfiesRange(entry.version, range);
            if (satisfied === false) {
                diagnostics.push({
                    code: DiagnosticCode.E_VERSION,
                    severity: 'error',
                    module: record.name,
                    package: packageName,
                    check: 'intent',
                    found: entry.version,
                    required: range,
                    message: `Layer "${record.name}" declares "${packageName}@${range}" but the elected winner "${entry.provider}" resolves ${entry.version}.`,
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
            if (!entry.version) {
                continue;
            }
            if (!(packageName in record.devDependencies)) {
                continue;
            }
            const localVersion = resolveInstalledVersion(
                record.root,
                packageName
            );
            if (localVersion && localVersion !== entry.version) {
                diagnostics.push({
                    code: DiagnosticCode.W_TYPE_DRIFT,
                    severity: 'warning',
                    module: record.name,
                    package: packageName,
                    found: localVersion,
                    required: entry.version,
                    message: `Layer "${record.name}" types against its local "${packageName}@${localVersion}" but the code runs on the elected winner's ${entry.version}.`,
                    fix: `Align the "${packageName}" devDependencies copy in "${record.name}" with the winner's version ${entry.version}.`
                });
            }
        }
    }

    return { supply, mounts, diagnostics };
}
