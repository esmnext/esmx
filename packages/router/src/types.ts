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
    layer?: RouterLayerOptions | null;
}

export interface RouterLayerOptions {
    /**
     * 路由层初始化参数，以键值对形式传递
     */
    params?: Record<string, any>;
    /**
     * 路由关闭前的验证钩子函数
     * @returns 返回true允许关闭，false阻止关闭
     */
    shouldClose?: RouteVerifyHook;
    /**
     * 是否自动记录路由历史
     * @default true
     */
    autoPush?: boolean;
    /**
     * 路由跳转方式控制
     * - 当autoPush为true时：
     *   - true: 使用push方式(添加新历史记录)
     *   - false: 使用replace方式(替换当前历史记录)
     * @default true
     */
    push?: boolean;
    /**
     * 路由层销毁完成后的回调
     * @param result - 包含路由层返回结果的对象
     */
    destroyed?: (result: RouterLayerResult) => void;
}
export type RouterLayerResult =
    | { type: 'push'; result: Route }
    | { type: 'close'; result: null }
    | { type: 'success'; result: any };

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
    none = 'none',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow'
}
export type RouteMeta = Record<string | symbol, any>;

export type RouteState = Record<string, unknown>;
export type RouteHandleResult = Record<string | symbol, any> | null | void;

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
export interface Route {
    readonly type: RouteType;
    readonly req: IncomingMessage | null;
    readonly res: ServerResponse | null;
    readonly url: URL;
    readonly path: string;
    readonly fullPath: string;
    readonly params: Record<string, string>;
    readonly query: Record<string, string | undefined>;
    readonly queryArray: Record<string, string[] | undefined>;
    readonly state: RouteState;
    readonly meta: RouteMeta;
    readonly matched: readonly RouteParsedConfig[];
    readonly config: RouteParsedConfig | null;
    status: RouteStatus;
    keepScrollPosition: boolean;
    handle: RouteHandleHook | null;
    handleResult: RouteHandleResult;
}
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
    compilePath: string;
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

export interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string>;
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
) => Awaitable<RouteConfirmHookResult>;
export type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationRaw
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

export interface RouteEnvOptions {
    handle?: RouteHandleHook;
    require?: RouteVerifyHook;
}

export type RouteEnv = RouteHandleHook | RouteEnvOptions;

// ============================================================================
// 工具函数
// ============================================================================
export type Awaitable<T> = T | Promise<T>;
