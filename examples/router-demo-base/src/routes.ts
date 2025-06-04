import type { RouteConfig } from '@esmx/router';
import App from './app.vue';
import Home from './views/home.vue';
import Test from './views/test.vue';

export const routes: RouteConfig[] = [
    {
        path: '/',
        component: App,
        children: [
            {
                path: '/',
                component: Home
            },
            {
                path: '/test',
                component: Test
            },
            {
                path: '/test1',
                asyncComponent: () => import('./views/test1.vue')
            },
            {
                path: '(.*)*',
                asyncComponent: () => import('./views/not-found.vue')
            }
        ]
    }
];
