import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MatchFunction } from 'path-to-regexp';
import type { Router } from './router';

// ============================================================================
// Basic Types and Utilities
// ============================================================================

export type Awaitable<T> = T | Promise<T>;

export type RouteMeta = Record<string | symbol, unknown>;

export type RouteState = Record<string, unknown>;

// ============================================================================
// Enums
// ============================================================================

export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}

export enum NavigationType {
    push = 'push',
    replace = 'replace',
    reload = 'reload',
    go = 'go',
    forward = 'forward',
    back = 'back',
    popstate = 'popstate',
    openWindow = 'openWindow',
    replaceWindow = 'replaceWindow',
    pushLayer = 'pushLayer',
    resolve = 'resolve'
}

// ============================================================================
// Location and Navigation Types
// ============================================================================

export interface RouterLocation {
    url?: string | URL;
    path?: string;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    params?: Record<string, string>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
}

export type RouterRawLocation = RouterLocation | string;

export type NavigationGuardReturn = boolean | RouterRawLocation;

export type NavigationGuard = (
    to: Route,
    from: Route | null
) => Awaitable<NavigationGuardReturn>;

// ============================================================================
// Route Configuration Types
// ============================================================================

export type RouteRedirect =
    | RouterRawLocation
    | ((to: Route, from: Route | null) => RouterRawLocation);

export interface RouteConfig {
    path: string;
    component?: unknown;
    asyncComponent?: () => Promise<unknown>;
    redirect?: RouteRedirect;
    meta?: RouteMeta;
    children?: RouteConfig[];
    beforeEnter?: NavigationGuard;
    beforeUpdate?: NavigationGuard;
    beforeLeave?: NavigationGuard;
    app?: string | RouterMicroAppCallback;
    env?: NavigationEnv;
}

export interface RouteParsedConfig {
    absolutePath: string;
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
    path: string;
    component?: unknown;
    asyncComponent?: () => Promise<unknown>;
    redirect?: RouteRedirect;
    meta: RouteMeta;
    children: RouteParsedConfig[];
}

export interface RouteMatchResult {
    matches: RouteParsedConfig[];
    params: Record<string, string>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

export interface Route {
    navigationType: NavigationType;
    url: URL;
    params: Record<string, string>;
    query: Record<string, string | undefined>;
    queryArray: Record<string, string[] | undefined>;
    state: RouteState;
    meta: RouteMeta;
    path: string;
    fullPath: string;
    matched: RouteConfig[];
    matchConfig: RouteConfig | null;
}

// ============================================================================
// Router Configuration Types
// ============================================================================

export interface RouterOptions {
    base?: URL;
    mode?: RouterMode;
    routes?: RouteConfig[];
    normalizeURL?: (url: URL, raw: RouterRawLocation) => URL;
    onOpen?: (route: Route) => boolean;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    onServerLocation?: (route: Route) => boolean;
    apps?: RouterMicroApp;
    scrollBehavior?: RouterScrollBehavior;
    env?: string;
}

export interface RouterParsedOptions extends Required<RouterOptions> {
    /** 路由匹配器实例 */
    matcher: RouteMatcher;
}

// ============================================================================
// Micro App Types
// ============================================================================

export interface RouterMicroAppOptions {
    mount: () => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}

export type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;

export type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;

// ============================================================================
// Scroll Behavior Types
// ============================================================================

export interface RouterScrollPosition {
    behavior?: ScrollOptions['behavior'];
    left?: number;
    top?: number;
}

export type RouterScrollBehavior = (
    to: Route,
    from: Route | null,
    savedPosition: RouterScrollPosition | null
) => Awaitable<RouterScrollPosition | false | undefined>;

// ============================================================================
// Environment Types
// ============================================================================

export type EnvBridge = (route: Route) => Awaitable<any>;

export interface NavigationEnvOptions {
    require?: (route: Route) => boolean;
    handle?: EnvBridge;
}

export type NavigationEnv = EnvBridge | NavigationEnvOptions;
