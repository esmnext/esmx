/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h, provide, ssrContextKey } from 'vue';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

export async function createApp({
    base,
    url,
    renderToString,
    ssrCtx = {}
}: {
    base: string;
    url: string;
    renderToString?: (app: any, context?: any) => Promise<string>;
    ssrCtx?: Record<string, any>;
}) {
    const router = new Router({
        root: '#root',
        base: new URL(base),
        routes,
        apps(router) {
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
        }
    });
    await router.replace(url);
    if (isBrowser) (window as any).router = router;
    return router;
}
