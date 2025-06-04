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
    normalizeURL?: (to: URL, from: URL | null) => URL;
    location?: RouteHandleHook;
    serverLocation?: RouteHandleHook;
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
export type RouteMeta = Record<string | symbol, any>;

export type RouteState = Record<string, unknown>;
export type RouteHandleResult = Record<string | symbol, any> | null;

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
export type RouteLocationRaw = RouteLocation | string;

export interface RouteConfig {
    path: string;
    component?: any;
    children?: RouteConfig[];
    redirect?: RouteLocationRaw | RouteConfirmHook;
    meta?: RouteMeta;
    env?: RouteEnv;
    app?: string | RouterMicroAppCallback;
    asyncComponent?: () => Promise<any>;
    beforeEnter?: RouteConfirmHook;
    beforeUpdate?: RouteConfirmHook;
    beforeLeave?: RouteConfirmHook;
}
export interface RouteParsedConfig extends RouteConfig {
    absolutePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}

export enum RouteStatus {
    resolve = 'resolve',
    aborted = 'aborted',
    error = 'error',
    success = 'success'
}
export interface Route {
    status: RouteStatus;
    type: RouteType;
    req: IncomingMessage | null;
    res: ServerResponse | null;
    url: URL;
    path: string;
    fullPath: string;
    params: Record<string, string>;
    query: Record<string, string | undefined>;
    queryArray: Record<string, string[] | undefined>;
    state: RouteState;
    meta: RouteMeta;
    matched: RouteParsedConfig[];
    config: RouteParsedConfig | null;
    handleResult: RouteHandleResult;
}

export interface RouteMatchResult {
    matches: RouteParsedConfig[];
    params: Record<string, string>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

/**
 * 路由钩子函数类型
 * @param to 目标路由
 * @param from 来源路由，首次导航时可能为 null
 * @returns
 *   - true: 继续往后执行
 *   - false: 终止执行
 *   - RouteLocationRaw: 重定向到另外一个路由
 */
export type RouteConfirmHook = (
    to: Route,
    from: Route | null
) => Awaitable<unknown | true | false | RouteLocationRaw>;

export type RouteVerifyHook = (
    to: Route,
    from: Route | null
) => Awaitable<boolean>;
export type RouteHandleHook = (
    to: Route,
    from: Route | null
) => Awaitable<RouteHandleResult>;
export type RouteNotifyHook = (to: Route, from: Route | null) => void;

export interface RouteEnvOptions {
    handle?: RouteHandleHook;
    require?: RouteVerifyHook;
}

export type RouteEnv = RouteHandleHook | RouteEnvOptions;

// ============================================================================
// 工具函数
// ============================================================================
export type Awaitable<T> = T | Promise<T>;
