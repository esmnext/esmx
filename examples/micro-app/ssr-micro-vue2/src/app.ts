import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';
import { createRenderer } from 'vue-server-renderer';

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
        mount(el: HTMLElement) {
            app.$mount(el);
        },
        unmount() {
            app.$destroy();
        },
        renderToString() {
            const renderer = createRenderer();
            return renderer.renderToString(app);
        }
    };
}
