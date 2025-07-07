import type { IncomingMessage } from 'node:http';
import type { RenderContext } from '@esmx/core';
import { renderToString as vue2render2str } from 'ssr-npm-vue2/src/render-to-str';
import { renderToString as vue3render2str } from 'ssr-npm-vue3/src/render-to-str';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    const req = rc.params.req as IncomingMessage | undefined;
    const protocol = req?.headers['x-forwarded-proto'] || 'http';
    const host = req?.headers.host || 'localhost';
    const ssrCtx: Record<string, any> = {};
    const router = await createApp({
        base: `${protocol}://${host}`,
        url: req?.url ?? '/',
        vue2render2str,
        vue3render2str,
        ssrCtx
    });

    // 使用 Vue 的 renderToString 生成页面内容
    const html = await router.renderToString(true);
    // console.log('SSR HTML:', host, req?.url, html, router);
    // 提交依赖收集，确保所有必要资源都被加载
    await rc.commit();

    // 生成完整的 HTML 结构
    rc.html = `<!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8"/>
            ${rc.preload()}
            <title>Esmx 快速开始</title>
            ${rc.css()}
        </head>
        <body>${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
