/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import Vue from 'vue';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

Vue.use(RouterPlugin);

export async function createApp({
    base,
    url,
    renderToString
}: {
    base: string;
    url: string;
    renderToString?: (app: any, context: any) => Promise<string>;
}) {
    const router = new Router({
        base: new URL(base),
        routes,
        apps(router) {
            const app = new Vue({
                setup() {
                    useProvideRouter(router);
                    return {};
                },
                render: (h) => h(RouterView)
            });
            return {
                mount(root) {
                    const ssrEl = root.querySelector(
                        '[data-server-rendered="true"]'
                    );
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
                    if (typeof renderToString === 'function') {
                        return renderToString(app, {});
                    }
                    return '';
                }
            };
        }
    });
    await router.replace(url);
    if (isBrowser) (window as any).router = router;
    return router;
}
