
import type { RouteMeta, RouteRedirect, RouteConfig, RouteRecord } from "./route";
import type { RouterLocation } from "./location";

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
