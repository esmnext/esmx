import { routes as htmlRoutes } from 'ssr-micro-html/src/routes';
import { routes as reactRoutes } from 'ssr-micro-react/src/routes';
import { routes as vue2Routes } from 'ssr-micro-vue2/src/routes';
import { routes as vue3Routes } from 'ssr-micro-vue3/src/routes';
import { createHomeApp } from './create-app';

export const routes = [
    {
        path: '/',
        app: createHomeApp
    },
    ...htmlRoutes,
    ...vue2Routes,
    ...vue3Routes,
    ...reactRoutes
];
