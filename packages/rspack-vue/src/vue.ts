import type { Esmx } from '@esmx/core';
import type { RspackHtmlAppOptions } from '@esmx/rspack';
import { createRspackVueApp } from './vue-app';

export interface RspackVueAppOptions extends RspackHtmlAppOptions {
    vueLoader?: Record<string, any>;
}

export function createRspackVue2App(esmx: Esmx, options?: RspackVueAppOptions) {
    return createRspackVueApp(esmx, '2', options);
}

export function createRspackVue3App(esmx: Esmx, options?: RspackVueAppOptions) {
    return createRspackVueApp(esmx, '3', options);
}
