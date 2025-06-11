import type { Route, Router } from '@esmx/router';
import { type VueConstructor, reactive } from 'vue';

import { RouterLink } from './link';
import { RouterView } from './view';

const ROUTER_CONTEXT = Symbol('RouterContext');

interface RouterContext {
    router: Router;
    route: Route;
    afterEach: () => void;
    removeAfterEach: () => void; // 清理函数
}

declare module 'vue/types/vue' {
    interface Vue {
        readonly $router: Router;
        readonly $route: Route;
    }
}

declare module 'vue/types/options' {
    // @ts-expect-error
    interface ComponentOptions {
        router?: Router;
    }
}

export class RouterVuePlugin {
    static installed: boolean;

    static install(Vue: VueConstructor) {
        // 已安装则跳出
        if (this.installed) return;

        // 首次installed时
        this.installed = true;

        Vue.mixin({
            beforeCreate() {
                if (this === this.$root) {
                    const router = this.$options.router;
                    if (!router) {
                        return;
                    }
                    const afterEach = function (this: RouterContext) {
                        Object.assign(this.route, router.route);
                    };

                    const ctx: RouterContext = {
                        router,
                        route: reactive(router.route),
                        afterEach,
                        removeAfterEach: () => {} // 将被重新赋值
                    };

                    ctx.afterEach = ctx.afterEach.bind(ctx);
                    // 使用新的API：afterEach返回清理函数
                    ctx.removeAfterEach = router.afterEach(ctx.afterEach);
                    this[ROUTER_CONTEXT] = ctx;
                }
            },
            beforeDestroy() {
                const ctx: RouterContext | undefined = this[ROUTER_CONTEXT];
                if (ctx) {
                    // 使用新的清理函数，而不是废弃的 unAfterEach
                    ctx.removeAfterEach();
                }
            }
        });

        // 注册组件
        Vue.component('router-view', RouterView);
        Vue.component('router-link', RouterLink);

        function getRouterContext(vm: Vue): RouterContext {
            const ctx: RouterContext | undefined = vm.$root[ROUTER_CONTEXT];
            if (!ctx) {
                throw new Error(
                    'router is not available here! Please make sure to pass the router instance when creating Vue instance: new Vue({ router })'
                );
            }
            return ctx as RouterContext;
        }

        // 定义原型$router对象
        Object.defineProperty(Vue.prototype, '$router', {
            get() {
                return getRouterContext(this).router;
            }
        });

        // 定义原型$route对象
        Object.defineProperty(Vue.prototype, '$route', {
            get(this: Vue) {
                const ctx = getRouterContext(this);
                return ctx.route;
            }
        });
    }
}
