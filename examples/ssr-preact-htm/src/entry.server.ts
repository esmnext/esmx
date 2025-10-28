import type { RenderContext } from '@esmx/core';
import { html } from 'htm/preact';
import { render } from 'preact-render-to-string';
import { App } from './app';

export default async (rc: RenderContext) => {
    // 渲染页面内容
    const content = render(html`<${App} />`);

    // 提交模块依赖收集
    await rc.commit();

    rc.html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    ${rc.preload()}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esmx + Preact + HTM 示例</title>
    <link rel="icon" type="image/svg+xml" href="https://esmx.dev/logo.svg">
    ${rc.css()}
</head>
<body>
    <div id="app">
        ${content}
    </div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
