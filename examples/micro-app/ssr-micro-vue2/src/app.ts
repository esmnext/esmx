import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';

Vue.use(RouterPlugin);

export function createVue2App(router): RouterMicroAppOptions {
    let app: Vue | null = null;

    return {
        mount(el: HTMLElement) {
            app = new Vue({
                setup() {
                    useProvideRouter(router);
                },
                render: (h) => h('router-view')
            });
            app.$mount(el);
        },
        unmount() {
            if (app) {
                app.$destroy();
                app = null;
            }
        },
        async renderToString() {
            const { createRenderer } = await import('vue-server-renderer');
            const renderer = createRenderer();
            const vm = new Vue({
                setup() {
                    useProvideRouter(router);
                },
                render: (h) => h('router-view')
            });
            return renderer.renderToString(vm);
        }
    };
}
