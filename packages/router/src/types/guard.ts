
import type { Awaitable } from './common';
import type { RouterRawLocation } from './location';
import type { RouteRecord } from './route';

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
