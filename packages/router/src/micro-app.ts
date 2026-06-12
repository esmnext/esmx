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
                            app.hydration(appRoot);
                        } else {
                            throw new Error(
                                'SSR content detected but hydration function not provided'
                            );
                        }
                    } else {
                        // No child elements (e.g., Vue 2 comment nodes), fallback to mount
                        const el = document.createElement('div');
                        root.appendChild(el);
                        try {
                            app.mount(el);
                        } catch (e) {
                            el.remove();
                            throw e;
                        }
                    }
                    // Remove data-ssr attribute after hydration
                    root.removeAttribute('data-ssr');
                } else {
                    // Capture all existing children before inserting the new container.
                    // Old app may have created multiple sibling nodes during its lifecycle.
                    const oldChildren = Array.from(root.childNodes);
                    const el = document.createElement('div');
                    root.appendChild(el);
                    try {
                        app.mount(el);
                    } catch (e) {
                        el.remove();
                        throw e;
                    }
                    if (oldApp) {
                        try {
                            oldApp.unmount();
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error(
                                '[@esmx/router] MicroApp unmount failed during route transition. Check the framework unmount hook returned by your render function (Vue: app.unmount, React: root.unmount, etc.).',
                                e
                            );
                        }
                    }
                    // Remove old children that are still attached to the DOM.
                    // Some frameworks may have already removed their own nodes during unmount.
                    oldChildren.forEach((child) => {
                        if (child.parentNode) {
                            child.remove();
                        }
                    });
                }
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
        this._clearRoot();
        this.app = null;
        this.root = null;
        this._factory = null;
        this.destroyed = true;
    }

    private _clearRoot(): void {
        if (!this.root) {
            return;
        }
        Array.from(this.root.childNodes).forEach((child) => {
            child.remove();
        });
    }
}
