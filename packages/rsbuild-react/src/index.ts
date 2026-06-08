import type { App, Esmx } from '@esmx/core';
import {
    createRsbuildApp,
    type RsbuildAppConfigContext,
    type RsbuildAppOptions
} from '@esmx/rsbuild';
import { pluginReact } from '@rsbuild/plugin-react';

export * from '@esmx/rsbuild';

export interface RsbuildReactAppOptions extends RsbuildAppOptions {}

/**
 * Create an Rsbuild + React Esmx application.
 *
 * Adds @rsbuild/plugin-react (JSX transform + Fast Refresh) on top of the base
 * Rsbuild integration via the config hook, so it applies to every build target.
 */
export function createRsbuildReactApp(
    esmx: Esmx,
    options: RsbuildReactAppOptions = {}
): Promise<App> {
    return createRsbuildApp(esmx, {
        ...options,
        config(context: RsbuildAppConfigContext) {
            context.config.plugins = [
                ...(context.config.plugins ?? []),
                pluginReact()
            ];
            options.config?.(context);
        }
    });
}
