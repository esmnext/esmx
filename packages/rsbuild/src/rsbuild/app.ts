import { pathToFileURL } from 'node:url';
import {
    type App,
    createApp,
    type Esmx,
    type Middleware,
    mergeMiddlewares,
    RenderContext,
    type RenderContextOptions,
    type ServerRenderHandle
} from '@esmx/core';
import { createVmImport } from '@esmx/import';
import { createRsbuild } from '@rsbuild/core';
import hotMiddleware from 'webpack-hot-middleware';
import type { BuildTarget } from './build-target';
import {
    type CreateRsbuildConfigContext,
    createRsbuildConfig,
    type RsbuildAppOptions
} from './config';
import { writeDistPackageJson } from './pack';

export type { BuildTarget } from './build-target';
export type {
    RsbuildAppConfigContext,
    RsbuildAppOptions
} from './config';

interface CompilerLike {
    watch(options: unknown, handler: (err: unknown) => void): unknown;
}

/**
 * Create an Rsbuild-powered Esmx application instance.
 *
 * - dev: watch-builds client + server to disk via the underlying rspack
 *   compiler and serves webpack-hot-middleware for real HMR (same mechanism as
 *   @esmx/rspack, since Rsbuild is rspack underneath); SSR via vm-import.
 * - build: produces client + server + node artifacts, the start bootstrap and
 *   the dist package.json.
 * - start: handled by @esmx/core, which loads the built server entry.
 */
export async function createRsbuildApp(
    esmx: Esmx,
    options: RsbuildAppOptions = {}
): Promise<App> {
    const app = await createApp(esmx, esmx.command);
    switch (esmx.command) {
        case esmx.COMMAND.dev:
            app.middleware = mergeMiddlewares([
                ...(await createDevMiddleware(esmx, options)),
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

async function buildInstance(
    esmx: Esmx,
    options: RsbuildAppOptions,
    buildTarget: BuildTarget,
    ctx?: CreateRsbuildConfigContext
) {
    return createRsbuild({
        cwd: esmx.root,
        rsbuildConfig: createRsbuildConfig(esmx, buildTarget, options, ctx)
    });
}

function rewriteBuild(esmx: Esmx, options: RsbuildAppOptions) {
    const targets: BuildTarget[] = ['client', 'server'];
    if (!esmx.moduleConfig.lib) {
        targets.push('node');
    }
    return async (): Promise<boolean> => {
        for (const target of targets) {
            const instance = await buildInstance(esmx, options, target);
            await instance.build();
        }

        writeDistPackageJson(esmx);
        esmx.writeSync(
            esmx.resolvePath('dist/index.mjs'),
            `
async function start() {
    const options = await import('./node/src/entry.node.mjs').then(
        (mod) => mod.default
    );
    const { Esmx } = await import('@esmx/core');
    const esmx = new Esmx(options);

    await esmx.init(esmx.COMMAND.start);
}

start();
`.trim()
        );

        console.log('\n');
        console.log(esmx.generateSizeReport().text);
        return true;
    };
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
            global
        );
        const serverRender: ServerRenderHandle = module[rc.entryName];
        if (typeof serverRender === 'function') {
            await serverRender(rc);
        }
        return rc;
    };
}

/**
 * Dev middleware: watch-build client + server through the rspack compiler and
 * expose webpack-hot-middleware for HMR (the browser entry bundles the
 * hot-middleware client via preEntries — same approach as @esmx/rspack).
 */
async function createDevMiddleware(
    esmx: Esmx,
    options: RsbuildAppOptions
): Promise<Middleware[]> {
    const hotClient = `${import.meta.resolve('webpack-hot-middleware/client.js')}?path=/${esmx.name}/hot-middleware`;

    const clientInstance = await buildInstance(esmx, options, 'client', {
        hot: true,
        preEntries: [hotClient]
    });
    const serverInstance = await buildInstance(esmx, options, 'server');

    const clientCompiler =
        (await clientInstance.createCompiler()) as unknown as CompilerLike;
    const serverCompiler =
        (await serverInstance.createCompiler()) as unknown as CompilerLike;

    // Surface fatal watch errors instead of swallowing them; per-build compile
    // errors are still reported by Rsbuild's own stats reporter.
    const onWatchError = (target: string) => (err: unknown) => {
        if (err) console.error(`[esmx:rsbuild] ${target} watch error:`, err);
    };
    clientCompiler.watch({}, onWatchError('client'));
    serverCompiler.watch({}, onWatchError('server'));

    const hot = hotMiddleware(clientCompiler as never, {
        path: `${esmx.basePath}hot-middleware`
    });

    return [
        (req, res, next) => {
            if (req.url?.startsWith(`${esmx.basePath}hot-middleware`)) {
                return hot(req as never, res as never, next as never);
            }
            return next();
        }
    ];
}
