import type { Route, RouteRecord } from '../types';

export const createRoute = (route: Partial<Route> = {}): Route => ({
    hash: '',
    host: '',
    hostname: '',
    href: '',
    origin: 'null',
    pathname: '',
    port: '',
    protocol: '',
    search: '',
    params: {},
    query: {},
    queryArray: {},
    state: {},
    meta: {},
    path: '',
    fullPath: '',
    base: '',
    matched: [],
    ...route
});

/**
 * 创建一个路由记录
 */
export function createRouteRecord(
    route: Partial<RouteRecord> = {}
): RouteRecord {
    return {
        base: '',
        path: '/',
        fullPath: '/',
        meta: {},
        matched: [],
        query: {},
        queryArray: {},
        params: {},
        hash: '',
        state: {},
        ...route
    };
}
