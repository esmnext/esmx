import type { Route, RouterInstance } from '@esmx/router';
import { type App, type ShallowReactive, shallowReactive, unref } from 'vue';

import { RouterLink } from './link';
import { routerKey, routerViewLocationKey } from './symbols';
import { RouterView } from './view';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        // $route: Route;
        $route: ShallowReactive<Route>;
        $router: RouterInstance;
    }

    interface GlobalComponents {
        // RouterView:
        // RouterLink:
    }
}

export function RouterVuePlugin(router: RouterInstance) {
    return function install(app: App) {
        const route = shallowReactive(router.route);
        router.route = route;

        app.config.globalProperties.$router = router;
        app.config.globalProperties.$route = router.route;

        app.provide(routerKey, unref(router));
        app.provide(routerViewLocationKey, unref(router.route));

        // 注册组件
        app.component('router-view', RouterView);
        app.component('router-link', RouterLink);
    };
}
