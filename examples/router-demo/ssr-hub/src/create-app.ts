/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { appCreator as vue2appCreator } from 'ssr-npm-vue2/src/app-creator';
import { appCreator as vue3appCreator } from 'ssr-npm-vue3/src/app-creator';
import { Vue2MusicStorePlugin } from 'ssr-vue2/src/store/music-store';
import { Vue3MusicStorePlugin } from 'ssr-vue3/src/store/music-store';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

export async function createApp({
    base,
    url,
    vue2render2str,
    vue3render2str,
    ssrCtx = {}
}: {
    base: string;
    url: string;
    vue2render2str?: (app: any, context?: any) => Promise<string>;
    vue3render2str?: (app: any, context?: any) => Promise<string>;
    ssrCtx?: Record<string, any>;
}) {
    const router = new Router({
        root: '#root',
        base: new URL(base),
        routes,
        context: {},
        apps: {
            vue2: (router) =>
                vue2appCreator(router, {
                    beforeCreateApp: (Vue) => {
                        Vue.use(Vue2MusicStorePlugin);
                    },
                    renderToString: vue2render2str,
                    ssrCtx
                }),
            vue3: (router) =>
                vue3appCreator(router, {
                    afterCreateApp: (app) => {
                        app.use(Vue3MusicStorePlugin);
                    },
                    renderToString: vue3render2str,
                    ssrCtx
                })
        }
    });
    await router.replace(url);
    if (isBrowser) (window as any).router = router;
    return router;
}
