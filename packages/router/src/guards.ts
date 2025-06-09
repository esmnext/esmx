import type { Route } from './types';

/**
 * 判断是否是同一个路由
 */
export function isSameRoute(to: Route, from: Route) {
    return to.config === from.config;
}

/**
 * 判断是否是全等的路由: 路径完全相同
 */
export function isEqualRoute(to: Route, from: Route) {
    return to.fullPath === from.fullPath && isSameRoute(to, from);
}
