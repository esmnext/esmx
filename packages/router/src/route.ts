import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseLocation, resolveRouteLocationInput } from './location';
import { parsedOptions } from './options';
import type { Router } from './router';

import {
    type RouteConfirmHook,
    type RouteHandleHook,
    type RouteHandleResult,
    type RouteLayerOptions,
    type RouteLocationInput,
    type RouteMatchResult,
    type RouteMeta,
    type RouteOptions,
    type RouteParsedConfig,
    type RouteState,
    RouteType,
    type RouterParsedOptions
} from './types';
import { isNonEmptyPlainObject, isPlainObject } from './util';

/**
 * Configuration for non-enumerable properties in Route class
 * These properties will be hidden during object traversal and serialization
 */
export const NON_ENUMERABLE_PROPERTIES = [
    // Private fields - internal implementation details
    '_handled',
    '_handle',
    '_handleResult',
    '_options',

    // SSR-specific properties - meaningless in client environment
    'req',
    'res',

    // Internal context - used by framework internally
    'context',

    // Status code - internal status information
    'statusCode',

    // Route behavior overrides - framework internal logic
    'confirm',

    // Layer configuration - used for layer routes
    'layer'
] satisfies string[];

/**
 * Append user-provided parameters to URL path
 * @param match Route matching result
 * @param toInput User-provided route location object
 * @param base Base URL
 * @param to Current parsed URL object
 */
export function applyRouteParams(
    match: RouteMatchResult,
    toInput: RouteLocationInput,
    base: URL,
    to: URL
): void {
    if (
        !isPlainObject(toInput) ||
        !isNonEmptyPlainObject(toInput.params) ||
        !match.matches.length
    ) {
        return;
    }

    // Get the last matched route configuration
    const lastMatch = match.matches[match.matches.length - 1];

    // Split current path
    const current = to.pathname.split('/');

    // Compile new path with user parameters and split
    const next = new URL(
        lastMatch.compile(toInput.params).substring(1),
        base
    ).pathname.split('/');

    // Replace current path segments with new path segments
    next.forEach((item, index) => {
        current[index] = item || current[index];
    });

    // Update URL path
    to.pathname = current.join('/');

    // Merge parameters to match result, user parameters take precedence
    Object.assign(match.params, toInput.params);
}

/**
 * Route class provides complete route object functionality
 */
export class Route {
    // Private fields for handle validation
    private _handled = false;
    private _handle: RouteHandleHook | null = null;
    private _handleResult: RouteHandleResult | null = null;
    private readonly _options: RouterParsedOptions;

    // Public properties
    public readonly statusCode: number | null = null;
    public readonly state: RouteState;
    public readonly keepScrollPosition: boolean;
    /** Custom confirm handler that overrides default route-transition confirm logic */
    public readonly confirm: RouteConfirmHook | null;
    /** Layer configuration for layer routes */
    public readonly layer: RouteLayerOptions | null;

    // Read-only properties
    public readonly type: RouteType;
    public readonly req: IncomingMessage | null;
    public readonly res: ServerResponse | null;
    public readonly context: Record<string | symbol, any>;
    public readonly url: URL;
    public readonly path: string;
    public readonly fullPath: string;
    public readonly hash: string;
    public readonly params: Record<string, string> = {};
    public readonly query: Record<string, string | undefined> = {};
    public readonly queryArray: Record<string, string[] | undefined> = {};
    public readonly meta: RouteMeta;
    public readonly matched: readonly RouteParsedConfig[];
    public readonly config: RouteParsedConfig | null;

    /** @deprecated Use `url.pathname` instead. */
    public get pathname(): string {
        return this.url.pathname;
    }

    /** @deprecated Use `url.href` instead. */
    public get href(): string {
        return this.url.href;
    }

