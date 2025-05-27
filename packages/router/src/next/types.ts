// 路由输入

export interface RouteInputPush {
    type: 'push';
    location: RouterRawLocation;
}
export interface RouteInputReplace {
    type: 'replace';
    location: RouterRawLocation;
}
export interface RouteInputGo {
    type: 'go';
    index: number;
}

export interface RouteInputForward {
    type: 'forward';
}
export interface RouteInputBack {
    type: 'back';
}

export interface RouteInputPushLayer {
    type: 'pushLayer';
}
export interface RouteInputOpenWindow {
    type: 'openWindow';
    name?: string;
    windowFeatures?: string;
}

export interface RouteInputReload {
    type: 'reload';
    location?: RouterRawLocation;
}

export interface RouteInputForceReload {
    type: 'forceReload';
    url?: string;
}

export type RouteInput =
    | RouteInputPush
    | RouteInputReplace
    | RouteInputGo
    | RouteInputForward
    | RouteInputBack
    | RouteInputPushLayer
    | RouteInputOpenWindow
    | RouteInputReload
    | RouteInputForceReload;

// 路由输出

export interface RouteResultPush {
    type: 'push';
}
export interface RouteResultReplace {
    type: 'replace';
}
export interface RouteResultAborted {
    type: 'aborted';
}
export interface RouteResultRedirect {
    type: 'redirect';
}
export interface RouteResultUpdateIndex {
    type: 'redirect';
}

export type RouteResult =
    | RouteResultPush
    | RouteResultReplace
    | RouteResultAborted
    | RouteResultRedirect;

// 构造实例选项
export interface RouterOptions {
    base: URL;
    mode?: 'history' | 'abstract';
    routes: RouteConfig[];
    normalizeURL?: (url: URL) => string;
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

export interface RouteMatch {
    /**
     * 路径匹配的正则表达式
     */
    regex: RegExp;

    /**
     * 路由匹配方法，返回值意味着传入的路径是否匹配此路由
     */
    match: (path: string) => boolean;

    /**
     * 路径解析方法
     */
    parse: (path: string) => {
        params: Record<string, string>;
        query: Record<string, string | undefined>;
        queryArray: Record<string, string[]>;
        hash: string;
    };

    /**
     * 按照传入参数解析出完整路径
     */
    compile: (params?: {
        params?: Record<string, string>;
        query?: Record<string, string | undefined>;
        queryArray?: Record<string, string[]>;
        hash?: string;
    }) => string;

    /**
     *  路径
     */
    path: string;

    /**
     * 应用类型
     */
    appType: string;

    /**
     * 路由配置的组件
     */
    component?: any;

    /**
     * 路由配置的异步组件
     */
    asyncComponent?: () => any | Promise<any>;

    /**
     * 父路由
     */
    parent?: RouteMatch;

    /**
     * 路由元信息
     */
    meta: RouteMeta;

    /**
     * 重定向配置
     */
    redirect?: RouteRedirect;

    /**
     * 内部重定向，当 path 配置为数组时生成的内部重定向配置
     */
    internalRedirect?: RouteMatch;

    /**
     * 匹配的路由
     */
    matched: RouteConfig[];
}

export interface Route {
    hash: URL['hash'];
    host: URL['host'];
    hostname: URL['hostname'];
    href: URL['href'];
    origin: URL['origin'];
    pathname: URL['pathname'];
    port: URL['port'];
    protocol: URL['protocol'];
    search: URL['search'];

    params: Record<string, string>;
    /**
     * 按 Hanson 要求加入 undefined 类型。
     * 若为 undefined 则在解析时会删掉这个 query
     */
    query: Record<string, string | undefined>;
    /**
     * 按 Hanson 要求加入 undefined 类型。
     * 若为 undefined 则在解析时会删掉这个 query
     */
    queryArray: Record<string, string[] | undefined>;
    state: RouteState;
    meta: RouteMeta;
    path: string;
    fullPath: string;
    base: string;
    matched: RouteConfig[];
}
