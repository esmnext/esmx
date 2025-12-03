import path from 'node:path';
import type { BuildEnvironment } from './core';

export interface ModuleConfig {
    lib?: boolean;
    links?: Record<string, string>;
    imports?: ModuleConfigImportMapping;
    scopes?: Record<string, ModuleConfigImportMapping>;
    exports?: ModuleConfigExportExports;
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
    links: Record<string, ParsedModuleConfigLink>;
    environments: {
        client: ParsedModuleConfigEnvironment;
        server: ParsedModuleConfigEnvironment;
    };
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

export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    return {
        name,
        root,
        lib: config.lib ?? false,
        links: getLinks(name, root, config),
        environments: {
            client: getEnvironments(config, 'client', name),
            server: getEnvironments(config, 'server', name)
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

export function getEnvironmentScopes(
    environment: BuildEnvironment,
    scopes: Record<string, ModuleConfigImportMapping> = {}
): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    for (const [scopeName, scopeImports] of Object.entries(scopes)) {
        result[scopeName] = getEnvironmentImports(environment, scopeImports);
    }

    return result;
}

export function getEnvironments(
    config: ModuleConfig,
    env: BuildEnvironment,
    moduleName: string
): ParsedModuleConfigEnvironment {
    const imports = getEnvironmentImports(env, config.imports);
    const exports = getEnvironmentExports(config, env);
    const scopes = getEnvironmentScopes(env, {
        ...config.scopes,
        '': {
            ...config.scopes?.[''],
            ...imports
        }
    });
    addPackageExportsToScopes(exports, scopes, moduleName);
    return {
        imports,
        exports,
        scopes
    };
}

export function createDefaultExports(
    env: BuildEnvironment
): ParsedModuleConfigExports {
    switch (env) {
        case 'client':
            return {
                'src/entry.client': {
                    name: 'src/entry.client',
                    file: './src/entry.client',
                    pkg: false
                },
                'src/entry.server': {
                    name: 'src/entry.server',
                    file: '',
                    pkg: false
                }
            };
        case 'server':
            return {
                'src/entry.client': {
                    name: 'src/entry.client',
                    file: '',
                    pkg: false
                },
                'src/entry.server': {
                    name: 'src/entry.server',
                    file: './src/entry.server',
                    pkg: false
                }
            };
    }
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
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports = config.lib ? {} : createDefaultExports(env);

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
    const FILE_EXT_REGEX =
        /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

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
