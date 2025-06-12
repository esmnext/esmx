import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MatchFunction } from 'path-to-regexp';
import type { Route } from './route';
import type { Router } from './router';

// 重新导出 Route 类型，保持向后兼容
export type { Route };

// ============================================================================
// 路由器相关
// ============================================================================
export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}
export interface RouterOptions {
    id?: string;
    context?: Record<string | symbol, any>;
    routes?: RouteConfig[];
    mode?: RouterMode;
    /** 浏览器中是可选的，但服务端是必须的。 */
    base?: URL;
    env?: string;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    location?: RouteHandleHook;
    rootStyle?: Partial<CSSStyleDeclaration> | false;
    layer?: RouterLayerOptions | null;
    /** 当 router.back() 或 router.go(负数) 无响应时的钩子函数 */
    onBackNoResponse?: RouteBackNoResponseHook;
}

export interface RouterLayerOptions {
    /**
     * 是否启用弹层模式
     */
    enable?: boolean;

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
    | { type: 'push'; route: Route }
    | { type: 'close'; route: Route | null }
    | { type: 'success'; route: Route };

export interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
    /** 解析好的，不包含 query 和 hash 的，pathname 只含有目录的 URL */
    readonly base: URL;
    /** 路由匹配器实例 */
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
// 路由相关
// ============================================================================

/**
 * Route 构造函数的选项接口
 */
export interface RouteOptions {
    /** 路由器解析选项 */
    options?: RouterParsedOptions;
    /** 路由类型 */
    toType?: RouteType;
    /** 目标路由位置 */
    toRaw?: RouteLocationRaw;
    /** 来源 URL */
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
export type RouteMeta = Record<string | symbol, any>;

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
export type RouteLocationRaw = RouteLocation | string;

export interface RouteConfig {
    /** 传递一个经过 URL 编码过后的路径 */
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
    readonly params: Record<string, string | string[] | undefined>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

/**
 * 路由匹配类型
 * - 'route': 路由级匹配，比较路由配置是否相同
 * - 'exact': 完全匹配，比较路径是否完全相同
 * - 'include': 包含匹配，判断当前路径是否包含目标路径
 */
export type RouteMatchType = 'route' | 'exact' | 'include';

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

/**
 * 当 router.back() 或 router.go(负数) 无响应时的钩子函数类型
 * @param router 路由器实例
 */
export type RouteBackNoResponseHook = (router: Router) => void;

export interface RouteEnvOptions {
    handle?: RouteHandleHook;
    require?: RouteVerifyHook;
}

export type RouteEnv = RouteHandleHook | RouteEnvOptions;

// ============================================================================
// 工具函数
// ============================================================================
export type Awaitable<T> = T | Promise<T>;
