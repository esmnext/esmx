import type { MatchFunction } from 'path-to-regexp';
import type { Router } from './router';

export enum NavigationType {
    // 基本导航操作
    push = 'push',
    replace = 'replace',
    reload = 'reload',
    go = 'go',
    forward = 'forward',
    back = 'back',
    popstate = 'popstate',

    // 窗口/层导航
    openWindow = 'openWindow',
    replaceWindow = 'replaceWindow',
    pushLayer = 'pushLayer',

    // 路由解析
    resolve = 'resolve',

    // 导航结果状态
    open = 'open',
    aborted = 'aborted',
    duplicate = 'duplicate',
    notFound = 'notFound'
}

export type NavigationResult =
    // 基本导航操作结果
    | { navType: NavigationType.push; location: URL; route: Route }
    | { navType: NavigationType.replace; location: URL; route: Route }
    | { navType: NavigationType.reload; location: URL; route: Route }
    | { navType: NavigationType.go; location: URL; route: Route }
    | { navType: NavigationType.forward; location: URL; route: Route }
    | { navType: NavigationType.back; location: URL; route: Route }
    | { navType: NavigationType.popstate; location: URL; route: Route }
    | { navType: NavigationType.resolve; location: URL; route: Route }

    // 窗口/层导航结果
    | { navType: NavigationType.openWindow; location: URL }
    | { navType: NavigationType.replaceWindow; location: URL }
    | { navType: NavigationType.pushLayer; location: URL; result: any }

    // 导航结果状态
    | { navType: NavigationType.open; location: URL }
    | { navType: NavigationType.duplicate; location: URL }
    | { navType: NavigationType.notFound; location: URL };

export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}

export interface RouterMicroApp {
    context?: any;
    mount: () => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}

export type RouterMicroAppCallback = (router: Router) => RouterMicroApp;

export interface RouterOptions {
    base?: URL;
    mode?: RouterMode;
    routes?: RouteConfig[];
    normalizeURL?: (url: URL, raw: RouterRawLocation) => URL;
    onOpen?: (url: URL, navType: NavigationType, route?: Route) => boolean;
    scrollBehavior?: RouterScrollBehavior;
    apps?:
        | Record<string, RouterMicroAppCallback | undefined>
        | RouterMicroAppCallback;
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
    location?: string | URL;
    path?: string;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    params?: Record<string, string>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
}

export type RouterRawLocation = RouterLocation | string;

export type Awaitable<T> = T | Promise<T>;

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
    app?: string | RouterMicroAppCallback;

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
    location: URL;
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
