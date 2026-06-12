import fs from 'node:fs';
import path from 'node:path';
import { styleText } from 'node:util';

import {
    type ModuleConfig,
    type ModuleConfigExportObjectValue,
    type ParsedModuleConfig,
    parsedExportValue,
    parseModuleConfig
} from '../module-config';
import { lowerDeclaration } from './lower';
import type { ReadDeclarationResult } from './reader';
import { readDeclaration, readPackageRecord } from './reader';
import { resolveMounts } from './resolver';
import type {
    Diagnostic,
    EsmxDeclaration,
    EsmxDeclarationEntry,
    EsmxDeclarationExportFork,
    EsmxDeclarationExportValue
} from './types';

const FORK_SIDES = ['client', 'server'] as const;

const DEFAULT_ENTRY = {
    client: './src/entry.client.ts',
    server: './src/entry.server.ts'
} as const;

/** Legacy `modules` keys that are protocol facts (mirrors index.ts). */
const PROTOCOL_KEYS = ['lib', 'imports', 'exports', 'scopes'] as const;

export interface MigrateDifference {
    path: string;
    legacy: unknown;
    migrated: unknown;
}

export interface BuildDeclarationResult {
    declaration: EsmxDeclaration;
    warnings: string[];
    notes: string[];
}

export interface MigrateOutcome {
    written: boolean;
    declaration: EsmxDeclaration | null;
    warnings: string[];
    notes: string[];
    parity: 'exact' | 'mismatch';
    differences: MigrateDifference[];
    error?: string;
}

function mapExportFile(
    context: string,
    value: string,
    warnings: string[]
): string | null {
    const parsed = parsedExportValue(value);
    if (parsed.pkg) {
        warnings.push(
            `${context}: "pkg:" values inside object exports cannot be expressed in a declaration; ` +
                `declare the package in "provides" by hand.`
        );
        return null;
    }
    if (parsed.file.startsWith('./')) {
        return parsed.file;
    }
    warnings.push(
        `${context}: value ${JSON.stringify(value)} does not resolve to a "./" relative source file; ` +
            `declarations require relative source paths — migrate by hand.`
    );
    return null;
}

function mapObjectExportValue(
    name: string,
    value: ModuleConfigExportObjectValue,
    warnings: string[]
): EsmxDeclarationExportValue | null {
    if (typeof value === 'string') {
        return mapExportFile(`exports["${name}"]`, value, warnings);
    }
    const fork: EsmxDeclarationExportFork = {};
    for (const side of FORK_SIDES) {
        const sideValue = value[side];
        if (sideValue === undefined) {
            warnings.push(
                `exports["${name}"].${side} is absent: the legacy parser falls back to the export ` +
                    `name as the file path, but a declaration disables the absent side — review.`
            );
            continue;
        }
        if (sideValue === false) {
            fork[side] = false;
            continue;
        }
        if (sideValue === true) {
            warnings.push(
                `exports["${name}"].${side}: true means "use the export name as the path" in legacy ` +
                    `config and cannot be expressed in a declaration — declare an explicit "./" source path by hand.`
            );
            continue;
        }
        const mapped = mapExportFile(
            `exports["${name}"].${side}`,
            sideValue,
            warnings
        );
        if (mapped !== null) {
            fork[side] = mapped;
        }
    }
    return fork;
}

/**
 * Inverse-maps a legacy `modules` config (entry.node.ts) to an RFC 0001
 * package.json `esmx` declaration. Public export names are preserved
 * exactly ('root:src/routes.ts' → "./src/routes": "./src/routes.ts") so
 * consumer import sites keep working; logical renames are a human decision.
 */
