import type {
    ModuleConfig,
    ModuleConfigEntry,
    ModuleConfigExportExports,
    ModuleConfigExportObject,
    ModuleConfigExportObjectValue
} from '../module-config';
import type { ReadDeclarationResult } from './reader';
import type { ResolveMountsResult } from './resolver';
import { selectSupplyGroup } from './resolver';
import type { EsmxDeclarationExportValue } from './types';

const DEFAULT_CLIENT_ENTRY = './src/entry.client.ts';
const DEFAULT_SERVER_ENTRY = './src/entry.server.ts';

/** './src/foo.ts' → 'root:src/foo.ts' */
function toRootExport(relativePath: string): string {
    return `root:${relativePath.slice(2)}`;
}

function lowerExportValue(
    value: EsmxDeclarationExportValue
): ModuleConfigExportObjectValue {
    if (typeof value === 'string') {
        return toRootExport(value);
    }
    // An absent fork side means the side is disabled, same as false.
    return {
        client:
            typeof value.client === 'string'
                ? toRootExport(value.client)
                : false,
        server:
            typeof value.server === 'string'
                ? toRootExport(value.server)
                : false
    };
}

/**
 * Lowers a declared entry to the `ModuleConfig.entry` IR: an absent side
 * is disabled (`false`), the default path is omitted (rides on the legacy
 * default, keeping migration parity byte-identical), and a custom path
 * passes through (its export name is path-derived by `parseEntryConfig`,
 * RFC 0001 §4.1: no reserved names).
 */
function lowerEntry(
    entry: NonNullable<ReadDeclarationResult['declaration']['entry']>
): ModuleConfigEntry | null {
    const lowered: ModuleConfigEntry = {};
    if (!entry.client) {
        lowered.client = false;
    } else if (entry.client !== DEFAULT_CLIENT_ENTRY) {
        lowered.client = entry.client;
    }
    if (!entry.server) {
        lowered.server = false;
    } else if (entry.server !== DEFAULT_SERVER_ENTRY) {
        lowered.server = entry.server;
    }
    return Object.keys(lowered).length > 0 ? lowered : null;
}

/**
 * Lowers a declaration + resolution result to today's internal
 * `ModuleConfig` IR (RFC Phase 1+2): default entry paths ride on the
 * legacy defaults, custom/disabled entries flow through `config.entry`,
 * `provides` become `pkg:` exports, the merged supply table becomes
 * `imports`, and mounts become `links`.
 */
export function lowerDeclaration(
    pkg: ReadDeclarationResult,
    resolution: ResolveMountsResult
): ModuleConfig {
    const { declaration } = pkg;
    const config: ModuleConfig = {};

    if (!declaration.entry) {
        config.lib = true;
    } else {
        const entry = lowerEntry(declaration.entry);
        if (entry) {
            config.entry = entry;
        }
    }

    const links: Record<string, string> = {};
    for (const mount of Object.values(resolution.mounts)) {
        links[mount.name] = mount.artifactDir;
    }
    if (Object.keys(links).length > 0) {
        config.links = links;
    }

    // The static supply table: every merged entry is wired, whether or not
    // the consumer ever imports it — the externalization predicates treat
    // it as a pure membership test, so extra entries are harmless. With
    // per-major groups each module picks its own group locally: a module
    // that provides the package itself wires to its own copy (self wins
    // its group in its own merge); otherwise the dependencies ∪
    // peerDependencies range selects the satisfying major group.
    const imports: Record<string, string> = {};
    for (const [packageName, entry] of Object.entries(resolution.supply)) {
        if (entry.groups.some((group) => group.provider === pkg.name)) {
            continue;
        }
        const range =
            pkg.dependencies[packageName] ?? pkg.peerDependencies[packageName];
        const group = selectSupplyGroup(entry, range);
        if (!group) {
            continue;
        }
        imports[packageName] = `${group.provider}/${packageName}`;
    }
    if (Object.keys(imports).length > 0) {
        config.imports = imports;
    }

    const exports: ModuleConfigExportExports = [];
    for (const provided of declaration.provides ?? []) {
        exports.push(`pkg:${provided}`);
    }
    const exportObject: ModuleConfigExportObject = {};
    for (const [subpath, value] of Object.entries(declaration.exports ?? {})) {
        exportObject[subpath.slice(2)] = lowerExportValue(value);
    }
    if (Object.keys(exportObject).length > 0) {
        exports.push(exportObject);
    }
    if (exports.length > 0) {
        config.exports = exports;
    }

    return config;
}
