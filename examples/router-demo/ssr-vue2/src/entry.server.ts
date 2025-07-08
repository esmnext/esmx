import type { IncomingMessage } from 'node:http';
import type { RenderContext } from '@esmx/core';
import { renderToString } from 'ssr-npm-vue2/src/render-to-str';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    const req = rc.params.req as IncomingMessage | undefined;
    const protocol = req?.headers['x-forwarded-proto'] || 'https';
    const host = req?.headers.host || 'www.esmnext.com/router-demo/ssr-vue2/';
    const ssrCtx: Record<string, any> = {
        importMetaSet: rc.importMetaSet
    };
    const router = await createApp({
        base: `${protocol}://${host}`,
        url: req?.url ?? '/',
        renderToString,
        ssrCtx
    });

    // 使用 Vue 的 renderToString 生成页面内容
    const html = await router.renderToString();
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
