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
            case NavigationType.pushWindow:
                return this._handlePushWindow(action);
            case NavigationType.replaceWindow:
                return this._handleReplaceWindow(action);
            case NavigationType.pushLayer:
                return this._handlePushLayer(action);
            case NavigationType.reload:
                return this._handleReload(action);
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
}
