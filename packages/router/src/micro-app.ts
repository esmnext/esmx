import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser, isObject } from './util';

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
            let root: HTMLElement | null = this.root;
            if (root === null) {
                root = document.getElementById(router.id);
                if (root === null) {
                    root = document.createElement('div');
                    root.id = router.id;
                }
                const { rootStyle } = router.parsedOptions;
                console.log('>>>>>>>', rootStyle);
                if (isObject(rootStyle)) {
                    Object.assign(root.style, router.parsedOptions.rootStyle);
                }
            }
            app.mount(root);
            if (root.parentNode === null) {
                document.body.appendChild(root);
            }
            this.root = root;
            if (oldApp) {
                oldApp.unmount();
            }
        }
        this.app = app;
        this._factory = factory;
        // 销毁旧的应用
    }
    private _getNextFactory({
        route,
        options
    }: Router): RouterMicroAppCallback | null {
        const name = route.matched[0].app;
        if (
            typeof name === 'string' &&
            options.apps &&
            typeof options.apps === 'object'
        ) {
            return options.apps[name] || null;
        }
        if (typeof name === 'function') {
            return name;
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
