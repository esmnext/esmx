import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MatchFunction } from 'path-to-regexp';
import type { Route } from './route';
import type { Router } from './router';

// Re-export Route type for backward compatibility
export type { Route };

// ============================================================================
// Router related types
// ============================================================================
export enum RouterMode {
    history = 'history',
    memory = 'memory'
}
export interface RouterOptions {
    /**
     * Application mounting container
     * - Can be a DOM selector string (e.g., '#app', '.container', '[data-mount]')
     * - Can be an HTMLElement object
     * - Defaults to '#root'
     *
     * @example
     * ```typescript
     * // Using ID selector
     * new Router({ root: '#my-app' })
     *
     * // Using class selector
     * new Router({ root: '.app-container' })
     *
     * // Using attribute selector
     * new Router({ root: '[data-router-mount]' })
     *
     * // Passing DOM element directly
     * const element = document.getElementById('app');
     * new Router({ root: element })
     * ```
     */
    root?: string | HTMLElement;
    context?: Record<string | symbol, unknown>;
    routes?: RouteConfig[];
    mode?: RouterMode;
    /** Optional in browser, but required on server side */
    base?: URL;
    env?: string;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    location?: RouteHandleHook;
    rootStyle?: Partial<CSSStyleDeclaration> | false;
    layer?: RouterLayerOptions | null;
    /** Hook function called when router.back() or router.go(negative) is unresponsive */
    onBackNoResponse?: RouteBackNoResponseHook;
}

export interface RouterLayerOptions {
    /**
     * Whether to enable layer mode
     */
    enable?: boolean;

    /**
     * Layer zIndex value
     * If not set, will automatically use incremental layer value (1000 + increment)
     */
    zIndex?: number;

    /**
     * Route layer initialization parameters, passed as key-value pairs
     */
    params?: Record<string, unknown>;
    /**
     * Verification hook function before route closure
     * @returns Return true to allow closure, false to prevent closure
     */
    shouldClose?: RouteVerifyHook;
    /**
     * Whether to automatically record route history
     * @default true
     */
    autoPush?: boolean;
    /**
     * Route navigation mode control
     * - When autoPush is true:
     *   - true: Use push mode (add new history record)
     *   - false: Use replace mode (replace current history record)
     * @default true
     */
    push?: boolean;
    /**
     * Callback after route layer destruction
     * @param result - Object containing route layer return result
     */
    destroyed?: (result: RouterLayerResult) => void;
}
export type RouterLayerResult =
    | { type: 'push'; route: Route }
    | { type: 'close'; route: Route | null }
    | { type: 'success'; route: Route };

export interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
    /** Parsed URL containing only directory pathname, without query and hash */
    readonly base: URL;
    /** Route matcher instance */
    readonly matcher: RouteMatcher;
}

export interface RouterMicroAppOptions {
    mount: (el: HTMLElement) => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}

export type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;

export type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;

// ============================================================================
// Route related types
// ============================================================================

/**
 * Route constructor options interface
 */
export interface RouteOptions {
    /** Router parsed options */
    options?: RouterParsedOptions;
    /** Route type */
    toType?: RouteType;
    /** Target route location */
    toInput?: RouteLocationInput;
    /** Source URL */
    from?: URL | null;
}

export enum RouteType {
    push = 'push',
    replace = 'replace',
    restartApp = 'restartApp',
    go = 'go',
    forward = 'forward',
    back = 'back',
    none = 'none',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow'
}
export type RouteMeta = Record<string | symbol, unknown>;

export type RouteState = Record<string, unknown>;
export type RouteHandleResult = unknown | null | void;

export interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
    statusCode?: number | null;
}
export type RouteLocationInput = RouteLocation | string;

export interface RouteConfig {
    /** Pass a URL-encoded path */
    path: string;
    component?: unknown;
    children?: RouteConfig[];
    redirect?: RouteLocationInput | RouteConfirmHook;
    meta?: RouteMeta;
    env?: RouteEnv;
    app?: string | RouterMicroAppCallback;
    asyncComponent?: () => Promise<unknown>;
    beforeEnter?: RouteConfirmHook;
    beforeUpdate?: RouteConfirmHook;
    beforeLeave?: RouteConfirmHook;
}
export interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}

export enum RouteStatus {
    resolved = 'resolved', // Route resolution completed, Route object created
    pending = 'pending', // Executing task chain (guards, async components, etc.)
    success = 'success', // Task execution successful
    aborted = 'aborted', // Task was cancelled
    error = 'error' // Resolution or execution failed
}

export interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[] | undefined>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

/**
 * Route matching type
 * - 'route': Route-level matching, compare if route configurations are the same
 * - 'exact': Exact matching, compare if paths are exactly the same
 * - 'include': Include matching, check if current path contains target path
 */
export type RouteMatchType = 'route' | 'exact' | 'include';

/**
 * Route hook function type
 * @param to Target route
 * @param from Source route, may be null on first navigation
 * @returns
 *   - true: Continue execution
 *   - false: Terminate execution
 *   - RouteLocationInput: Redirect to another route
 */
export type RouteConfirmHook = (
    to: Route,
    from: Route | null
) => Awaitable<RouteConfirmHookResult>;
export type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;
export type RouteVerifyHook = (
    to: Route,
    from: Route | null
) => Awaitable<boolean>;
export type RouteHandleHook = (
    to: Route,
    from: Route | null
) => Awaitable<RouteHandleResult>;
export type RouteNotifyHook = (to: Route, from: Route | null) => void;

/**
 * Hook function type called when router.back() or router.go(negative) is unresponsive
 * @param router Router instance
 */
export type RouteBackNoResponseHook = (router: Router) => void;

export interface RouteEnvOptions {
    handle?: RouteHandleHook;
    require?: RouteVerifyHook;
}

export type RouteEnv = RouteHandleHook | RouteEnvOptions;

// ============================================================================
// RouterLink related types
// ============================================================================

/**
 * Router link navigation types
 */
export type RouterLinkType =
    | 'push'
    | 'replace'
    | 'pushWindow'
    | 'replaceWindow'
    | 'pushLayer';

/**
 * Router link attributes generated by the source code
 */
export interface RouterLinkAttributes {
    // Always generated
    href: string;
    class: string;

    // Conditionally generated
    target?: '_blank';
    rel?: string;
}

/**
 * Framework-agnostic link configuration interface
 */
export interface RouterLinkProps {
    to: RouteLocationInput;
    type?: RouterLinkType;
    /**
     * @deprecated Use type='replace' instead
     */
    replace?: boolean;
    exact?: RouteMatchType;
    activeClass?: string;
    event?: string | string[];
    layerOptions?: Partial<RouterLayerOptions>;
    tag?: string;
}

/**
 * Framework-agnostic link resolution result
 */
export interface RouterLinkResolved {
    // Basic information
    route: Route;
    type: RouterLinkType;
    isActive: boolean;
    isExactActive: boolean;
    isExternal: boolean;
    tag: string;

    // Element attributes
    attributes: RouterLinkAttributes;

    // Navigation function
    navigate: (e?: MouseEvent) => void;

    // Event handling
    getEventHandlers: (
        nameTransform?: (eventType: string) => string
    ) => Record<string, (e: MouseEvent) => void>;
}

// ============================================================================
// Utility functions
// ============================================================================
export type Awaitable<T> = T | Promise<T>;
