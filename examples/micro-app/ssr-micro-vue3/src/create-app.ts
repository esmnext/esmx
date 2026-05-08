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

    let container: HTMLElement | null = null;

    return {
        mount(root: HTMLElement) {
            // Vue 3 mount preserves the target element and replaces its innerHTML
            // For SSR hydration, the existing element is reused
            const ssrEl = root.querySelector('[data-ssr="true"]');
            if (ssrEl) {
                container = ssrEl as HTMLElement;
                app.mount(container);
            } else {
                container = document.createElement('div');
                app.mount(container);
                root.appendChild(container);
            }
        },
        unmount() {
            // Vue 3 app.unmount() preserves the container element (only clears innerHTML)
            // Must manually remove the container to avoid leaving empty DOM residue
            app.unmount();
            container?.remove();
            container = null;
        },
        async renderToString() {
            const { renderToString } = await import('@vue/server-renderer');
            return renderToString(app);
        }
    };
}
