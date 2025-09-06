import type { RouteConfig, Router, RouterMicroAppCallback } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';
import type { Renderer } from 'vue-server-renderer';

Vue.use(RouterPlugin);

let renderer: Renderer | null = null;

const app: RouterMicroAppCallback = (router: Router) => {
    const app = new Vue({
        setup() {
            useProvideRouter(router);
            return {};
        },
        render: (h) => h('router-view')
    });
    return {
        mount(root: HTMLElement) {
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
        async renderToString(): Promise<string> {
            if (typeof window === 'object') {
                throw new Error(
                    `renderToString() can only be used on the server side`
                );
            }
            if (!renderer) {
                const { createRenderer } = await import('vue-server-renderer');
                renderer = createRenderer();
            }
            return renderer.renderToString(app);
        }
    };
};

export function defineRouteConfig(routes: RouteConfig[]) {
    routes.forEach((route) => {
        route.app = route.app || app;
    });
    return routes;
}
