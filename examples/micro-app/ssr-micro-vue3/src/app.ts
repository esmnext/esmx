import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { createSSRApp } from 'vue';

import AppComponent from './app.vue';

export function createVue3App(router): RouterMicroAppOptions {
    let app: ReturnType<typeof createSSRApp> | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            el.appendChild(container);
            app = createSSRApp(AppComponent);
            app.provide('router', router);
            app.mount(container);
        },
        unmount() {
            if (app) {
                app.unmount();
                app = null;
            }
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        async renderToString() {
            const { renderToString } = await import('@vue/server-renderer');
            const ssrApp = createSSRApp(AppComponent);
            ssrApp.provide('router', router);
            return renderToString(ssrApp);
        }
    };
}
