import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { parseRoute } from './route';
import {
    type NavigationAction,
    type NavigationResult,
    NavigationType,
    type Route,
    type RouterOptions,
    type RouterParsedOptions,
    type RouterRawLocation
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
        this._navigation = new Navigation(this.options);
    }
    private async _update(action: NavigationAction): Promise<NavigationResult> {
        switch (action.type) {
            case NavigationType.push:
                return this._handlePush(action);
            case NavigationType.replace:
                return this._handlePush(action, true);
            case NavigationType.openWindow:
                return this._handleOpenWindow(action);
            case NavigationType.pushLayer:
                return this._handlePushLayer(action);
            case NavigationType.reload:
                return this._handleReload(action);
            case NavigationType.forceReload:
                return this._handleForceReload(action);
        }
        return {
            type: NavigationType.error
        };
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
                        replace
                    )
                };
            case NavigationType.crossApp:
                return {
                    type: NavigationType.crossApp,
                    location: result.location,
                    result: this.options.onOpenCrossApp(
                        result.location,
                        replace
                    )
                };
            case NavigationType.update:
                this._navigation.push(
                    result.route.fullPath,
                    result.route.state
                );
                return {
                    type: action.type,
                    location: result.location,
                    route: result.route
                };
        }
    }
    private async _handleOpenWindow(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.openWindow) {
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
                    type: NavigationType.openWindow,
                    location: result.location,
                    result: this.options.onOpenCrossOrigin(
                        result.location,
                        false
                    )
                };
            case NavigationType.crossApp:
            case NavigationType.update:
                return {
                    type: NavigationType.openWindow,
                    location: result.location,
                    result: this.options.onOpenCrossApp(result.location, false)
                };
        }
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
            type: NavigationType.forceReload
        };
    }
    private async _handleForceReload(
        action: NavigationAction
    ): Promise<NavigationResult> {
        if (action.type !== NavigationType.forceReload) {
            return {
                type: NavigationType.error
            };
        }
        const result = await parseRoute(this.options, action.location);
        setTimeout(() => {
            location.href = result.location.href;
        });
        return {
            type: NavigationType.forceReload
        };
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
        return this._update({
            type: NavigationType.go,
            index
        });
    }
    public forward() {
        return this._update({
            type: NavigationType.forward
        });
    }
    public back() {
        return this._update({
            type: NavigationType.back
        });
    }
    public pushLayer(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.pushLayer,
            location
        });
    }
    public openWindow(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.openWindow,
            location
        });
    }
    public reload(location?: RouterRawLocation) {
        return this._update({
            type: NavigationType.reload,
            location: location ?? this.route.href
        });
    }
    public forceReload(location?: RouterRawLocation) {
        return this._update({
            type: NavigationType.forceReload,
            location: location ?? this.route.href
        });
    }
}
