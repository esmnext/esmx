import { pathToFileURL } from 'node:url';
import { createLoaderImport } from '@esmx/import';
import type { COMMAND, Esmx } from './core';
import {
    RenderContext,
    type RenderContextOptions,
    type ServerRenderHandle
} from './render-context';
import { createMiddleware, type Middleware } from './utils/middleware';

/**
 * Application instance interface.
 *
 * App is the application abstraction of the Esmx framework, providing a unified interface
 * to manage application lifecycle, static assets, and server-side rendering.
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   // Development environment configuration
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackHtmlApp(esmx, {
 *         config(rc) {
 *           // Custom Rspack configuration
 *         }
 *       })
 *     );
 *   }
 * }
 * ```
 */
export interface App {
    /**
     * Static asset processing middleware.
     *
     * Development environment:
     * - Handles static asset requests from source code
     * - Supports real-time compilation and hot reloading
     * - Uses no-cache strategy
     *
     * Production environment:
     * - Handles built static assets
     * - Supports long-term caching for immutable files (.final.xxx)
     * - Optimized asset loading strategy
     *
     * @example
     * ```ts
     * server.use(esmx.middleware);
     * ```
     */
    middleware: Middleware;

    /**
     * Server-side rendering function.
     *
     * Provides different implementations based on the runtime environment:
     * - Production environment (start): Loads the built server entry file (entry.server) to execute rendering
     * - Development environment (dev): Loads the server entry file from source code to execute rendering
     *
     * @param options - Rendering options
     * @returns Returns the rendering context containing the rendering result
     *
     * @example
     * ```ts
     * const rc = await esmx.render({
     *   params: { url: '/page' }
     * });
     * res.end(rc.html);
     * ```
     */
    render: (options?: RenderContextOptions) => Promise<RenderContext>;

    /**
     * Production environment build function.
     * Used for asset packaging and optimization.
     *
     * @returns Returns true for successful build, false for failed build
     */
    build?: () => Promise<boolean>;

    /**
     * Resource cleanup function.
     * Used for shutting down servers, disconnecting connections, etc.
     *
     * @returns Returns true for successful cleanup, false for failed cleanup
     */
    destroy?: () => Promise<boolean>;
}

/**
 * Create an application instance for production environment, not available in development environment.
 */
export async function createApp(esmx: Esmx, command: COMMAND): Promise<App> {
    const render =
        command === esmx.COMMAND.start
            ? await createStartRender(esmx) // Provides actual rendering function
            : createErrorRender(esmx); // Provides error prompt rendering function
    return {
        middleware: createMiddleware(esmx),
        render
    };
}

/**
 * Create production environment rendering function.
 * Loads the built server entry file (entry.server) to execute rendering.
 *
 * @param esmx - Esmx instance
 * @returns Returns the rendering function
 * @internal
 *
 * @example
 * ```ts
 * // Server entry file (entry.server)
 * export default async function render(rc: RenderContext) {
 *   rc.html = '<html>...</html>';
 * }
 * ```
 */
async function createStartRender(esmx: Esmx) {
    const baseURL = pathToFileURL(esmx.resolvePath('dist/server')) as URL;
    const importMap = await esmx.getImportMap('server');
    const loaderImport = createLoaderImport(baseURL, importMap);

    return async (options?: RenderContextOptions): Promise<RenderContext> => {
        try {
            const rc = new RenderContext(esmx, options);
            const result = await loaderImport(`${esmx.name}/src/entry.server`);
            const serverRender: ServerRenderHandle = result[rc.entryName];
            if (typeof serverRender === 'function') {
                await serverRender(rc);
            }
            return rc;
        } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
        }
    };
}

function createErrorRender(esmx: Esmx) {
    return (options?: RenderContextOptions) => {
        throw new Error(
            `App instance is only available in production and can only execute built artifacts.`
        );
    };
}
