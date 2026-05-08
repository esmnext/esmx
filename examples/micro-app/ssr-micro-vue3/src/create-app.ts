import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h } from 'vue';

import AppComponent from './app.vue';

export function createVue3App(router): RouterMicroAppOptions {
    const app = createSSRApp({
        setup() {
            useProvideRouter(router);
        },
        render: () => h(AppComponent)
    });

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr="true"]');
            if (ssrEl) {
                app.mount(ssrEl);
            } else {
                root.innerHTML = '';
                const el = document.createElement('div');
                app.mount(el);
                root.appendChild(el);
            }
        },
        unmount() {
            app.unmount();
        },
        async renderToString() {
            const { renderToString } = await import('@vue/server-renderer');
            return renderToString(app);
        }
    };
}
