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
        // English is the default locale, served at the root; Chinese is rendered
        // under a `/zh/` directory. The asset base stays `/ssr-micro-hub/` for
        // both (assets are shared) — the locale lives in the route path, so the
        // client can switch via SPA navigation (history pushState, no full page
        // reload). Locale is derived from the URL in entry.server.
        const base = 'http://localhost:3000/ssr-micro-hub/';
        const routes = [
            '',
            'demo/',
            'html/',
            'lit/',
            'vue2/',
            'vue3/',
            'react/',
            'preact/',
            'preact-htm/',
            'solid/',
            'svelte/'
        ];

        for (const prefix of ['', 'zh/']) {
            for (const route of routes) {
                const rc = await esmx.render({
                    params: { url: base + prefix + route, base }
                });
                esmx.writeSync(
                    esmx.resolvePath(
                        'dist/client',
                        `${prefix}${route}index.html`
                    ),
                    rc.html
                );
            }
        }
    }
} satisfies EsmxOptions;
