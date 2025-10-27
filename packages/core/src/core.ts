import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';
import { pathToFileURL } from 'node:url';
import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';

import serialize from 'serialize-javascript';
import { type App, createApp } from './app';
import { type ManifestJson, getManifestList } from './manifest-json';
import {
    type ModuleConfig,
    type ParsedModuleConfig,
    parseModuleConfig
} from './module-config';
import {
    type PackConfig,
    type ParsedPackConfig,
    parsePackConfig
} from './pack-config';
import type { ImportmapMode } from './render-context';
import type { RenderContext, RenderContextOptions } from './render-context';
import { type CacheHandle, createCache } from './utils/cache';
import { fixNestedScopesResolution, getImportMap } from './utils/import-map';
import type { Middleware } from './utils/middleware';
import { type ProjectPath, resolvePath } from './utils/resolve-path';
import { getImportPreloadInfo as getStaticImportPaths } from './utils/static-import-lexer';

/**
 * Core configuration options interface for the Esmx framework
 */
export interface EsmxOptions {
    /**
     * Project root directory path
     * - Can be absolute or relative path
     * - Defaults to current working directory (process.cwd())
     */
    root?: string;

    /**
     * Whether it is production environment
     * - true: Production environment
     * - false: Development environment
     * - Defaults to process.env.NODE_ENV === 'production'
     */
    isProd?: boolean;

    /**
     * Base path placeholder configuration
     * - string: Custom placeholder
     * - false: Disable placeholder
     * - Default value is '[[[___ESMX_DYNAMIC_BASE___]]]'
     * - Used for dynamically replacing the base path of assets at runtime
     */
    basePathPlaceholder?: string | false;

    /**
     * Module configuration options
     * - Used to configure module resolution rules for the project
     * - Includes module aliases, external dependencies, etc.
     */
    modules?: ModuleConfig;

    /**
     * Package configuration options
     * - Used to package build artifacts into standard npm .tgz format packages
     * - Includes output path, package.json handling, packaging hooks, etc.
     */
    packs?: PackConfig;

    /**
     * Development environment application creation function
     * - Only used in development environment
     * - Used to create application instance for development server
     * @param esmx Esmx instance
     */
    devApp?: (esmx: Esmx) => Promise<App>;

    /**
     * Server startup configuration function
     * - Used to configure and start HTTP server
     * - Can be used in both development and production environments
     * @param esmx Esmx instance
     */
    server?: (esmx: Esmx) => Promise<void>;

    /**
     * Post-build processing function
     * - Executed after project build is completed
     * - Can be used to perform additional resource processing, deployment, etc.
     * @param esmx Esmx instance
     */
    postBuild?: (esmx: Esmx) => Promise<void>;
}

/**
 * Application build target types.
 * - client: Client build target, used to generate code that runs in the browser
 * - server: Server build target, used to generate code that runs in Node.js environment
 */
export type BuildEnvironment = 'client' | 'server';

/**
 * Command enumeration for the Esmx framework.
 * Used to control the runtime mode and lifecycle of the framework.
 */
export enum COMMAND {
    /**
     * Development mode
     * Starts development server with hot reload support
     */
    dev = 'dev',

    /**
     * Build mode
     * Generates production build artifacts
     */
    build = 'build',

    /**
     * Preview mode
     * Preview build artifacts
     */
    preview = 'preview',

    /**
     * Start mode
     * Starts production environment server
     */
    start = 'start'
}

export type { ImportMap, SpecifierMap, ScopesMap };

/**
 * Initialization status interface for Esmx framework instance
 * @internal For framework internal use only
 *
 * @description
 * This interface defines the status data after framework instance initialization, including:
 * - Application instance: Handles requests and rendering
 * - Current command: Controls runtime mode
 * - Module configuration: Parsed module settings
 * - Package configuration: Parsed build settings
 * - Cache handling: Framework internal caching mechanism
 */
interface Readied {
    /** Application instance, providing middleware and rendering functionality */
    app: App;
    /** Currently executing framework command */
    command: COMMAND;
    /** Parsed module configuration information */
    moduleConfig: ParsedModuleConfig;
    /** Parsed package configuration information */
    packConfig: ParsedPackConfig;
    /** Cache handler */
    cache: CacheHandle;
}

export class Esmx {
    // Basic properties and constructor
    private readonly _options: EsmxOptions;
    private _readied: Readied | null = null;
    private _importmapHash: string | null = null;

