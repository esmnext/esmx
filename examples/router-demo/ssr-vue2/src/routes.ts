import type { RouteConfig } from '@esmx/router';
import App from './app.vue';
import AlbumDetail from './views/album-detail.vue';
import ArtistProfile from './views/artist-profile.vue';
import SearchMusic from './views/search-music.vue';

export const routes: RouteConfig[] = [
    {
        path: '/',
        component: App,
        app: 'vue2',
        children: [
            {
                path: '/artist/:id',
                component: ArtistProfile
            },
            {
                path: '/album/:id',
                component: AlbumDetail
            },
            // 下面两个后面用 html 实现
            {
                path: '/search/:query?',
                component: SearchMusic
            },
            {
                path: '(.*)*',
                asyncComponent: () => import('./views/not-found.vue')
            }
        ]
    }
];
