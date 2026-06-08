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
            context.config.plugins = [
                ...(context.config.plugins ?? []),
                pluginVue()
            ];
            options.config?.(context);
        }
    });
}
