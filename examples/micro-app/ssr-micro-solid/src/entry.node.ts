import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                chain(ctx) {
                    const { chain, buildTarget } = ctx;

                    // Add Solid extensions
                    chain.resolve.extensions.add('.tsx');

                    // Configure babel-loader for Solid JSX
                    const isServer = buildTarget === 'server';

                    chain.module
                        .rule('solid-tsx')
                        .test(/\.tsx$/)
                        .use('babel-loader')
                        .loader('babel-loader')
                        .options({
                            presets: [
                                [
                                    '@babel/preset-typescript',
                                    { isTSX: true, allExtensions: true }
                                ],
                                [
                                    'solid',
                                    {
                                        generate: isServer ? 'ssr' : 'dom',
                                        hydratable: true
                                    }
                                ]
                            ]
                        })
                        .end()
                        .type('javascript/auto');
                }
            })
        );
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3008;
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
            console.log(`Solid micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
