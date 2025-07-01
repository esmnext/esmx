import type { RouteConfig } from '@esmx/router';
import App from './app.vue';
import AlbumDetail from './views/album-detail.vue';
import ArtistProfile from './views/artist-profile.vue';
import Home from './views/home.vue';
import NowPlaying from './views/now-playing.vue';
import PlaylistDetail from './views/playlist-detail.vue';
import SearchMusic from './views/search-music.vue';

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
                path: '/playlist/:id',
                component: PlaylistDetail
            },
            {
                path: '/artist/:id',
                component: ArtistProfile
            },
            {
                path: '/album/:id',
                component: AlbumDetail
            },
            {
                path: '/player',
                component: NowPlaying
            },
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
