/**
 * @fileoverview 路由器类型定义文件
 * @description 包含路由器相关的所有TypeScript类型定义，提供完整的类型安全支持
 * @version 2.0.0
 * @author Router Team
 * @since 1.0.0
 *
 * 本文件包含以下主要模块：
 * - 核心路由器类型（RouterOptions, RouteConfig等）
 * - 路由匹配相关类型（RouteMatch, RouteMatcher等）
 * - 导航相关类型（NavigationGuard, NavigationType等）
 * - 微应用支持类型（RouterMicroApp等）
 * - 滚动行为类型（RouterScrollBehavior等）
 * - 工具类型（Awaitable, Maybe等）
 */

// Node.js HTTP模块类型
import type { IncomingMessage, ServerResponse } from 'node:http';
// 路径匹配库类型
import type { MatchFunction } from 'path-to-regexp';
// 路由器核心类型
import type { Router } from './router';

/**
 * 类型定义规范说明
 *
 * 本文件按照功能模块组织类型定义，遵循以下规范：
 *
 * 1. 模块分类：
 *    - 核心模块：路由器基础功能，包括路由器选项、路由配置、路由匹配、导航类型、导航结果
 *    - 拓展模块：可选功能，包括微应用、滚动行为等
 *    - 工具类型：通用辅助类型
 *
 * 2. 接口扩展规范：
 *    - 核心接口（如 RouterOptions、RouteConfig）可在各功能模块中通过 interface 合并进行扩展
 *    - 扩展属性应在对应功能模块内定义，保持模块内聚性
 *    - 扩展接口必须添加详细的 JSDoc 注释说明
 *
 * 3. 命名规范：
 *    - 接口名使用 PascalCase，以功能模块为前缀（如 RouterXxx、RouteXxx）
 *    - 类型别名使用 PascalCase
 *    - 枚举使用 PascalCase，枚举值使用 camelCase
 *
 * 4. 注释规范：
 *    - 所有公开接口必须添加 JSDoc 注释
 *    - 复杂类型需要添加使用示例
 *    - 扩展功能需要说明依赖关系和使用场景
 *
 * 5. 模块组织：
 *    - 每个功能模块使用注释分隔符明确标识
 *    - 相关类型定义应紧密排列
 *    - 依赖关系从上到下，核心类型在前，扩展类型在后
 */

/////////////////////////////////////////////////////////
// ======================================================
//  核心：路由器选项
// ======================================================
/////////////////////////////////////////////////////////
/**
 * 路由器模式
 * @description 定义路由器的运行模式
 */
export enum RouterMode {
    /** 历史模式，使用HTML5 History API */
    history = 'history',
    /** 抽象模式，不依赖浏览器环境，适用于服务端或测试环境 */
    abstract = 'abstract'
}

/**
 * 路由器配置选项
 * @description 创建路由器实例时的配置参数
 */
export interface RouterOptions {
    /** 应用的基础URL */
    base?: URL;
    /** 路由器运行模式 */
    mode?: RouterMode;
    /** 路由配置数组 */
    routes?: RouteConfig[];
    /** URL标准化函数，用于处理URL格式 */
    normalizeURL?: (url: URL, raw: RouterRawLocation) => URL;
    /** 路由打开时的钩子函数 */
    onOpen?: (route: Route) => boolean;
    /** 服务端请求对象（仅服务端使用） */
    req?: IncomingMessage | null;
    /** 服务端响应对象（仅服务端使用） */
    res?: ServerResponse | null;
    /** 服务端位置变化钩子函数 */
    onServerLocation?: (route: Route) => boolean;
}

/**
 * 解析后的路由器配置
 * @description 路由器内部使用的完整配置，所有可选项都有默认值
 */
export interface RouterParsedOptions extends Required<RouterOptions> {}

/////////////////////////////////////////////////////////
// ======================================================
//  核心：路由配置
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 路由重定向配置
 * @description 定义路由重定向的目标位置，可以是静态位置或动态函数
 * @example
 * ```typescript
 * // 静态重定向
 * const redirect: RouteRedirect = '/home';
 *
 * // 动态重定向
 * const redirect: RouteRedirect = (to) => {
 *   return to.query.returnUrl || '/dashboard';
 * };
 * ```
 */
export type RouteRedirect =
    | RouterRawLocation
    | ((to: Route, from: Route | null) => RouterRawLocation);

/**
 * 路由元信息
 * @description 存储路由相关的元数据，支持任意键值对
 * @example
 * ```typescript
 * const meta: RouteMeta = {
 *   title: '用户中心',
 *   requiresAuth: true,
 *   permissions: ['user:read'],
 *   [Symbol.for('custom')]: 'value'
 * };
 * ```
 */
export type RouteMeta = Record<string | symbol, unknown>;

