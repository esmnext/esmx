export const StateLayerConfigKey = '__layer_config_key';

/**
 * @internal
 */
export type Awaitable<T> = T | PromiseLike<T>;

/**
 * HTML5 history state value 支持的类型
 * @description HTML5 history state 不支持所有的数据类型，比如 Symbol Function 类型就是无法写入state 的
 *
 * @internal
 */
export type HistoryStateValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | HistoryState
    | HistoryStateValue[];

/**
 * HTML history.state的数据类型
 */
export interface HistoryState {
    [x: number]: HistoryStateValue;
    [x: string]: HistoryStateValue;
}

/**
 * 路由的meta配置
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {}

/**
 * 路由模式
 */
export enum RouterMode {
    /**
     * hash模式
     * 按 Hanson 要求，不支持hash模式
     */
    // HASH = 'hash',

    /**
     * history模式
     * @description 客户端默认使用 history 模式
     */
    HISTORY = 'history',

    /**
     * 虚拟路由模式
     * @description 此模式不存在历史记录，服务端默认使用 abstract 模式
     */
    ABSTRACT = 'abstract'
}

/**
 * 路由重定向配置的类型
 */
export type RouteRedirect =
    | RouterRawLocation
    | ((to: RouteRecord) => RouterRawLocation);

/**
 * 路由守卫返回值
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type NavigationGuardReturn = boolean | RouterRawLocation | void;

/**
 * 路由守卫钩子
 */
export type NavigationGuard = (
    from: RouteRecord,
    to: RouteRecord
) => Awaitable<NavigationGuardReturn>;

/**
 * 路由守卫afterEach钩子
 */
export type NavigationGuardAfter = (from: RouteRecord, to: RouteRecord) => any;

/**
 * 路由配置使用的 route
 */
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
    path: string | string[];

    /**
     * 路由配置的组件
     */
    component?: any;

    /**
     * 路由配置的异步组件
     */
    asyncComponent?: () => any;

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

/**
 * 路由前置部分
 * 例： https://www.google.com:443/en/news/123
 * 客户端传入 https://www.google.com:443/en https://www.google.com:443/en/
 * 服务端传入 https://www.google.com:443/en https://www.google.com:443/en/
 */
export type RouterBase =
    | string
    | ((params: {
          fullPath: string;
          /**
           * 按 Hanson 要求加入 undefined 类型
           */
          query: Record<string, string | undefined>;
          queryArray: Record<string, string[]>;
          hash: string;
      }) => string);

/**
 * Scroll position 与 {@link https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions | `ScrollToOptions`} 相似.
 * 注意并不是所有浏览器都支持`behavior`属性.
 */
export interface ScrollPositionCoordinates {
    behavior?: ScrollOptions['behavior'];
    left?: number;
    top?: number;
}

/**
 * 内部使用的 {@link ScrollPositionCoordinates} `left` 和 `top` 属性始终有值.
 * 必须是 HistoryStateValue 支持的类型.
 * @internal
 */
export interface _ScrollPositionNormalized {
    behavior?: ScrollOptions['behavior'];
    left: number;
    top: number;
}

export interface ScrollPositionElement extends ScrollToOptions {
    /**
     * 一个合法的 CSS 选择器. 部分特殊字符需要被转义 (https://mathiasbynens.be/notes/css-escapes).
     * @example
     * 这里是部分示例:
     *
     * - `.title`
     * - `.content:first-child`
     * - `#marker`
     * - `#marker\~with\~symbols`
     * - `#marker.with.dot`: 选中的是 `class="with dot" id="marker"`, 而不是 `id="marker.with.dot"`
     *
     */
    el: string | Element;
}

/**
 * 滚动行为处理器类型
 */
export type ScrollBehaviorHandler<T> = (
    to: RouteRecord,
    from: RouteRecord,
    savedPosition: T | undefined
) => Awaitable<ScrollPosition | false | undefined>;

/**
 * 滚动参数
 */
export type ScrollPosition = ScrollPositionCoordinates | ScrollPositionElement;

/**
 * @param to - 前往的路由
 * @param from - 离开的路由
 * @param savedPosition - 存储的位置，如果不存在则为 null
 */
export type RouterScrollBehavior = (
    to: RouteRecord,
    from: RouteRecord,
    savedPosition: ScrollPosition | null
) => Awaitable<ScrollPosition | false | undefined>;

/**
 * 路由配置
 */
export interface RouterOptions {
    /**
     * 路由模式
     */
    mode?: RouterMode;

    /**
     * 路由前置部分
     * 例： https://www.google.com:443/en/news/123
     * 客户端传入 en /en /en/ 均可
     * 服务端传入 https://www.google.com:443/en https://www.google.com:443/en/
     */
    base?: RouterBase;

    /**
     * 初始化时使用的初始 url
     */
    initUrl?: string;

    /**
     * 滚动行为配置
     */
    scrollBehavior?: RouterScrollBehavior;

