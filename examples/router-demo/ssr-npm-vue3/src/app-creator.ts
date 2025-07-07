import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h, provide, ssrContextKey } from 'vue';

export type createAppOptions = {
    vueOptions?: Record<string, any>;
    beforeCreateApp?: () => void;
    afterCreateApp?: (app: any) => void;
    renderToString?: (app: any, context: any) => Promise<string>;
    ssrCtx?: Record<string, any>;
};

export const appCreator = (
    router: Router,
    {
        vueOptions = {},
        beforeCreateApp,
        afterCreateApp,
        renderToString,
        ssrCtx = {}
    }: createAppOptions = {}
): RouterMicroAppOptions => {
    beforeCreateApp?.();
    const app = createSSRApp({
        ...vueOptions,
        setup() {
            useProvideRouter(router);
            provide(ssrContextKey, ssrCtx);
        },
        render: () => h(RouterView)
    });
    app.use(RouterPlugin);
    afterCreateApp?.(app);
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
            return renderToString(app, ssrCtx);
        }
    };
};
