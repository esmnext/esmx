import type { Router } from './router';
import type { RouterMicroAppCallback, RouterMicroAppOptions } from './types';
import { isBrowser, isPlainObject } from './util';

/**
 * Gets the root container element by ID.
 * If not found, creates a new div with the given ID and appends it to document.body.
 *
 * @param appId - The application container ID.
 * @returns The resolved HTMLElement.
 */
export function getRootElement(appId: string): HTMLElement {
    const el = document.getElementById(appId);
    if (el) {
        return el;
    }
    const newEl = document.createElement('div');
    newEl.id = appId;
    document.body.appendChild(newEl);
    return newEl;
}

export class MicroApp {
    public app: RouterMicroAppOptions | null = null;
    public root: HTMLElement | null = null;
    private _factory: RouterMicroAppCallback | null = null;
    private destroyed = false;

    public _update(router: Router, force = false) {
        if (this.destroyed) {
            throw new Error('MicroApp has been destroyed');
        }
        const factory = this._getNextFactory(router);
        if (!force && factory === this._factory) {
            return;
        }
        const oldApp = this.app;
        // Create the new application
        const app = factory ? factory(router) : null;
        if (isBrowser && app) {
            let root: HTMLElement | null = this.root;
            if (root === null) {
                root = getRootElement(router.appId);
                const { rootStyle } = router.parsedOptions;
                if (root && isPlainObject(rootStyle)) {
                    Object.assign(root.style, router.parsedOptions.rootStyle);
                }
                this.root = root;
            }
            if (root) {
                const isHydration = root.hasAttribute('data-ssr');
                if (isHydration) {
                    const appRoot = root.firstElementChild as HTMLElement;
                    if (appRoot) {
                        if (app.hydration) {
                            app.hydration(root);
                        } else {
                            throw new Error(
                                'SSR content detected but hydration function not provided'
                            );
                        }
                    } else {
                        // No child elements (e.g., Vue 2 comment nodes), fallback to mount
                        const el = document.createElement('div');
                        root.appendChild(el);
                        app.mount(el);
                    }
                    // Remove data-ssr attribute after hydration
                    root.removeAttribute('data-ssr');
                } else {
                    const el = document.createElement('div');
                    root.appendChild(el);
                    app.mount(el);
                }
            }
            if (oldApp) {
                oldApp.unmount();
                root?.firstElementChild?.remove();
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
        this.root?.firstElementChild?.remove();
        this.app = null;
        this.root = null;
        this._factory = null;
        this.destroyed = true;
    }
}
