import type { App, Esmx } from '@esmx/core';
import {
    createViteApp,
    type ViteAppConfigContext,
    type ViteAppOptions
} from '@esmx/vite';
import react from '@vitejs/plugin-react';

export * from '@esmx/vite';

export interface ViteReactAppOptions extends ViteAppOptions {}

/**
 * Create a Vite + React Esmx application.
 *
 * Adds @vitejs/plugin-react (JSX transform + Fast Refresh) on top of the base
 * Vite integration. The plugin is injected through the config hook so it
 * applies to every build target and to the dev server.
 */
export function createViteReactApp(
    esmx: Esmx,
    options: ViteReactAppOptions = {}
): Promise<App> {
    return createViteApp(esmx, {
        ...options,
        config(context: ViteAppConfigContext) {
            context.config.plugins = [
                ...(context.config.plugins ?? []),
                react()
            ];
            options.config?.(context);
        }
    });
}