    /**
     * 类似 vue nextTick 等待下一次 DOM 更新刷新的工具方法
     */
    nextTick?: () => Awaitable<any>;

    /**
     * 到达历史记录末点时触发 history back 之后的回调
     * @description 只有在 history state 可用的环境才生效
     */
    noBackNavigation?: (router: RouterInstance) => void;

    /**
     * 判断是否是外部链接。在同域时调用，用于处理同域也被视为外站的情况
     * @param router 路由实例
     * @param url 要判断的链接
     * @param route 虚假的 route 信息
     * @returns 是否是外部链接，返回 `false | undefined` 会继续路由跳转（`true` 会调用 `handleOutside`）。
     */
    validateOutside?: (context: {
        router: RouterInstance;
        location: RouterRawLocation;
        route: Route;
    }) => boolean | undefined;

    /**
     * 路由跳转到外部链接时触发
     * @param router 路由实例
     * @param route 虚假的 route 信息
     * @param replace 是否替换当前历史记录
     * @param isTriggerWithWindow 是否是 pushWindow/replaceWindow 触发的
     * @param isSameHost 是否是同域。
     * * 客户端如果 `isTriggerWithWindow === true && isSameHost === true`，意味着 `validateOutside` 返回了 `true`
     * * 服务端如果 `isSameHost === true`，意味着 `validateOutside` 返回了 `true`
     * @returns 返回 `false` 认为使用者已自行处理跳转行为，不会继续默认的路由跳转逻辑
     */
    handleOutside?: (context: {
        router: RouterInstance;
        route: Route;
        replace: boolean;
        isTriggerWithWindow: boolean;
        isSameHost: boolean;
    }) => boolean | undefined;

    /**
     * 路由配置使用的 route
     */
    routes: RouteConfig[];
}

/**
 * 用户使用的 route
 */
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
     * 按 Hanson 要求加入 undefined 类型
     */
    query: Record<string, string | undefined>;
    /**
     * 按 Hanson 要求加入 undefined 类型
     */
    queryArray: Record<string, string[] | undefined>;
    state: HistoryState;
    meta: RouteMeta;
    path: string;
    fullPath: string;
    base: string;
    matched: RouteConfig[];
}

/**
 * 路由记录
 */
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
    state: HistoryState;

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

/**
 * 路由历史
 */
export interface RouterHistory {
    /**
     * 路由实例
     */
    readonly router: RouterInstance;

    /**
     * 路由是否被冻结
     * @description 路由实例被冻结后，路由实例的所有方法都将失效
     */
    isFrozen: boolean;

    /**
     * 匹配的当前路由
     */
    readonly current: RouteRecord;

    /**
     * 解析路由
     */
    resolve: (location: RouterRawLocation) => RouteRecord;

    /**
     * 更新路由
     */
    updateRoute: (route: RouteRecord) => void;

    /**
     * 跳转方法，会创建新的历史纪录
     */
    push: (location: RouterRawLocation) => Promise<void>;

    /**
     * 跳转方法，替换当前历史记录
     */
    replace: (location: RouterRawLocation) => Promise<void>;

    /**
     * 新开浏览器窗口的方法，在服务端会调用 push 作为替代
     */
    pushWindow: (location: RouterRawLocation) => void;

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     */
    replaceWindow: (location: RouterRawLocation) => void;

    /**
     * 路由移动到指定历史记录方法
     */
    go: (delta: number) => void;

    /**
     * 路由历史记录前进方法
     */
    forward: () => void;

    /**
     * 路由历史记录后退方法
     */
    back: () => void;

    /**
     * 初始化方法
     */
    init: (params?: { replace?: boolean }) => Promise<void>;

    /**
     * 卸载方法
     */
    destroy: () => void;
}

/**
 * 路由跳转等事件使用的参数
 */
export interface RouterLocation {
    path?: string;
    /**
     * 按 Hanson 要求加入 undefined 类型
     */
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    params?: Record<string, string>;
    hash?: string;
    state?: HistoryState;
}

/**
 * 路由跳转等事件使用的参数
 */
export type RouterRawLocation =
    | (RouterLocation & {
          /**
           * 设置此参数后，不保存滚动位置，跳转后页面位置仍在原处
           */
          keepScrollPosition?: boolean;
      })
    | string;

/**
 * 路由匹配规则
 */
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

/**
 * 路由匹配器
 */
export interface RouterMatcher {
    /**
     * 路由匹配方法
     */
    match: (
        raw: RouterLocation,
        config?: { base: string }
    ) => RouteRecord | null;

    /**
     * 新增单个路由匹配规则
     */
    // addRoute: (route: RouteConfig) => void;

    /**
     * 新增多个路由匹配规则
     */
    // addRoutes: (routes: RouteConfig[]) => void;

    /**
     * 获取所有路由匹配规则
     */
    getRoutes: () => RouteMatch[];
}

/**
 * 路由注册配置
 */
