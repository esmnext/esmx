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
            'npm:vue',
            'npm:@esmx/router-vue',
            'root:src/app-creator.ts',
            {
                'src/render-to-str': {
                    input: './src/render-to-str.ts',
                    inputTarget: {
                        client: false,
                        server: './src/render-to-str.ts'
                    }
                }
            }
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx)
        );
    }
} satisfies EsmxOptions;
