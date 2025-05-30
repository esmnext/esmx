import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { handleRoute } from './route';
import { NavigationType } from './types';
import type {
    NavigationAction,
    NavigationResult,
    RegisteredConfig,
    RegisteredConfigMap,
    Route,
    RouteState,
    RouterOptions,
    RouterParsedOptions,
    RouterRawLocation
} from './types';

export class Router {
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
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
                    replace: false,
                    handle: async (location, route) => {
                        this._applyRoute(route);
                        return {
                            type: NavigationType.popstate,
                            location,
                            route
                        };
                    }
                });
            }
        );
    }
    private _applyRoute(route: Route) {
        this._route = route;
    }
    public push(location: RouterRawLocation): Promise<NavigationResult> {
        const replace = false;
        return handleRoute({
            navType: NavigationType.push,
            options: this.options,
            location,
            replace,
            handle: async (location, route) => {
                this._navigation.push(route, replace);
                this._applyRoute(route);
                return {
                    type: NavigationType.push,
                    location,
                    route
                };
            }
        });
    }
    public replace(location: RouterRawLocation) {
        const replace = true;
        return handleRoute({
            navType: NavigationType.replace,
            options: this.options,
            location,
            replace,
            handle: async (location, route) => {
                this._navigation.push(route, replace);
                this._applyRoute(route);
                return {
                    type: NavigationType.push,
                    location,
                    route
                };
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
        switch (result.type) {
            case 'duplicate':
                return {
                    type: NavigationType.duplicate
                };
            case 'timeout':
                return {
                    type: NavigationType.error
                };
        }
        return handleRoute({
            navType,
            options: this.options,
            location: {
                path: result.url,
                state: result.state
            },
            replace: false,
            async handle(location, route) {
                return {
                    type: navType,
                    location,
                    route
                };
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
        const navType = NavigationType.pushWindow;
        return handleRoute({
            navType,
            options: this.options,
            location,
            replace: true,
            handle: async (location, route) => {
                return {
                    type: navType,
                    location,
                    result: await this.options.onOpenInApp(
                        location,
                        false,
                        navType
                    )
                };
            }
        });
    }
    public replaceWindow(location: RouterRawLocation) {
        const navType = NavigationType.replaceWindow;
        return handleRoute({
            navType,
            options: this.options,
            location,
            replace: true,
            handle: async (location, route) => {
                return {
                    type: navType,
                    location,
                    result: await this.options.onOpenInApp(
                        location,
                        false,
                        navType
                    )
                };
            }
        });
    }
    public reload(location?: RouterRawLocation) {
        const navType = NavigationType.reload;
        return handleRoute({
            navType,
            options: this.options,
            location: location ?? this.route.href,
            replace: true,
            handle: async (location, route) => {
                this._applyRoute(route);
                return {
                    type: navType,
                    location,
                    route
                };
            }
        });
    }
    public destroy() {
        this._navigation.destroy();
        this._destroyAllApp();
        this._registeredCfgMap = {};
    }

    protected _registeredCfgMap: RegisteredConfigMap = {};

    public register(
        appName: string,
        generator: (router: Router) => RegisteredConfig
    ) {
        this._registeredCfgMap[appName] = {
            appName,
            mounted: false,
            generator
        };
    }

    protected _destroyApp(cfg: string | RegisteredConfigMap[string]) {
        if (typeof cfg === 'string') {
            cfg = this._registeredCfgMap[cfg];
        }
        if (!cfg?.mounted) return;
        cfg.config?.destroy?.();
        cfg.mounted = false;
        cfg.config = void 0;
    }

    protected _destroyAllApp() {
        for (const appType in this._registeredCfgMap) {
            this._destroyApp(appType);
        }
    }
}
