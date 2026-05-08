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

    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            el.appendChild(container);
            app.$mount(container);
        },
        unmount() {
            app.$destroy();
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        renderToString() {
            const renderer = createRenderer();
            return renderer.renderToString(app);
        }
    };
}
