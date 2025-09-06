import { type RouteConfig, Router, type RouterMicroApp } from '@esmx/router';
export interface CreateAppOptions {
    routes?: RouteConfig[];
    apps?: RouterMicroApp;
}

export async function createApp(opts: CreateAppOptions = {}) {
    const router = new Router({
        root: '#root',
        ...opts
    });
    await router.replace('/');
    return { router };
}
