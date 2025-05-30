import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { handleRoute } from './route';
import { NavigationType } from './types';
import type {
    NavigationResult,
    Route,
    RouteState,
    RouterMicroApp,
    RouterMicroAppCallback,
    RouterOptions,
    RouterParsedOptions,
    RouterRawLocation
} from './types';

class MicroApp {
    public app: RouterMicroApp | null = null;
    private _factory: RouterMicroAppCallback | null = null;
    public _update(router: Router) {
        const factory = this._getNextFactory(router) ?? null;
        if (factory === this._factory) {
            return;
        }
        const oldApp = this.app;
        // 创建新的应用
        const app = factory ? factory(router) : null;
        app?.mount();
        this.app = app;
        this._factory = factory;
        // 销毁旧的应用
        oldApp?.unmount();
    }
    private _getNextFactory({ route, options }: Router) {
        return typeof route.matched[0].app === 'string'
            ? options.apps[route.matched[0].app]
            : route.matched[0].app;
    }
}

export class Router {
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    public get app() {
        if (this._microApp.app === null) {
            throw new Error(`App is not ready.`);
        }
        return this._microApp.app;
    }
    public get route() {
        if (this._route === null) {
            throw new Error(`Route is not ready.`);
        }
        return this._route;
    }
    public constructor(options: RouterOptions) {
        this.options = parsedOptions(options);
        this._navigation = new Navigation(
            this.options,
            (url: string, state: RouteState) => {
                handleRoute({
                    navType: NavigationType.popstate,
                    options: this.options,
                    location: {
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
    public push(location: RouterRawLocation): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.push,
            options: this.options,
            location,
            handle: async (result) => {
                await this._applyRoute(result.route);
                this._navigation.push(result.route);
                return result;
            }
        });
    }
    public replace(location: RouterRawLocation) {
        return handleRoute({
            navType: NavigationType.replace,
            options: this.options,
            location,
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
                location: this.route.location
            };
        }

        return handleRoute({
            navType,
            options: this.options,
            location: {
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
    public pushLayer(location: RouterRawLocation) {}
    public openWindow(location: RouterRawLocation): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.openWindow,
            options: this.options,
            location,
            handle: async (result) => {
                this.options.onOpen(
                    result.location,
                    result.navType,
                    result.route
                );
                return result;
            }
        });
    }
    public replaceWindow(
        location: RouterRawLocation
    ): Promise<NavigationResult> {
        return handleRoute({
            navType: NavigationType.replaceWindow,
            options: this.options,
            location,
            handle: async (result) => {
                this.options.onOpen(
                    result.location,
                    result.navType,
                    result.route
                );
                return result;
            }
        });
    }
    public reload(location?: RouterRawLocation) {
        const navType = NavigationType.reload;
        return handleRoute({
            navType,
            options: this.options,
            location: location ?? this.route.href,
            handle: async (result) => {
                await this._applyRoute(result.route);
                return result;
            }
        });
    }
    public destroy() {
        this._navigation.destroy();
    }
}