    private get readied() {
        if (this._readied) {
            return this._readied;
        }
        throw new NotReadyError();
    }

    /**
     * Get module name
     * @returns {string} The name of the current module, sourced from module configuration
     * @throws {NotReadyError} Throws error when framework instance is not initialized
     */
    public get name(): string {
        return this.moduleConfig.name;
    }

    /**
     * Get module variable name
     * @returns {string} A valid JavaScript variable name generated based on the module name
     * @throws {NotReadyError} Throws error when framework instance is not initialized
     */
    public get varName(): string {
        return '__' + this.name.replace(/[^a-zA-Z]/g, '_') + '__';
    }

    /**
     * Get the absolute path of the project root directory
     * @returns {string} The absolute path of the project root directory
     * If the configured root is a relative path, it is resolved to an absolute path based on the current working directory
     */
    public get root(): string {
        const { root = cwd() } = this._options;
        if (path.isAbsolute(root)) {
            return root;
        }
        return path.resolve(cwd(), root);
    }

    /**
     * Determine if currently in production environment
     * @returns {boolean} Environment flag
     * Prioritizes the isProd in configuration, if not configured, judges based on process.env.NODE_ENV
     */
    public get isProd(): boolean {
        return this._options?.isProd ?? process.env.NODE_ENV === 'production';
    }

    /**
     * Get the base path of the module
     * @returns {string} The base path of the module starting and ending with a slash
     * Used to construct the access path for module assets
     */
    public get basePath(): string {
        return `/${this.name}/`;
    }

    /**
     * Get the base path placeholder
     * @returns {string} Base path placeholder or empty string
     * Used for dynamically replacing the base path of the module at runtime, can be disabled through configuration
     */
    public get basePathPlaceholder(): string {
        const varName = this._options.basePathPlaceholder;
        if (varName === false) {
            return '';
        }
        return varName ?? '[[[___ESMX_DYNAMIC_BASE___]]]';
    }

    /**
     * Get the currently executing command
     * @returns {COMMAND} The command enumeration value currently being executed
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     */
    public get command(): COMMAND {
        return this.readied.command;
    }

    /**
     * Get the command enumeration type
     * @returns {typeof COMMAND} Command enumeration type definition
     */
    public get COMMAND(): typeof COMMAND {
        return COMMAND;
    }

    /**
     * Get module configuration information
     * @returns {ParsedModuleConfig} Complete configuration information of the current module
     */
    public get moduleConfig(): ParsedModuleConfig {
        return this.readied.moduleConfig;
    }

    /**
     * Get package configuration information
     * @returns {ParsedPackConfig} Package-related configuration of the current module
     */
    public get packConfig(): ParsedPackConfig {
        return this.readied.packConfig;
    }

    /**
     * Get the static asset processing middleware for the application.
     *
     * This middleware is responsible for handling static asset requests for the application,
     * providing different implementations based on the runtime environment:
     * - Development environment: Supports real-time compilation and hot reloading of source code, uses no-cache strategy
     * - Production environment: Handles built static assets, supports long-term caching for immutable files
     *
     * @returns {Middleware} Returns the static asset processing middleware function
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * const server = http.createServer((req, res) => {
     *     // Use middleware to handle static asset requests
     *     esmx.middleware(req, res, async () => {
     *         const rc = await esmx.render({ url: req.url });
     *         res.end(rc.html);
     *     });
     * });
     * ```
     */
    public get middleware(): Middleware {
        return this.readied.app.middleware;
    }

