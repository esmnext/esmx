import type {
    ModuleConfig,
    ModuleConfigExportExports,
    ModuleConfigExportObject,
    ModuleConfigExportObjectValue
} from '../module-config';
import type { ReadDeclarationResult } from './reader';
import type { ResolveMountsResult } from './resolver';
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

function lowerEntry(
    entry: NonNullable<ReadDeclarationResult['declaration']['entry']>
): ModuleConfigExportObject {
    const lowered: ModuleConfigExportObject = {};
    if (entry.client !== DEFAULT_CLIENT_ENTRY) {
        lowered['src/entry.client'] = {
            client: entry.client ? toRootExport(entry.client) : false,
            server: false
        };
    }
    if (entry.server !== DEFAULT_SERVER_ENTRY) {
        lowered['src/entry.server'] = {
            client: false,
            server: entry.server ? toRootExport(entry.server) : false
        };
    }
    return lowered;
}

/**
 * Lowers a declaration + resolution result to today's internal
 * `ModuleConfig` IR (RFC Phase 1): default entry paths ride on
 * `createDefaultExports`, custom entries become named object exports,
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
    // it as a pure membership test, so extra entries are harmless.
    const imports: Record<string, string> = {};
    for (const [packageName, entry] of Object.entries(resolution.supply)) {
        if (entry.provider === pkg.name) {
            continue;
        }
        imports[packageName] = `${entry.provider}/${packageName}`;
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
    if (declaration.entry) {
        Object.assign(exportObject, lowerEntry(declaration.entry));
    }
    if (Object.keys(exportObject).length > 0) {
        exports.push(exportObject);
    }
    if (exports.length > 0) {
        config.exports = exports;
    }

    return config;
}
