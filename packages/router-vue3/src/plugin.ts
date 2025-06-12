import type { Route, Router } from '@esmx/router';
import { type App, type ShallowReactive, shallowReactive, unref } from 'vue';

import { RouterLink } from './link';
import { routerKey, routerViewLocationKey } from './symbols';
import { RouterView } from './view';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
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
        // 创建响应式的路由克隆
        const reactiveRoute = shallowReactive(
            router.route.clone()
        ) as ShallowReactive<Route>;

        // 设置 afterEach 钩子来同步路由状态
        const removeAfterEach = router.afterEach(() => {
            router.route.syncTo(reactiveRoute);
        });

        app.config.globalProperties.$router = router;
        app.config.globalProperties.$route = reactiveRoute;

        app.provide(routerKey, unref(router));
        app.provide(routerViewLocationKey, reactiveRoute);

        // 注册组件
        app.component('router-view', RouterView);
        app.component('router-link', RouterLink);

        // 在应用卸载时清理钩子
        const originalUnmount = app.unmount;
        app.unmount = function () {
            removeAfterEach();
            return originalUnmount.call(this);
        };
    };
}
