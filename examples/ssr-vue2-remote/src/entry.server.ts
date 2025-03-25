import type { RenderContext } from '@gez/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

const renderer = createRenderer();

export default async (rc: RenderContext) => {
    const { app } = createApp();

    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    await rc.commit();

    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gez Module Link Remote</title>
    <link rel="icon" type="image/svg+xml" href="https://www.esmnext.com/logo.svg">
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
