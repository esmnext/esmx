import path from 'node:path';
import type { BuildEnvironment } from './core';

/**
 * Core configuration interface for the module system.
 * Defines module linking, import mapping, and export configurations.
 */
export interface ModuleConfig {
    /**
     * Module linking configuration.
     * Key is remote module name, value is module build output directory path.
     *
     * @example
     * ```typescript
     * links: {
     *   'shared-lib': '../shared-lib/dist',
     *   'api-utils': '/var/www/api-utils/dist'
     * }
     * ```
     */
    links?: Record<string, string>;

    /**
     * Module import mapping configuration.
     * Key is local module identifier, value is remote module path.
     * Mainly used for standard imports of third-party libraries.
     *
     * @example
     * ```typescript
     * imports: {
     *   'axios': 'shared-lib/axios',
     *   'lodash': 'shared-lib/lodash'
     * }
     * ```
     */
    imports?: Record<string, string | Record<BuildEnvironment, string>>;

    /**
     * Module export configuration.
     * Supports multiple configuration forms: mixed array and object.
     *
     * @example
     * ```typescript
     * // Array form
     * exports: ['npm:axios', 'root:src/utils/format.ts']
     *
     * // Object form
     * exports: {
     *   'axios': 'axios',
     *   'utils': './src/utils/index.ts'
     * }
     * ```
     */
    exports?: ModuleConfigExportExports;
}

/**
 * Union type for export configuration.
 * Supports array form to provide flexibility for different configuration scenarios.
 */
export type ModuleConfigExportExports = Array<
    string | Record<string, string | ModuleConfigExportObject>
>;

/**
 * Configuration object for individual module exports.
 * Provides fine-grained control over module export behavior.
 */
export type ModuleConfigExportObject = {
    /**
     * Input file path, relative to project root directory.
     *
     * @example './src/utils/format'
     */
    file?: string;

    /**
     * Environment-specific input file configuration.
     * Supports client and server differentiated builds.
     * Set to `false` to disable builds for specific environments.
     *
     * @example
     * ```typescript
     * files: {
     *   client: './src/storage/indexedDB.ts',
     *   server: './src/storage/filesystem.ts'
     * }
     * ```
     */
    files?: Record<BuildEnvironment, string | false>;

    /**
     * Whether to rewrite import paths within modules.
     *
     * @default true
     * @remarks Only needs to be false when exporting npm packages
     */
    rewrite?: boolean;
};

/**
 * Parsed and normalized module configuration.
 * Contains resolved paths and processed configuration data.
 */
export interface ParsedModuleConfig {
    /** Module name */
    name: string;

    /** Module root directory path */
    root: string;

    /**
     * Resolved link information for connected modules.
     * Contains absolute paths to client/server directories and manifest files.
     */
    links: Record<
        string,
        {
            /** Module name */
            name: string;
            /** Original root path (relative or absolute) */
            root: string;
            /** Absolute path to client build directory */
            client: string;
            /** Absolute path to client manifest.json */
            clientManifestJson: string;
            /** Absolute path to server build directory */
            server: string;
            /** Absolute path to server manifest.json */
            serverManifestJson: string;
        }
    >;

    /** Environment-specific configuration */
    environments: {
        /** Client environment configuration */
        client: {
            /** Import mapping configuration (passed through as-is) */
            imports: Record<string, string>;
            /** Processed export configuration */
            exports: ParsedModuleConfigExports;
        };
        /** Server environment configuration */
        server: {
            /** Import mapping configuration (passed through as-is) */
            imports: Record<string, string>;
            /** Processed export configuration */
            exports: ParsedModuleConfigExports;
        };
    };
}

/**
 * Processed export configuration mapping.
 * Maps export names to their resolved configuration objects.
 */
export type ParsedModuleConfigExports = Record<
    string,
    ParsedModuleConfigExport
>;

/**
 * Processed export configuration for a single module.
 * Contains resolved input target and processing flags.
 */
export interface ParsedModuleConfigExport {
    /** Export name/identifier */
    name: string;

    /** Input file path */
    file: string;

    /** Whether to rewrite import paths within this module */
    rewrite: boolean;
}

