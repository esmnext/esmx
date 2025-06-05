import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser } from './util';

export class MicroApp {
    public app: RouterMicroAppOptions | null = null;
    private _factory: RouterMicroAppCallback | null = null;
    private first = true;
    public _update(router: Router, force = false) {
        const factory = this._getNextFactory(router);
        if (!force && factory === this._factory) {
            return;
        }
        const oldApp = this.app;
        // 创建新的应用
        const app = factory ? factory(router, this.first) : null;
        isBrowser && app?.mount();
        this.app = app;
        this._factory = factory;
        // 销毁旧的应用
        isBrowser && oldApp?.unmount();
        this.first = true;
    }
    private _getNextFactory({
        route,
        options
    }: Router): RouterMicroAppCallback | null {
        if (
            typeof route.matched[0].app === 'string' &&
            options.apps &&
            typeof options.apps === 'object'
        ) {
            return options.apps[route.matched[0].app] || null;
        }
        if (typeof route.matched[0].app === 'function') {
            return route.matched[0].app;
        }
        if (typeof options.apps === 'function') {
            return options.apps;
        }
        return null;
    }
    public destroy() {
        this.app?.unmount();
        this.app = null;
        this._factory = null;
    }
}
