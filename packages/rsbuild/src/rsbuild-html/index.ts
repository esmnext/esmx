import type { App, Esmx } from '@esmx/core';
import { createRsbuildApp, type RsbuildAppOptions } from '../rsbuild';

/**
 * Options for a no-framework HTML application. Rsbuild handles TypeScript, CSS
 * and assets out of the box, so no extra loaders are registered here.
 */
export interface RsbuildHtmlAppOptions extends RsbuildAppOptions {}

/**
 * Create an Rsbuild application for plain HTML/TS projects (no UI framework).
 */
export function createRsbuildHtmlApp(
    esmx: Esmx,
    options?: RsbuildHtmlAppOptions
): Promise<App> {
    return createRsbuildApp(esmx, options);
}
