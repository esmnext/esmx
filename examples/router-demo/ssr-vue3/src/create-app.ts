/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { appCreator } from 'ssr-npm-vue3/src/app-creator';
import { routes } from './routes';
import { Vue3MusicStorePlugin } from './store/music-store';

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
        context: {},
        apps: (router) =>
            appCreator(router, {
                afterCreateApp: (app) => {
                    app.use(Vue3MusicStorePlugin);
                },
                renderToString,
                ssrCtx
            })
    });
    await router.replace(url);
    if (isBrowser) (window as any).router = router;
    return router;
}
