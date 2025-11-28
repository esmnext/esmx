import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue, { type VueConstructor } from 'vue';

Vue.use(RouterPlugin);

export type createAppOptions = {
    vueOptions?: Record<string, any>;
    beforeCreateApp?: (Vue: VueConstructor) => void;
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
    beforeCreateApp?.(Vue);
    const app = new Vue({
        ...vueOptions,
        setup() {
            useProvideRouter(router);
        },
        render: (h) => h('router-view')
    });
    afterCreateApp?.(app);
    return {
        mount(root) {
            const ssrEl = root.querySelector('[data-server-rendered="true"]');
            if (ssrEl) {
                app.$mount(ssrEl, true);
            } else {
                root.appendChild(app.$mount().$el);
            }
        },
        unmount() {
            app.$destroy();
            app.$el.remove();
        },
        async renderToString() {
            if (typeof renderToString !== 'function') return '';
            return renderToString(app, ssrCtx);
        }
    };
};
