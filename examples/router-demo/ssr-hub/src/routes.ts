import type { RouteConfig } from '@esmx/router';
import { routes as vue2routes } from 'ssr-vue2/src/routes';
import { routes as vue3routes } from 'ssr-vue3/src/routes';
import App from './app.vue';

export const routes: RouteConfig[] = [
    {
        path: '/',
        component: App,
        app: 'vue3',
        children: vue3routes
    },
    {
        path: '/',
        component: App,
        app: 'vue2',
        children: vue2routes
    }
];
