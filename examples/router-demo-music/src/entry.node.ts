/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['npm:vue', 'npm:@esmx/router', 'npm:@esmx/router-vue']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx)
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

        // 监听指定端口
        const port = Number(process.env.PORT) || 3001;
        server.listen(port, () => {
            console.log(
                `🎵 音乐播放器 Demo 服务器已启动: http://localhost:${port}`
            );
        });
    }
} satisfies EsmxOptions;
