import path from 'node:path';
import type { BuildEnvironment } from './core';

export interface ModuleConfig {
    lib?: boolean;
    entry?: ModuleConfigEntry;
    links?: Record<string, string>;
    imports?: ModuleConfigImportMapping;
    exports?: ModuleConfigExportExports;
}

/**
 * Framework entry declaration (RFC 0001 Phase 2).
 *
 * Per side: a `./`-relative source file path declares a custom entry,
 * `false` disables the side, and `undefined` keeps the legacy default
 * (`./src/entry.client` / `./src/entry.server`).
 */
export interface ModuleConfigEntry {
    client?: string | false;
    server?: string | false;
}

export type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;

export type ModuleConfigExportExports = ModuleConfigExportExport[];

export type ModuleConfigExportExport = string | ModuleConfigExportObject;

export type ModuleConfigExportObject = Record<
    string,
    ModuleConfigExportObjectValue
>;
export type ModuleConfigExportObjectValue =
    | string
    | Record<BuildEnvironment, string | boolean>;

export interface ParsedModuleConfig {
    name: string;
    root: string;
    lib: boolean;
    entry: ParsedModuleConfigEntry;
    links: Record<string, ParsedModuleConfigLink>;
    environments: {
        client: ParsedModuleConfigEnvironment;
        server: ParsedModuleConfigEnvironment;
    };
}

/** A resolved framework entry: export name + source file path. */
export interface ParsedModuleConfigEntryTarget {
    /** Export name (import specifier suffix), e.g. 'src/entry.client'. */
    name: string;
    /** Source file path, e.g. './src/entry.client' or './custom/main.ts'. */
    file: string;
}

export interface ParsedModuleConfigEntry {
    client: ParsedModuleConfigEntryTarget | null;
    server: ParsedModuleConfigEntryTarget | null;
}

export type ParsedModuleConfigExports = Record<
    string,
    ParsedModuleConfigExport
>;

export interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}

export interface ParsedModuleConfigEnvironment {
    imports: Record<string, string>;
    exports: ParsedModuleConfigExports;
    scopes: Record<string, Record<string, string>>;
}

export interface ParsedModuleConfigLink {
    name: string;
    root: string;
    client: string;
    clientManifestJson: string;
    server: string;
    serverManifestJson: string;
}

/**
 * Single source of truth for the default framework entries, used as the
 * fallback when a module declares no explicit `entry` (RFC 0001 Phase 2
 * threads resolved entries through the config instead of hard-coding them).
 */
export const DEFAULT_MODULE_ENTRY: Record<
    'client' | 'server',
    ParsedModuleConfigEntryTarget
> = {
    client: { name: 'src/entry.client', file: './src/entry.client' },
    server: { name: 'src/entry.server', file: './src/entry.server' }
};

const FILE_EXT_REGEX =
    /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

function parseEntryTarget(
    value: string | false | undefined,
    fallback: ParsedModuleConfigEntryTarget
): ParsedModuleConfigEntryTarget | null {
    if (value === false) {
        return null;
    }
    if (value === undefined) {
        return { ...fallback };
    }
    const relativePath = value.startsWith('./') ? value.slice(2) : value;
    const parsed = parsedExportValue(`root:${relativePath}`);
    return { name: parsed.name, file: parsed.file };
}

export function parseEntryConfig(
    config: ModuleConfig
): ParsedModuleConfigEntry {
    if (config.lib) {
        return { client: null, server: null };
    }
    return {
        client: parseEntryTarget(
            config.entry?.client,
            DEFAULT_MODULE_ENTRY.client
        ),
        server: parseEntryTarget(
            config.entry?.server,
            DEFAULT_MODULE_ENTRY.server
        )
    };
}

/**
 * Manifest chunk identifier for an entry target: `<module>@<srcRelPath>`
 * including the file extension (bundlers key chunks by the resolved source
 * file, so the legacy extensionless default maps to `.ts`).
 */
export function getEntryChunkId(
    moduleName: string,
    target: ParsedModuleConfigEntryTarget
): string {
    const relativePath = target.file.startsWith('./')
        ? target.file.slice(2)
        : target.file;
    const withExtension = FILE_EXT_REGEX.test(relativePath)
        ? relativePath
        : `${relativePath}.ts`;
    return `${moduleName}@${withExtension}`;
}

export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    const entry = parseEntryConfig(config);
    return {
        name,
        root,
        lib: config.lib ?? false,
        entry,
        links: getLinks(name, root, config),
        environments: {
            client: getEnvironments(config, 'client', name, entry),
            server: getEnvironments(config, 'server', name, entry)
        }
    };
}

export function getLinks(
    name: string,
    root: string,
    config: ModuleConfig
): Record<string, ParsedModuleConfigLink> {
    const result: Record<string, ParsedModuleConfigLink> = {};
    Object.entries({
        [name]: path.resolve(root, 'dist'),
        ...config.links
    }).forEach(([name, value]) => {
        const serverRoot = path.isAbsolute(value)
            ? value
            : path.resolve(root, value);
        result[name] = {
            name: name,
            root: value,
            client: path.resolve(serverRoot, 'client'),
            clientManifestJson: path.resolve(
                serverRoot,
                'client/manifest.json'
            ),
            server: path.resolve(serverRoot, 'server'),
            serverManifestJson: path.resolve(serverRoot, 'server/manifest.json')
        };
    });
    return result;
}

