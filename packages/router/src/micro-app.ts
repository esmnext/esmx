import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser, isPlainObject } from './util';

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
                root = this._resolveRootElement(router);
                const { rootStyle } = router.parsedOptions;
                if (root && isPlainObject(rootStyle)) {
                    Object.assign(root.style, router.parsedOptions.rootStyle);
                }
            }
            if (root) {
                app.mount(root);
                if (root.parentNode === null) {
                    document.body.appendChild(root);
                }
                this.root = root;
            }
            if (oldApp) {
                oldApp.unmount();
            }
        }
        this.app = app;
        this._factory = factory;
        // 销毁旧的应用
    }

    /**
     * 解析根容器元素
     * 支持 DOM 选择器或直接传入的 DOM 元素
     */
    private _resolveRootElement(router: Router): HTMLElement | null {
        const rootConfig = router.root;

        // 直接传入的 DOM 元素（检查nodeType而不是instanceof HTMLElement）
        if (
            isBrowser &&
            rootConfig &&
            typeof rootConfig === 'object' &&
            rootConfig.nodeType === 1
        ) {
            return rootConfig as HTMLElement;
        }

        // DOM 选择器字符串
        if (typeof rootConfig === 'string') {
            let root = document.querySelector
                ? document.querySelector(rootConfig)
                : null;
            if (root === null) {
                // 如果选择器找不到元素，创建新元素
                root = document.createElement
                    ? document.createElement('div')
                    : null;
            }
            return root as HTMLElement | null;
        }

        return null;
    }

    private _getNextFactory({
        route,
        options
    }: Router): RouterMicroAppCallback | null {
        if (!route.matched || route.matched.length === 0) {
            return null;
        }
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
        this.root?.remove();
        this.root = null;
        this._factory = null;
    }
}
