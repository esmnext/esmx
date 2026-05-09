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

    let container: HTMLElement | null = null;

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr]');
            if (ssrEl) {
                container = ssrEl as HTMLElement;
                app.$mount(container, true);
            } else {
                container = app.$mount().$el as HTMLElement;
                root.appendChild(container);
            }
        },
        unmount() {
            app.$destroy();
            container?.remove();
            container = null;
        },
        async renderToString() {
            const { createRenderer } = await import('vue-server-renderer');
            const renderer = createRenderer();
            return renderer.renderToString(app);
        }
    };
}
