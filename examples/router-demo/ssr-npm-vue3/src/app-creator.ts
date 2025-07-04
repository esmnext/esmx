import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h, provide, ssrContextKey } from 'vue';

export const appCreator = (
    router: Router,
    renderToString?: (app: any, context: any) => Promise<string>,
    ssrCtx: Record<string, any> = {}
): RouterMicroAppOptions => {
    const app = createSSRApp({
        setup() {
            useProvideRouter(router);
            provide(ssrContextKey, ssrCtx);
        },
        render: () => h(RouterView)
    });
    app.use(RouterPlugin);
    return {
        mount(root) {
            const ssrEl = root.querySelector('[data-server-rendered]');
            if (ssrEl) {
                app.mount(ssrEl);
            } else {
                const el = document.createElement('div');
                app.mount(el);
                root.appendChild(el);
            }
        },
        unmount() {
            app.unmount();
        },
        async renderToString() {
            if (typeof renderToString !== 'function') return '';
            return `<div data-server-rendered>${await renderToString(app, ssrCtx)}</div>`;
        }
    };
};
