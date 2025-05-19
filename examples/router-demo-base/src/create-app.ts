/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { createRouter } from '@esmx/router';
import { RouterView, RouterVuePlugin } from '@esmx/router-vue2';
import Vue from 'vue';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

export async function createApp(routerBase = 'http://localhost:3000') {
    Vue.use(RouterVuePlugin);
    let app: Vue | null = null;

    const router = createRouter({
        base: routerBase,
        initUrl: '/',
        routes
    });

    router.register('vue2', (router) => {
        const vm: Vue = new Vue({
            render: (h) => h(RouterView),
            router
        });
        app = vm;
        return {
            mount() {
                if (isBrowser) {
                    // 挂载 Vue 实例
                    vm.$mount('#app');
                }
            },
            updated() {},
            destroy() {
                vm.$destroy();
            }
        };
    });
    await router.init();

    return {
        app: app as unknown as Vue
    };
}