    constructor(routeOptions: Partial<RouteOptions> = {}) {
        const {
            toType = RouteType.push,
            from = null,
            options = parsedOptions()
        } = routeOptions;

        this._options = options;
        this.type = toType;
        this.req = options.req;
        this.res = options.res;
        this.context = options.context;

        const base = options.base;
        const toInput = resolveRouteLocationInput(routeOptions.toInput, from);
        const to = options.normalizeURL(parseLocation(toInput, base), from);
        let match: RouteMatchResult | null = null;

        // Check if URL origin matches base origin (protocol + hostname + port)
        // If origins don't match, treat as external URL and don't attempt route matching
        if (
            to.origin === base.origin &&
            to.pathname.startsWith(base.pathname)
        ) {
            const isLayer = toType === RouteType.pushLayer;
            match = options.matcher(to, base, (config) => {
                if (isLayer) {
                    return config.layer !== false;
                }
                return config.layer !== true;
            });
        }

        if (match) {
            applyRouteParams(match, toInput, base, to);
            Object.assign(this.params, match.params);
        }

        this.url = to;
        this.path = match
            ? to.pathname.substring(base.pathname.length - 1)
            : to.pathname;
        this.fullPath = (match ? this.path : to.pathname) + to.search + to.hash;
        this.matched = match ? match.matches : Object.freeze([]);
        this.keepScrollPosition = Boolean(toInput.keepScrollPosition);
        this.confirm = toInput.confirm || null;
        this.layer =
            toType === RouteType.pushLayer && toInput.layer
                ? toInput.layer
                : null;
        this.config =
            this.matched.length > 0
                ? this.matched[this.matched.length - 1]
                : null;
        this.meta = this.config?.meta || {};

        const state: RouteState = {};
        if (toInput.state) {
            Object.assign(state, toInput.state);
        }
        this.state = state;

        for (const key of new Set(to.searchParams.keys())) {
            this.query[key] = to.searchParams.get(key)!;
            this.queryArray[key] = to.searchParams.getAll(key);
        }
        this.hash = to.hash;

        // Set status code
        // Prioritize user-provided statusCode
        if (typeof toInput.statusCode === 'number') {
            this.statusCode = toInput.statusCode;
        }
        // If statusCode is not provided, keep default null value

        // Configure property enumerability
        // Set internal implementation details as non-enumerable, keep user-common properties enumerable
        // Set specified properties as non-enumerable according to configuration
        for (const property of NON_ENUMERABLE_PROPERTIES) {
            Object.defineProperty(this, property, { enumerable: false });
        }
    }

    get isPush(): boolean {
        return this.type.startsWith('push');
    }

    // handle related getter/setter
    get handle(): RouteHandleHook | null {
        return this._handle;
    }

    set handle(val: RouteHandleHook | null) {
        this.setHandle(val);
    }

    get handleResult(): RouteHandleResult | null {
        return this._handleResult;
    }

    set handleResult(val: RouteHandleResult | null) {
        this._handleResult = val;
    }

    /**
     * Set handle function with validation logic wrapper
     */
    setHandle(val: RouteHandleHook | null): void {
        if (typeof val !== 'function') {
            this._handle = null;
            return;
        }
        const self = this;
        this._handle = function handle(
            this: Route,
            to: Route,
            from: Route | null,
            router: Router
        ) {
            if (self._handled) {
                throw new Error(
                    'Route handle hook can only be called once per navigation'
                );
            }
            self._handled = true;
            return val.call(this, to, from, router);
        };
    }

    /**
     * Apply navigation-generated state to current route
     * Used by route handlers to add system state like pageId
     * @param navigationState Navigation-generated state to apply
     */
    applyNavigationState(navigationState: Partial<RouteState>): void {
        Object.assign(this.state, navigationState);
    }

    /**
     * Sync all properties of current route to target route object
     * Used for route object updates in reactive systems
     * @param targetRoute Target route object
     */
    syncTo(targetRoute: Route): void {
        // Copy enumerable properties
        Object.assign(targetRoute, this);

        // Copy non-enumerable properties - type-safe property copying
        for (const property of NON_ENUMERABLE_PROPERTIES) {
            if (!(property in this && property in targetRoute)) continue;
            // Use Reflect.set for type-safe property setting
            const value = Reflect.get(this, property);
            Reflect.set(targetRoute, property, value);
        }
    }

    /**
     * Clone current route instance
     * Returns a new Route instance with same configuration and state
     */
    clone(): Route {
        // Reconstruct route object, passing current state and confirm handler
        const toInput: RouteLocationInput = {
            path: this.fullPath,
            state: { ...this.state },
            ...(this.confirm && { confirm: this.confirm }),
            ...(this.layer && { layer: this.layer }),
            ...(this.statusCode !== null && { statusCode: this.statusCode })
        };

        // Get original options from constructor's finalOptions
        const options = this._options;

        const clonedRoute = new Route({
            options,
            toType: this.type,
            toInput
        });

        return clonedRoute;
    }
}
