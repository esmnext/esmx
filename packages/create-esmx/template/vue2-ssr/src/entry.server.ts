import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

const renderer = createRenderer();

export default async (rc: RenderContext) => {
    const { app } = createApp();
    const ctx = {
        importMetaSet: rc.importMetaSet,
        renderStyles: () => ''
    };
    const html = await renderer.renderToString(app, ctx);
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Vue2 with Server-Side Rendering powered by Esmx framework">
    <meta name="keywords" content="Vue2, SSR, Server-Side Rendering, Esmx, Vue.js, JavaScript, TypeScript, Rspack">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Vue2 SSR Demo | Powered by Esmx</title>
    ${ctx.renderStyles()}
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
