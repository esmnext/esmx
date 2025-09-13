import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['pkg:@esmx/router']
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    }
} satisfies EsmxOptions;