export interface RouteConfig {
    /**
     * 路径
     * 在配置path为数组类型时，会根据配置的数组生成多个匹配规则，在命中任意一个匹配规则时，会重定向到配置的第一个 path
     * 按 Hanson 要求，只支持相对路径
     * 路径配置请参考文档: https://github.com/pillarjs/path-to-regexp/tree/v6.2.2#parameters
     */
    path: string;

    /**
     * 路由配置的组件
     * @description 可以是任何有效的组件类型
     */
    component?: unknown;

    /**
     * 路由配置的异步组件
     * @description 返回组件的异步加载函数
     */
    asyncComponent?: () => Promise<unknown>;

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
}

/////////////////////////////////////////////////////////
// ======================================================
//  核心：路由匹配
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 路由匹配项
 * @description 表示单个路由的匹配结果，包含路由配置和匹配信息
 */
export interface RouteMatch {
    /** 匹配的路由配置 */
    route: RouteConfig;
    /** 匹配的路径名 */
    pathname: string;
    /** 子路由匹配项 */
    children: RouteMatch[];
    /** path-to-regexp 匹配函数 */
    match: MatchFunction;
    /** 路径编译函数，用于根据参数生成路径 */
    compile: (params?: Record<string, unknown>) => string;
}

/**
 * 路由匹配结果
 * @description 包含所有匹配的路由和提取的参数
 */
export interface RouteMatchResult {
    /** 匹配的路由列表 */
    matches: RouteMatch[];
    /** 从路径中提取的参数 */
    params: Record<string, string>;
}

/**
 * 路由匹配器
 * @description 根据目标URL和基础URL进行路由匹配的函数
 * @param targetURL 目标URL
 * @param baseURL 基础URL
 * @returns 匹配结果
 */
export type RouteMatcher = (targetURL: URL, baseURL: URL) => RouteMatchResult;

/**
 * 路由器解析配置扩展
 * @description 为RouterParsedOptions添加路由匹配相关的属性
 */
export interface RouterParsedOptions {
    /** 路由匹配器实例 */
    matcher: RouteMatcher;
}

/////////////////////////////////////////////////////////
// ======================================================
//  核心：导航类型和位置
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 导航类型枚举
 * @description 定义所有可能的导航操作类型和状态
 */
export enum NavigationType {
    // 基本导航操作
    /** 推入新的历史记录 */
    push = 'push',
    /** 替换当前历史记录 */
    replace = 'replace',
    /** 重新加载当前页面 */
    reload = 'reload',
    /** 前进或后退指定步数 */
    go = 'go',
    /** 前进一步 */
    forward = 'forward',
    /** 后退一步 */
    back = 'back',
    /** 浏览器popstate事件触发的导航 */
    popstate = 'popstate',

    // 窗口/层导航
    /** 打开新窗口 */
    openWindow = 'openWindow',
    /** 替换当前窗口 */
    replaceWindow = 'replaceWindow',
    /** 推入新的层级 */
    pushLayer = 'pushLayer',

    // 路由解析
    /** 解析路由但不执行导航 */
    resolve = 'resolve'
}

/**
 * 路由位置信息
 * @description 描述路由的完整位置信息，包括路径、查询参数、状态等
 */
export interface RouterLocation {
    /** 完整的URL，可以是字符串或URL对象 */
    url?: string | URL;
    /** 路径部分，不包含查询参数和hash */
    path?: string;
    /** 查询参数对象，值可能为undefined */
    query?: Record<string, string | undefined>;
    /** 查询参数数组形式，用于处理同名参数 */
    queryArray?: Record<string, string[]>;
    /** 路径参数，从动态路由中提取 */
    params?: Record<string, string>;
    /** URL的hash部分，不包含# */
    hash?: string;
    /** 路由状态数据 */
    state?: RouteState;
}

/**
 * 原始路由位置
 * @description 可以是RouterLocation对象或字符串形式的路径
 */
export type RouterRawLocation = RouterLocation | string;

/**
 * 路由状态
 * @description 存储与路由相关的状态数据，通常用于页面间传递数据
 * @example
 * ```typescript
 * const state: RouteState = {
 *   from: 'userList',
 *   scrollPosition: { x: 0, y: 100 },
 *   formData: { name: 'John' }
 * };
 * ```
 */
export type RouteState = Record<string, unknown>;

/////////////////////////////////////////////////////////
// ======================================================
//  核心：导航守卫
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 导航守卫返回值
 * @description 导航守卫函数的返回值类型
 * - true: 允许导航继续
 * - false: 阻止导航
 * - RouterRawLocation: 重定向到指定位置
 */
export type NavigationGuardReturn = boolean | RouterRawLocation;

/**
 * 导航守卫函数
 * @description 在路由导航过程中执行的钩子函数，用于控制导航行为
 * @param from 来源路由
 * @param to 目标路由
 * @returns 导航控制结果，可以是同步或异步的
 * @example
 * ```typescript
 * const authGuard: NavigationGuard = async (from, to) => {
 *   const isAuthenticated = await checkAuth();
 *   if (!isAuthenticated) {
 *     return '/login'; // 重定向到登录页
 *   }
 *   return true; // 允许继续导航
 * };
 * ```
 */
