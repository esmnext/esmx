import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-npm-base': './node_modules/ssr-npm-base/dist'
        },
        imports: {
            '@esmx/router': 'ssr-npm-base/@esmx/router'
        },
        exports: ['npm:vue', 'npm:@esmx/router-vue']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx)
        );
    }
} satisfies EsmxOptions;
