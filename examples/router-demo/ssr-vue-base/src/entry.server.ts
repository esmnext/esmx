import type { IncomingMessage } from 'node:http';
import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    const req = rc.params.req as IncomingMessage | undefined;
    const protocol = req?.headers['x-forwarded-proto'] || 'https';
    const host = req?.headers.host || 'www.esmnext.com/router-demo-music/';
    const ssrCtx: Record<string, any> = {};
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
        <body>${ssrCtx.teleports?.body || ''}
            <div id="root">${html}</div>
            <div id="teleported">${ssrCtx.teleports?.['#teleported'] ?? ''}</div>
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
