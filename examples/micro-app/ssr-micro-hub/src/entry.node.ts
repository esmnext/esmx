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
            'ssr-micro-vue3': '../ssr-micro-vue3/dist',
            'ssr-micro-vite-html': '../ssr-micro-vite-html/dist',
            'ssr-micro-vite-react': '../ssr-micro-vite-react/dist',
            'ssr-micro-vite-vue': '../ssr-micro-vite-vue/dist',
            'ssr-micro-rsbuild-html': '../ssr-micro-rsbuild-html/dist',
            'ssr-micro-rsbuild-react': '../ssr-micro-rsbuild-react/dist',
            'ssr-micro-rsbuild-vue': '../ssr-micro-rsbuild-vue/dist'
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
            if (req.url === '/robots.txt' || req.url === '/robots.txt/') {
                res.writeHead(200, { 'content-type': 'text/plain' });
                res.end('User-agent: *\nAllow: /\nSitemap: https://esmx.dev/sitemap.xml\n');
                return;
            }
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
        // The hub owns the deployed site root: its landing replaces the docs
        // home at `/`, and the demo/per-framework pages sit at `/demo/`,
        // `/vue3/`, etc. English is the default locale at the root; Chinese is
        // rendered under a `/zh/` directory. The render base is therefore the
        // root — client assets keep their per-module `/ssr-micro-<name>/`
        // namespace regardless of this base, so they never collide with the
        // docs. Locale is derived from the URL in entry.server, and the client
        // can switch via SPA navigation (history pushState, no full reload).
        const base = 'http://localhost:3000/';
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
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'robots.txt'),
            'User-agent: *\nAllow: /\nSitemap: https://esmx.dev/sitemap.xml\n'
        );
    }
} satisfies EsmxOptions;
