import path from 'node:path';
import type { BuildEnvironment } from './core';

/**
 * Core configuration interface for the module system.
 * Defines module linking, import mapping, and export configurations.
 */
export interface ModuleConfig {
    /**
     * Module linking configuration for connecting to other modules.
     * Maps module names to their distribution directory paths.
     *
     * @remarks
     * Links enable module-to-module communication and sharing.
     * Paths can be relative or absolute. The current module is automatically
     * included as a self-link pointing to its own dist directory.
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
     * Import path mapping configuration with environment-specific support.
     * Maps import identifiers to their actual module paths or package names.
     *
     * @remarks
     * Supports both static mappings and environment-specific overrides.
     * Environment-specific mappings take precedence over static mappings.
     *
     * @example
     * ```typescript
     * imports: {
     *   // Standard import mapping
     *   'axios': 'shared-lib/axios',
     *   'lodash': 'shared-lib/lodash',
     *
     *   // Environment-specific mapping
     *   'storage': {
     *     client: 'shared-lib/storage/client',
     *     server: 'shared-lib/storage/server'
     *   },
     *   'config': {
     *     client: 'shared-lib/config/browser',
     *     server: 'shared-lib/config/node'
     *   }
     * }
     * ```
     */
    imports?: ModuleConfigImportMapping;

    /**
     * Scope-specific import mapping configuration.
     * Allows organizing imports by logical scopes or namespaces.
     * Each scope contains its own import mappings with environment-specific support.
     *
     * @remarks
     * Scopes provide a way to group related imports and avoid naming conflicts.
     * Useful for organizing imports from different libraries or domains.
     * Unlike global imports, scoped imports are namespaced under their scope name.
     *
     * @example
     * ```typescript
     * scopes: {
     *   'shared': {
     *     axios: 'shared-lib/axios',
     *     lodash: { client: 'client-lib/lodash', server: 'server-lib/lodash' }
     *   },
     *   'ui': {
     *     react: 'ui-lib/react',
     *     'react-dom': 'ui-lib/react-dom'
     *   }
     * }
     * ```
     */
    scopes?: Record<string, ModuleConfigImportMapping>;
    /**
     * Module export configuration defining entry points and public API.
     * Supports flexible export formats including npm packages and local files.
     *
     * @remarks
     * Exports are defined as an array containing:
     * - String values with prefixes (npm:, root:)
     * - Object mappings with detailed configuration
     *
     * @example
     * ```typescript
     * exports: [
     *   // Export npm package (no path rewriting)
     *   'npm:axios',
     *   'npm:lodash',
     *
     *   // Export local file (with path rewriting)
     *   'root:src/utils/date-utils.ts',
     *   'root:src/components/Chart.js',
     *
     *   // Detailed export configuration
     *   {
     *     'api': './src/api/index.ts',
     *     'storage': {
     *       files: {
     *         client: './src/storage/browser.ts',
     *         server: './src/storage/node.ts'
     *       }
     *     }
     *   }
     * ]
     * ```
     */
    exports?: ModuleConfigExportExports;
}

/**
 * Import mapping configuration type with environment-specific support.
 * Maps import identifiers to their actual module paths or package names.
 * Supports both static mappings and environment-specific overrides.
 */
export type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;

