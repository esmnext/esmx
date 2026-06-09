import type { App, Esmx } from '@esmx/core';
import {
    createRsbuildApp,
    type RsbuildAppConfigContext,
    type RsbuildAppOptions
} from '@esmx/rsbuild';
import { pluginVue } from '@rsbuild/plugin-vue';

export * from '@esmx/rsbuild';

export interface RsbuildVueAppOptions extends RsbuildAppOptions {}

/**
 * Create an Rsbuild + Vue 3 Esmx application.
 *
 * Adds @rsbuild/plugin-vue (SFC compilation + HMR) on top of the base Rsbuild
 * integration via the config hook, so it applies to every build target.
 */
export function createRsbuildVueApp(
    esmx: Esmx,
    options: RsbuildVueAppOptions = {}
): Promise<App> {
    return createRsbuildApp(esmx, {
        ...options,
        config(context: RsbuildAppConfigContext) {
            // @rsbuild/plugin-vue hardcodes vue-loader's `isServerBuild` to
            // undefined, so SFCs in the server build are NOT compiled in SSR
            // mode — they drag the runtime template compiler (and @vue/
            // compiler-sfc / @babel/parser) into the federated `vue` chunk,
            // which breaks the @vue/server-renderer ↔ vue `ssrUtils` linkage.
            // Compile SFCs for SSR on the server/node targets, like
            // @esmx/rspack-vue's `optimizeSSR`.
            const isServerBuild = context.buildTarget !== 'client';
            context.config.plugins = [
                ...(context.config.plugins ?? []),
                pluginVue({ vueLoaderOptions: { isServerBuild } })
            ];
            // Resolve `vue` to the runtime-only build (with ssrUtils, no
            // template compiler), like @esmx/rspack-vue. Otherwise the
            // federation `vue` entry resolves to the full build, dragging the
            // runtime compiler into the chunk and breaking the
            // @vue/server-renderer ↔ vue ssrUtils linkage in SSR.
            const prev = context.config.tools?.bundlerChain;
            context.config.tools = {
                ...context.config.tools,
                bundlerChain: (chain, utils) => {
                    chain.resolve.alias.set(
                        'vue$',
                        esmx.isProd
                            ? 'vue/dist/vue.runtime.esm-browser.prod.js'
                            : 'vue/dist/vue.runtime.esm-browser.js'
                    );
                    if (typeof prev === 'function') prev(chain, utils);
                }
            };
            options.config?.(context);
        }
    });
}