export function buildDeclaration(
    modules: ModuleConfig,
    entryFiles: { client: boolean; server: boolean }
): BuildDeclarationResult {
    const warnings: string[] = [];
    const notes: string[] = [];
    const declaration: EsmxDeclaration = {};

    if (modules.lib) {
        notes.push('lib: true → declaration omits "entry" (library module).');
    } else {
        const entry: EsmxDeclarationEntry = { ...DEFAULT_ENTRY };
        declaration.entry = entry;
        for (const side of FORK_SIDES) {
            if (!entryFiles[side]) {
                warnings.push(
                    `src/entry.${side}.ts not found; the legacy default exports assumed it. ` +
                        `Declared "${DEFAULT_ENTRY[side]}" anyway — verify the file exists before building.`
                );
            }
        }
    }

    const provides: string[] = [];
    const exportsMap: Record<string, EsmxDeclarationExportValue> = {};
    for (const item of modules.exports ?? []) {
        if (typeof item === 'string') {
            const parsed = parsedExportValue(item);
            if (parsed.pkg) {
                provides.push(parsed.name);
                continue;
            }
            if (item.startsWith('root:')) {
                exportsMap[`./${parsed.name}`] = parsed.file;
                continue;
            }
            warnings.push(
                `exports entry ${JSON.stringify(item)} has no pkg:/root: prefix and cannot be ` +
                    `migrated automatically; declare it by hand in "esmx.exports".`
            );
            continue;
        }
        for (const [name, value] of Object.entries(item)) {
            const mapped = mapObjectExportValue(name, value, warnings);
            if (mapped !== null) {
                exportsMap[`./${name}`] = mapped;
            }
        }
    }
    if (provides.length > 0) {
        declaration.provides = provides;
    }
    if (Object.keys(exportsMap).length > 0) {
        declaration.exports = exportsMap;
    }

    const linkNames = Object.keys(modules.links ?? {});
    if (linkNames.length > 0) {
        declaration.uses = linkNames;
        notes.push(
            'every links key was added to "uses" (consuming is why you link; over-declared uses ' +
                'only widen the merged supply table, which is harmless). links stays in entry.node.ts ' +
                'as an environment fact.'
        );
    }

    for (const [spec, target] of Object.entries(modules.imports ?? {})) {
        if (typeof target !== 'string') {
            warnings.push(
                `imports["${spec}"] uses a per-environment mapping (${JSON.stringify(target)}); ` +
                    `declarations cannot express env-forked imports — migrate by hand.`
            );
            continue;
        }
        const provider = linkNames.find((name) => target === `${name}/${spec}`);
        if (provider) {
            notes.push(
                `imports["${spec}"] dropped: derived from provider "${provider}" by the supply ` +
                    `merge (the provider must declare "${spec}" in its "provides" — migrate providers first).`
            );
            continue;
        }
        const prefixProvider = linkNames.find((name) =>
            target.startsWith(`${name}/`)
        );
        if (prefixProvider) {
            warnings.push(
                `imports["${spec}"] maps to "${target}": provider "${prefixProvider}" is linked but ` +
                    `the target subpath differs from the bare specifier; the supply merge can only ` +
                    `derive "${prefixProvider}/${spec}" — manual attention required.`
            );
        } else {
            warnings.push(
                `imports["${spec}"] maps to "${target}" whose provider is not in links; ` +
                    `cannot migrate automatically — manual attention required.`
            );
        }
    }

    if (modules.scopes !== undefined) {
        warnings.push(
            'scopes cannot be migrated automatically (declarations have no scopes vocabulary; ' +
                'per-module isolation is derived). The scopes entries were NOT written — migrate by hand.'
        );
    }

    return { declaration, warnings, notes };
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (
        typeof a !== 'object' ||
        typeof b !== 'object' ||
        a === null ||
        b === null
    ) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    return aKeys.every((key) =>
        deepEqual(
            (a as Record<string, unknown>)[key],
            (b as Record<string, unknown>)[key]
        )
    );
}

const LINK_PATH_FIELDS = [
    'client',
    'clientManifestJson',
    'server',
    'serverManifestJson'
] as const;

export interface CompareParsedConfigsResult {
    differences: MigrateDifference[];
    notes: string[];
}

/**
 * Deep-compares two parsed configs for migration parity. Additional supply
 * wiring on the migrated side (extra imports / scope entries derived from
 * the merge, extra auto-mounted links) is tolerated and reported as notes:
 * the externalization predicates are pure membership tests, so extra
 * entries are harmless. Everything else must match exactly.
 */
