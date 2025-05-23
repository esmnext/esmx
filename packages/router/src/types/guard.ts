
import type { Awaitable } from './common';
import type { HistoryActionType } from './history';
import type { RouterRawLocation } from './location';
import type { RouteRecord } from './route';
import type { RouterInstance } from './router';

/**
 * 路由守卫返回值
 */
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
 * 注册路由表匹配完成后的钩子。所有内链都会执行该钩子。
 */
export type AfterMatchHook = (context: {
    from: RouteRecord,
    to: RouteRecord,
    /**
     * 路由实例
     */
    router: RouterInstance,
    /**
     * 导航类型
     */
    navType: HistoryActionType,
    /**
     * 是否是全等的路由（路径完全相同）
     */
    isEqualRoute: boolean,
    /**
     * 是否是同一个路由
     */
    isSameRoute: boolean,
}) => void;
