import { routes as htmlRoutes } from 'ssr-micro-html/src/routes';
import { routes as litRoutes } from 'ssr-micro-lit/src/routes';
import { routes as preactRoutes } from 'ssr-micro-preact/src/routes';
import { routes as preactHtmRoutes } from 'ssr-micro-preact-htm/src/routes';
import { routes as reactRoutes } from 'ssr-micro-react/src/routes';
import { routes as solidRoutes } from 'ssr-micro-solid/src/routes';
import { routes as svelteRoutes } from 'ssr-micro-svelte/src/routes';
import { routes as vue2Routes } from 'ssr-micro-vue2/src/routes';
import { routes as vue3Routes } from 'ssr-micro-vue3/src/routes';
import { createHomeApp, createLandingApp } from './create-app';

export const routes = [
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
    ...svelteRoutes
];
