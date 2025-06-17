import type { Route, Router } from '@esmx/router';
import type Vue from 'vue2';

// @ts-ignore
declare module 'vue/types/vue' {
    interface Vue {
        readonly $router: Router;
        readonly $route: Route;
    }
}
declare module 'vue2/types/vue' {
    interface Vue {
        readonly $router: Router;
        readonly $route: Route;
    }
}
