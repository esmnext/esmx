import type { RouteConfig } from '@esmx/router';
import { routes as htmlRoutes } from 'ssr-micro-html/src/routes';
import { routes as litRoutes } from 'ssr-micro-lit/src/routes';
import { routes as preactRoutes } from 'ssr-micro-preact/src/routes';
import { routes as preactHtmRoutes } from 'ssr-micro-preact-htm/src/routes';
import { routes as reactRoutes } from 'ssr-micro-react/src/routes';
import { routes as rsbuildHtmlRoutes } from 'ssr-micro-rsbuild-html/src/routes';
import { routes as rsbuildReactRoutes } from 'ssr-micro-rsbuild-react/src/routes';
import { routes as rsbuildVueRoutes } from 'ssr-micro-rsbuild-vue/src/routes';
import { routes as solidRoutes } from 'ssr-micro-solid/src/routes';
import { routes as svelteRoutes } from 'ssr-micro-svelte/src/routes';
import { routes as viteHtmlRoutes } from 'ssr-micro-vite-html/src/routes';
import { routes as viteReactRoutes } from 'ssr-micro-vite-react/src/routes';
import { routes as viteVueRoutes } from 'ssr-micro-vite-vue/src/routes';
import { routes as vue2Routes } from 'ssr-micro-vue2/src/routes';
import { routes as vue3Routes } from 'ssr-micro-vue3/src/routes';
import { createHomeApp, createLandingApp } from './create-app';

const baseRoutes: RouteConfig[] = [
    {
        path: '/',
        app: createLandingApp
    },
    {
        path: '/demo/',
        app: createHomeApp
    },
    ...htmlRoutes,
    ...litRoutes,
    ...vue2Routes,
    ...vue3Routes,
    ...reactRoutes,
    ...preactRoutes,
    ...preactHtmRoutes,
    ...solidRoutes,
    ...svelteRoutes,
    ...viteHtmlRoutes,
    ...viteReactRoutes,
    ...viteVueRoutes,
    ...rsbuildHtmlRoutes,
    ...rsbuildReactRoutes,
    ...rsbuildVueRoutes
];

/**
 * English is the default locale and is served at the root (`/demo/`). Chinese
 * pages live under a `/zh` path prefix (`/zh/demo/`) — the same micro-app
 * factories are reused, since only the shared Layout is localized. Registering
 * both lets the SPA router match `/zh/...` so the language toggle can switch via
 * `router.push` (history navigation) instead of a full page reload.
 */
function prefixLocale(routes: RouteConfig[], prefix: string): RouteConfig[] {
    return routes.map((route) => ({ ...route, path: prefix + route.path }));
}

export const routes: RouteConfig[] = [
    ...baseRoutes,
    ...prefixLocale(baseRoutes, '/zh')
];
