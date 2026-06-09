import type { RenderContext } from '@esmx/core';
import { message } from './message';

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${rc.preload()}
    <title>Esmx + Rsbuild SSR</title>
    ${rc.css()}
</head>
<body>
    <h1>${message('server')}</h1>
    <div id="app"></div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
