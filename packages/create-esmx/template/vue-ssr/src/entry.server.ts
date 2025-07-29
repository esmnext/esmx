import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createVueApp } from './create-app';

export default async (rc: RenderContext) => {
    const { app } = createVueApp();
    const html = await renderToString(app);
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Vue with Server-Side Rendering powered by Esmx framework">
    <meta name="keywords" content="Vue, SSR, Server-Side Rendering, Esmx, Vue.js, JavaScript, TypeScript, Rspack">
    <link rel="icon" href="https://www.esmnext.com/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Vue SSR Demo | Powered by Esmx</title>
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
