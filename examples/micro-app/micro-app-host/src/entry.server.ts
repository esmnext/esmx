import type { RenderContext } from '@esmx/core';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    const app = createApp();

    const html = await app.router.renderToString(false);

    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Esmx Shared Modules - Micro-frontend module sharing solution based on native ESM">
    <meta name="keywords" content="Esmx,Shared Modules,Micro-frontend,ESM Modules,JavaScript Modules,TypeScript,Rspack,Frontend Architecture">
    <meta name="generator" content="Esmx Framework">
    <link rel="icon" href="https://www.esmnext.com/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Esmx Shared Modules | Micro-frontend Module Sharing Solution</title>
    ${rc.css()}
</head>
<body>
    <div id="root">${html ?? ''}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
