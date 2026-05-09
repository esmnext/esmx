import type { RenderContext } from '@esmx/core';
import { Router } from '@esmx/router';
import { routes } from './routes';

export default async (rc: RenderContext) => {
    const url = rc.params.url as string;
    const base = (rc.params.base as string) || 'http://localhost:3000';
    const router = new Router({
        routes,
        base: new URL(base),
        resolveLink(link) {
            const { href, origin } = link.route.url;
            link.attributes.href = href.slice(origin.length) || '/';
            return link;
        }
    });
    await router.replace(url);
    const html = await router.renderToString();
    await rc.commit();

    const basePath = new URL(base).pathname;

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${rc.preload()}
    <title>Esmx Micro-App Hub</title>
    ${rc.css()}
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            line-height: 1.5;
        }

    </style>
    <script>window.__ESMX_BASE__='${basePath}'</script>
</head>
<body>
    ${html ?? '<div id="app"></div>'}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
