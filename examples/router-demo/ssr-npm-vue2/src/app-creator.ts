import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';

Vue.use(RouterPlugin);

export const appCreator = (
    router: Router,
    renderToString?: (app: any, context: any) => Promise<string>,
    ssrCtx: Record<string, any> = {}
): RouterMicroAppOptions => {
    const app = new Vue({
        setup() {
            useProvideRouter(router);
        },
        render: (h) => h('router-view')
    });
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
