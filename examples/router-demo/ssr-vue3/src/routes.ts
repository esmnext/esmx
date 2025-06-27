import type { RouteConfig } from '@esmx/router';
import App from './app.vue';
import Home from './views/home.vue';
import NewsDetail from './views/news-detail.vue';

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
                path: '/news/:id',
                component: NewsDetail
            },
            {
                path: '(.*)*',
                asyncComponent: () => import('./views/not-found.vue')
            }
        ]
    }
];
