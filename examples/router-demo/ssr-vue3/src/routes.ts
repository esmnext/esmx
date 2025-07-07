import type { RouteConfig } from '@esmx/router';
import App from './app.vue';
import Home from './views/home.vue';
import NowPlaying from './views/now-playing.vue';

export const routes: RouteConfig[] = [
    {
        path: '/',
        component: App,
        app: 'vue3',
        children: [
            {
                path: '',
                component: Home
            },
            {
                path: 'player',
                component: NowPlaying
            },
            {
                path: 'playlist/:id',
                asyncComponent: () => import('./views/playlist-detail.vue')
            }
        ]
    }
];
