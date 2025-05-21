
import type { HistoryState } from './history';
import type { RouterRawLocation } from './location';
import type { NavigationGuard } from './guard';
import type { RouterLocation } from './location';

/**
 * 路由的meta配置
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {}

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
 * 路由重定向配置的类型
 */
export type RouteRedirect =
    | RouterRawLocation
    | ((to: RouteRecord) => RouterRawLocation);

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
 * 用户使用的 route。
 * 和 {@link RouterLocation| `RouterLocation`} 的区别在于，{@link RouterLocation| `RouterLocation`} 是入参，{@link Route | `Route`} 是出参
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