export function compareParsedConfigs(
    legacy: ParsedModuleConfig,
    migrated: ParsedModuleConfig
): CompareParsedConfigsResult {
    const differences: MigrateDifference[] = [];
    const notes: string[] = [];

    if (legacy.lib !== migrated.lib) {
        differences.push({
            path: 'lib',
            legacy: legacy.lib,
            migrated: migrated.lib
        });
    }

    for (const [name, link] of Object.entries(legacy.links)) {
        const other = migrated.links[name];
        if (!other) {
            differences.push({
                path: `links.${name}`,
                legacy: link.root,
                migrated: undefined
            });
            continue;
        }
        for (const field of LINK_PATH_FIELDS) {
            if (link[field] !== other[field]) {
                differences.push({
                    path: `links.${name}.${field}`,
                    legacy: link[field],
                    migrated: other[field]
                });
            }
        }
    }
    for (const name of Object.keys(migrated.links)) {
        if (!(name in legacy.links)) {
            notes.push(
                `link "${name}" is newly auto-mounted by the resolver (transitive uses); harmless.`
            );
        }
    }

    for (const env of FORK_SIDES) {
        const legacyEnv = legacy.environments[env];
        const migratedEnv = migrated.environments[env];

        const exportNames = new Set([
            ...Object.keys(legacyEnv.exports),
            ...Object.keys(migratedEnv.exports)
        ]);
        for (const name of exportNames) {
            if (
                !deepEqual(legacyEnv.exports[name], migratedEnv.exports[name])
            ) {
                differences.push({
                    path: `environments.${env}.exports.${name}`,
                    legacy: legacyEnv.exports[name],
                    migrated: migratedEnv.exports[name]
                });
            }
        }

        const extraImports = new Set<string>();
        for (const [key, value] of Object.entries(legacyEnv.imports)) {
            if (migratedEnv.imports[key] !== value) {
                differences.push({
                    path: `environments.${env}.imports.${key}`,
                    legacy: value,
                    migrated: migratedEnv.imports[key]
                });
            }
        }
        for (const [key, value] of Object.entries(migratedEnv.imports)) {
            if (!(key in legacyEnv.imports)) {
                extraImports.add(key);
                notes.push(
                    `environments.${env}.imports.${key} = "${value}" is additional supply wiring ` +
                        `derived from the merge; harmless (externalization is a membership test).`
                );
            }
        }

        const scopeNames = new Set([
            ...Object.keys(legacyEnv.scopes),
            ...Object.keys(migratedEnv.scopes)
        ]);
        for (const scope of scopeNames) {
            const legacyScope = legacyEnv.scopes[scope] ?? {};
            const migratedScope = migratedEnv.scopes[scope] ?? {};
            const keys = new Set([
                ...Object.keys(legacyScope),
                ...Object.keys(migratedScope)
            ]);
            for (const key of keys) {
                const legacyValue = legacyScope[key];
                const migratedValue = migratedScope[key];
                if (legacyValue === migratedValue) {
                    continue;
                }
                if (
                    legacyValue === undefined &&
                    scope === '' &&
                    extraImports.has(key)
                ) {
                    continue;
                }
                differences.push({
                    path: `environments.${env}.scopes.${scope || "''"}.${key}`,
                    legacy: legacyValue,
                    migrated: migratedValue
                });
            }
        }
    }

    return { differences, notes };
}

/**
 * Inserts (or replaces) the `esmx` field right after "version" (falling
 * back to the end), preserving the file's key order, detected indentation
 * and trailing newline.
 */
