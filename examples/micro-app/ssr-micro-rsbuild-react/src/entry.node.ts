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
        exports: ['pkg:react', 'pkg:react-dom', 'root:src/routes.ts']
    },
    async devApp(esmx) {
        return import('@esmx/rsbuild-react').then((m) =>
            m.createRsbuildReactApp(esmx)
        );
    },

    async server(esmx) {
        const port = Number(process.env.PORT) || 3014;
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
            console.log(`Rsbuild React micro-app: ${base}`);
        });
    }
} satisfies EsmxOptions;
