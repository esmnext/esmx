import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

// Crawlers must not index coverage reports or the per-demo source modules
// (`/<demo>/src/*.mjs`): those modules are content-hashed, so every rebuild
// changes their URLs and the old ones become permanent 404s that pollute the
// index and waste crawl budget. Docs assets live under `/static/` and hub
// demo assets under `/ssr-micro-<name>/`, so neither is affected.
const ROBOTS_TXT = [
    'User-agent: *',
    'Disallow: /coverage/',
    'Disallow: /*/src/',
    'Sitemap: https://esmx.dev/sitemap.xml',
    ''
].join('\n');

// Cloudflare Pages `_redirects`: server-side 301s for legacy doc URLs that
// predate the `/api/` restructure (e.g. `/router/micro-app`). Splat rules cover
// the whole old prefix so unlisted siblings redirect too; the targets live under
// `/api/...`, which never matches the source patterns, so there is no loop. The
// file must sit at the deploy root, so it is overlaid from the hub's client dir.
const REDIRECTS = [
    '/guide                  /guide/start/introduction       301',
    '/zh/guide               /zh/guide/start/introduction    301',
    '/router/*               /api/router/:splat              301',
    '/router-react/*         /api/router-react/:splat        301',
    '/router-vue/*           /api/router-vue/:splat          301',
    '/zh/router/*            /zh/api/router/:splat           301',
    '/zh/router-react/*      /zh/api/router-react/:splat     301',
    '/zh/router-vue/*        /zh/api/router-vue/:splat        301',
    // Legacy `/docs/*` duplicate of the site root (removed from the build):
    // 301 any still-indexed URL to its canonical root path by stripping the
    // prefix, e.g. /docs/api/router/router -> /api/router/router.
    '/docs/*                 /:splat                         301',
    ''
].join('\n');

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
    },

    async server(esmx) {
        const server = http.createServer((req, res) => {
            if (req.url === '/robots.txt' || req.url === '/robots.txt/') {
                res.writeHead(200, { 'content-type': 'text/plain' });
                res.end(ROBOTS_TXT);
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
            ROBOTS_TXT
        );
        esmx.writeSync(
            esmx.resolvePath('dist/client', '_redirects'),
            REDIRECTS
        );
    }
} satisfies EsmxOptions;
