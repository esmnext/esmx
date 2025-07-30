import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MatchFunction } from 'path-to-regexp';
import type { Route } from './route';
import type { Router } from './router';

// Re-export Route type for backward compatibility
export type { Route };

// ============================================================================
// Utility types
// ============================================================================
export type Awaitable<T> = T | Promise<T>;

// ============================================================================
// Core enums
// ============================================================================
export enum RouterMode {
    history = 'history',
    memory = 'memory'
}

export enum RouteType {
    push = 'push',
    replace = 'replace',
    restartApp = 'restartApp',
    go = 'go',
    forward = 'forward',
    back = 'back',
    unknown = 'unknown',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow',
    pushLayer = 'pushLayer'
}

// ============================================================================
// Hook function types
// ============================================================================
export type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;

export type RouteConfirmHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteConfirmHookResult>;

export type RouteVerifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<boolean>;

export type RouteHandleHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteHandleResult>;

export type RouteNotifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => void;

// ============================================================================
// Basic data types
// ============================================================================
export type RouteMeta = Record<string | symbol, unknown>;
export type RouteState = Record<string, unknown>;
export type RouteHandleResult = unknown | null | void;

/**
 * Route matching type
 * - 'route': Route-level matching, compare if route configurations are the same
 * - 'exact': Exact matching, compare if paths are exactly the same
 * - 'include': Include matching, check if current path contains target path
 */
export type RouteMatchType = 'route' | 'exact' | 'include';

// ============================================================================
// Route location and config types
// ============================================================================
export interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[] | undefined>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
    statusCode?: number | null;
    layer?: RouteLayerOptions | null;
    confirm?: RouteConfirmHook | null;
}
export type RouteLocationInput = RouteLocation | string;

export interface RouteConfig {
    /** Pass a URL-encoded path */
    path: string;
    component?: unknown;
    children?: RouteConfig[];
    redirect?: RouteLocationInput | RouteConfirmHook;
    meta?: RouteMeta;
    app?: string | RouterMicroAppCallback;
    asyncComponent?: () => Promise<unknown>;
    beforeEnter?: RouteConfirmHook;
    beforeUpdate?: RouteConfirmHook;
    beforeLeave?: RouteConfirmHook;
    /** Mark this route as only effective in layer mode */
    layer?: boolean;

    /**
     * Route override function for hybrid app development
     *
     * Note: Override is not executed during initial route loading
     *
     * @param to Target route
     * @param from Source route
     * @returns Function to execute instead of default routing, or void for default
     *
     * @example
     * ```typescript
     * override: (to, from) => {
     *   if (isInApp()) {
     *     return () => JSBridge.openNative();
     *   }
     * }
     * ```
     */
    override?: RouteConfirmHook;
}

export interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}

export interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[] | undefined>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

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

// ============================================================================
// Router Layer types
// ============================================================================
export interface RouteLayerOptions {
    /**
     * Layer zIndex value
     * If not set, will automatically use incremental layer value (1000 + increment)
     */
    zIndex?: number;
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
     * Router options for creating the layer instance
     * These options will be merged with the default router configuration
     */
    routerOptions?: RouterLayerOptions;
}

export type RouteLayerResult =
    | { type: 'close'; route: Route }
    | { type: 'push'; route: Route }
    | { type: 'success'; route: Route; data?: any };

/**
 * Router options for creating layer instances
 * Excludes handler functions and layer fields which are handled internally by createLayer
 */
export type RouterLayerOptions = Omit<
    RouterOptions,
    'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;

// ============================================================================
// Router MicroApp types
// ============================================================================
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
// Router core types
// ============================================================================
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
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    fallback?: RouteHandleHook;

    rootStyle?: Partial<CSSStyleDeclaration> | false;
    layer?: boolean;
    zIndex?: number;
    handleBackBoundary?: (router: Router) => void;
    handleLayerClose?: (router: Router, data?: any) => void;
}

export interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
    readonly matcher: RouteMatcher;
}

// ============================================================================
// RouterLink types
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

export type RouterLinkEventHandler = <E extends Event = MouseEvent>(
    event: E
) => boolean | void;

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
    tag?: string;
    layerOptions?: RouteLayerOptions;
    eventHandler?: RouterLinkEventHandler;
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
    navigate: (e?: Event) => Promise<void>;

    // Event handling
    getEventHandlers: (
        nameTransform?: (eventType: string) => string
    ) => Record<string, (e: Event) => Promise<void> | undefined>;
}
