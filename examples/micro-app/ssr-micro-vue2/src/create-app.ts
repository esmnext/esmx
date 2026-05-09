import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';

import AppComponent from './app.vue';

Vue.use(RouterPlugin);

export function createVue2App(router): RouterMicroAppOptions {
    const app = new Vue({
        setup() {
            useProvideRouter(router);
        },
        render: (h) => h(AppComponent)
    });

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr]');
            if (ssrEl) {
                app.$mount(ssrEl as HTMLElement, true);
            } else {
                root.appendChild(app.$mount().$el);
            }
        },
        unmount() {
            app.$destroy();
            app.$el?.remove();
        },
        async renderToString() {
            const { createRenderer } = await import('vue-server-renderer');
            const renderer = createRenderer();
            return renderer.renderToString(app);
        }
    };
}
