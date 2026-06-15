import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/vite').then((m) => m.createViteHtmlApp(esmx));
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3010;
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
            console.log(`Vite HTML micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
