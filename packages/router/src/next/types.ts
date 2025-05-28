import type { MatchFunction } from 'path-to-regexp';
export enum NavigationType {
    // Action 类型
    push = 'push',
    replace = 'replace',
    update = 'update',
    go = 'go',
    forward = 'forward',
    back = 'back',
    pushLayer = 'pushLayer',
    openWindow = 'openWindow',
    reload = 'reload',
    forceReload = 'forceReload',
    // Result 类型
    aborted = 'aborted',
    redirect = 'redirect',
    external = 'external',
    notFound = 'notFound'
}

export interface NavigationPushAction {
    type: NavigationType.push;
    rawLocation: RouterRawLocation;
}
export interface NavigationReplaceAction {
    type: NavigationType.replace;
    rawLocation: RouterRawLocation;
}
export interface NavigationUpdateAction {
    type: NavigationType.update;
    location: RouterRawLocation;
}
export interface NavigationGoAction {
    type: NavigationType.go;
    index: number;
}
export interface NavigationForwardAction {
    type: NavigationType.forward;
}
export interface NavigationBackAction {
    type: NavigationType.back;
}
export interface NavigationPushLayerAction {
    type: NavigationType.pushLayer;
}
export interface NavigationOpenWindowAction {
    type: NavigationType.openWindow;
    name?: string;
    windowFeatures?: string;
}
export interface NavigationReloadAction {
    type: NavigationType.reload;
    location?: RouterRawLocation;
}
export interface NavigationForceReloadAction {
    type: NavigationType.forceReload;
    url?: string;
}

export type NavigationAction =
    | NavigationPushAction
    | NavigationReplaceAction
    | NavigationUpdateAction
    | NavigationGoAction
    | NavigationForwardAction
    | NavigationBackAction
    | NavigationPushLayerAction
    | NavigationOpenWindowAction
    | NavigationReloadAction
    | NavigationForceReloadAction;

export interface NavigationPushResult {
    type: NavigationType.push;
}
export interface NavigationReplaceResult {
    type: NavigationType.replace;
}
export interface NavigationAbortedResult {
    type: NavigationType.aborted;
}
export interface NavigationRedirectResult {
    type: NavigationType.redirect;
}
export interface NavigationUpdateResult {
    type: NavigationType.update;
    route: Route;
}
export interface NavigationExternalResult {
    type: NavigationType.external;
    data: any;
}
export interface NavigationNotFoundResult {
    type: NavigationType.notFound;
}

export type NavigationResult =
    | NavigationPushResult
    | NavigationReplaceResult
    | NavigationAbortedResult
    | NavigationRedirectResult
    | NavigationExternalResult
    | NavigationUpdateResult
    | NavigationNotFoundResult;

export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}

export interface RouterOptions {
    base?: URL;
    mode?: RouterMode;
    routes?: RouteConfig[];
    normalizeURL?: (url: URL) => Awaitable<URL>;
    onOpenCrossOrigin?: (url: URL) => Awaitable<any>;
    onOpenCrossApp?: (url: URL) => Awaitable<any>;
    scrollBehavior?: RouterScrollBehavior;
}

export interface RouterParsedOptions extends Required<RouterOptions> {
    matcher: RouteMatcher;
}

export type RouteState = Record<string, string | number | boolean>;
export type RouteMeta = Record<string | number | symbol, unknown>;
export type RouteRedirect =
    | RouterRawLocation
    | ((to: Route) => RouterRawLocation);

export interface RouterLocation {
    path?: string;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    params?: Record<string, string>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
}

export type RouterRawLocation = RouterLocation | string;

export type Awaitable<T> = T | PromiseLike<T>;

/**
 * @param to - 前往的路由
 * @param from - 离开的路由
 * @param savedPosition - 存储的位置，如果不存在则为 null
 */
export type RouterScrollBehavior = (
    to: Route,
    from: Route,
    savedPosition: RouterScrollPosition | null
) => Awaitable<RouterScrollPosition | false | undefined>;

export interface RouterScrollPosition {
    behavior?: ScrollOptions['behavior'];
    left?: number;
    top?: number;
}

export interface RouteConfig {
    /**
     * 应用类型, 只在根路由配置有效
     */
    appType?: string;

    /**
     * 按 Hanson 要求，不提供 name 功能
     */
    // name: string;

    /**
     * 路径
     * 在配置path为数组类型时，会根据配置的数组生成多个匹配规则，在命中任意一个匹配规则时，会重定向到配置的第一个 path
     * 按 Hanson 要求，只支持相对路径
     * 路径配置请参考文档: https://github.com/pillarjs/path-to-regexp/tree/v6.2.2#parameters
     */
    path: string;

    /**
     * 路由配置的组件
     */
    component?: any;

    /**
     * 路由配置的异步组件
     */
    asyncComponent?: () => Promise<any>;

    /**
     * 路由命中时的重定向地址
     */
    redirect?: RouteRedirect;

    /**
     * 路由元信息
     */
    meta?: RouteMeta;

    /**
     * 子路由配置
     */
    children?: RouteConfig[];

    /**
     * 进入路由前的路由守卫
     */
    beforeEnter?: NavigationGuard;

    /**
     * 更新路由前的路由守卫
     */
    beforeUpdate?: NavigationGuard;

    /**
     * 离开路由前的路由守卫
     */
    beforeLeave?: NavigationGuard;
}

export type NavigationGuard = (
    from: Route,
    to: Route
) => Awaitable<NavigationGuardReturn>;

export type NavigationGuardReturn = boolean | RouterRawLocation;

export interface Route {
    hash: string;
    host: string;
    hostname: string;
    href: string;
    origin: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;

    params: Record<string, string>;
    query: Record<string, string | undefined>;
    queryArray: Record<string, string[] | undefined>;
    state: RouteState;
    meta: RouteMeta;
    path: string;
    fullPath: string;
    matched: RouteConfig[];
}

export interface RouteMatch {
    route: RouteConfig;
    pathname: string;
    children: RouteMatch[];
    match: MatchFunction;
    compile: (params?: Record<string, any>) => string;
}
export interface RouteMatchResult {
    matches: RouteMatch[];
    params: Record<string, string>;
}

export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;
