import http from 'node:http';
import path from 'node:path';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'micro-app-shared': path.resolve(
                './node_modules/micro-app-shared/dist'
            )
        },
        exports: [
            'npm:vue',
            'npm:@esmx/router-vue',
            'root:src/create-app.ts',
            {
                index: {
                    file: './src/index.ts'
                },
                'vue-server-renderer': {
                    files: {
                        server: 'npm:vue-server-renderer',
                        client: false
                    }
                }
            }
        ]
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                minimize: false,
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
