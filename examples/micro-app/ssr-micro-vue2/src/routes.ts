import type { RouteConfig } from '@esmx/router';
import { createVue2App } from './app';
import AppComponent from './app.vue';

export const routes: RouteConfig[] = [
    {
        path: '/vue2',
        app: createVue2App,
        component: AppComponent
    }
];