export function spliceEsmxField(
    raw: string,
    declaration: EsmxDeclaration
): string {
    const json = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    let inserted = false;
    for (const [key, value] of Object.entries(json)) {
        if (key === 'esmx') {
            continue;
        }
        next[key] = value;
        if (key === 'version') {
            next.esmx = declaration;
            inserted = true;
        }
    }
    if (!inserted) {
        next.esmx = declaration;
    }
    const indent = raw.match(/\n([ \t]+)"/)?.[1] ?? '    ';
    return (
        JSON.stringify(next, null, indent) + (raw.endsWith('\n') ? '\n' : '')
    );
}

export interface MigrateModuleOptions {
    dryRun: boolean;
}

/**
 * Migrates a module's legacy `modules` config to a package.json `esmx`
 * declaration, then verifies parity in-process: the written declaration is
 * resolved (with the original legacy links as envLinks), lowered back to
 * the internal ModuleConfig IR, and both configs are run through
 * `parseModuleConfig` and deep-compared. On mismatch the original
 * package.json is restored — never a broken half-migration.
 */
export function migrateModule(
    rootDir: string,
    modules: ModuleConfig | undefined,
    options: MigrateModuleOptions
): MigrateOutcome {
    const record = readPackageRecord(rootDir);
    if (!record) {
        return {
            written: false,
            declaration: null,
            warnings: [],
            notes: [],
            parity: 'mismatch',
            differences: [],
            error: `No readable package.json at ${rootDir}.`
        };
    }
    const legacyModules = modules ?? {};
    const entryFiles = {
        client: fs.existsSync(path.resolve(rootDir, 'src/entry.client.ts')),
        server: fs.existsSync(path.resolve(rootDir, 'src/entry.server.ts'))
    };
    const built = buildDeclaration(legacyModules, entryFiles);
    const warnings = [...built.warnings];
    const notes = [...built.notes];
    if (record.declaration !== null) {
        warnings.push(
            'package.json already has an "esmx" field; it is replaced by the migrated declaration.'
        );
    }

    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const originalRaw = fs.readFileSync(packageJsonPath, 'utf-8');

    let written = false;
    let lowered: ModuleConfig;
    let diagnostics: Diagnostic[];
    if (options.dryRun) {
        const pkgLike: ReadDeclarationResult = {
            ...record,
            declaration: built.declaration
        };
        const resolution = resolveMounts(rootDir, pkgLike, legacyModules.links);
        lowered = lowerDeclaration(pkgLike, resolution);
        diagnostics = resolution.diagnostics;
    } else {
        fs.writeFileSync(
            packageJsonPath,
            spliceEsmxField(originalRaw, built.declaration)
        );
        written = true;
        const reread = readDeclaration(rootDir);
        if (!reread) {
            fs.writeFileSync(packageJsonPath, originalRaw);
            return {
                written: false,
                declaration: built.declaration,
                warnings,
                notes,
                parity: 'mismatch',
                differences: [],
                error: 'Written declaration could not be read back; package.json restored.'
            };
        }
        const resolution = resolveMounts(rootDir, reread, legacyModules.links);
        lowered = lowerDeclaration(reread, resolution);
        diagnostics = resolution.diagnostics;
    }
    for (const diagnostic of diagnostics) {
        warnings.push(
            `[${diagnostic.code}] ${diagnostic.message} Fix: ${diagnostic.fix}`
        );
    }

    const name = record.name || path.basename(rootDir);
    const parsedLegacy = parseModuleConfig(name, rootDir, legacyModules);
    const parsedMigrated = parseModuleConfig(name, rootDir, lowered);
    const compared = compareParsedConfigs(parsedLegacy, parsedMigrated);
    notes.push(...compared.notes);
    const parity = compared.differences.length === 0 ? 'exact' : 'mismatch';
    if (parity === 'mismatch' && written) {
        fs.writeFileSync(packageJsonPath, originalRaw);
        written = false;
        warnings.push(
            'parity mismatch: package.json was restored to its original content.'
        );
    }

    return {
        written,
        declaration: built.declaration,
        warnings,
        notes,
        parity,
        differences: compared.differences
    };
}

export interface RunMigrateOptions {
    dryRun: boolean;
    json: boolean;
}

/** CLI entry: runs the migration and prints the report. Returns success. */
export function runMigrate(
    rootDir: string,
    modules: ModuleConfig | undefined,
    options: RunMigrateOptions
): boolean {
    const outcome = migrateModule(rootDir, modules, {
        dryRun: options.dryRun
    });
    const ok = outcome.parity === 'exact' && outcome.error === undefined;

    if (options.json) {
        const payload: Record<string, unknown> = {
            written: outcome.written,
            declaration: outcome.declaration,
            warnings: outcome.warnings,
            notes: outcome.notes,
            parity: outcome.parity
        };
        if (outcome.parity === 'mismatch') {
            payload.differences = outcome.differences;
        }
        if (outcome.error !== undefined) {
            payload.error = outcome.error;
        }
        console.log(JSON.stringify(payload, null, 4));
        return ok;
    }

    console.log(
        styleText(
            'cyan',
            options.dryRun ? 'esmx migrate (dry run)' : 'esmx migrate'
        )
    );
    if (outcome.error !== undefined) {
        console.error(styleText('red', outcome.error));
        return false;
    }
    console.log('\nDeclaration (package.json "esmx" field):');
    console.log(JSON.stringify(outcome.declaration, null, 4));
    if (outcome.notes.length > 0) {
        console.log('\nNotes:');
        for (const note of outcome.notes) {
            console.log(`  - ${note}`);
        }
    }
    if (outcome.warnings.length > 0) {
        console.log(styleText('yellow', '\nWarnings:'));
        for (const warning of outcome.warnings) {
            console.log(styleText('yellow', `  - ${warning}`));
        }
    }
    if (outcome.parity === 'exact') {
        console.log(styleText('green', '\nparity: exact'));
    } else {
        console.log(styleText('red', '\nparity: mismatch'));
        for (const difference of outcome.differences) {
            console.log(
                styleText(
                    'red',
                    `  - ${difference.path}: legacy=${JSON.stringify(difference.legacy)} migrated=${JSON.stringify(difference.migrated)}`
                )
            );
        }
    }
    console.log(
        outcome.written
            ? 'package.json updated.'
            : options.dryRun
              ? 'dry run: package.json not modified.'
              : 'package.json NOT modified.'
    );

    const protocolKeys = PROTOCOL_KEYS.filter(
        (key) => modules?.[key] !== undefined
    );
    if (outcome.written && protocolKeys.length > 0) {
        console.log(
            styleText(
                'cyan',
                `\nNext: remove ${protocolKeys.join(', ')} from the "modules" object in src/entry.node.ts ` +
                    `(keep "links" and behavior hooks); Esmx.init throws E_PROTOCOL_IN_BEHAVIOR as long as ` +
                    `they remain alongside the "esmx" declaration.`
            )
        );
    }
    return ok;
}
