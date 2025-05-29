import type { MatchFunction } from 'path-to-regexp';
import type { Router } from './router';

export enum NavigationActionType {
    push = 'push',
    replace = 'replace',
    openWindow = 'openWindow',
    pushLayer = 'pushLayer',
    reload = 'reload',
    forceReload = 'forceReload',

    go = 'go',
    forward = 'forward',
    back = 'back',
    popstate = 'popstate'
}

export enum NavigationResultType {
    success = 'success',
    /**
     * 在导航守卫中返回 `false` 中断了本次导航。
     */
    aborted = 'aborted',
    /**
     * 导航被阻止，因为我们已经在目标位置了。
     */
    duplicate = 'duplicate',
    /**
     * 在导航过程中发生了重定向，目前只有两种情况会触发：
     * 1. 在导航守卫中返回了一个新的路由位置。
     * 2. 在路由配置中定义了重定向。
     */
    redirect = 'redirect',
    /**
     * 导航到应用外的链接。
     */
    external = 'external',
    /**
     * 导航到应用内的链接，但没有匹配到任何路由。
     */
    notFound = 'notFound',
    error = 'error'
}

export type NavigationSuccessResult<
    T extends NavigationActionType = NavigationActionType
> = {
    navResultType: NavigationResultType.success;
    navActionType: T;
    location: URL;
} & (T extends
    | NavigationActionType.push
    | NavigationActionType.replace
    | NavigationActionType.popstate
    ? { route: Route }
    : T extends NavigationActionType.openWindow
      ? { result?: any }
      : {});

export type NavigationFailureResult<
    T extends Exclude<
        NavigationResultType,
        NavigationResultType.success
    > = Exclude<NavigationResultType, NavigationResultType.success>,
    ActT extends NavigationActionType = NavigationActionType
> = {
    navResultType: T;
    navActionType: ActT;
} & (ActT extends
    | NavigationActionType.go
    | NavigationActionType.forward
    | NavigationActionType.back
    | NavigationActionType.popstate
    ? {}
    : {
          location: T extends NavigationResultType.error
              ? URL | RouterRawLocation
              : URL;
      }) &
    (T extends NavigationResultType.external
        ? { result?: any }
        : T extends NavigationResultType.error
          ? { error: Error }
          : {});

export type NavigationResult<
    SucT extends NavigationActionType = NavigationActionType,
    FailT extends Exclude<
        NavigationResultType,
        NavigationResultType.success
    > = Exclude<NavigationResultType, NavigationResultType.success>
> = NavigationSuccessResult<SucT> | NavigationFailureResult<FailT>;

export enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}

export interface RouterOptions {
    base: URL | string;
    mode?: RouterMode;
    routes?: RouteConfig[];
    normalizeURL?: (args: {
        url: URL;
        raw: RouterRawLocation;
        type: NavigationActionType;
        router: Router;
    }) => Awaitable<URL>;
    externalUrlHandler?: (args: {
        url: URL;
        router: Router;
        type: NavigationActionType;
    }) => any | Promise<any>;
    scrollBehavior?: RouterScrollBehavior;
}

export interface RouterParsedOptions
    extends Required<Omit<RouterOptions, 'base'>> {
    base: URL;
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

export interface RegisteredConfig {
    mount?: () => void;
    update?: () => void;
    destroy?: () => void;
    renderToString?: () => string | Promise<string>;
}

export type RegisteredConfigMap = {
    [AppName in string]?: {
        appName: AppName;
        mounted: boolean;
        generator: (router: Router) => RegisteredConfig;
        config?: RegisteredConfig;
    };
};

// 旧字段 + 新字段
