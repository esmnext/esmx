import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist'
        },
        imports: {
            '@esmx/router': 'ssr-micro-shared/@esmx/router'
        },
        exports: ['root:src/routes.ts']
    },
    async devApp(esmx) {
        return import('@esmx/vite').then((m) => m.createViteHtmlApp(esmx));
    }
} satisfies EsmxOptions;
