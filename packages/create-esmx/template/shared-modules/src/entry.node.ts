import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            'pkg:@esmx/router',
            {
                index: './src/index.ts'
            }
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                chain(context) {
                    // Custom Rspack configuration
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
            console.log('Server started: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
