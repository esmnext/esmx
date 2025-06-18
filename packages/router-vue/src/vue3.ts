import type { Route, Router } from '@esmx/router';
import type { RouterLink } from './router-link';
import type { RouterView } from './router-view';

declare module 'vue' {
    interface ComponentCustomProperties {
        readonly $router: Router;
        readonly $route: Route;
    }

    interface GlobalComponents {
        RouterLink: typeof RouterLink;
        RouterView: typeof RouterView;
    }
}
