
import type { RouterMode, RouterHistory } from "./history";
import type { RouterScrollBehavior } from "./scroll";
import type { Awaitable } from "./common";
import type { RouterRawLocation } from "./location";
import type { Route, RouteConfig, RouteRecord } from "./route";
import type { RouterMatcher, RouteMatch } from "./match";
import type { NavigationGuard, NavigationGuardAfter } from "./guard";

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

    /**
     * 路由的全局数据上下文。用于在导航中传递数据
     */
    dataCtx?: Record<any, any>;
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
 * 路由注册配置
 */
export type RegisteredConfigMap = {
    [appType: string]: {
        /**
         * 是否已经挂载
         */
        mounted: boolean;
        generator: (router: RouterInstance) => RegisteredConfig;
        config?: RegisteredConfig;
    }
};

/**
 * 路由注册配置
 */
export interface RegisteredConfig {
    /**
     * 初始化
     */
    mount: () => any;

    /**
     * 更新。在 updateRoute 和 closeLayer({ descendantStrategy: 'hoisting' }) 时会调用。
     */
    updated: () => any;

    /**
     * 销毁
     */
    destroy: () => any;

    /**
     * 一个可选的渲染到字符串函数。
     */
    renderToString?: () => string;
}

export interface RouterLayerInfo {
    /**
     * 路由id
     */
    id: number;

    /**
     * 路由弹层深度
     */
    get depth(): number;

    /**
     * 当前路由对象的父路由对象
     */
    parent: RouterInstance | null;

    /**
     * 当前路由对象的子路由对象数组
     */
    children: RouterInstance[];

    /**
     * 当前路由对象的根路由对象
     */
    root: RouterInstance;
}

export interface CloseLayerArgs {
    /**
     * 关闭的类型。
     * `back`：表明是通过路由back触发的关闭
     * `close`(default)：表明是通过close触发的关闭
     */
    type?: 'back' | 'close';

    /**
     * 关闭时 layer 返回的数据
     */
    data?: any;

    /**
     * 对后代 layer 的策略：
     * * `clear`(default)：关闭所有后代 layer，可以在顶层路由调用
     * * `hoisting`：将直接子 layer 挂载到直接父 layer 上。顶层路由调用不会有任何效果。
     * * 顶层路由调用不会销毁顶层路由。
     */
    descendantStrategy?: 'clear' | 'hoisting';
}

export interface PushLayerExtArgs {
    dataCtx?: RouterOptions['dataCtx'];
    hooks?: {
        /**
         * 是否应该关闭弹层路由
         * @returns `true` 关闭弹层路由，`false` 不关闭弹层路由
         */
        shouldCloseLayer?: (from: RouteRecord, to: RouteRecord, layerRouter: RouterInstance) => boolean;
        // 未来有需要再实现（虽然很想现在就放出去）
        // beforeEach?: NavigationGuard;
        // afterEach?: NavigationGuardAfter;
        // beforeEnter?: NavigationGuard;
        // beforeUpdate?: NavigationGuard;
        // beforeLeave?: NavigationGuard;
    };
}

/**
 * 路由类实例
 */
export interface RouterInstance {
    /**
     * 路由弹层相关信息
     */
    layer: RouterLayerInfo;

    /**
     * 是否是弹层路由实例
     */
    get isLayer(): boolean;

    /**
     * 关闭路由弹层
     */
    closeLayer: (options?: CloseLayerArgs) => void;

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
    init: () => Promise<void>;

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
        /**
         * @protected 为了 pushLayer 时注入控制行为，路由库外部不要使用
         */
        _beforeEnter?: NavigationGuard[];
        /**
         * @protected 为了 pushLayer 时注入控制行为，路由库外部不要使用
         */
        _beforeUpdate?: NavigationGuard[];
        /**
         * @protected 为了 pushLayer 时注入控制行为，路由库外部不要使用
         */
        _beforeLeave?: NavigationGuard[];
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
    push: RouterHistory['push'];

    /**
     * 路由跳转方法，会替换当前的历史记录
     */
    replace: RouterHistory['replace'];

    /**
     * 打开路由弹层方法，会创建新的路由实例并调用注册的 register 方法
     * 服务端会使用 push 作为替代
     */
    pushLayer: {
        (options: RouterRawLocation & PushLayerExtArgs): void;
        (location: RouterRawLocation, options?: PushLayerExtArgs): void;
    };

    /**
     * 新开浏览器窗口的方法, 会进入配置的 handleOutside 钩子，在服务端会调用 push 作为替代
     */
    pushWindow: RouterHistory['pushWindow'];

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     * @deprecated 请使用 {@link reload | `reload`} 或 {@link forceReload | `forceReload`} 方法替代。该函数和 {@link forceReload | `forceReload`} 方法的功能相同
     */
    replaceWindow: RouterHistory['pushWindow'];

    /**
     * 刷新当前路由。会将实例卸载并重新挂载。子 layer 会被销毁（相当于调用了一次 closeLayer）
     */
    reload: RouterHistory['reload'];

    /**
     * 强制刷新当前路由。浏览器会刷新网页，服务端调用效果等同于在根路由执行 {@link reload | `reload`}。
     */
    forceReload: RouterHistory['forceReload'];

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

    /**
     * 返回 注册app时传递的 {@link RegisteredConfig.renderToString | `renderToString`} 的执行结果
     */
    renderToString: () => string;
}
