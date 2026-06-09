import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist'
        },
        imports: {
            '@esmx/router': 'ssr-micro-shared/@esmx/router'
        },
        exports: [
            'pkg:vue',
            'root:src/routes.ts',
            {
                '@vue/server-renderer': {
                    server: 'pkg:@vue/server-renderer',
                    client: false
                }
            }
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                chain(context) {
                    // Custom Rspack configuration
                }
            })
        );
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3004;
        const base = `http://localhost:${port}/`;
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({
                    params: { url: req.url, base }
                });
                res.end(rc.html);
            });
        });

        server.listen(port, () => {
            console.log(`Vue 3 micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
