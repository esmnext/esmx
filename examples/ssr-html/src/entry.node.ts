import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    packs: {
        enable: true
    },
    // 本地执行 dev 和 build 时会使用
    async devApp(esmx) {
        // 这里应使用动态模块。生产依赖不存在。
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                minimize: false,
                config(context) {
                    // 可以在这里修改 Rspack 编译的配置
                    // 自定义你的 Vue、React等框架的打包逻辑
                }
            })
        );
    },
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // 静态文件处理
            esmx.middleware(req, res, async () => {
                res.setHeader('Content-Type', 'text/html;charset=UTF-8');
                // 传入渲染的参数
                const rc = await esmx.render({
                    importmapMode: 'js',
                    params: {
                        url: req.url
                    }
                });
                // 响应 HTML 内容
                res.end(rc.html);
            });
        });

        // 监听端口
        server.listen(3000, () => {
            console.log('http://localhost:3000');
        });
    },
    async postBuild(esmx) {
        const list: string[] = ['/', '/about', '/404'];
        for (const url of list) {
            const rc = await esmx.render({
                params: { url: url, base: '/ssr-html/' }
            });
            esmx.writeSync(
                esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
                rc.html
            );
        }
    },
    modules: {
        exports: ['./src/title/index.ts']
    }
} satisfies EsmxOptions;
