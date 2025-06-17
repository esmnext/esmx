import type { Route, Router } from '@esmx/router';
// @ts-ignore
declare module 'vue/types/vue' {
    interface Vue {
        readonly $router: Router;
        readonly $route: Route;
    }
}
