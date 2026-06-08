import type { App, Esmx } from '@esmx/core';
import {
    createViteApp,
    type ViteAppConfigContext,
    type ViteAppOptions
} from '@esmx/vite';
import vue from '@vitejs/plugin-vue';

export * from '@esmx/vite';

export interface ViteVueAppOptions extends ViteAppOptions {}

/**
 * Create a Vite + Vue 3 Esmx application.
 *
 * Adds @vitejs/plugin-vue (SFC compilation + HMR) on top of the base Vite
 * integration. The plugin is injected through the config hook so it applies to
 * every build target and to the dev server.
 */
export function createViteVueApp(
    esmx: Esmx,
    options: ViteVueAppOptions = {}
): Promise<App> {
    return createViteApp(esmx, {
        ...options,
        config(context: ViteAppConfigContext) {
            context.config.plugins = [...(context.config.plugins ?? []), vue()];
            options.config?.(context);
        }
    });
}
