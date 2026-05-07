import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist',
            'ssr-micro-html': '../ssr-micro-html/dist',
            'ssr-micro-vue2': '../ssr-micro-vue2/dist',
            'ssr-micro-vue3': '../ssr-micro-vue3/dist',
            'ssr-micro-react': '../ssr-micro-react/dist'
        },
        imports: {
            '@esmx/router': 'ssr-micro-shared/@esmx/router'
        }
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    },

    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Hub server: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
