/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

const port = process.env.PORT || 3004;

export default {
    modules: {
        links: {
            'ssr-share': '../ssr-share/dist',
            'ssr-vue2': '../ssr-vue2/dist',
            'ssr-vue3': '../ssr-vue3/dist',
            'ssr-npm-base': '../ssr-npm-base/dist',
            'ssr-npm-vue2': '../ssr-npm-vue2/dist',
            'ssr-npm-vue3': '../ssr-npm-vue3/dist'
        },
        imports: {
            '@esmx/router': 'ssr-npm-base/@esmx/router',
            vue: 'ssr-npm-vue3/vue',
            '@esmx/router-vue': 'ssr-npm-vue3/@esmx/router-vue'
        }
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx)
        );
    },

    /**
     * 配置并启动 HTTP 服务器
     * @description 创建 HTTP 服务器实例，集成 Esmx 中间件，处理 SSR 请求
     * @param esmx Esmx 框架实例，提供中间件和渲染功能
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // 使用 Esmx 中间件处理请求
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({
                    params: {
                        req,
                        res
                    }
                });
                res.end(rc.html);
            });
        });

        server.listen(port, () => {
            console.log(`服务启动: http://localhost:${port}`);
        });
    },
    async postBuild(esmx) {
        const rc = await esmx.render({
            params: { url: '/' }
        });
        esmx.writeSync(esmx.resolvePath('dist/client', 'index.html'), rc.html);
    }
} satisfies EsmxOptions;
