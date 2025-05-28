import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { parseRoute } from './route';
import {
    type NavigationAction,
    type NavigationOpenWindowAction,
    type NavigationPushAction,
    type NavigationReplaceAction,
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
            case NavigationType.replace:
            case NavigationType.openWindow:
                return this._updateNavigation(action);
        }
    }
    private async _updateNavigation(
        action:
            | NavigationPushAction
            | NavigationReplaceAction
            | NavigationOpenWindowAction
    ): Promise<NavigationResult> {
        const result = await parseRoute(this.options, action.rawLocation);

        // 跨域处理
        if (result.type === NavigationType.crossOrigin) {
            const replace = action.type === NavigationType.openWindow;
            return {
                type: NavigationType.crossOrigin,
                data: this.options.onOpenCrossOrigin(result.url, replace)
            };
        }
        // 404 处理
        if (result.type === NavigationType.notFound) {
            return result;
        }
        // 更新导航
        if (result.type === NavigationType.update) {
            this._route = result.route;
            switch (action.type) {
                case NavigationType.push:
                    this._navigation.push(
                        result.route.fullPath,
                        result.route.state
                    );
                    return {
                        type: NavigationType.push,
                        route: result.route
                    };
                case NavigationType.replace:
                    this._navigation.replace(
                        result.route.fullPath,
                        result.route.state
                    );
                    return {
                        type: NavigationType.replace,
                        route: result.route
                    };
            }
        }
        return {
            type: NavigationType.error
        };
    }
    public push(rawLocation: RouterRawLocation) {
        return this._update({
            type: NavigationType.push,
            rawLocation
        });
    }
    public replace(rawLocation: RouterRawLocation) {
        return this._update({
            type: NavigationType.replace,
            rawLocation
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
    public pushLayer() {
        return this._update({
            type: NavigationType.pushLayer
        });
    }
    public openWindow(rawLocation: RouterRawLocation) {
        return this._update({
            type: NavigationType.openWindow,
            rawLocation
        });
    }
    public reload() {
        return this._update({
            type: NavigationType.reload
        });
    }
    public forceReload() {
        return this._update({
            type: NavigationType.forceReload
        });
    }
}
