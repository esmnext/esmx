import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MatchFunction } from 'path-to-regexp';
import type { Router } from './router';

// ============================================================================
// 路由器相关
// ============================================================================
export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}
export interface RouterOptions {
    routes?: RouteConfig[];
    mode?: RouterMode;
    base?: URL;
    env?: string;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (url: URL, raw: RouteRawLocation) => URL;
    onOpen?: (route: Route) => boolean;
    onServerLocation?: (route: Route) => boolean;
}

export interface RouterParsedOptions extends Required<RouterOptions> {
    /** 路由匹配器实例 */
    matcher: RouteMatcher;
}

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
// 路由相关
// ============================================================================
export enum RouteType {
    push = 'push',
    replace = 'replace',
    reload = 'reload',
    go = 'go',
    forward = 'forward',
    back = 'back',
    popstate = 'popstate',
    openWindow = 'openWindow',
    replaceWindow = 'replaceWindow',
    resolve = 'resolve'
}
export type RouteMeta = Record<string | symbol, unknown>;

export type RouteState = Record<string, unknown>;

export interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
}
export type RouteRawLocation = RouteLocation | string;
export type RouteRedirect =
    | RouteRawLocation
    | ((to: Route, from: Route | null) => RouteRawLocation);

export interface RouteConfig {
    path: string;
    component?: Record<string, any>;
    children?: RouteConfig[];
    redirect?: RouteRedirect;
    meta?: RouteMeta;
    env?: RouteEnv;
    app?: string | RouterMicroAppCallback;
    asyncComponent?: () => Promise<Record<string, any>>;
    beforeEnter?: Function;
    beforeUpdate?: Function;
    beforeLeave?: Function;
}
export interface RouteParsedConfig extends RouteConfig {
    absolutePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}
export interface Route {
    type: RouteType;
    url: URL;
    path: string;
    fullPath: string;
    params: Record<string, string>;
    query: Record<string, string | undefined>;
    queryArray: Record<string, string[] | undefined>;
    state: RouteState;
    meta: RouteMeta;
    matched: RouteParsedConfig[];
    matchConfig: RouteParsedConfig | null;
}

export interface RouteMatchResult {
    matches: RouteParsedConfig[];
    params: Record<string, string>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

export type RouteEnvHandle = (route: Route) => Awaitable<any>;
export type RouteEnvRequire = (route: Route) => Awaitable<any>;

export interface RouteEnvOptions {
    handle?: RouteEnvHandle;
    require?: RouteEnvRequire;
}

export type RouteEnv = RouteEnvHandle | RouteEnvOptions;

// ============================================================================
// 工具函数
// ============================================================================
export type Awaitable<T> = T | Promise<T>;
