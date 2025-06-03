import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { createRouteByURL, handleRoute, parseRoute } from './route';
import { NavigationType } from './types';
import type {
    NavigationResult,
    Route,
    RouteState,
    RouterMicroAppCallback,
    RouterMicroAppOptions,
    RouterOptions,
    RouterParsedOptions,
    RouterRawLocation
} from './types';
import { isBrowser } from './util';

class MicroApp {
    public app: RouterMicroAppOptions | null = null;
    private _factory: RouterMicroAppCallback | null = null;
    public _update(router: Router) {
        const factory = this._getNextFactory(router);
        if (factory === this._factory) {
            return;
        }
        const oldApp = this.app;
        // 创建新的应用
        const app = factory ? factory(router) : null;
        isBrowser && app?.mount();
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

export class Router {
    private _options: RouterOptions;
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    public get route() {
        if (this._route === null) {
            throw new Error(`Route is not ready.`);
        }
        return this._route;
    }
    public constructor(options: RouterOptions) {
        this._options = options;
        this.options = parsedOptions(options);
        this._navigation = new Navigation(
            this.options,
            (url: string, state: RouteState) => {
                handleRoute({
                    navType: NavigationType.popstate,
                    options: this.options,
                    loc: {
                        path: url,
                        state
                    },
                    handle: async (result) => {
                        await this._applyRoute(result.route);
                        return {
                            ...result,
                            navType: NavigationType.popstate
                        };
                    }
                });
            }
        );
    }
    private async _applyRoute(route: Route) {
        this._route = route;
        this._microApp._update(this);
    }
    public createLayer(options?: RouterOptions): Router {
        return new Router({
            ...this._options,
            ...options
        });
    }
    public resolve(loc: RouterRawLocation): Route {
        const result = parseRoute(this.options, loc);
        if (result.navType === NavigationType.resolve) {
            return result.route;
        }
        return createRouteByURL(this.options.base);
    }
    public push(loc: RouterRawLocation): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.push,
            options: this.options,
            loc,
            handle: async (result) => {
                await this._applyRoute(result.route);
                this._navigation.push(result.route);
                return result;
            }
        });
    }
    public replace(loc: RouterRawLocation) {
        return handleRoute({
            navType: NavigationType.replace,
            options: this.options,
            loc: loc,
            handle: async (result) => {
                await this._applyRoute(result.route);
                this._navigation.push(result.route, true);
                return result;
            }
        });
    }
    private async _handleGo(
        index: number,
        navType:
            | NavigationType.go
            | NavigationType.back
            | NavigationType.forward
    ): Promise<NavigationResult> {
        const result = await this._navigation.go(index);
        if (result === null) {
            return {
                navType: NavigationType.duplicate,
                loc: this.route.loc
            };
        }

        return handleRoute({
            navType,
            options: this.options,
            loc: {
                path: result.url,
                state: result.state
            },
            async handle(result) {
                return result;
            }
        });
    }
    public async go(index: number): Promise<NavigationResult> {
        return this._handleGo(index, NavigationType.go);
    }
    public async forward(): Promise<NavigationResult> {
        return this._handleGo(1, NavigationType.forward);
    }
    public async back() {
        return this._handleGo(-1, NavigationType.back);
    }
    public pushLayer(loc: RouterRawLocation) {}
    public openWindow(loc: RouterRawLocation): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.openWindow,
            options: this.options,
            loc: loc,
            handle: async (result) => {
                this.options.onOpen(result.loc, result.navType, result.route);
                return result;
            }
        });
    }
    public replaceWindow(loc: RouterRawLocation): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.replaceWindow,
            options: this.options,
            loc: loc,
            handle: async (result) => {
                this.options.onOpen(result.loc, result.navType, result.route);
                return result;
            }
        });
    }
    public reload(loc?: RouterRawLocation) {
        const navType = NavigationType.reload;
        return handleRoute({
            navType,
            options: this.options,
            loc: loc ?? this.route.loc.href,
            handle: async (result) => {
                await this._applyRoute(result.route);
                return result;
            }
        });
    }
    public async renderToString(throwError = false): Promise<string | null> {
        try {
            const result = await this._microApp.app?.renderToString?.();
            return result ?? null;
        } catch (e) {
            if (throwError) {
                throw e;
            } else {
                console.error(e);
            }
            return null;
        }
    }
    public destroy() {
        this._navigation.destroy();
        this._microApp.destroy();
    }
}