export function getEnvironmentImports(
    environment: BuildEnvironment,
    imports: ModuleConfigImportMapping = {}
): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(imports)) {
        if (typeof value === 'string') {
            result[key] = value;
        } else {
            const environmentValue = value[environment];
            if (environmentValue !== undefined) {
                result[key] = environmentValue;
            }
        }
    }

    return result;
}

export function getEnvironments(
    config: ModuleConfig,
    env: BuildEnvironment,
    moduleName: string,
    entry: ParsedModuleConfigEntry = parseEntryConfig(config)
): ParsedModuleConfigEnvironment {
    const imports = getEnvironmentImports(env, config.imports);
    const exports = getEnvironmentExports(config, env, entry);
    // The single root scope (`''`) is derived from the supply wiring and the
    // module's own pkg-exports. There is no user-authored directory-scope
    // remapping (RFC 0001 §4): per-module isolation and multi-major
    // coexistence are derived from declarations, never hand-mapped.
    const scopes: Record<string, Record<string, string>> = {
        '': { ...imports }
    };
    addPackageExportsToScopes(exports, scopes, moduleName);
    return {
        imports,
        exports,
        scopes
    };
}

/**
 * Builds the per-environment exports for the resolved framework entries.
 * Each entry exports its source file in its own environment and an empty
 * file on the other side (the inactive side is skipped by adapters).
 */
export function createEntryExports(
    entry: ParsedModuleConfigEntry,
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports: ParsedModuleConfigExports = {};
    for (const side of ['client', 'server'] as const) {
        const target = entry[side];
        if (!target) {
            continue;
        }
        exports[target.name] = {
            name: target.name,
            file: side === env ? target.file : '',
            pkg: false
        };
    }
    return exports;
}

export function processStringExport(
    exportString: string
): ParsedModuleConfigExports {
    const parsedValue = parsedExportValue(exportString);
    return { [parsedValue.name]: parsedValue };
}

export function processObjectExport(
    exportObject: ModuleConfigExportObject,
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports: ParsedModuleConfigExports = {};

    Object.keys(exportObject).forEach((name) => {
        const config = exportObject[name];
        if (typeof config === 'string') {
            const parsedValue = parsedExportValue(config);
            exports[name] = { ...parsedValue, name };
            return;
        }

        const filePath = resolveExportFile(config, env, name);
        const parsedValue = parsedExportValue(filePath);
        exports[name] = { ...parsedValue, name };
    });

    return exports;
}

export function resolveExportFile(
    config: ModuleConfigExportObjectValue,
    env: BuildEnvironment,
    name: string
): string {
    if (typeof config === 'string') {
        return config;
    }
    const value = config[env];
    if (typeof value === 'boolean') {
        return value === true ? name : '';
    } else if (typeof value === 'string') {
        return value || name;
    }
    return name;
}

export function processExportArray(
    exportArray: ModuleConfigExportExports,
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports: ParsedModuleConfigExports = {};

    exportArray.forEach((item) => {
        if (typeof item === 'string') {
            const itemExports = processStringExport(item);
            Object.assign(exports, itemExports);
        } else {
            const itemExports = processObjectExport(item, env);
            Object.assign(exports, itemExports);
        }
    });

    return exports;
}

export function getEnvironmentExports(
    config: ModuleConfig,
    env: BuildEnvironment,
    entry: ParsedModuleConfigEntry = parseEntryConfig(config)
): ParsedModuleConfigExports {
    const exports = createEntryExports(entry, env);

    if (config.exports) {
        const userExports = processExportArray(config.exports, env);
        Object.assign(exports, userExports);
    }

    return exports;
}

export function addPackageExportsToScopes(
    exports: ParsedModuleConfigExports,
    scopes: Record<string, Record<string, string>>,
    moduleName: string
): Record<string, Record<string, string>> {
    Object.entries(exports).forEach(([exportName, exportConfig]) => {
        if (exportConfig.pkg) {
            if (!scopes['']) {
                scopes[''] = {};
            }
            scopes[''][exportName] = moduleName + '/' + exportName;
        }
    });

    return scopes;
}

export function parsedExportValue(value: string): ParsedModuleConfigExport {
    if (value.startsWith('pkg:')) {
        const item = value.substring('pkg:'.length);
        return {
            name: item,
            pkg: true,
            file: item
        };
    } else if (value.startsWith('root:')) {
        const item = value.substring('root:'.length);
        const name = item.replace(FILE_EXT_REGEX, '');
        return {
            name: name,
            pkg: false,
            file: './' + item
        };
    } else {
        return {
            name: value,
            pkg: false,
            file: value
        };
    }
}
