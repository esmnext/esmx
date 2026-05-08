import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h } from 'vue';

import AppComponent from './app.vue';

export function createVue3App(router): RouterMicroAppOptions {
    let app: ReturnType<typeof createSSRApp> | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            container.className = 'app-container';
            el.appendChild(container);
            app = createSSRApp({
                setup() {
                    useProvideRouter(router);
                },
                render: () => h(AppComponent)
            });
            app.mount(container);
        },
        unmount() {
            if (app) {
                app.unmount();
                app = null;
            }
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        async renderToString() {
            const { renderToString } = await import('@vue/server-renderer');
            const ssrApp = createSSRApp({
                setup() {
                    useProvideRouter(router);
                },
                render: () => h(AppComponent)
            });
            return renderToString(ssrApp);
        }
    };
}
