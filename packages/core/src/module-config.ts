import path from 'upath';
import type { BuildSsrTarget } from './core';

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
    imports?: Record<string, string>;

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
 * Supports mixed array and object forms to provide flexibility
 * for different configuration scenarios.
 */
export type ModuleConfigExportExports =
    | Array<string | Record<string, string | ModuleConfigExportObject>>
    | Record<string, string | ModuleConfigExportObject>;

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
    input?: string;

    /**
     * Environment-specific input file configuration.
     * Supports client and server differentiated builds.
     * Set to `false` to disable builds for specific environments.
     *
     * @example
     * ```typescript
     * inputTarget: {
     *   client: './src/storage/indexedDB.ts',
     *   server: './src/storage/filesystem.ts'
     * }
     * ```
     */
    inputTarget?: Record<BuildSsrTarget, string | false>;

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

    /** Import mapping configuration (passed through as-is) */
    imports: Record<string, string>;

    /** Processed export configuration */
    exports: ParsedModuleConfigExports;
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
 * Contains resolved input targets and processing flags.
 */
export interface ParsedModuleConfigExport {
    /** Export name/identifier */
    name: string;

    /** Resolved input targets for different build environments */
    inputTarget: Record<BuildSsrTarget, string | false>;

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
        imports: config.imports ?? {},
        exports: getExports(config)
    };
}

/**
 * Prefix constants for export configuration syntactic sugar.
 * Used to identify and process npm: and root: prefixes in export strings.
 */
const PREFIX = {
    /** Prefix for npm package exports */
    npm: 'npm:',
    /** Prefix for source file exports */
    root: 'root:'
} as const;

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
 * Process and normalize module exports configuration.
 * Handles different export formats (array, object, object array) and
 * processes prefix syntactic sugar (npm:, root:).
 * Automatically adds default entry exports for client and server.
 *
 * @param config - Module configuration (optional)
 * @returns Processed exports configuration
 *
 * @internal
 */
function getExports(config: ModuleConfig = {}) {
    const result: ParsedModuleConfig['exports'] = {};

    // Default exports added automatically for every module
    const exports: Record<string, ModuleConfigExportObject | string> = {
        'src/entry.client': {
            inputTarget: {
                client: './src/entry.client',
                server: false
            }
        },
        'src/entry.server': {
            inputTarget: {
                client: false,
                server: './src/entry.server'
            }
        }
    };

    if (Array.isArray(config.exports)) {
        // Regular expression to match supported file extensions
        const FILE_EXT_REGEX =
            /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

        config.exports.forEach((item) => {
            if (typeof item === 'string') {
                // Process prefix syntactic sugar
                if (item.startsWith(PREFIX.npm)) {
                    // npm: prefix - export npm package, maintain original import paths
                    item = item.substring(PREFIX.npm.length);
                    exports[item] = {
                        rewrite: false,
                        input: item
                    };
                } else if (item.startsWith(PREFIX.root)) {
                    // root: prefix - export source file, rewrite import paths
                    item = item
                        .substring(PREFIX.root.length)
                        .replace(FILE_EXT_REGEX, '');
                    exports[item] = {
                        input: './' + item
                    };
                } else {
                    console.error(`Invalid module export: ${item}`);
                }
            } else {
                // Object configuration - merge directly
                Object.assign(exports, item);
            }
        });
    } else if (config.exports) {
        // Object configuration - merge directly
        Object.assign(exports, config.exports);
    }

    // Normalize all export configurations
    for (const [name, value] of Object.entries(exports)) {
        const opts =
            typeof value === 'string'
                ? {
                      input: value
                  }
                : value;
        const client = opts.inputTarget?.client ?? opts.input ?? name;
        const server = opts.inputTarget?.server ?? opts.input ?? name;
        result[name] = {
            name,
            rewrite: opts.rewrite ?? true,
            inputTarget: {
                client,
                server
            }
        };
    }
    return result;
}
