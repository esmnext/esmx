export enum NavigationType {
    push = 'push',
    replace = 'replace',
    go = 'go',
    forward = 'forward',
    back = 'back',
    pushLayer = 'pushLayer',
    openWindow = 'openWindow',
    reload = 'reload',
    forceReload = 'forceReload',
    // 导航结果类型
    aborted = 'aborted',
    redirect = 'redirect',
    external = 'external',
    notFound = 'notFound'
}

export interface NavigationPush {
    type: NavigationType.push;
    location: RouterRawLocation;
}
export interface NavigationReplace {
    type: NavigationType.replace;
    location: RouterRawLocation;
}
export interface NavigationGo {
    type: NavigationType.go;
    index: number;
}

export interface NavigationForward {
    type: NavigationType.forward;
}
export interface NavigationBack {
    type: NavigationType.back;
}

export interface NavigationPushLayer {
    type: NavigationType.pushLayer;
}
export interface NavigationOpenWindow {
    type: NavigationType.openWindow;
    name?: string;
    windowFeatures?: string;
}

export interface NavigationReload {
    type: NavigationType.reload;
    location?: RouterRawLocation;
}

export interface NavigationForceReload {
    type: NavigationType.forceReload;
    url?: string;
}

export type Navigation =
    | NavigationPush
    | NavigationReplace
    | NavigationGo
    | NavigationForward
    | NavigationBack
    | NavigationPushLayer
    | NavigationOpenWindow
    | NavigationReload
    | NavigationForceReload;

export interface NavigationResultPush {
    type: NavigationType.push;
}
export interface NavigationResultReplace {
    type: NavigationType.replace;
}
export interface NavigationResultAborted {
    type: NavigationType.aborted;
}
export interface NavigationResultRedirect {
    type: NavigationType.redirect;
}
export interface NavigationResultUpdateIndex {
    type: NavigationType.redirect;
}
export interface NavigationResultExternal {
    type: NavigationType.external;
}
export interface NavigationResultNotFound {
    type: NavigationType.notFound;
}

export type NavigationResult =
    | NavigationResultPush
    | NavigationResultReplace
    | NavigationResultAborted
    | NavigationResultRedirect
    | NavigationResultExternal
    | NavigationResultNotFound;

// 构造实例选项
export interface RouterOptions {
    base: URL;
    mode?: 'history' | 'abstract';
    routes: RouteConfig[];
    normalizeURL?: (url: URL) => URL;
    externalUrlHandler?: (url: URL) => Awaitable<boolean>;
    scrollBehavior?: RouterScrollBehavior;
}

export type RouteState = Record<string, string | number | boolean>;
export type RouteMeta = Record<string | number | symbol, unknown>;
export type RouteRedirect =
    | RouterRawLocation
    | ((to: RouteRecord) => RouterRawLocation);

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
    to: RouteRecord,
    from: RouteRecord,
    savedPosition: RouterScrollPosition | null
) => Awaitable<RouterScrollPosition | false | undefined>;

export interface RouterScrollPosition {
    behavior?: ScrollOptions['behavior'];
    left?: number;
    top?: number;
}

export interface RouteRecord {
    base: string;
    /**
     *  路径
     */
    path: string;

    fullPath: string;
    params: Record<string, string>;
    /**
     * 按 Hanson 要求加入 undefined 类型
     */
    query: Record<string, string | undefined>;
    /**
     * 按 Hanson 要求加入 undefined 类型
     */
    queryArray: Record<string, string[] | undefined>;
    hash: string;
    state: RouteState;

    /**
     * 路由配置的组件
     */
    component?: any;

    /**
     * 路由配置的异步组件
     */
    asyncComponent?: () => any;

    /**
     * 路由元信息
     */
    meta: RouteMeta;

    /**
     * 重定向配置
     */
    redirect?: RouteRedirect;

    /**
     * 匹配的路由
     */
    matched: RouteConfig[];

    /**
     * 重定向来源
     */
    redirectedFrom?: RouteRecord;

    /**
     * 来源
     */
    from?: RouteRecord;
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
    from: RouteRecord,
    to: RouteRecord
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
