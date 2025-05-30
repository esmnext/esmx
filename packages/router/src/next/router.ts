import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { handleRoute } from './route';
import { NavigationType } from './types';
import type {
    NavigationResult,
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
                    handle: async (result) => {
                        this._applyRoute(result.route);
                        return {
                            ...result,
                            navType: NavigationType.popstate
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
        return handleRoute({
            navType: NavigationType.push,
            options: this.options,
            location,
            handle: async (result) => {
                this._applyRoute(result.route);
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
                this._applyRoute(result.route);
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
                this._applyRoute(result.route);
                return result;
            }
        });
    }
    public destroy() {
        this._navigation.destroy();
    }
}
