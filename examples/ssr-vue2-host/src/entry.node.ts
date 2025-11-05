import type { EsmxOptions } from '@esmx/core';
import express from 'express';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx)
        );
    },
    modules: {
        /**
         * 导入的模块基本配置
         */
        links: {
            'ssr-vue2-remote': '../ssr-vue2-remote/dist'
        },
        /**
         * 导入映射配置
         */
        imports: {
            vue: 'ssr-vue2-remote/vue'
        }
    },
    async server(esmx) {
        const server = express();
        server.use(esmx.middleware);
        server.get('*', async (req, res) => {
            res.setHeader('Content-Type', 'text/html;charset=UTF-8');
            const result = await esmx.render({
                params: { url: req.url }
            });
            res.send(result.html);
        });
        server.listen(3004, () => {
            console.log('http://localhost:3004');
        });
    },
    async postBuild(esmx) {
        const rc = await esmx.render({
            params: { url: '/' }
        });
        esmx.writeSync(esmx.resolvePath('dist/client', 'index.html'), rc.html);
    }
} satisfies EsmxOptions;