/**
 * Array type for export configuration.
 * Contains string values or object mappings as array elements.
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
     * @remarks Set to false for npm packages to maintain standard import paths,
     * or when path rewriting is not desired for specific exports.
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
    links: Record<string, ParsedModuleConfigLink>;

    /** Environment-specific configuration */
    environments: {
        /** Client environment configuration */
        client: ParsedModuleConfigEnvironment;
        /** Server environment configuration */
        server: ParsedModuleConfigEnvironment;
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
 * Environment-specific configuration for parsed module config.
 * Contains processed imports, exports, and scopes for a specific build environment.
 */
export interface ParsedModuleConfigEnvironment {
    /** Import mapping configuration (passed through as-is) */
    imports: Record<string, string>;
    /** Processed export configuration */
    exports: ParsedModuleConfigExports;
    /** Scope configuration */
    scopes: Record<string, Record<string, string>>;
}

/**
 * Link information for a connected module.
 * Contains resolved paths to client/server directories and manifest files.
 */
export interface ParsedModuleConfigLink {
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

/**
 * Process environment-specific scope configuration.
 * Resolves scope mappings for different build environments.
 *
 * @param environment - Target build environment
 * @param scopes - Raw scope configuration
 * @returns Processed scope mappings for the specified environment
 *
 * @internal
 */
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

/**
 * Process and normalize module environment configuration.
 * Combines imports, exports, and scopes for a specific build environment.
 *
 * @param config - Module configuration
 * @param env - Target build environment
 * @returns Processed environment configuration
 *
 * @internal
 */
export function getEnvironments(
    config: ModuleConfig,
    env: BuildEnvironment
): ParsedModuleConfigEnvironment {
    return {
        imports: getEnvironmentImports(env, config.imports),
        exports: getEnvironmentExports(config, env),
        scopes: getEnvironmentScopes(env, config.scopes)
    };
}

/**
 * Create default export entries for the specified environment.
 * Always includes src/entry.client and src/entry.server with appropriate file paths.
 *
 * @param env - Target build environment
 * @returns Default export configuration for the environment
 *
 * @internal
 */
export function createDefaultExports(
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports: ParsedModuleConfigExports = {};

    if (env === 'client') {
        exports['src/entry.client'] = {
            name: 'src/entry.client',
            file: './src/entry.client',
            rewrite: true
        };
        exports['src/entry.server'] = {
            name: 'src/entry.server',
            file: '', // Client doesn't need server entry
            rewrite: true
        };
    } else {
        exports['src/entry.client'] = {
            name: 'src/entry.client',
            file: '', // Server doesn't need client entry
            rewrite: true
        };
        exports['src/entry.server'] = {
            name: 'src/entry.server',
            file: './src/entry.server',
            rewrite: true
        };
    }

    return exports;
}

/**
 * Process a string export configuration.
 *
 * @param exportString - Export string (e.g., 'npm:axios', 'root:src/utils.ts')
 * @returns Processed export configuration
 *
 * @internal
 */
export function processStringExport(
    exportString: string
): ParsedModuleConfigExports {
    const parsedValue = parsedExportValue(exportString);
    return { [parsedValue.name]: parsedValue };
}

/**
 * Process an object export configuration.
 *
 * @param exportObject - Export object configuration
 * @param env - Target build environment
 * @returns Processed export configuration
 *
 * @internal
 */
export function processObjectExport(
    exportObject: Record<string, string | ModuleConfigExportObject>,
    env: BuildEnvironment
): ParsedModuleConfigExports {
    const exports: ParsedModuleConfigExports = {};

    Object.keys(exportObject).forEach((name) => {
        if (typeof exportObject[name] === 'string') {
            const parsedValue = parsedExportValue(exportObject[name] as string);
            exports[name] = { ...parsedValue, name };
            return;
        }

        const config = exportObject[name] as ModuleConfigExportObject;
        const file = resolveExportFile(config, env, name);
        const rewrite: boolean =
            config.rewrite ?? parsedExportValue(file).rewrite;

        exports[name] = {
            name,
            file,
            rewrite
        };
    });

    return exports;
}

/**
 * Resolve the file path for an export configuration.
 *
 * @param config - Export configuration object
 * @param env - Target build environment
 * @param name - Export name (fallback if no file specified)
 * @returns Resolved file path
 *
 * @internal
 */
export function resolveExportFile(
    config: ModuleConfigExportObject,
    env: BuildEnvironment,
    name: string
): string {
    if (config.files?.[env] === false) return '';
    if (config.files?.[env]) return config.files[env] as string;
    if (config.file) return config.file;
    return name;
}

/**
 * Process an array of export configurations.
 *
 * @param exportArray - Array of export configurations
 * @param env - Target build environment
 * @returns Processed export configuration
 *
 * @internal
 */
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

/**
 * Process environment-specific export configuration.
 * Resolves export mappings for different build environments.
 *
 * @param config - Module configuration
 * @param env - Target build environment
 * @returns Processed export mappings for the specified environment
 *
 * @internal
 */
export function getEnvironmentExports(
    config: ModuleConfig,
    env: BuildEnvironment
): ParsedModuleConfigExports {
    // Create default exports
    const exports = createDefaultExports(env);

    // Process user-defined exports
    if (config.exports) {
        const userExports = processExportArray(config.exports, env);
        Object.assign(exports, userExports);
    }

    return exports;
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