export type RegisteredConfigMap = Record<
    string,
    {
        mounted: boolean;
        generator: (router: RouterInstance) => RegisteredConfig;
        config?: RegisteredConfig;
    }
>;

export interface RouterInitOptions {
    parent?: RouterInstance;
    route?: RouteRecord;
    replace?: boolean;
}

/**
 * 路由注册配置
 */
export interface RegisteredConfig {
    /**
     * 初始化
     */
    mount: () => any;

    /**
     * 更新
     */
    updated: () => any;

    /**
     * 销毁
     */
    destroy: () => any;
}

/**
 * 路由类实例
 */
export interface RouterInstance {
    /**
     * 当前路由对象的上级路由对象
     */
    parent: RouterInstance | null;

    /**
     * 路由是否冻结
     */
    isFrozen: boolean;

    /**
     * 路由冻结方法
     */
    freeze: () => void;

    /**
     * 路由解冻方法
     */
    unfreeze: () => void;

    /**
     * 路由配置
     */
    options: RouterOptions;

    /**
     * 路由固定前置路径
     * 需要注意的是如果使用函数返回 base，需要尽量保证相同的路径返回相同base
     */
    base?: RouterBase;

    /**
     * 滚动行为
     */
    scrollBehavior: RouterScrollBehavior;

    /**
     * 路由模式
     */
    mode: RouterMode;

    /**
     * 路由匹配器
     */
    matcher: RouterMatcher;

    /**
     * 路由history类
     */
    history: RouterHistory;

    /**
     * 当前路由信息
     */
    route: Route;

    /**
     * 解析路由
     */
    resolve: (location: RouterRawLocation) => RouteRecord;

    /**
     * 更新路由
     */
    updateRoute: (route: RouteRecord) => void;

    /**
     * 初始化
     */
    init: (options?: RouterInitOptions) => Promise<void>;

    /**
     * 卸载方法
     */
    destroy: () => void;

    /**
     * app配置注册
     */
    register: (
        name: string,
        config: (router: RouterInstance) => RegisteredConfig
    ) => void;

    /* 已注册的app配置 */
    registeredConfigMap: RegisteredConfigMap;

    /**
     * 全局路由守卫
     */
    readonly guards: {
        beforeEach: NavigationGuard[];
        afterEach: NavigationGuardAfter[];
    };

    /**
     * 注册全局路由前置守卫
     */
    beforeEach: (guard: NavigationGuard) => void;

    /**
     * 卸载全局路由前置守卫
     */
    unBindBeforeEach: (guard: NavigationGuard) => void;

    /**
     * 注册全局路由后置守卫
     */
    afterEach: (guard: NavigationGuardAfter) => void;

    /**
     * 卸载全局路由后置守卫
     */
    unBindAfterEach: (guard: NavigationGuardAfter) => void;

    /**
     * 路由跳转方法，会创建新的历史记录
     */
    push: (location: RouterRawLocation) => Promise<void>;

    /**
     * 路由跳转方法，会替换当前的历史记录
     */
    replace: (location: RouterRawLocation) => Promise<void>;

    /**
     * 当前路由弹层id，用于区分不同的路由弹层
     */
    layerId: number;

    /**
     * 路由弹层配置
     */
    layerConfigList: Array<{
        /**
         * 路由弹层id
         */
        id: number;
        /**
         * 路由弹层深度
         */
        depth: number;
    }>;

    /**
     * 路由弹层id与路由实例的map
     */
    layerMap: Record<
        number,
        {
            router: RouterInstance;
            config: RegisteredConfig;
            destroyed: boolean;
        }
    >;

    /**
     * 更新路由弹层方法
     */
    updateLayerState: (route: RouteRecord) => void;

    /**
     * 检查路由弹层方法
     */
    checkLayerState: (state: HistoryState) => boolean;

    /**
     * 打开路由弹层方法，会创建新的路由实例并调用注册的 register 方法
     * 服务端会使用 push 作为替代
     */
    pushLayer: (location: RouterRawLocation) => void;

    /**
     * 新开浏览器窗口的方法, 会进入配置的 handleOutside 钩子，在服务端会调用 push 作为替代
     */
    pushWindow: (location: RouterRawLocation) => void;

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     */
    replaceWindow: (location: RouterRawLocation) => void;

    /**
     * 前往特定路由历史记录的方法，可以在历史记录前后移动
     */
    go: (delta: number) => void;

    /**
     * 路由历史记录前进方法
     */
    forward: () => void;

    /**
     * 路由历史记录后退方法
     */
    back: () => void;

    /**
     * 新增单个路由匹配规则
     */
    // addRoute: (route: RouteConfig) => void;

    /**
     * 新增多个路由匹配规则
     */
    // addRoutes: (routes: RouteConfig[]) => void;

    /**
     * 根据获取当前所有活跃的路由Record对象
     */
    getRoutes: () => RouteMatch[];
}
