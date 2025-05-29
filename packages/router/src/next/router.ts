import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { parseRoute } from './route';
import { NavigationActionType, NavigationResultType } from './types';
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
import { openWindow } from './util';

export class Router {
    public options: RouterParsedOptions;
    protected _route: null | Route = null;
    protected _navigation: Navigation;
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
                    type: NavigationActionType.popstate,
                    location: {
                        path: url,
                        state
                    }
                });
            }
        );
    }
    protected async _update(
        action: NavigationAction
    ): Promise<NavigationResult> {
        switch (action.type) {
            case NavigationActionType.push:
                return this._handlePush(
                    action as NavigationAction<NavigationActionType.push>
                );
            case NavigationActionType.replace:
                return this._handlePush(
                    action as NavigationAction<NavigationActionType.replace>
                );
            case NavigationActionType.pushWindow:
                return this._handlePushWindow(
                    action as NavigationAction<NavigationActionType.pushWindow>
                );
            case NavigationActionType.forceReload:
                return this._handleForceReload(
                    action as NavigationAction<NavigationActionType.forceReload>
                );
            case NavigationActionType.pushLayer:
                return this._handlePushLayer(
                    action as NavigationAction<NavigationActionType.pushLayer>
                );
            case NavigationActionType.reload:
                return this._handleReload(
                    action as NavigationAction<NavigationActionType.reload>
                );
            case NavigationActionType.go:
            case NavigationActionType.back:
            case NavigationActionType.forward:
            case NavigationActionType.popstate:
                return this._handlePopstate(
                    action as NavigationAction<NavigationActionType.popstate>
                );
        }
    }
    protected async _handlePush(
        action: NavigationAction<
            NavigationActionType.push | NavigationActionType.replace
        >
    ): Promise<NavigationResult> {
        const result = await parseRoute({
            options: this.options,
            raw: action.location,
            type: action.type,
            router: this
        });
        switch (result.navResultType) {
            case NavigationResultType.notFound:
                return {
                    navResultType: NavigationResultType.notFound,
                    navActionType: action.type,
                    location: result.location
                };
            case NavigationResultType.external:
                return {
                    navResultType: NavigationResultType.external,
                    navActionType: action.type,
                    location: result.location,
                    result: this.options.externalUrlHandler({
                        url: result.location,
                        router: this,
                        type: action.type
                    })
                };
            case NavigationResultType.success:
                this._applyRoute(result.route);
                return {
                    navResultType: NavigationResultType.success,
                    navActionType: action.type,
                    location: result.location,
                    route: result.route
                };
        }
    }
    protected async _handlePushWindow(
        action: NavigationAction<NavigationActionType.pushWindow>
    ): Promise<NavigationResult> {
        const result = await parseRoute({
            options: this.options,
            raw: action.location,
            type: action.type,
            router: this
        });
        switch (result.navResultType) {
            case NavigationResultType.notFound:
                return {
                    navResultType: NavigationResultType.notFound,
                    navActionType: action.type,
                    location: result.location
                };
            case NavigationResultType.external:
                return {
                    navResultType: NavigationResultType.external,
                    navActionType: action.type,
                    location: result.location,
                    result: this.options.externalUrlHandler({
                        url: result.location,
                        router: this,
                        type: action.type
                    })
                };
            case NavigationResultType.success:
                setTimeout(() => openWindow(result.location));
                return {
                    navActionType: NavigationActionType.pushWindow,
                    navResultType: NavigationResultType.success,
                    location: result.location
                };
        }
    }
    protected async _handleForceReload(
        action: NavigationAction<NavigationActionType.forceReload>
    ): Promise<NavigationResult> {
        const result = await parseRoute({
            options: this.options,
            raw: action.location,
            type: action.type,
            router: this
        });
        setTimeout(() => {
            location.href = result.location.href;
        });
        return {
            navActionType: NavigationActionType.forceReload,
            navResultType: NavigationResultType.success,
            location: result.location
        };
    }
    protected async _handlePushLayer(
        action: NavigationAction<NavigationActionType.pushLayer>
    ): Promise<NavigationResult> {
        return {
            navResultType: NavigationResultType.error,
            navActionType: action.type,
            location: action.location,
            error: new Error('Push layer is not supported yet.')
        };
    }
    protected async _handleReload(
        action: NavigationAction<NavigationActionType.reload>
    ): Promise<NavigationResult> {
        const result = await parseRoute({
            options: this.options,
            raw: action.location,
            type: action.type,
            router: this
        });
        setTimeout(() => {
            location.href = result.location.href;
        });
        return {
            navActionType: NavigationActionType.reload,
            navResultType: NavigationResultType.success,
            location: result.location
        };
    }
    protected async _handlePopstate(
        action: NavigationAction<NavigationActionType.popstate>
    ): Promise<NavigationResult> {
        const result = await parseRoute({
            options: this.options,
            raw: action.location,
            type: action.type,
            router: this
        });
        if (result.navResultType === NavigationResultType.success) {
            this._applyRoute(result.route);
            return {
                navResultType: NavigationResultType.success,
                navActionType: action.type,
                location: result.location,
                route: result.route
            };
        }
        return {
            navResultType: NavigationResultType.error,
            navActionType: action.type,
            location: action.location,
            error: new Error(`Failed to handle popstate: ${action.location}`)
        };
    }
    protected _applyRoute(route: Route, replace = false) {
        this._route = route;
        this._navigation.push(route, replace);
    }
    public destroy() {
        this._navigation.destroy();
        this._destroyAllApp();
        this._registeredCfgMap = {};
    }

    public push(location: RouterRawLocation) {
        return this._update({ type: NavigationActionType.push, location });
    }
    public replace(location: RouterRawLocation) {
        return this._update({ type: NavigationActionType.replace, location });
    }
    public pushLayer(location: RouterRawLocation) {
        return this._update({ type: NavigationActionType.pushLayer, location });
    }
    public openWindow(location: RouterRawLocation) {
        return this._update({
            type: NavigationActionType.pushWindow,
            location
        });
    }
    public forceReload(location: RouterRawLocation) {
        return this._update({
            type: NavigationActionType.forceReload,
            location
        });
    }
    public reload(location?: RouterRawLocation) {
        return this._update({
            type: NavigationActionType.reload,
            location: location ?? this.route.href
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
