import { type App, createApp, type Esmx, mergeMiddlewares } from '@esmx/core';
import { type InlineConfig, build as viteBuild } from 'vite';
import type { BuildTarget } from './build-target';
import { createViteConfig, type ViteAppOptions } from './config';
import { createViteDevServer } from './dev';
import { writeDistPackageJson } from './pack';

export type { BuildTarget } from './build-target';
export type { ViteAppConfigContext, ViteAppOptions } from './config';

/**
 * Create a Vite-powered Esmx application instance.
 *
 * - dev: runs a Vite dev server with real module-level HMR and SSR via
 *   ssrLoadModule (see ./dev).
 * - build: produces client + server + node artifacts, the start bootstrap and
 *   the dist package.json.
 * - start: handled by @esmx/core, which loads the built server entry.
 */
export async function createViteApp(
    esmx: Esmx,
    options: ViteAppOptions = {}
): Promise<App> {
    const app = await createApp(esmx, esmx.command);
    switch (esmx.command) {
        case esmx.COMMAND.dev: {
            const dev = await createViteDevServer(esmx, options);
            app.middleware = mergeMiddlewares([dev.middleware, app.middleware]);
            app.render = dev.render;
            app.destroy = dev.close;
            break;
        }
        case esmx.COMMAND.build:
            app.build = rewriteBuild(esmx, options);
            break;
    }
    return app;
}

function buildConfig(
    esmx: Esmx,
    options: ViteAppOptions,
    buildTarget: BuildTarget
): InlineConfig {
    return createViteConfig(esmx, buildTarget, options);
}

function rewriteBuild(esmx: Esmx, options: ViteAppOptions) {
    const targets: BuildTarget[] = ['client', 'server'];
    if (!esmx.moduleConfig.lib) {
        targets.push('node');
    }
    return async (): Promise<boolean> => {
        // Vite builds one target at a time (unlike rspack's MultiCompiler).
        for (const target of targets) {
            await viteBuild(buildConfig(esmx, options, target));
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