    /**
     * Get the server-side rendering function for the application.
     *
     * This function is responsible for executing server-side rendering,
     * providing different implementations based on the runtime environment:
     * - Development environment: Loads server entry file from source code, supports hot reloading and real-time preview
     * - Production environment: Loads built server entry file, provides optimized rendering performance
     *
     * @returns {(options?: RenderContextOptions) => Promise<RenderContext>} Returns the server-side rendering function
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // Basic usage
     * const rc = await esmx.render({
     *     params: { url: req.url }
     * });
     * res.end(rc.html);
     *
     * // Advanced configuration
     * const rc = await esmx.render({
     *     base: '',           // Set base path
     *     importmapMode: 'inline',    // Set import map mode
     *     entryName: 'default',    // Specify render entry
     *     params: {
     *         url: req.url,
     *         state: { user: 'admin' }
     *     }
     * });
     * ```
     */
    public get render(): (
        options?: RenderContextOptions
    ) => Promise<RenderContext> {
        return this.readied.app.render;
    }
    public constructor(options: EsmxOptions = {}) {
        this._options = options;
    }
    /**
     * Initialize the Esmx framework instance.
     *
     * This method executes the following core initialization process:
     * 1. Parse project configuration (package.json, module configuration, package configuration, etc.)
     * 2. Create application instance (development or production environment)
     * 3. Execute corresponding lifecycle methods based on the command
     *
     * @param command - Framework running command
     *   - dev: Start development server with hot reload support
     *   - build: Build production artifacts
     *   - preview: Preview build artifacts
     *   - start: Start production environment server
     *
     * @returns Returns true for successful initialization
     * @throws {Error} Throws error when initializing repeatedly
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // Development environment configuration
     *   async devApp(esmx) {
     *     return import('@esmx/rspack').then((m) =>
     *       m.createRspackHtmlApp(esmx, {
     *         config(context) {
     *           // Custom Rspack configuration
     *         }
     *       })
     *     );
     *   },
     *
     *   // HTTP server configuration
     *   async server(esmx) {
     *     const server = http.createServer((req, res) => {
     *       // Static file handling
     *       esmx.middleware(req, res, async () => {
     *         // Pass rendering parameters
     *         const render = await esmx.render({
     *           params: { url: req.url }
     *         });
     *         // Respond with HTML content
     *         res.end(render.html);
     *       });
     *     });
     *
     *     // Listen to port
     *     server.listen(3000, () => {
     *       console.log('http://localhost:3000');
     *     });
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async init(command: COMMAND): Promise<boolean> {
        if (this._readied) {
            throw new Error('Cannot be initialized repeatedly');
        }

        const { name } = await this.readJson(
            path.resolve(this.root, 'package.json')
        );
        const moduleConfig = parseModuleConfig(
            name,
            this.root,
            this._options.modules
        );
        const packConfig = parsePackConfig(this._options.packs);
        this._readied = {
            command,
            app: {
                middleware() {
                    throw new NotReadyError();
                },
                async render() {
                    throw new NotReadyError();
                }
            },
            moduleConfig,
            packConfig,
            cache: createCache(this.isProd)
        };

        const devApp = this._options.devApp || defaultDevApp;
        const app: App = [COMMAND.dev, COMMAND.build].includes(command)
            ? await devApp(this)
            : await createApp(this, command);

        this.readied.app = app;

        switch (command) {
            case COMMAND.dev:
            case COMMAND.start:
                await this.server();
                break;
            case COMMAND.build:
                return this.build();
            case COMMAND.preview:
                break;
        }
        return true;
    }

    /**
     * Destroy the Esmx framework instance, performing resource cleanup and connection closing operations.
     *
     * This method is mainly used for resource cleanup in development environment, including:
     * - Closing development servers (such as Rspack Dev Server)
     * - Cleaning up temporary files and cache
     * - Releasing system resources
     *
     * Note: In general, the framework automatically handles resource release, users do not need to manually call this method.
     * Only use it when custom resource cleanup logic is needed.
     *
     * @returns Returns a Promise that resolves to a boolean value
     *   - true: Cleanup successful or no cleanup needed
     *   - false: Cleanup failed
     *
     * @example
     * ```ts
     * // Use when custom cleanup logic is needed
     * process.once('SIGTERM', async () => {
     *   await esmx.destroy(); // Clean up resources
     *   process.exit(0);
     * });
     * ```
     */
    public async destroy(): Promise<boolean> {
        const { readied } = this;
        if (readied.app?.destroy) {
            return readied.app.destroy();
        }
        return true;
    }

