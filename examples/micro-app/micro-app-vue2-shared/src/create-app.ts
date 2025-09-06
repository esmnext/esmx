import { createApp as _ } from 'micro-app-shared/src/create-app';
import { defineRouteConfig } from './define-route-config';

export function createApp() {
    return _({
        routes: defineRouteConfig([
            {
                path: '/',
                component: () => import('./views/index.vue')
            }
        ])
    });
}
export { defineRouteConfig };
