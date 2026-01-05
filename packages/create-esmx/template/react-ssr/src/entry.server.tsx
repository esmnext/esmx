import type { RenderContext } from '@esmx/core';
import { renderToString } from 'react-dom/server';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Create React app instance
    const { app } = createApp();

    // Use React's renderToString to generate page content
    const html = renderToString(app);

    // Commit dependency collection to ensure all necessary resources are loaded
    await rc.commit();

    // Generate complete HTML structure
    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="React with Server-Side Rendering powered by Esmx framework">
    <meta name="keywords" content="React, SSR, Server-Side Rendering, Esmx, React.js, JavaScript, TypeScript, Rspack">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>React SSR Demo | Powered by Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};

