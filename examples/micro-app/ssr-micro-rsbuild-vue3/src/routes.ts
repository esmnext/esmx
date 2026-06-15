import type { RouteConfig } from '@esmx/router';
import { createVue3App } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/rsbuild-vue/',
        app: createVue3App,
        component: () => import('./app.vue')
    }
];
