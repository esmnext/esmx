import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { renderToString } from '@vue/server-renderer';
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
        mount(el: HTMLElement) {
            app.mount(el);
        },
        unmount() {
            app.unmount();
        },
        renderToString() {
            return renderToString(app);
        }
    };
}
