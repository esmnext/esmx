import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist',
            'ssr-micro-react': '../ssr-micro-react/dist',
            'ssr-micro-vue3': '../ssr-micro-vue3/dist'
        },
        imports: {
            '@esmx/router': 'ssr-micro-shared/@esmx/router',
            unhead: 'ssr-micro-shared/unhead-core'
        }
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    },

    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers.host || 'localhost:3000';
                const rc = await esmx.render({
                    params: {
                        url: req.url,
                        base: `${protocol}://${host}/`
                    }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Hub server: http://localhost:3000');
        });
    },

    async postBuild(esmx) {
        const base = 'http://localhost:3000/ssr-micro-hub/';
        const pages = [
            { url: base, file: 'index.html' },
            { url: base + 'react/', file: 'react/index.html' },
            { url: base + 'vue3/', file: 'vue3/index.html' }
        ];

        for (const page of pages) {
            const rc = await esmx.render({ params: { url: page.url, base } });
            const filePath = esmx.resolvePath('dist/client', page.file);
            esmx.writeSync(filePath, rc.html);
        }
    }
} satisfies EsmxOptions;
