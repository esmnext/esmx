/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { createRouter } from '@esmx/router';
import { RouterView, RouterVuePlugin } from '@esmx/router-vue2';
import Vue, { nextTick } from 'vue';
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
                if (!isBrowser) return;
                console.log('mount', router);
                if (!router.isLayer) {
                    // 挂载 Vue 实例
                    vm.$mount('#app');
                    return;
                }
                // 如果是弹层路由，则挂载到一个新的 DOM 元素上
                const ele = document.createElement('div');
                ele.dataset.layerId = '' + router.layer.id;
                ele.id = `router-layer-${router.layer.id}`;
                ele.classList.add('router-layer');
                ele.innerHTML = `<div></div>`;
                document.body.appendChild(ele);
                vm.$mount(ele.children[0]);
            },
            updated() {},
            destroy() {
                if (!isBrowser) return;
                vm.$destroy();
                if (!router.isLayer) return;
                document
                    .getElementById(`router-layer-${router.layer.id}`)
                    ?.remove();
            }
        };
    });
    await router.init();

    return {
        app: app as unknown as Vue
    };
}