/**
 * Parse and normalize module configuration.
 * Resolves paths, processes exports, and creates a standardized configuration object.
 *
 * @param name - Module name
 * @param root - Module root directory path
 * @param config - Raw module configuration (optional)
 * @returns Parsed and normalized module configuration
 *
 * @example
 * ```typescript
 * const parsed = parseModuleConfig('my-app', '/path/to/app', {
 *   links: { 'shared-lib': '../shared-lib/dist' },
 *   imports: { 'axios': 'shared-lib/axios' },
 *   exports: ['npm:axios', 'root:src/utils/format.ts']
 * });
 * ```
 */
export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    return {
        name,
        root,
        links: getLinks(name, root, config),
        environments: {
            client: getEnvironments(config, 'client'),
            server: getEnvironments(config, 'server')
        }
    };
}

/**
 * Process and resolve module linking configuration.
 * Creates absolute paths for client/server directories and manifest files.
 * Automatically includes the current module as a self-link.
 *
 * @param name - Module name
 * @param root - Module root directory path
 * @param config - Module configuration
 * @returns Resolved links configuration with absolute paths
 *
 * @internal
 */
function getLinks(name: string, root: string, config: ModuleConfig) {
    const result: ParsedModuleConfig['links'] = {};
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

/**
 * Process environment-specific import configuration.
 * Resolves import mappings for different build environments.
 *
 * @param environment - Target build environment
 * @param imports - Raw import configuration
 * @returns Processed import mappings for the specified environment
 *
 * @internal
 */
export function getEnvironmentImports(
    environment: BuildEnvironment,
    imports: Record<string, string | Record<BuildEnvironment, string>> = {}
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

/**
 * Process and normalize module environment configuration.
 * Handles different export formats (array, object, object array) and
 * processes prefix syntactic sugar (npm:, root:).
 * Automatically adds default entry exports for client and server.
 *
 * @param config - Module configuration (optional)
 * @returns Processed environment configuration
 *
 * @internal
 */
function getEnvironments(config: ModuleConfig, env: BuildEnvironment) {
    const exports: ParsedModuleConfigExports = {};

    const applyExports = (
        exportObject: Record<string, ModuleConfigExportObject | string>
    ) => {
        Object.keys(exportObject).forEach((name) => {
            if (typeof exportObject[name] === 'string') {
                const parsedValue = parsedExportValue(exportObject[name]);
                exports[name] = {
                    ...parsedValue,
                    name
                };
            } else {
                const file =
                    exportObject[name].files?.[env] ??
                    exportObject[name].file ??
                    name;
                if (file === false) {
                    return;
                }
                const parsedValue = parsedExportValue(file);
                const rewrite: boolean =
                    exportObject[name].rewrite ?? parsedValue.rewrite;
                exports[name] = {
                    name,
                    rewrite,
                    file: parsedValue.file
                };
            }
        });
    };
    // Parse default entry exports first
    applyExports({
        'src/entry.client': {
            files: {
                client: './src/entry.client',
                server: false
            }
        },
        'src/entry.server': {
            files: {
                client: false,
                server: './src/entry.server'
            }
        }
    });

    config.exports?.forEach((item) => {
        if (typeof item === 'string') {
            const parsedValue = parsedExportValue(item);
            exports[parsedValue.name] = parsedValue;
        } else {
            applyExports(item);
        }
    });

    return {
        imports: getEnvironmentImports(env, config.imports),
        exports
    };
}

/**
 * Parse export value string and return parsed export configuration.
 * Handles npm: and root: prefix syntactic sugar.
 *
 * @param value - Export value string (e.g., 'npm:axios', 'root:src/utils/format.ts')
 * @returns Parsed export configuration object
 *
 * @internal
 */
export function parsedExportValue(value: string): ParsedModuleConfigExport {
    const FILE_EXT_REGEX =
        /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

    if (value.startsWith('npm:')) {
        const item = value.substring('npm:'.length);
        return {
            name: item,
            rewrite: false,
            file: item
        };
    } else if (value.startsWith('root:')) {
        const item = value
            .substring('root:'.length)
            .replace(FILE_EXT_REGEX, '');
        return {
            name: item,
            rewrite: true,
            file: './' + item
        };
    } else {
        return {
            name: value,
            rewrite: true,
            file: value
        };
    }
}
