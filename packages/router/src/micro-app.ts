import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser, isPlainObject } from './util';

/**
 * 解析根容器元素
 * 支持 DOM 选择器或直接传入的 DOM 元素
 *
 * @param rootConfig - 根容器配置，可以是选择器字符串或 HTMLElement
 * @returns 解析后的 HTMLElement 或 null
 */
export function resolveRootElement(
    rootConfig?: string | HTMLElement
): HTMLElement {
    let el: HTMLElement | null = null;
    // 直接传入的 DOM 元素
    if (rootConfig instanceof HTMLElement) {
        el = rootConfig;
    }
    if (typeof rootConfig === 'string' && rootConfig) {
        try {
            el = document.querySelector(rootConfig);
        } catch (error) {
            console.error(`Failed to resolve root element: ${rootConfig}`);
        }
    }
    if (el === null) {
        el = document.createElement('div');
    }
    return el;
}

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
                root = resolveRootElement(router.root);
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