    /**
     * Execute the application's build process.
     *
     * This method is responsible for executing the entire application build process, including:
     * - Compiling source code
     * - Generating production build artifacts
     * - Optimizing and compressing code
     * - Generating asset manifests
     *
     * The build process prints start and end times, as well as total duration and other information.
     *
     * @returns Returns a Promise that resolves to a boolean value
     *   - true: Build successful or build method not implemented
     *   - false: Build failed
     *
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // Development environment configuration
     *   async devApp(esmx) {
     *     return import('@esmx/rspack').then((m) =>
     *       m.createRspackHtmlApp(esmx, {
     *         config(context) {
     *           // Custom Rspack configuration
     *         }
     *       })
     *     );
     *   },
     *
     *   // Post-build processing
     *   async postBuild(esmx) {
     *     // Generate static HTML after build completion
     *     const render = await esmx.render({
     *       params: { url: '/' }
     *     });
     *     esmx.writeSync(
     *       esmx.resolvePath('dist/client', 'index.html'),
     *       render.html
     *     );
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async build(): Promise<boolean> {
        const startTime = Date.now();

        const successful = await this.readied.app.build?.();

        const endTime = Date.now();
        const duration = endTime - startTime;
        const status = successful
            ? '\x1b[32m✓\x1b[0m'.padEnd(3)
            : '\x1b[31m✗\x1b[0m'.padEnd(3);
        console.log(
            `${status.padEnd(2)} Build ${successful ? 'completed' : 'failed'} in ${duration}ms`
        );

        return successful ?? true;
    }

    /**
     * Start HTTP server and configure server instance.
     *
     * This method is called in the following lifecycle of the framework:
     * - Development environment (dev): Start development server, providing features like hot reload
     * - Production environment (start): Start production server, providing production-grade performance
     *
     * The specific implementation of the server is provided by the user through the server configuration function in EsmxOptions.
     * This function is responsible for:
     * - Creating HTTP server instance
     * - Configuring middleware and routes
     * - Handling requests and responses
     * - Starting server listening
     *
     * @returns Returns a Promise that resolves when the server startup is complete
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import http from 'node:http';
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // Server configuration
     *   async server(esmx) {
     *     const server = http.createServer((req, res) => {
     *       // Handle static assets
     *       esmx.middleware(req, res, async () => {
     *         // Server-side rendering
     *         const render = await esmx.render({
     *           params: { url: req.url }
     *         });
     *         res.end(render.html);
     *       });
     *     });
     *
     *     // Start server
     *     server.listen(3000, () => {
     *       console.log('Server running at http://localhost:3000');
     *     });
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async server(): Promise<void> {
        await this._options?.server?.(this);
    }

    /**
     * Execute post-build processing logic.
     *
     * This method is called after the application build is completed, used to perform additional resource processing, such as:
     * - Generating static HTML files
     * - Processing build artifacts
     * - Executing deployment tasks
     * - Sending build notifications
     *
     * The method automatically captures and handles exceptions during execution, ensuring it does not affect the main build process.
     *
     * @returns Returns a Promise that resolves to a boolean value
     *   - true: Post-processing successful or no processing needed
     *   - false: Post-processing failed
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // Post-build processing
     *   async postBuild(esmx) {
     *     // Generate static HTML for multiple pages
     *     const pages = ['/', '/about', '/404'];
     *
     *     for (const url of pages) {
     *       const render = await esmx.render({
     *         params: { url }
     *       });
     *
     *       // Write static HTML file
     *       esmx.writeSync(
     *         esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
     *         render.html
     *       );
     *     }
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async postBuild(): Promise<boolean> {
        try {
            await this._options.postBuild?.(this);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * Resolve project relative path to absolute path
     *
     * @param projectPath - Project path type, such as 'dist/client', 'dist/server', etc.
     * @param args - Path segments to be concatenated
     * @returns Resolved absolute path
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async postBuild(esmx) {
     *   const outputPath = esmx.resolvePath('dist/client', 'index.html');
     *   // Output: /project/root/dist/client/index.html
     * }
     * ```
     */
    public resolvePath(projectPath: ProjectPath, ...args: string[]): string {
        return resolvePath(this.root, projectPath, ...args);
    }

