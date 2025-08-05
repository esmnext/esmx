import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    type App,
    type Esmx,
    type Middleware,
    RenderContext,
    type RenderContextOptions,
    type ServerRenderHandle,
    createApp,
    mergeMiddlewares
} from '@esmx/core';
import { createVmImport } from '@esmx/import';
import type { RspackOptions } from '@rspack/core';
import hotMiddleware from 'webpack-hot-middleware';
import type { BuildTarget } from './build-target';
import { createRspackConfig } from './chain-config';
import { pack } from './pack';
import { createRsBuild } from './utils';

const extension = path.extname(fileURLToPath(import.meta.url));
const hotFixCode = fs.readFileSync(
    fileURLToPath(new URL(`./hot-fix${extension}`, import.meta.url)),
    'utf-8'
);

/**
 * Rspack application configuration context interface.
 *
 * This interface provides context information accessible in configuration hook functions, allowing you to:
 * - Access the Esmx framework instance
 * - Get the current build target (client/server/node)
 * - Modify Rspack configuration
 * - Access application options
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         // Configuration hook function
 *         config(context) {
 *           // Access build target
 *           if (context.buildTarget === 'client') {
 *             // Modify client build configuration
 *             context.config.optimization = {
 *               ...context.config.optimization,
 *               splitChunks: {
 *                 chunks: 'all'
 *               }
 *             };
 *           }
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export interface RspackAppConfigContext {
    /**
     * Esmx framework instance.
     * Can be used to access framework APIs and utility functions.
     */
    esmx: Esmx;

    /**
     * Current build target.
     * - 'client': Client build, generates browser-executable code
     * - 'server': Server build, generates SSR rendering code
     * - 'node': Node.js build, generates server entry code
     */
    buildTarget: BuildTarget;

    /**
     * Rspack compilation configuration object.
     * You can modify this object in configuration hooks to customize build behavior.
     */
    config: RspackOptions;

    /**
     * Options object passed when creating the application.
     */
    options: RspackAppOptions;
}

/**
 * Rspack chain configuration context interface.
 *
 * This interface provides context information accessible in chain hook functions, allowing you to:
 * - Access the Esmx framework instance
 * - Get the current build target (client/server/node)
 * - Modify configuration using rspack-chain
 * - Access application options
 */
export interface RspackAppChainContext {
    /**
     * Esmx framework instance.
     * Can be used to access framework APIs and utility functions.
     */
    esmx: Esmx;

    /**
     * Current build target.
     * - 'client': Client build, generates browser-executable code
     * - 'server': Server build, generates SSR rendering code
     * - 'node': Node.js build, generates server entry code
     */
    buildTarget: BuildTarget;

    /**
     * rspack-chain configuration object.
     * You can use the chain API in chain hooks to modify the configuration.
     */
    chain: import('rspack-chain');

    /**
     * Options object passed when creating the application.
     */
    options: RspackAppOptions;
}

/**
 * Rspack application configuration options interface.
 *
 * This interface provides configuration options available when creating a Rspack application, including:
 * - Code compression options
 * - Rspack configuration hook functions
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         // Disable code compression
 *         minimize: false,
 *         // Custom Rspack configuration
 *         config(context) {
 *           if (context.buildTarget === 'client') {
 *             context.config.optimization.splitChunks = {
 *               chunks: 'all'
 *             };
 *           }
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export interface RspackAppOptions {
    /**
     * Whether to enable code compression.
     *
     * - true: Enable code compression
     * - false: Disable code compression
     * - undefined: Automatically determine based on environment (enabled in production, disabled in development)
     *
     * @default undefined
     */
    minimize?: boolean;

    /**
     * Called before the build starts, this function allows you to modify the Rspack compilation configuration.
     * Supports differentiated configuration for different build targets (client/server/node).
     *
     * @param context - Configuration context, containing framework instance, build target, and configuration object
     */
    config?: (context: RspackAppConfigContext) => void;

    /**
     * Uses rspack-chain to provide chained configuration method, allowing more flexible modification of Rspack configuration.
     * Called after the config hook, if chain hook exists, chained configuration is preferred.
     *
     * @param context - Configuration context, containing framework instance, build target, and chain configuration object
     */
    chain?: (context: RspackAppChainContext) => void;
}

