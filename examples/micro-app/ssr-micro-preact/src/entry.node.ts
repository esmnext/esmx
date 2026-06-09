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
                    ctx.chain.resolve.alias.set('react', 'preact/compat');
                    ctx.chain.resolve.alias.set('react-dom', 'preact/compat');
                }
            })
        );
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3006;
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
            console.log(`Preact micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
