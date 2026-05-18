import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist',
            'ssr-micro-html': '../ssr-micro-html/dist',
            'ssr-micro-lit': '../ssr-micro-lit/dist',
            'ssr-micro-preact': '../ssr-micro-preact/dist',
            'ssr-micro-preact-htm': '../ssr-micro-preact-htm/dist',
            'ssr-micro-react': '../ssr-micro-react/dist',
            'ssr-micro-solid': '../ssr-micro-solid/dist',
            'ssr-micro-svelte': '../ssr-micro-svelte/dist',
            'ssr-micro-vue2': '../ssr-micro-vue2/dist',
            'ssr-micro-vue3': '../ssr-micro-vue3/dist'
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
            { url: base + 'demo/', file: 'demo/index.html' },
            { url: base + 'html/', file: 'html/index.html' },
            { url: base + 'lit/', file: 'lit/index.html' },
            { url: base + 'vue2/', file: 'vue2/index.html' },
            { url: base + 'vue3/', file: 'vue3/index.html' },
            { url: base + 'react/', file: 'react/index.html' },
            { url: base + 'preact/', file: 'preact/index.html' },
            { url: base + 'preact-htm/', file: 'preact-htm/index.html' },
            { url: base + 'solid/', file: 'solid/index.html' },
            { url: base + 'svelte/', file: 'svelte/index.html' }
        ];

        for (const page of pages) {
            const rc = await esmx.render({ params: { url: page.url, base } });
            const filePath = esmx.resolvePath('dist/client', page.file);
            esmx.writeSync(filePath, rc.html);
        }
    }
} satisfies EsmxOptions;