/**
 * Create Rspack application instance.
 *
 * This function creates different application instances based on the runtime environment (development/production):
 * - Development environment: Configures hot update middleware and real-time rendering
 * - Production environment: Configures build tasks
 *
 * @param esmx - Esmx framework instance
 * @param options - Rspack application configuration options
 * @returns Returns application instance
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         config(context) {
 *           // Configure loader to handle different file types
 *           context.config.module = {
 *             rules: [
 *               {
 *                 test: /\.ts$/,
 *                 exclude: [/node_modules/],
 *                 loader: 'builtin:swc-loader',
 *                 options: {
 *                   jsc: {
 *                     parser: {
 *                       syntax: 'typescript'
 *                     }
 *                   }
 *                 }
 *               },
 *               {
 *                 test: /\.css$/,
 *                 use: ['style-loader', 'css-loader']
 *               }
 *             ]
 *           };
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export async function createRspackApp(
    esmx: Esmx,
    options?: RspackAppOptions
): Promise<App> {
    const app = await createApp(esmx, esmx.command);
    switch (esmx.command) {
        case esmx.COMMAND.dev:
            app.middleware = mergeMiddlewares([
                ...(await createMiddleware(esmx, options)),
                app.middleware
            ]);
            app.render = rewriteRender(esmx);
            break;
        case esmx.COMMAND.build:
            app.build = rewriteBuild(esmx, options);
            break;
    }
    return app;
}
async function createMiddleware(
    esmx: Esmx,
    options: RspackAppOptions = {}
): Promise<Middleware[]> {
    if (esmx.command !== esmx.COMMAND.dev) {
        return [];
    }
    // const middlewares: Middleware[] = [];

    const rsBuild = createRsBuild([
        generateBuildConfig(esmx, options, 'client'),
        generateBuildConfig(esmx, options, 'server')
    ]);
    rsBuild.watch();

    // @ts-ignore
    const hot = hotMiddleware(rsBuild.compilers[0], {
        path: `${esmx.basePath}hot-middleware`
    });
    return [
        (req, res, next) => {
            if (req.url?.startsWith(`${esmx.basePath}hot-middleware`)) {
                // @ts-ignore
                return hot(req, res, next);
            }
            return next();
        }
    ];
}

function generateBuildConfig(
    esmx: Esmx,
    options: RspackAppOptions,
    buildTarget: BuildTarget
): RspackOptions {
    return createRspackConfig(esmx, buildTarget, options);
}

function rewriteRender(esmx: Esmx) {
    return async (options?: RenderContextOptions): Promise<RenderContext> => {
        const baseURL = pathToFileURL(esmx.root);
        const importMap = await esmx.getImportMap('server');
        const vmImport = createVmImport(baseURL, importMap);
        const rc = new RenderContext(esmx, options);
        const module = await vmImport(
            `${esmx.name}/src/entry.server`,
            import.meta.url,
            {
                console,
                setTimeout,
                clearTimeout,
                process,
                URL,
                global
            }
        );
        const serverRender: ServerRenderHandle = module[rc.entryName];
        if (typeof serverRender === 'function') {
            await serverRender(rc);
            rc.html = rc.html.replace(
                '</head>',
                `
                <script type="module">${hotFixCode}</script>
                </head>
            `
            );
        }
        return rc;
    };
}

function rewriteBuild(esmx: Esmx, options: RspackAppOptions = {}) {
    return async (): Promise<boolean> => {
        const ok = await createRsBuild([
            generateBuildConfig(esmx, options, 'client'),
            generateBuildConfig(esmx, options, 'server'),
            generateBuildConfig(esmx, options, 'node')
        ]).build();
        if (!ok) {
            return false;
        }
        esmx.writeSync(
            esmx.resolvePath('dist/index.mjs'),
            `
async function start() {
    const options = await import('./node/exports/src/entry.node.mjs').then(
        (mod) => mod.default
    );
    const { Esmx } = await import('@esmx/core');
    const esmx = new Esmx(options);

    await esmx.init(esmx.COMMAND.start);
}

start();
`.trim()
        );
        return pack(esmx);
    };
}
