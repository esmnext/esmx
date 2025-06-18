import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseLocation } from './location';
import { parsedOptions } from './options';
import { RouteStatus } from './types';
import {
    type RouteHandleHook,
    type RouteHandleResult,
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
    'statusCode'
] satisfies string[];

/**
 * Create default route options
 */
function createDefaultRouteOptions(): Required<RouteOptions> {
    return {
        options: parsedOptions(),
        toType: RouteType.none,
        toInput: '/',
        from: null
    };
}

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
    public status: RouteStatus = RouteStatus.resolved;
    public statusCode: number | null = null;
    public readonly state: RouteState;
    public readonly keepScrollPosition: boolean;

    // Read-only properties
    public readonly type: RouteType;
    public readonly isPush: boolean;
    public readonly req: IncomingMessage | null;
    public readonly res: ServerResponse | null;
    public readonly context: Record<string | symbol, any>;
    public readonly url: URL;
    public readonly path: string;
    public readonly fullPath: string;
    public readonly hash: string;
    public readonly params: Record<string, string> = {};
    public readonly query: Record<string, string | undefined>;
    public readonly queryArray: Record<string, string[] | undefined>;
    public readonly meta: RouteMeta;
    public readonly matched: readonly RouteParsedConfig[];
    public readonly config: RouteParsedConfig | null;

    constructor(routeOptions: Partial<RouteOptions> = {}) {
        // Merge default options
        const defaults = createDefaultRouteOptions();
        const finalOptions = { ...defaults, ...routeOptions };

        const { options, toType, toInput, from } = finalOptions;

        // Save original options for cloning
        this._options = options;
        this.type = toType;
        this.isPush = toType.startsWith('push');
        this.req = options.req;
        this.res = options.res;
        this.context = options.context;

        const base = options.base;
        const to = options.normalizeURL(parseLocation(toInput, base), from);
        const isSameOrigin = to.origin === base.origin;
        const isSameBase = to.pathname.startsWith(base.pathname);
        const match =
            isSameOrigin && isSameBase ? options.matcher(to, base) : null;

        this.url = to;
        this.path = match
            ? to.pathname.substring(base.pathname.length - 1)
            : to.pathname;
        this.fullPath = match
            ? `${this.path}${to.search}${to.hash}`
            : to.pathname + to.search + to.hash;
        this.matched = match ? match.matches : Object.freeze([]);
        this.keepScrollPosition = isPlainObject(toInput)
            ? Boolean(toInput.keepScrollPosition)
            : false;
        this.config =
            this.matched.length > 0
                ? this.matched[this.matched.length - 1]
                : null;
        this.meta = this.config?.meta || {};

        // Initialize state object - create new local object, merge externally passed state
        const state: RouteState = {};
        if (isPlainObject(toInput) && toInput.state) {
            Object.assign(state, toInput.state);
        }
        this.state = state;

        // Initialize query parameter objects
        const query: Record<string, string | undefined> = {};
        const queryArray: Record<string, string[] | undefined> = {};

        // Process query parameters
        for (const key of new Set(to.searchParams.keys())) {
            query[key] = to.searchParams.get(key)!;
            queryArray[key] = to.searchParams.getAll(key);
        }
        this.query = query;
        this.queryArray = queryArray;
        this.hash = to.hash;

        // Apply user-provided route parameters (if match is successful)
        if (match) {
            applyRouteParams(match, toInput, base, to);
            // Assign matched parameters to route object
            Object.assign(this.params, match.params);
        }

        // Set status code
        // Prioritize user-provided statusCode
        if (isPlainObject(toInput) && typeof toInput.statusCode === 'number') {
            this.statusCode = toInput.statusCode;
        } else if (isPlainObject(toInput) && toInput.statusCode === null) {
            this.statusCode = null;
        }
        // If statusCode is not provided, keep default null value

        // Configure property enumerability
        this._configureEnumerability();
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
     * Configure property enumerability
     * Set internal implementation details as non-enumerable, keep user-common properties enumerable
     */
    private _configureEnumerability(): void {
        // Set specified properties as non-enumerable according to configuration
        for (const property of NON_ENUMERABLE_PROPERTIES) {
            Object.defineProperty(this, property, { enumerable: false });
        }
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
            ...args: Parameters<RouteHandleHook>
        ) {
            if (this.status !== RouteStatus.success) {
                throw new Error(
                    `Cannot call route handle hook - current status is ${this.status} (expected: ${RouteStatus.success})`
                );
            }
            if (self._handled) {
                throw new Error(
                    'Route handle hook can only be called once per navigation'
                );
            }
            self._handled = true;
            return val.call(this, ...args);
        };
    }

    /**
     * Merge new state into current route's state
     * @param newState New state to merge
     */
    mergeState(newState: Partial<RouteState>): void {
        // Directly merge new state without clearing existing state
        Object.assign(this.state, newState);
    }

    /**
     * Set single state value
     * @param name State name
     * @param value State value
     */
    setState(name: string, value: any): void {
        this.state[name] = value;
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
            if (property in this && property in targetRoute) {
                // Use Reflect.set for type-safe property setting
                const value = Reflect.get(this, property);
                Reflect.set(targetRoute, property, value);
            }
        }
    }

    /**
     * Clone current route instance
     * Returns a new Route instance with same configuration and state
     */
    clone(): Route {
        // Reconstruct route object, passing current state
        const toInput = {
            path: this.fullPath,
            state: { ...this.state }
        };

        // Get original options from constructor's finalOptions
        const options = this._options;

        const clonedRoute = new Route({
            options,
            toType: this.type,
            toInput
        });

        // Manually copy statusCode as it might have been manually modified
        clonedRoute.statusCode = this.statusCode;

        return clonedRoute;
    }
}
