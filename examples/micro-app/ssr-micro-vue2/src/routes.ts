import type { RouteConfig } from '@esmx/router';
import AppComponent from './app.vue';
import { createVue2App } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/vue2/',
        app: createVue2App,
        component: AppComponent
    }
];
