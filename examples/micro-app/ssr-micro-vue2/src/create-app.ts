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
            // Vue 2 $mount replaces the target element entirely
            // For SSR hydration, pass the existing element as target
            const ssrEl = root.querySelector('[data-ssr="true"]');
            if (ssrEl) {
                app.$mount(ssrEl as HTMLElement, true);
            } else {
                root.appendChild(app.$mount().$el);
            }
        },
        unmount() {
            // Vue 2 $destroy does not remove the DOM element
            // Must manually remove $el to clean up
            app.$destroy();
            if (app.$el?.parentNode) {
                app.$el.remove();
            }
        },
        async renderToString() {
            const { createRenderer } = await import('vue-server-renderer');
            const renderer = createRenderer();
            return renderer.renderToString(app);
        }
    };
}
