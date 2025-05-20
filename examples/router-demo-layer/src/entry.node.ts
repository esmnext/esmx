/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 配置开发环境的应用创建器
     * @description 创建并配置 Rspack 应用实例，用于开发环境的构建和热更新
     * @param esmx Esmx 框架实例，提供核心功能和配置接口
     * @returns 返回配置好的 Rspack 应用实例，支持 HMR 和实时预览
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // 在此处自定义 Rspack 编译配置
                }
            })
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
                // 执行服务端渲染
                let routerBase = new URL(
                    req.headers.referer ||
                        req.headers.origin ||
                        `http://${req.headers.host}${req.url}`
                ).href;
                if (req.url) {
                    const i = routerBase.lastIndexOf(req.url);
                    if (~i) routerBase = routerBase.substring(0, i);
                }
                const rc = await esmx.render({
                    params: {
                        url: req.url,
                        routerBase
                    }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('服务启动: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