    /**
     * Write file content synchronously
     *
     * @param filepath - Absolute path of the file
     * @param data - Data to be written, can be string, Buffer or object
     * @returns Whether the write was successful
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async postBuild(esmx) {
     *   const htmlPath = esmx.resolvePath('dist/client', 'index.html');
     *   const success = esmx.writeSync(htmlPath, '<html>...</html>');
     * }
     * ```
     */
    public writeSync(filepath: string, data: any): boolean {
        try {
            // Ensure the target directory exists
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
            // Write file
            fs.writeFileSync(filepath, data);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Write file content asynchronously
     *
     * @param filepath - Absolute path of the file
     * @param data - Data to be written, can be string, Buffer or object
     * @returns Promise<boolean> Whether the write was successful
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async postBuild(esmx) {
     *   const htmlPath = esmx.resolvePath('dist/client', 'index.html');
     *   const success = await esmx.write(htmlPath, '<html>...</html>');
     * }
     * ```
     */
    public async write(filepath: string, data: any): Promise<boolean> {
        try {
            // Ensure the target directory exists
            await fsp.mkdir(path.dirname(filepath), { recursive: true });
            // Write file
            await fsp.writeFile(filepath, data);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Read and parse JSON file synchronously
     *
     * @template T - Expected JSON object type to return
     * @param filename - Absolute path of the JSON file
     * @returns {T} Parsed JSON object
     * @throws Throws exception when file does not exist or JSON format is incorrect
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async server(esmx) {
     *   const manifest = esmx.readJsonSync<Manifest>(esmx.resolvePath('dist/client', 'manifest.json'));
     *   // Use manifest object
     * }
     * ```
     */
    public readJsonSync<T = any>(filename: string): T {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    }

    /**
     * Read and parse JSON file asynchronously
     *
     * @template T - Expected JSON object type to return
     * @param filename - Absolute path of the JSON file
     * @returns {Promise<T>} Parsed JSON object
     * @throws Throws exception when file does not exist or JSON format is incorrect
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async server(esmx) {
     *   const manifest = await esmx.readJson<Manifest>(esmx.resolvePath('dist/client', 'manifest.json'));
     *   // Use manifest object
     * }
     * ```
     */
    public async readJson<T = any>(filename: string): Promise<T> {
        return JSON.parse(await fsp.readFile(filename, 'utf-8'));
    }

    /**
     * Get build manifest list
     *
     * @description
     * This method is used to get the build manifest list for the specified target environment, including the following features:
     * 1. **Cache Management**
     *    - Uses internal caching mechanism to avoid repeated loading
     *    - Returns immutable manifest list
     *
     * 2. **Environment Adaptation**
     *    - Supports both client and server environments
     *    - Returns corresponding manifest information based on the target environment
     *
     * 3. **Module Mapping**
     *    - Contains module export information
     *    - Records resource dependency relationships
     *
     * @param env - Target environment type
     *   - 'client': Client environment
     *   - 'server': Server environment
     * @returns Returns read-only build manifest list
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async server(esmx) {
     *   // Get client build manifest
     *   const manifests = await esmx.getManifestList('client');
     *
     *   // Find build information for a specific module
     *   const appModule = manifests.find(m => m.name === 'my-app');
     *   if (appModule) {
     *     console.log('App exports:', appModule.exports);
     *     console.log('App chunks:', appModule.chunks);
     *   }
     * }
     * ```
     */
    public async getManifestList(
        env: BuildEnvironment
    ): Promise<readonly ManifestJson[]> {
        return this.readied.cache(`getManifestList-${env}`, async () =>
            Object.freeze(await getManifestList(env, this.moduleConfig))
        );
    }

    /**
     * Get import map object
     *
     * @description
     * This method is used to generate ES module import maps with the following features:
     * 1. **Module Resolution**
     *    - Generate module mappings based on build manifests
     *    - Support both client and server environments
     *    - Automatically handle module path resolution
     *
     * 2. **Cache Optimization**
     *    - Use internal caching mechanism
     *    - Return immutable mapping objects
     *
     * 3. **Path Handling**
     *    - Automatically handle module paths
     *    - Support dynamic base paths
     *
     * @param env - Target environment type
     *   - 'client': Generate import map for browser environment
     *   - 'server': Generate import map for server environment
     * @returns Returns read-only import map object
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async server(esmx) {
     *   // Get client import map
     *   const importmap = await esmx.getImportMap('client');
     *
     *   // Custom HTML template
     *   const html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       <script type="importmap">
     *         ${JSON.stringify(importmap)}
     *       </script>
     *     </head>
     *     <body>
     *       <!-- Page content -->
     *     </body>
     *     </html>
     *   `;
     * }
     * ```
     */
    public async getImportMap(
        env: BuildEnvironment
    ): Promise<Readonly<ImportMap>> {
        return this.readied.cache(`getImportMap-${env}`, async () => {
            const { moduleConfig } = this.readied;
            const manifests = await this.getManifestList(env);
            let json: ImportMap = {};
            switch (env) {
                case 'client': {
                    json = fixNestedScopesResolution(
                        getImportMap({
                            manifests,
                            getScope(name, scope) {
                                return `/${name}${scope}`;
                            },
                            getFile(name, file) {
                                return `/${name}/${file}`;
                            }
                        }),
                        manifests,
                        (name, scope) => {
                            return `/${name}${scope}`;
                        }
                    );
                    break;
                }
                case 'server':
                    json = getImportMap({
                        manifests,
                        getScope: (name: string, scope: string) => {
                            const linkPath = moduleConfig.links[name].server;
                            // Get the real physical path instead of symbolic link
                            // This is crucial when generating import maps on the server side.
                            // If we use symbolic link paths as scopes, it would cause module resolution errors at runtime
                            // because the actual accessed paths are real physical paths, not the symbolic links.
                            // Using realpathSync ensures path consistency between import map generation and runtime resolution.
                            const realPath = fs.realpathSync(linkPath);
                            return pathToFileURL(path.join(realPath, scope))
                                .href;
                        },
                        getFile: (name: string, file: string) => {
                            const linkPath = moduleConfig.links[name].server;
                            // Get the real physical path instead of symbolic link
                            // This is crucial to maintain consistency with getScope function
                            // and ensure proper module resolution at runtime
                            const realPath = fs.realpathSync(linkPath);
                            return pathToFileURL(path.resolve(realPath, file))
                                .href;
                        }
                    });
                    break;
            }

            return Object.freeze(json);
        });
    }

    /**
     * Get client import map information
     *
     * @description
     * This method is used to generate import map code for client environment, supporting two modes:
     * 1. **Inline Mode (inline)**
     *    - Inline import map directly into HTML
     *    - Reduce additional network requests
     *    - Suitable for scenarios with smaller import maps
     *
     * 2. **JS File Mode (js)**
     *    - Generate standalone JS file
     *    - Support browser caching
     *    - Suitable for scenarios with larger import maps
     *
     * Core Features:
     * - Automatically handle dynamic base paths
     * - Support module path runtime replacement
     * - Optimize caching strategy
     * - Ensure module loading order
     *
     * @param mode - Import map mode
     *   - 'inline': Inline mode, returns HTML script tag
     *   - 'js': JS file mode, returns information with file path
     * @returns Returns import map related information
     *   - src: URL of the JS file (only in js mode)
     *   - filepath: Local path of the JS file (only in js mode)
     *   - code: HTML script tag content
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // Used in entry.node.ts
     * async server(esmx) {
     *   const server = express();
     *   server.use(esmx.middleware);
     *
     *   server.get('*', async (req, res) => {
     *     // Use JS file mode
     *     const result = await esmx.render({
     *       importmapMode: 'js',
     *       params: { url: req.url }
     *     });
     *     res.send(result.html);
     *   });
     *
     *   // Or use inline mode
     *   server.get('/inline', async (req, res) => {
     *     const result = await esmx.render({
     *       importmapMode: 'inline',
     *       params: { url: req.url }
     *     });
     *     res.send(result.html);
     *   });
     * }
     * ```
     */
    public async getImportMapClientInfo<T extends ImportmapMode>(
        mode: T
    ): Promise<
        T extends 'js'
            ? {
                  src: string;
                  filepath: string;
                  code: string;
              }
            : {
                  src: null;
                  filepath: null;
                  code: string;
              }
    > {
        return this.readied.cache(
            `getImportMap-${mode}`,
            async (): Promise<any> => {
                const importmap = await this.getImportMap('client');
                const { basePathPlaceholder } = this;
                let filepath: string | null = null;
                if (this._importmapHash === null) {
                    let wrote = false;
                    const code = `(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = ${serialize(importmap, { isJSON: true })};
const set = (data) => {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        data[k] = base + v;
    });
};
set(importmap.imports);
if (importmap.scopes) {
    Object.values(importmap.scopes).forEach(set);
}
const script = document.createElement("script");
script.type = "importmap";
script.innerText = JSON.stringify(importmap);
document.head.appendChild(script);
})();`;
                    const hash = contentHash(code);
                    filepath = this.resolvePath(
                        'dist/client/importmap',
                        `${hash}.final.mjs`
                    );
                    try {
                        const existingContent = await fsp.readFile(
                            filepath,
                            'utf-8'
                        );
                        if (existingContent === code) {
                            wrote = true;
                        } else {
                            wrote = await this.write(filepath, code);
                        }
                    } catch {
                        wrote = await this.write(filepath, code);
                    }
                    this._importmapHash = wrote ? hash : '';
                }
                if (mode === 'js' && this._importmapHash) {
                    const src = `${basePathPlaceholder}${this.basePath}importmap/${this._importmapHash}.final.mjs`;
                    return {
                        src,
                        filepath,
                        code: `<script data-base="${basePathPlaceholder}" src="${src}"></script>`
                    };
                }
                if (basePathPlaceholder) {
                    const set = (data?: Record<string, string>) => {
                        if (!data) return;
                        Object.entries(data).forEach(([k, v]) => {
                            data[k] = basePathPlaceholder + v;
                        });
                    };
                    set(importmap.imports);
                    if (importmap.scopes) {
                        Object.values(importmap.scopes).forEach(set);
                    }
                }
                return {
                    src: null,
                    filepath: null,
                    code: `<script type="importmap">${serialize(importmap, { isJSON: true, unsafe: true })}</script>`
                };
            }
        );
    }

    /**
     * Get the list of static import paths for a module.
     *
     * @param env - Build target ('client' | 'server')
     * @param specifier - Module specifier
     * @returns Returns the list of static import paths, returns null if not found
     * @throws {NotReadyError} Throws error when calling this method if the framework instance is not initialized
     *
     * @example
     * ```ts
     * // Get static import paths for client entry module
     * const paths = await esmx.getStaticImportPaths(
     *   'client',
     *   `your-app-name/src/entry.client`
     * );
     * ```
     */
    public async getStaticImportPaths(
        env: BuildEnvironment,
        specifier: string
    ) {
        return this.readied.cache(
            `getStaticImportPaths-${env}-${specifier}`,
            async () => {
                const result = await getStaticImportPaths(
                    specifier,
                    await this.getImportMap(env),
                    this.moduleConfig
                );
                if (!result) {
                    return null;
                }
                return Object.freeze(Object.values(result));
            }
        );
    }
}

/**
 * Default development environment application creation function
 *
 * @description
 * This is a default placeholder function that throws an error when the development environment application creation function is not configured.
 * In actual use, the actual application creation function should be configured through EsmxOptions.devApp.
 *
 * @throws {Error} Throws an error when devApp is not configured, prompting the user to set up the development environment application creation function
 * @returns {Promise<App>} Will not actually return, always throws an error
 *
 * @example
 * ```ts
 * // Correct usage is to provide devApp in the configuration
 * const options: EsmxOptions = {
 *   devApp: async (esmx) => {
 *     return import('@esmx/rspack').then(m =>
 *       m.createRspackHtmlApp(esmx)
 *     );
 *   }
 * };
 * ```
 */
async function defaultDevApp(): Promise<App> {
    throw new Error("'devApp' function not set");
}

/**
 * Esmx framework not initialized error
 *
 * @description
 * This error is thrown in the following situations:
 * - Accessing methods or properties that require initialization before calling init()
 * - Attempting to use core functionality when the framework is not fully initialized
 * - Continuing to use framework functionality after destroying the instance
 *
 * @extends Error
 *
 * @example
 * ```ts
 * const esmx = new Esmx();
 * try {
 *   // This will throw NotReadyError because it's not initialized yet
 *   await esmx.render();
 * } catch (e) {
 *   if (e instanceof NotReadyError) {
 *     console.error('Framework not initialized');
 *   }
 * }
 * ```
 */
class NotReadyError extends Error {
    constructor() {
        super(`The Esmx has not been initialized yet`);
    }
}

/**
 * Calculate SHA-256 hash value of content
 *
 * @description
 * This function is used for:
 * - Generating unique identifiers for file content
 * - Cache invalidation judgment
 * - Generating filenames with content hash
 *
 * Features:
 * - Uses SHA-256 algorithm to ensure hash uniqueness
 * - Truncates to first 12 characters to balance uniqueness and length
 * - Suitable for cache control and file version management
 *
 * @param {string} text - Text content to calculate hash for
 * @returns {string} Returns 12-character hexadecimal hash string
 *
 * @example
 * ```ts
 * const content = 'some content';
 * const hash = contentHash(content);
 * // Output similar to: 'a1b2c3d4e5f6'
 * ```
 */
function contentHash(text: string) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex').substring(0, 12);
}
