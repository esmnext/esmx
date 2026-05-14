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
        exports: ['root:src/routes.ts']
    },
    async devApp(esmx) {
        const { createRspackHtmlApp, rspack } = await import('@esmx/rspack');

        return createRspackHtmlApp(esmx, {
            chain(ctx) {
                const { chain, buildTarget, esmx } = ctx;
                const isServer = buildTarget === 'server';
                const isProd = esmx.isProd;

                chain.resolve.extensions.add('.svelte');
                chain.resolve.mainFields.prepend('svelte');

                chain.module
                    .rule('svelte')
                    .test(/\.svelte$/)
                    .use('svelte-loader')
                    .loader('svelte-loader')
                    .options({
                        compilerOptions: {
                            generate: isServer ? 'server' : 'client',
                            dev: !isProd
                        },
                        emitCss: false
                    })
                    .end()
                    .type('javascript/auto');

                chain.module
                    .rule('svelte-mjs')
                    .test(/node_modules\/svelte\/.*\.mjs$/)
                    .resolve.set('fullySpecified', false);

                // Svelte's internal/server uses import('node:async_hooks')
                // for optional AsyncLocalStorage. Rspack v2 doesn't handle
                // the node: URI scheme. Ignore the module — svelte already
                // has .then(noop, noop) fallback for import failures.
                chain
                    .plugin('ignore-node-async-hooks')
                    .use(rspack.IgnorePlugin, [
                        { resourceRegExp: /node:async_hooks/ }
                    ]);
            }
        });
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
            console.log('Svelte micro-app: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
