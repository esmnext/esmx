import type { RenderContext } from '@esmx/core';
import { Router } from '@esmx/router';
import {
    getRouterHead,
    getSsrStyles,
    localeFromPath,
    renderSSRHead,
    setLocale
} from 'ssr-micro-shared/src/index';

import { routes } from './routes';

export default async (rc: RenderContext) => {
    const url = rc.params.url as string;
    const base = (rc.params.base as string) || 'http://localhost:3000/';
    const baseURL = new URL(base);
    // The URL is the source of truth for locale: `/zh/...` is Chinese, the root
    // is the default English. The base is locale-agnostic; the locale lives in
    // the route path, so it is derived from the path relative to the base
    // (mirroring the router's own base-strip on match). `url` may be relative
    // (live server passes `req.url`), so it is resolved against the base.
    const routePath = new URL(url, baseURL).pathname.slice(
        baseURL.pathname.length - 1
    );
    const locale = localeFromPath(routePath);
    const router = new Router({
        routes,
        base: baseURL,
        resolveLink(link) {
            const { href, origin } = link.route.url;
            link.attributes.href = href.slice(origin.length) || '/';
            return link;
        }
    });
    setLocale(router, locale);
    await router.replace(url);
    const html = await router.renderToString();
    const { headTags, htmlAttrs, bodyAttrs } = renderSSRHead(
        getRouterHead(router)
    );
    await rc.commit();

    const renderStyles = getSsrStyles(router);
    const contextJson = JSON.stringify({
        'esmx:appState': router.context['esmx:appState'],
        'esmx:locale': router.context['esmx:locale']
    });

    rc.html = `<!DOCTYPE html>
<html lang="${locale}"${htmlAttrs}>
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
    <script>window.__ESMX_BASE__='${baseURL.pathname}'</script>
    <script>window.__ESMX_CONTEXT__=${contextJson}</script>
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
