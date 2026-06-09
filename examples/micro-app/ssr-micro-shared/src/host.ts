import type { RenderContext } from '@esmx/core';
import { type RouteConfig, Router } from '@esmx/router';
import { renderSSRHead } from 'unhead/server';
import { getRouterHead } from './head-manager';
import { installLocaleSync, localeFromPath, setLocale } from './i18n';
import { installNavDelegate, STANDALONE_KEY } from './layout';
import { getSsrStyles } from './ssr-styles';

declare global {
    interface Window {
        __ESMX_BASE__?: string;
        // biome-ignore lint/suspicious/noExplicitAny: serialized router context
        __ESMX_CONTEXT__?: any;
    }
}

export interface HostOptions {
    /**
     * Standalone mode: the routes belong to a single micro-app run on its own
     * (not composed by the hub). Adds a `/` → primary-route redirect and tells
     * the shared Layout to hide the cross-remote navigation (those remotes are
     * not mounted here, so their links would 404).
     */
    standalone?: boolean;
}

/** A router-scoped link resolver shared by the SSR and client hosts. */
function resolveLink(link: ReturnType<Router['resolveLink']>) {
    const { href, origin } = link.route.url;
    link.attributes.href = href.slice(origin.length) || '/';
    return link;
}

/** Prepend a `/` → primary-route redirect for standalone single-app runs. */
function withStandaloneRedirect(
    routes: RouteConfig[],
    standalone: boolean
): RouteConfig[] {
    if (!standalone || routes.length === 0) return routes;
    const primary = routes[0].path;
    if (primary === '/') return routes;
    return [{ path: '/', redirect: primary }, ...routes];
}

/**
 * Render an esmx micro-host to HTML. The hub passes all remotes' routes; a
 * single remote passes only its own (with `standalone: true`). The rendering
 * is framework-agnostic — `@esmx/router` drives each route's own
 * `renderToString`, so the same host works for React/Vue/Solid/Svelte/… built
 * by any bundler.
 */
export async function renderHost(
    rc: RenderContext,
    routes: RouteConfig[],
    options: HostOptions = {}
): Promise<void> {
    const standalone = options.standalone ?? false;
    const url = rc.params.url as string;
    const base = (rc.params.base as string) || 'http://localhost:3000/';
    const baseURL = new URL(base);
    // The URL is the source of truth for locale: `/zh/...` is Chinese, the root
    // is the default English. `url` may be relative (live server passes
    // `req.url`), so resolve it against the base before deriving the locale.
    const routePath = new URL(url, baseURL).pathname.slice(
        baseURL.pathname.length - 1
    );
    const locale = localeFromPath(routePath);

    const router = new Router({
        routes: withStandaloneRedirect(routes, standalone),
        base: baseURL,
        resolveLink
    });
    if (standalone) {
        router.context[STANDALONE_KEY] = true;
    }
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
        'esmx:locale': router.context['esmx:locale'],
        // Persist standalone mode so client hydration matches the SSR markup
        // (the Layout reads it to hide cross-remote nav).
        ...(standalone ? { [STANDALONE_KEY]: true } : {})
    });

    rc.html = `<!DOCTYPE html>
<html${htmlAttrs}>
<head>
    <link rel="icon" href="/logo.svg" type="image/svg+xml">
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
}

/**
 * Client-side hydration counterpart to {@link renderHost}. Builds the same
 * router (with the same standalone redirect) and replays the current URL so the
 * matched micro-app hydrates the server-rendered markup.
 */
export async function hydrateHost(
    routes: RouteConfig[],
    options: HostOptions = {}
): Promise<Router> {
    const standalone = options.standalone ?? false;
    const basePath = window.__ESMX_BASE__ || '/';
    const base = new URL(basePath, location.origin);
    const context = window.__ESMX_CONTEXT__ || {};

    const router = new Router({
        routes: withStandaloneRedirect(routes, standalone),
        appId: 'app',
        base,
        context,
        resolveLink
    });

    // Install the nav-click delegate before the first app mounts so links are
    // intercepted from the first interaction, and keep the shared locale synced
    // to the URL on every navigation.
    installNavDelegate(router);
    installLocaleSync(router);

    await router.replace(location.href);
    return router;
}
