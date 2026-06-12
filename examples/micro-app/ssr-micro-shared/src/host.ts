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
        __ESMX_CONTEXT__?: Record<string, unknown>;
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

/**
 * In standalone mode the only mounted route is the remote's own (e.g.
 * `/vite-vue/`), so hitting the site root renders nothing. Map the root to the
 * remote's primary route so `/` shows the app. Done by rewriting the target URL
 * (not a redirect route) because a server-side `redirect` route resolves to a
 * 3xx status instead of rendering — this keeps `/` a normal 200 render, and
 * the same mapping on the client keeps SSR/hydration in lockstep.
 */
function standaloneTarget(
    url: string,
    rootPath: string,
    routes: RouteConfig[],
    standalone: boolean
): string {
    if (!standalone || routes.length === 0) return url;
    return url === rootPath || url === '/' ? routes[0].path : url;
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
        routes,
        base: baseURL,
        resolveLink
    });
    if (standalone) {
        router.context[STANDALONE_KEY] = true;
    }
    setLocale(router, locale);
    await router.replace(
        standaloneTarget(url, baseURL.pathname, routes, standalone)
    );
    const html = await router.renderToString();
    const { headTags, htmlAttrs, bodyAttrs } = renderSSRHead(
        getRouterHead(router)
    );
    // Register this module's chunk (which carries the shared CSS — see G
    // section of `.claude/redesign-plan.md`) so commit() collects it into
    // `files.css` and `rc.css()` emits `<link rel="stylesheet">` for the
    // shared design tokens + components on every SSR'd page.
    rc.importMetaSet.add(import.meta);
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
        routes,
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

    // Standalone root → primary route (same mapping as the server, so SSR and
    // hydration target the same route); otherwise replay the full current URL.
    const atRoot =
        location.pathname === base.pathname || location.pathname === '/';
    const target =
        standalone && routes.length > 0 && atRoot
            ? routes[0].path
            : location.href;
    await router.replace(target);
    return router;
}
