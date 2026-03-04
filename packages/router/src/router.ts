import { LAYER_ID } from './increment-id';
import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteTransition } from './route-transition';
import { createLinkResolver } from './router-link';
import type {
    RouteConfirmHook,
    RouteLayerOptions,
    RouteLayerResult,
    RouteLocationInput,
    RouteMatchType,
    RouteNotifyHook,
    RouterLinkProps,
    RouterLinkResolved,
    RouterOptions,
    RouterParsedOptions,
    RouteState
} from './types';
import { RouterMode, RouteType } from './types';
import { isNotNullish, isPlainObject, isRouteMatched } from './util';

export class Router {
    public readonly options: RouterOptions;
    public readonly parsedOptions: RouterParsedOptions;
    public readonly isLayer: boolean;
    public readonly navigation: Navigation;
    public readonly microApp: MicroApp = new MicroApp();

    // Route transition manager
    public readonly transition = new RouteTransition(this);
    public get route() {
        const route = this.transition.route;
        if (route === null) {
            throw new Error(
                'No active route found. Please navigate to a route first using router.push() or router.replace().'
            );
        }
        return route;
    }

    public get context() {
        return this.parsedOptions.context;
    }
    public get data() {
        return this.parsedOptions.data;
    }

    public get root() {
        return this.parsedOptions.root;
    }
    public get mode(): RouterMode {
        return this.parsedOptions.mode;
    }
    public get base(): URL {
        return this.parsedOptions.base;
    }
    public get req() {
        return this.parsedOptions.req ?? null;
    }
    public get res() {
        return this.parsedOptions.res ?? null;
    }

    public constructor(options: RouterOptions) {
        this.options = options;
        this.parsedOptions = parsedOptions(options);
        this.isLayer = this.parsedOptions.layer;

        this.navigation = new Navigation(
            this.parsedOptions,
            (url: string, state: RouteState) => {
                this.transition.to(RouteType.unknown, {
                    url,
                    state
                });
            }
        );
    }

