import type { Esmx } from '@esmx/core';
import type { RspackHtmlAppOptions } from '@esmx/rspack';
import { createRspackReactApp as createApp } from './react-app';

export interface RspackReactAppOptions extends RspackHtmlAppOptions {
    // No additional options, same as Vue
}

export function createRspackReactApp(
    esmx: Esmx,
    options?: RspackReactAppOptions
) {
    return createApp(esmx, options);
}
