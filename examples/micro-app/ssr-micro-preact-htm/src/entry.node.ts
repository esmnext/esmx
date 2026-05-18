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
        exports: ['pkg:preact', 'root:src/routes.ts']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-react').then((m) =>
            m.createRspackReactApp(esmx, {
                chain(ctx) {
                    ctx.chain.resolve.alias.set(
                        'react/jsx-runtime',
                        'preact/jsx-runtime'
                    );
                    ctx.chain.resolve.alias.set(
                        'react/jsx-dev-runtime',
                        'preact/jsx-dev-runtime'
                    );
                }
            })
        );
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
            console.log('Preact+HTM micro-app: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