export type NavigationGuard = (
    to: Route,
    from: Route | null
) => Awaitable<NavigationGuardReturn>;

export interface RouteConfig {
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

/////////////////////////////////////////////////////////
// ======================================================
//  核心：路由对象和导航结果
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 路由对象
 * @description 表示当前激活的路由信息，包含完整的路由状态
 */
export interface Route {
    /** 导航的类型 */
    navigationType: NavigationType;
    /** 当前路由的完整URL对象 */
    url: URL;
    /** 从动态路由中提取的路径参数 */
    params: Record<string, string>;
    /** 查询参数对象，值可能为undefined */
    query: Record<string, string | undefined>;
    /** 查询参数数组形式，用于处理同名参数 */
    queryArray: Record<string, string[] | undefined>;
    /** 路由状态数据 */
    state: RouteState;
    /** 路由元信息 */
    meta: RouteMeta;
    /** 路径部分，不包含base、查询参数和hash */
    path: string;
    /** 完整路径，不包含base，但包含查询参数和hash */
    fullPath: string;
    /** 匹配的路由配置数组，按层级排序 */
    matched: RouteConfig[];
    /** matched 的最后一个值 */
    config: RouteConfig | null;
}

/////////////////////////////////////////////////////////
// ======================================================
//  拓展：微应用
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 微应用配置选项
 * @description 定义微应用的生命周期方法和配置
 */
export interface RouterMicroAppOptions {
    /** 微应用挂载方法 */
    mount: () => void;
    /** 微应用卸载方法 */
    unmount: () => void;
    /** 服务端渲染方法，返回HTML字符串 */
    renderToString?: () => Awaitable<string>;
}

/**
 * 微应用回调函数
 * @description 接收路由器实例并返回微应用配置的函数
 * @param router 路由器实例
 * @returns 微应用配置选项
 */
export type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;

/**
 * 微应用配置
 * @description 可以是单个回调函数或应用名称到回调函数的映射
 */
export type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;

export interface RouterOptions {
    /**
     * 微应用配置
     */
    apps?: RouterMicroApp;
}

export interface RouteConfig {
    /**
     * 应用类型, 只在根路由配置有效
     */
    app?: string | RouterMicroAppCallback;
}

/////////////////////////////////////////////////////////
// ======================================================
//  拓展：滚动行为
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 滚动位置配置
 */
export interface RouterScrollPosition {
    /**
     * 滚动动画类型
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions/behavior
     */
    behavior?: ScrollOptions['behavior'];

    /** 水平滚动位置(px) */
    left?: number;

    /** 垂直滚动位置(px) */
    top?: number;
}

/**
 * 定义路由切换时的滚动行为
 * @param to 目标路由
 * @param from 来源路由
 * @param savedPosition 浏览器记录的滚动位置(可能为null)
 * @returns 可返回Promise的滚动位置配置或false/undefined
 */
export type RouterScrollBehavior = (
    to: Route,
    from: Route | null,
    savedPosition: RouterScrollPosition | null
) => Awaitable<RouterScrollPosition | false | undefined>;

export interface RouterOptions {
    /**
     * 控制路由切换时的滚动行为
     * @default 浏览器默认行为
     */
    scrollBehavior?: RouterScrollBehavior;
}

export interface RouterLocation {
    /**
     * 是否保持滚动位置
     * @default false
     */
    keepScrollPosition?: boolean;
}

/////////////////////////////////////////////////////////
// ======================================================
//  拓展：混合开发
// ======================================================
/////////////////////////////////////////////////////////

export interface RouterOptions {
    env?: string;
}
export interface RouteConfig {
    env?: NavigationEnv;
}
export type EnvBridge = (route: Route) => Awaitable<any>;
export interface NavigationEnvOptions {
    require?: (route: Route) => boolean;
    handle?: EnvBridge;
}

export type NavigationEnv = EnvBridge | NavigationEnvOptions;

/////////////////////////////////////////////////////////
// ======================================================
//  工具类型
// ======================================================
/////////////////////////////////////////////////////////

/**
 * 可等待类型
 * @description 表示一个值可以是同步的或异步的（Promise包装的）
 * @template T 值的类型
 * @example
 * ```typescript
 * // 可以返回同步值
 * const syncValue: Awaitable<string> = 'hello';
 *
 * // 也可以返回Promise
 * const asyncValue: Awaitable<string> = Promise.resolve('hello');
 *
 * // 在函数中使用
 * function processData(data: string): Awaitable<string> {
 *   if (needsAsyncProcessing) {
 *     return processAsync(data);
 *   }
 *   return processSync(data);
 * }
 * ```
 */
export type Awaitable<T> = T | Promise<T>;
