import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { parseRoute } from './route';
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
                return this._update({
                    type: NavigationType.popstate,
                    location: {
                        path: url,
                        state
                    }
                });
            }
        );
    }
    private async _update(action: NavigationAction): Promise<NavigationResult> {
        switch (action.type) {
            case NavigationType.push:
                return this._handlePush(action);
            case NavigationType.replace:
                return this._handlePush(action, true);
            case NavigationType.pushWindow:
                return this._handlePushWindow(action);
            case NavigationType.replaceWindow:
                return this._handleReplaceWindow(action);
            case NavigationType.pushLayer:
                return this._handlePushLayer(action);
            case NavigationType.reload:
                return this._handleReload(action);
            case NavigationType.popstate:
                return this._handlePopstate(action);
        }
    }
    private async _handlePush(
        action: NavigationAction,
        replace = false
    ): Promise<NavigationResult> {
        if (
            action.type !== NavigationType.push &&
            action.type !== NavigationType.replace
        ) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        switch (result.type) {
            case NavigationType.notFound:
                return {
                    type: NavigationType.notFound,
                    location: result.location
                };
            case NavigationType.crossOrigin:
                return {
                    type: NavigationType.crossOrigin,
                    location: result.location,
                    result: this.options.onOpenCrossOrigin(
                        result.location,
                        replace,
                        action.type
                    )
                };
            case NavigationType.crossApp:
                return {
                    type: NavigationType.crossApp,
                    location: result.location,
                    result: this.options.onOpenCrossApp(
                        result.location,
                        replace,
                        action.type
                    )
                };
            case NavigationType.update:
                this._applyRoute(result.route);
                return {
                    type: action.type,
                    location: result.location,
                    route: result.route
                };
        }
    }
    private async _handlePushWindow(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.pushWindow) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        switch (result.type) {
            case NavigationType.notFound:
                return {
                    type: NavigationType.notFound,
                    location: result.location
                };
            case NavigationType.crossOrigin:
                return {
                    type: NavigationType.pushWindow,
                    location: result.location,
                    result: this.options.onOpenCrossOrigin(
                        result.location,
                        false,
                        action.type
                    )
                };
            case NavigationType.crossApp:
            case NavigationType.update:
                return {
                    type: NavigationType.pushWindow,
                    location: result.location,
                    result: this.options.onOpenCrossApp(
                        result.location,
                        false,
                        action.type
                    )
                };
        }
    }
    private async _handleReplaceWindow(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.replaceWindow) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        setTimeout(() => {
            location.href = result.location.href;
        });
        return {
            type: NavigationType.replaceWindow,
            location: result.location
        };
    }
    private async _handlePushLayer(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.pushLayer) {
            return {
                type: NavigationType.error
            };
        }
        return {
            type: NavigationType.error
        };
    }
    private async _handleReload(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.reload) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        setTimeout(() => {
            location.href = result.location.href;
        });
        return {
            type: NavigationType.reload,
            location: result.location
        };
    }
    private async _handlePopstate(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.popstate) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        if (result.type === NavigationType.update) {
            this._applyRoute(result.route);
            return {
                type: action.type,
                location: result.location,
                route: result.route
            };
        }
        return {
            type: NavigationType.error
        };
    }
    private _applyRoute(route: Route, replace = false) {
        this._route = route;
        this._navigation.push(route, replace);
    }
    public push(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.push,
            location
        });
    }
    public replace(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.replace,
            location
        });
    }
    public go(index: number) {
        return this._navigation.go(index);
    }
    public forward() {
        return this.go(1);
    }
    public back() {
        return this.go(-1);
    }
    public pushLayer(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.pushLayer,
            location
        });
    }
    public openWindow(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.pushWindow,
            location
        });
    }
    public replaceWindow(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.replaceWindow,
            location
        });
    }
    public reload(location?: RouterRawLocation) {
        return this._update({
            type: NavigationType.reload,
            location: location ?? this.route.href
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
