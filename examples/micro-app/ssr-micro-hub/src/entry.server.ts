import type { RenderContext } from '@esmx/core';
import { Router } from '@esmx/router';
import {
    getRouterHead,
    getSsrStyles,
    renderSSRHead
} from 'ssr-micro-shared/src/index';

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
    const head = getRouterHead(router);
    const { headTags, htmlAttrs, bodyAttrs } = head
        ? await renderSSRHead(head)
        : { headTags: '', htmlAttrs: '', bodyAttrs: '' };
    await rc.commit();

    const basePath = new URL(base).pathname;
    const renderStyles = getSsrStyles(router);

    rc.html = `<!DOCTYPE html>
<html lang="en"${htmlAttrs}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://esmx.dev/logo.svg" type="image/svg+xml">
    ${headTags}
    ${rc.preload()}
    ${renderStyles}
    ${rc.css()}
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--esmx-bg-main);
            color: var(--esmx-text-primary);
            line-height: 1.5;
        }

    </style>
    <script>window.__ESMX_BASE__='${basePath}'</script>
</head>
<body${bodyAttrs}>
    ${html ?? '<div id="app"></div>'}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
