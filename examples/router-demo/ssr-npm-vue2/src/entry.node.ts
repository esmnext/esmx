import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-npm-base': './node_modules/ssr-npm-base/dist'
        },
        imports: {
            '@esmx/router': 'ssr-npm-base/@esmx/router'
        },
        exports: [
            'pkg:vue',
            'pkg:@esmx/router-vue',
            'root:src/app-creator.ts',
            {
                'src/render-to-str': {
                    client: false,
                    server: './src/render-to-str.ts'
                }
            }
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx)
        );
    }
} satisfies EsmxOptions;
