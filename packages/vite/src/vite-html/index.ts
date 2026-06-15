import type { App, Esmx } from '@esmx/core';
import { createViteApp, type ViteAppOptions } from '../vite';

/**
 * Options for a no-framework HTML application.
 *
 * Vite natively handles TypeScript, CSS and static assets, so unlike the
 * rspack equivalent no extra loaders need to be registered here.
 */
export interface ViteHtmlAppOptions extends ViteAppOptions {}

/**
 * Create a Vite application for plain HTML/TS projects (no UI framework).
 */
export function createViteHtmlApp(
    esmx: Esmx,
    options?: ViteHtmlAppOptions
): Promise<App> {
    return createViteApp(esmx, options);
}
