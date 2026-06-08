import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rsbuild').then((m) =>
            m.createRsbuildHtmlApp(esmx)
        );
    },
    async postBuild(esmx) {
        const rc = await esmx.render();
        esmx.writeSync(esmx.resolvePath('dist/client', 'index.html'), rc.html);
    },
    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({ params: { url: req.url } });
                res.end(rc.html);
            });
        });
        server.listen(3001, () => {
            console.log('Server started: http://localhost:3001');
        });
    }
} satisfies EsmxOptions;
