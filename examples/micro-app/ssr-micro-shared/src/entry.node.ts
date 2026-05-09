import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            'pkg:@esmx/router',
            {
                'unhead-core': {
                    client: 'root:src/unhead-client.ts',
                    server: 'root:src/unhead-server.ts'
                }
            },
            'root:src/index.ts'
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    }
} satisfies EsmxOptions;
