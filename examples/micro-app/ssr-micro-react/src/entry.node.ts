import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack-react').then((m) =>
            m.createRspackReactApp(esmx, {
                chain(context) {
                    // Custom Rspack configuration
                }
            })
        );
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3005;
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
            console.log(`React micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
