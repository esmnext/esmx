/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { RouterView, RouterVuePlugin } from '@esmx/router-vue2';
import Vue from 'vue';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

export async function createApp({
    base,
    url,
    renderToString
}: {
    base: string;
    url: string;
    renderToString?: (app: any, context: any) => Promise<string>;
}) {
    Vue.use(RouterVuePlugin);

    const router = new Router({
        base: new URL(base),
        routes,
        apps(router) {
            const app = new Vue({
                router,
                render: (h) => h(RouterView)
            });
            return {
                mount(root) {
                    const ssrEl = root.firstElementChild;
                    if (
                        root.parentNode &&
                        ssrEl &&
                        ssrEl.hasAttribute('data-server-rendered')
                    ) {
                        root.parentNode.replaceChild(ssrEl, root);
                        root.getAttributeNames().forEach((name) => {
                            ssrEl.setAttribute(name, root.getAttribute(name)!);
                        });
                        app.$mount(ssrEl, true);
                        return ssrEl;
                    } else {
                        app.$mount(root);
                    }
                },
                unmount() {
                    app.$destroy();
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
