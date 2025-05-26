
import type { RouterMode, RouterHistory, HistoryActionType, NavReturnType } from "./history";
import type { RouterScrollBehavior } from "./scroll";
import type { Awaitable } from "./common";
import type { RouterRawLocation } from "./location";
import type { Route, RouteConfig, RouteRecord } from "./route";
import type { RouterMatcher, RouteMatch } from "./match";
import type { AfterMatchHook, NavigationGuard, NavigationGuardAfter } from "./guard";

/**
 * 路由配置
 */
export interface RouterOptions {
    /**
     * 路由模式
     */
    mode?: RouterMode;

    /**
     * 路由前置部分。需要传入完整的带协议的 URL
     * * 注意：如果传入的是一个字符串，则需要保证该字符串是一个合法的 URL，否则会抛出异常
     * * 注意：尾随斜杠在解析相对路由时是有意义的。例如：在 `push('./a')` 时，`http://example.com/en` 会解析成 `http://example.com/a`，`http://example.com/en/` 会解析成 `http://example.com/en/a`。
     * * 注意：在解析相对于根的相对路径（以 `/` 开头的路径）时，会直接拼接到该 URL 之后。例如：在 `push('/a')` 时，无论 `http://example.com/en` 还是 `http://example.com/en/`，都会解析成 `http://example.com/en/a`。
     * * 推荐：传入带尾随斜杠的 URL
     * @example `https://www.google.com:443/en/`
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
     * URL规范化函数，用于实现跨区域无刷新导航。此函数可以将不同格式的区域URL（包括子域名和路径格式）
     * 统一转换为标准的内部路由格式，从而实现统一的路由管理和无缝的用户体验。
     * 该函数在路由库解析 URL 后调用。
     */
    normalizeURL?: (context: {
        url: URL;
        router: RouterInstance;
        type: HistoryActionType;
    }) => URL | Promise<URL>;

    /**
     * 自定义外部链接处理函数。返回 `true` 表示已处理，返回 `false` 则继续使用默认策略。
     * 目前的默认策略是根据 `replace` 来决定是当前标签页还是新标签页打开。
     */
    externalUrlHandler?: (context: {
        url: URL;
        router: RouterInstance;
        type: HistoryActionType;
    }) => boolean | Promise<boolean>;

    /**
     * 路由配置使用的 route
     */
    routes: RouteConfig[];

    /**
     * 路由的全局数据上下文。用于在导航中传递数据
     */
    dataCtx?: Record<string | symbol, any>;
}

/**
 * 路由前置部分。需要传入完整的带协议的 URL
 * * 注意：如果传入的是一个字符串，则需要保证该字符串是一个合法的 URL，否则会抛出异常
 * * 注意：尾随斜杠在解析相对路由时是有意义的。例如：在 `push('./a')` 时，`http://example.com/en` 会解析成 `http://example.com/a`，`http://example.com/en/` 会解析成 `http://example.com/en/a`。
 * * 注意：在解析相对于根的相对路径（以 `/` 开头的路径）时，会直接拼接到该 URL 之后。例如：在 `push('/a')` 时，无论 `http://example.com/en` 还是 `http://example.com/en/`，都会解析成 `http://example.com/en/a`。
 * @example `https://www.google.com:443/en/
 * * 推荐：传入带尾随斜杠的 URL`
 */
export type RouterBase = string | URL;

/** 路由注册函数 */
export type RegisteredConfigGenerator = (router: RouterInstance) => RegisteredConfig;

/**
 * 路由注册配置
 */
export type RegisteredConfigMap = {
    [AppType in string]?: {
        /** 应用类型 */
        appType: AppType;
        /** 是否已经挂载 */
        mounted: boolean;
        /** 用户注册app时的函数 */
        generator: RegisteredConfigGenerator;
        /** 用户注册app时的函数的执行结果的缓存，当app被卸载后会删除该缓存 */
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

    /**
     * 应用内的数据上下文。优先级高于{@link RouterOptions.dataCtx | 路由的全局数据上下文}。用于在导航中传递数据
     */
    dataCtx?: RouterOptions['dataCtx'];
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
    /**
     * 导航时的数据上下文。优先级高于{@link RegisteredConfig.dataCtx | 应用内的数据上下文}和{@link RouterOptions.dataCtx | 路由的全局数据上下文}。用于在导航中传递数据
     */
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
    /**
     * 事件监听器。
     * 内置了事件：
     * * `layerClosed`：关闭弹层路由时触发，事件入参：{@link CloseLayerArgs | `CloseLayerArgs`}。
     */
    events?: Record<string, Function>;
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
     * 路由固定前置路径。需要传入完整的带协议的 URL
     * * 注意：如果传入的是一个字符串，则需要保证该字符串是一个合法的 URL，否则会抛出异常
     * * 注意：尾随斜杠在解析相对路由时是有意义的。例如：在 `push('./a')` 时，`http://example.com/en` 会解析成 `http://example.com/a`，`http://example.com/en/` 会解析成 `http://example.com/en/a`。
     * * 注意：在解析相对于根的相对路径（以 `/` 开头的路径）时，会直接拼接到该 URL 之后。例如：在 `push('/a')` 时，无论 `http://example.com/en` 还是 `http://example.com/en/`，都会解析成 `http://example.com/en/a`。
     * * 推荐：传入带尾随斜杠的 URL
     * @example `https://www.google.com:443/en/`
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
        config: RegisteredConfigGenerator,
    ) => void;

    /* 已注册的app配置 */
    registeredConfigMap: RegisteredConfigMap;

    /**
     * 全局路由守卫
     */
    readonly guards: {
        beforeEach: NavigationGuard[];
        afterEach: NavigationGuardAfter[];
        afterMatch: AfterMatchHook[];
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
     * 注册路由表匹配完成后的钩子
     */
    afterMatch: (guard: AfterMatchHook) => void;

    /**
     * 卸载路由表匹配完成后的钩子
     */
    unBindAfterMatch: (guard: AfterMatchHook) => void;

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
        (options: RouterRawLocation & PushLayerExtArgs): NavReturnType<{
            layerRouter: RouterInstance;
            closeLayerPromise: Promise<CloseLayerArgs>;
        }>;
        (location: RouterRawLocation, options?: PushLayerExtArgs): NavReturnType<{
            layerRouter: RouterInstance;
            closeLayerPromise: Promise<CloseLayerArgs>;
        }>;
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

    /**
     * 返回当前路由{@link RouterOptions.dataCtx | 全局}和{@link RegisteredConfig.dataCtx | 应用内的数据上下文}按优先级合并后的结果
     */
    get dataCtx(): NonNullable<RouterOptions['dataCtx']>;

    /**
     * 注册事件监听器
     * @param event 事件名称
     * @param listener 监听器
     */
    on(event: string, listener: Function): void;
    /**
     * 卸载事件监听器
     * @param event 事件名称
     * @param listener 监听器
     */
    off(event: string, listener: Function): void;
    /**
     * 触发事件
     * @param event 事件名称
     * @param args 事件参数
     */
    emit(event: string, ...args: any[]): void;
}
