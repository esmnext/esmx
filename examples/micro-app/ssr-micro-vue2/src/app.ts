import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';

import AppComponent from './app.vue';

Vue.use(RouterPlugin);

export function createVue2App(router): RouterMicroAppOptions {
    let app: Vue | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            container.className = 'app-container';
            el.appendChild(container);
            app = new Vue({
                setup() {
                    useProvideRouter(router);
                },
                render: (h) => h(AppComponent)
            });
            app.$mount(container);
        },
        unmount() {
            if (app) {
                app.$destroy();
                app = null;
            }
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        async renderToString() {
            const { createRenderer } = await import('vue-server-renderer');
            const renderer = createRenderer();
            const vm = new Vue({
                setup() {
                    useProvideRouter(router);
                },
                render: (h) => h(AppComponent)
            });
            return renderer.renderToString(vm);
        }
    };
}
