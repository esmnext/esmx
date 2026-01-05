/**
 * @file Server-side rendering entry file
 * @description Responsible for server-side rendering process, HTML generation and resource injection
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from 'react-dom/server';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Create React app instance
    const { app } = createApp();

    // Use React's renderToString to generate page content
    // Note: renderToString is synchronous, but we keep the function async for consistency
    const html = renderToString(app);

    // Commit dependency collection to ensure all necessary resources are loaded
    await rc.commit();

    // Generate complete HTML structure
    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    ${rc.preload()}
    <title>Esmx React Demo</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

