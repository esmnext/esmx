import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { createSSRApp } from 'vue';

import AppComponent from './app.vue';

export function createVue3App(router): RouterMicroAppOptions {
    let app: ReturnType<typeof createSSRApp> | null = null;

    return {
        mount(el: HTMLElement) {
            app = createSSRApp(AppComponent);
            app.provide('router', router);
            app.mount(el);
        },
        unmount() {
            if (app) {
                app.unmount();
                app = null;
            }
        },
        async renderToString() {
            const { renderToString } = await import('@vue/server-renderer');
            const ssrApp = createSSRApp(AppComponent);
            ssrApp.provide('router', router);
            return renderToString(ssrApp);
        }
    };
}
