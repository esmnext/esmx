import type { RenderContext } from '@esmx/core';
import { Router } from '@esmx/router';
import { routes } from './routes';

export default async (rc: RenderContext) => {
    const url = rc.params.url as string;
    const base = (rc.params.base as string) || 'http://localhost:3000';
    const router = new Router({
        routes,
        base: new URL(base)
    });
    await router.replace(`${base}${url}`);
    const html = await router.renderToString();
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Esmx Micro-App Hub</title>
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
