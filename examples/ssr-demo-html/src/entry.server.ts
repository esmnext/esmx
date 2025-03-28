/**
 * @file 服务端渲染入口文件
 * @description 负责服务端渲染流程、HTML 生成和资源注入
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// 封装页面内容生成逻辑
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // 将服务端渲染上下文注入到应用实例中
    app.ssrContext = ssrContext;
    // 初始化服务端
    app.onServer();

    // 生成页面内容
    return app.render();
};

export default async (rc: RenderContext) => {
    // 创建应用实例，返回包含 app 实例的对象
    const { app } = createApp();
    // 使用 renderToString 生成页面内容
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 提交依赖收集，确保所有必要资源都被加载
    await rc.commit();

    // 生成完整的 HTML 结构
    rc.html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    ${rc.preload()}
    <title>Esmx 快速开始</title>
    ${rc.css()}
</head>
<body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