    public push(toInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.push, toInput);
    }
    public replace(toInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.replace, toInput);
    }
    public pushWindow(toInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.pushWindow, toInput);
    }
    public replaceWindow(toInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.replaceWindow, toInput);
    }
    public restartApp(toInput?: RouteLocationInput): Promise<Route> {
        return this.transition.to(
            RouteType.restartApp,
            toInput ?? this.route.url.href
        );
    }

    public async back(): Promise<Route | null> {
        const result = await this.navigation.go(-1);
        if (result === null) {
            this.parsedOptions.handleBackBoundary(this);
            return null;
        }
        return this.transition.to(RouteType.back, {
            url: result.url,
            state: result.state
        });
    }
    public async go(index: number): Promise<Route | null> {
        // go(0) refreshes the page in browser, but we return null directly in router
        if (index === 0) return null;

        const result = await this.navigation.go(index);
        if (result === null) {
            // Call handleBackBoundary when backward navigation has no response
            if (index < 0) {
                this.parsedOptions.handleBackBoundary(this);
            }
            return null;
        }
        return this.transition.to(RouteType.go, {
            url: result.url,
            state: result.state
        });
    }
    public async forward(): Promise<Route | null> {
        const result = await this.navigation.go(1);
        if (result === null) return null;
        return this.transition.to(RouteType.forward, {
            url: result.url,
            state: result.state
        });
    }

    /**
     * Parse route location without performing actual navigation
     *
     * This method is used to parse route configuration and return the corresponding route object,
     * but does not trigger actual page navigation. It is mainly used for the following scenarios:
     * - Generate link URLs without jumping
     * - Pre-check route matching
     * - Get route parameters, meta information, etc.
     * - Test the validity of route configuration
     *
     * @param toInput Target route location, can be a string path or route configuration object
     * @returns Parsed route object containing complete route information
     *
     * @example
     * ```typescript
     * // Parse string path
     * const route = router.resolve('/user/123');
     * const url = route.url.href; // Get complete URL
     *
     * // Parse named route
     * const userRoute = router.resolve({
     *   name: 'user',
     *   params: { id: '123' }
     * });
     * console.log(userRoute.params.id); // '123'
     *
     * // Check route validity
     * const testRoute = router.resolve('/some/path');
     * if (testRoute.matched.length > 0) {
     *   // Route matched successfully
     * }
     * ```
     */
    public resolve(toInput: RouteLocationInput, toType?: RouteType): Route {
        return new Route({
            options: this.parsedOptions,
            toType,
            toInput,
            from: this.transition.route?.url ?? null
        });
    }

    /**
     * Check if the route matches the current route
     *
     * @param toRoute Target route object to compare
     * @param matchType Match type
     * - 'route': Route-level matching, compare if route configurations are the same
     * - 'exact': Exact matching, compare if paths are completely the same
     * - 'include': Include matching, check if current path contains target path
     * @returns Whether it matches
     */
    public isRouteMatched(
        toRoute: Route,
        matchType: RouteMatchType = 'include'
    ): boolean {
        const currentRoute = this.transition.route;
        if (!currentRoute) return false;

        return isRouteMatched(currentRoute, toRoute, matchType);
    }

    /**
     * Resolve router link configuration and return complete link data
     *
     * This method analyzes router link properties and returns a comprehensive
     * link resolution result including route information, navigation functions,
     * HTML attributes, and event handlers. It's primarily used for:
     * - Framework-agnostic link component implementation
     * - Generating link attributes and navigation handlers
     * - Computing active states and CSS classes
     * - Creating event handlers for different frameworks
     *
     * @param props Router link configuration properties
     * @returns Complete link resolution result with all necessary data
     *
     * @example
     * ```typescript
     * // Basic link resolution
     * const linkData = router.resolveLink({
     *   to: '/user/123',
     *   type: 'push'
     * });
     *
     * // Access resolved data
     * console.log(linkData.route.path); // '/user/123'
     * console.log(linkData.attributes.href); // Full href URL
     * console.log(linkData.isActive); // Active state
     *
     * // Use navigation function
     * linkData.navigate(); // Programmatic navigation
     *
     * // Get event handlers for React
     * const handlers = linkData.createEventHandlers(name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`);
     * // handlers.onClick for React
     * ```
     */
    public resolveLink(props: RouterLinkProps): RouterLinkResolved {
        return createLinkResolver(this, props);
    }

    public async createLayer(
        toInput: RouteLocationInput
    ): Promise<{ promise: Promise<RouteLayerResult>; router: Router }> {
        const layerOptions: RouteLayerOptions =
            (isPlainObject(toInput) && toInput.layer) || {};

        const zIndex =
            layerOptions.zIndex ?? this.parsedOptions.zIndex + LAYER_ID.next();

        let promiseResolve: (result: RouteLayerResult) => void;
        let promise = new Promise<RouteLayerResult>((resolve) => {
            promiseResolve = resolve;
        });

        const router = new Router({
            rootStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: String(zIndex),
                background: 'rgba(0,0,0,.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            ...this.options,
            context: this.parsedOptions.context,
            mode: RouterMode.memory,
            root: undefined,
            ...layerOptions.routerOptions,
            handleBackBoundary(router) {
                router.destroy();
                promiseResolve({
                    type: 'close',
                    route: router.route
                });
            },
            handleLayerClose(router, data) {
                router.destroy();
                if (isNotNullish(data)) {
                    promiseResolve({
                        type: 'success',
                        route: router.route,
                        data
                    });
                } else {
                    promiseResolve({
                        type: 'close',
                        route: router.route
                    });
                }
            },
            layer: true
        });
        const initRoute = await router.replace(toInput);

        router.afterEach(async (to, from) => {
            if (
                [
                    RouteType.pushWindow,
                    RouteType.replaceWindow,
                    RouteType.replace,
                    RouteType.restartApp,
                    RouteType.pushLayer
                ].includes(to.type)
            )
                return;
            let keepAlive = false;
            if (layerOptions.keepAlive === 'exact') {
                keepAlive = to.path === initRoute.path;
            } else if (layerOptions.keepAlive === 'include') {
                keepAlive = to.path.startsWith(initRoute.path);
            } else if (typeof layerOptions.keepAlive === 'function') {
                keepAlive = await layerOptions.keepAlive(to, from, router);
            } else {
                if (layerOptions.shouldClose) {
                    console.warn(
                        '[esmx-router] RouteLayerOptions.shouldClose is deprecated. Use keepAlive instead. ' +
                            'Note: shouldClose returns true to close, keepAlive returns true to keep alive.'
                    );
                    keepAlive = !(await layerOptions.shouldClose(
                        to,
                        from,
                        router
                    ));
                } else {
                    keepAlive = to.path === initRoute.path;
                }
            }
            if (!keepAlive) {
                router.destroy();
                promiseResolve({
                    type: 'push',
                    route: to
                });
            }
        });
        if (layerOptions.push) {
            router.navigation.pushHistoryState(
                router.route.state,
                router.route.url
            );
            promise = promise.then(async (result) => {
                await this.navigation.backHistoryState();
                return result;
            });
        }
        if (layerOptions.autoPush) {
            promise = promise.then(async (result) => {
                if (result.type === 'push') {
                    await this.push(result.route.url.href);
                }
                return result;
            });
        }
        return {
            promise,
            router
        };
    }
    public async pushLayer(
        toInput: RouteLocationInput
    ): Promise<RouteLayerResult> {
        const result = await this.transition.to(RouteType.pushLayer, toInput);
        return result.handleResult as RouteLayerResult;
    }
    public closeLayer(data?: any) {
        if (!this.isLayer) return;
        this.parsedOptions.handleLayerClose(this, data);
    }

    public async renderToString(throwError = false): Promise<string | null> {
        try {
            const result = await this.microApp.app?.renderToString?.();
            return result ?? null;
        } catch (e) {
            if (throwError) throw e;
            else console.error(e);
            return null;
        }
    }

    public beforeEach(guard: RouteConfirmHook): () => void {
        return this.transition.beforeEach(guard);
    }
    public afterEach(guard: RouteNotifyHook): () => void {
        return this.transition.afterEach(guard);
    }

    public destroy() {
        this.transition.destroy();
        this.navigation.destroy();
        this.microApp.destroy();
    }
}
