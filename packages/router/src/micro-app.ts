import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser } from './util';

const getRootEl = (id: string): HTMLElement => {
    let root: HTMLElement | null = null;
    if (id) {
        root = document.getElementById(id);
    }
    if (root === null) {
        root = document.createElement('div');
        root.id = id;
        document.body.appendChild(root);
    }
    return root;
};

export class MicroApp {
    public app: RouterMicroAppOptions | null = null;
    public root: HTMLElement | null = null;
    private _factory: RouterMicroAppCallback | null = null;
    public _update(router: Router, force = false) {
        const factory = this._getNextFactory(router);
        if (!force && factory === this._factory) {
            return;
        }
        const oldApp = this.app;
        // 创建新的应用
        const app = factory ? factory(router) : null;
        if (isBrowser && app) {
            const root = getRootEl(this.root ? '' : router.id);
            const result = app.mount(root);
            this.root = result instanceof HTMLElement ? result : root;
        }
        this.app = app;
        this._factory = factory;
        // 销毁旧的应用
        isBrowser && oldApp?.unmount();
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
