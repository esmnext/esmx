import { LAYER_ID } from './increment-id';
import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteTransition } from './route-transition';
import { createLinkResolver } from './router-link';
import { RouteType, RouterMode } from './types';
import type {
    RouteConfirmHook,
    RouteLocationInput,
    RouteMatchType,
    RouteNotifyHook,
    RouteState,
    RouterLayerOptions,
    RouterLayerResult,
    RouterLinkProps,
    RouterLinkResolved,
    RouterOptions,
    RouterParsedOptions
} from './types';
import { isRouteMatched } from './util';

export class Router {
    public readonly options: RouterOptions;
    public readonly parsedOptions: RouterParsedOptions;
    public readonly isLayer: boolean;
    public readonly navigation: Navigation;
    public readonly microApp: MicroApp = new MicroApp();
    private _destroys: Array<() => void> = [];

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

    public get root() {
        return this.parsedOptions.root;
    }

    public constructor(options: RouterOptions) {
        this.options = options;
        this.parsedOptions = parsedOptions(options);
        this.isLayer = this.parsedOptions.layer?.enable === true;

        this.navigation = new Navigation(
            this.parsedOptions,
            (url: string, state: RouteState) => {
                this.transition.to(RouteType.none, {
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
    public pushWindow(toInput?: RouteLocationInput): Promise<Route> {
        return this.transition.to(
            RouteType.pushWindow,
            toInput ?? this.route.url.href
        );
    }
    public replaceWindow(toInput?: RouteLocationInput): Promise<Route> {
        return this.transition.to(
            RouteType.replaceWindow,
            toInput ?? this.route.url.href
        );
    }
    public restartApp(): Promise<Route>;
    public restartApp(toInput: RouteLocationInput): Promise<Route>;
    public restartApp(
        toInput?: RouteLocationInput | undefined
    ): Promise<Route> {
        return this.transition.to(
            RouteType.restartApp,
            toInput ?? this.route.url.href
        );
    }
    public async back(): Promise<Route | null> {
        const result = await this.navigation.go(-1);
        if (result === null) {
            // Call onBackNoResponse hook
            if (this.parsedOptions.onBackNoResponse) {
                this.parsedOptions.onBackNoResponse(this);
            }
            return null;
        }
        return this.transition.to(RouteType.back, {
            url: result.url,
            state: result.state
        });
    }
    public async go(index: number): Promise<Route | null> {
        // go(0) refreshes the page in browser, but we return null directly in router
        if (index === 0) {
            return null;
        }

        const result = await this.navigation.go(index);
        if (result === null) {
            // Call onBackNoResponse hook when backward navigation has no response
            if (index < 0 && this.parsedOptions.onBackNoResponse) {
                this.parsedOptions.onBackNoResponse(this);
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
        if (result === null) {
            return null;
        }
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
    public resolve(toInput: RouteLocationInput): Route {
        return new Route({
            options: this.parsedOptions,
            toType: RouteType.none,
            toInput,
            from: this.transition.route?.url ?? null
        });
    }

    /**
     * Check if the route matches the current route
     *
     * @param targetRoute Target route object to compare
     * @param matchType Match type
     * - 'route': Route-level matching, compare if route configurations are the same
     * - 'exact': Exact matching, compare if paths are completely the same
     * - 'include': Include matching, check if current path contains target path
     * @returns Whether it matches
     */
    public isRouteMatched(
        targetRoute: Route,
        matchType: RouteMatchType = 'include'
    ): boolean {
        const currentRoute = this.transition.route;
        if (!currentRoute) return false;

        return isRouteMatched(targetRoute, currentRoute, matchType);
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
     * const handlers = linkData.getEventHandlers(name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`);
     * // handlers.onClick for React
     * ```
     */
    public resolveLink(props: RouterLinkProps): RouterLinkResolved {
        return createLinkResolver(this, props);
    }

    public async createLayer(
        toInput: RouteLocationInput,
        options?: RouterOptions
    ): Promise<{ promise: Promise<RouterLayerResult>; router: Router }> {
        const layer: Required<RouterLayerOptions> = {
            enable: true,
            zIndex: 1000 + LAYER_ID.next(),
            params: {},
            shouldClose: () => false,
            autoPush: true,
            push: true,
            destroyed: () => {},
            ...options?.layer
        };
        const promise = new Promise<RouterLayerResult>((resolve) => {
            const destroyed = layer.destroyed;
            layer.destroyed = (result) => {
                if (result.type === 'push' && layer.autoPush) {
                    const href = result.route.url.href;
                    if (layer.push) {
                        this.push(href);
                    } else {
                        this.replace(href);
                    }
                }
                destroyed?.(result);
                resolve(result);
            };
        });
        const nextOptions: RouterOptions = {
            mode: RouterMode.memory,
            rootStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: `${layer.zIndex}`,
                background: 'rgba(0, 0,0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            ...this.options,
            root: undefined,
            ...options,
            onBackNoResponse: (router) => {
                // Close layer when back operation has no response
                router.closeLayer();
                // Call original onBackNoResponse if it exists
                options?.onBackNoResponse?.(router);
            },
            layer
        };
        const router = new Router(nextOptions);
        await router.replace(toInput);
        return {
            promise,
            router
        };
    }
    public async pushLayer(
        toInput: RouteLocationInput,
        layer?: Partial<RouterLayerOptions>,
        options?: RouterOptions
    ): Promise<RouterLayerResult> {
        const { promise } = await this.createLayer(toInput, {
            ...options,
            layer: {
                ...layer,
                ...options?.layer
            }
        });
        return promise;
    }
    public closeLayer() {
        if (this.isLayer) {
            this._destroys.push(() => {
                this.parsedOptions.layer?.destroyed?.({
                    type: 'close',
                    route: this.route
                });
            });
            this.destroy();
        }
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
        // Terminate current tasks
        this.transition.destroy();

        this.navigation.destroy();
        this.microApp.destroy();
        this._destroys.forEach((destroy) => destroy());
        this._destroys.length = 0;
    }
}
