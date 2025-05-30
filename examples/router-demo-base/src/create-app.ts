/**
 * @file Vue 实例创建
 * @description 负责创建和配置 Vue 应用实例
 */

import { Router } from '@esmx/router';
import { RouterView, RouterVuePlugin } from '@esmx/router-vue2';
import Vue from 'vue';
import { routes } from './routes';

const isBrowser = typeof window === 'object' && typeof document === 'object';

export async function createApp() {
    Vue.use(RouterVuePlugin);
    const app: Vue | null = null;

    const router = new Router({
        base: new URL('http://localhost:3000'),
        routes
    });

    if (isBrowser) (window as any).router = router;

    return {
        app: app as unknown as Vue
    };
}
