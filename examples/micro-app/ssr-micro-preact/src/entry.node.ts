import http from 'node:http';
import { createRequire } from 'node:module';
import type { EsmxOptions } from '@esmx/core';

const require = createRequire(import.meta.url);

export default {
    modules: {
        links: {
            'ssr-micro-shared': '../ssr-micro-shared/dist'
        },
        imports: {
            '@esmx/router': 'ssr-micro-shared/@esmx/router',
            unhead: 'ssr-micro-shared/unhead-core'
        },
        exports: ['pkg:preact', 'root:src/routes.ts']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-react').then((m) =>
            m.createRspackReactApp(esmx, {
                chain(ctx) {
                    ctx.chain.resolve.alias.set(
                        'react',
                        require.resolve('preact/compat')
                    );
                    ctx.chain.resolve.alias.set(
                        'react-dom',
                        require.resolve('preact/compat')
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
            console.log('Preact micro-app: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
