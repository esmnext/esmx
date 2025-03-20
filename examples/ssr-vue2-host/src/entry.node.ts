import type { GezOptions } from '@gez/core';
import express from 'express';

export default {
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue2App(gez)
        );
    },
    modules: {
        /**
         * 导入的模块基本配置
         */
        links: {
            'ssr-vue2-remote': 'root:./node_modules/ssr-vue2-remote/dist'
        },
        /**
         * 导入映射配置
         */
        imports: {
            vue: 'ssr-vue2-remote/npm/vue'
        }
    },
    async server(gez) {
        const server = express();
        server.use(gez.middleware);
        server.get('*', async (req, res) => {
            res.setHeader('Content-Type', 'text/html;charset=UTF-8');
            const result = await gez.render({
                importmapMode: 'js',
                params: { url: req.url }
            });
            res.send(result.html);
        });
        server.listen(3004, () => {
            console.log('http://localhost:3004');
        });
    },
    async postBuild(gez) {
        const rc = await gez.render({
            params: { url: '/' }
        });
        gez.writeSync(gez.resolvePath('dist/client', 'index.html'), rc.html);
    }
} satisfies GezOptions;
