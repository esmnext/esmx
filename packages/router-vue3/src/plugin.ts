import type { Route, Router } from '@esmx/router';
import { type App, type ShallowReactive, shallowReactive, unref } from 'vue';

import { RouterLink } from './link';
import { routerKey, routerViewLocationKey } from './symbols';
import { RouterView } from './view';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        // $route: Route;
        $route: ShallowReactive<Route>;
        $router: Router;
    }

    interface GlobalComponents {
        // RouterView:
        // RouterLink:
    }
}

export function RouterVuePlugin(router: Router) {
    return function install(app: App) {
        app.config.globalProperties.$router = router;
        app.config.globalProperties.$route = router.route;

        app.provide(routerKey, unref(router));
        app.provide(routerViewLocationKey, unref(router.route));

        // 注册组件
        app.component('router-view', RouterView);
        app.component('router-link', RouterLink);
    };
}
