import { compile, match, pathToRegexp } from 'path-to-regexp';

import type {
    HistoryState,
    RouteConfig,
    RouteMatch,
    RouteRecord,
    RouterLocation,
    RouterMatcher
} from '../types';
import {
    decode,
    encodePath,
    normalizeLocation,
    normalizePath,
    parsePath,
    stringifyPath
} from '../utils';

/**
 * 路由匹配器
 */
class RouteMatcher {
    /*
     * 路由匹配规则
     */
    protected routeMatches: RouteMatch[];

    /*
     * 原始路由配置
     */
    // protected routes: RouteConfig[];

    constructor(routes: RouteConfig[]) {
        // this.routes = routes;
        this.routeMatches = createRouteMatches(routes);
    }

    /*
     * 根据配置匹配对应的路由
     */
    public match(
        rawLocation: RouterLocation,
        {
            base,
            redirectedFrom
        }: { base: string; redirectedFrom?: RouteRecord } = { base: '' }
    ): RouteRecord | null {
        let path = '';
        /* 按 Hanson 要求加入 undefined 类型 */
        let query: Record<string, string | undefined> = {};
        let queryArray: Record<string, string[]> = {};
        let params: Record<string, string> = {};
        let hash = '';
        let state: HistoryState = {};

        const parsedOption = parsePath(rawLocation.path);
        path = parsedOption.pathname;
        query = rawLocation.query || parsedOption.query || {};
        queryArray = rawLocation.queryArray || parsedOption.queryArray || {};
        hash = rawLocation.hash || parsedOption.hash || '';
        state = rawLocation.state || {};

        const routeMatch = this.routeMatches.find(({ match }) => {
            return match(path);
        });

        if (routeMatch) {
            const {
                component,
                asyncComponent,
                compile,
                meta,
                redirect,
                matched,
                parse
            } = routeMatch.internalRedirect || routeMatch; // 优先使用内部重定向

            params = rawLocation.params || parse(path).params || {};

            const realPath = normalizePath(
                compile({
                    query,
                    queryArray,
                    params,
                    hash
                })
            );

            const {
                params: realParams,
                query: realQuery,
                queryArray: realQueryArray,
                hash: realHash
            } = parse(realPath);

            const routeRecord = {
                base,
                path: normalizePath(
                    compile({
                        params: realParams
                    })
                ),
                fullPath: realPath,
                params: realParams,
                query: realQuery,
                queryArray: realQueryArray,
                hash: realHash,
                state,
                component,
                asyncComponent,
                meta,
                redirect,
                redirectedFrom,
                matched
            };

            if (redirect) {
                const normalizedLocation = normalizeLocation(
                    typeof redirect === 'function'
                        ? redirect(routeRecord)
                        : redirect,
                    base
                );
                return this.match(normalizedLocation, {
                    base,
                    redirectedFrom: routeRecord
                });
            }
            return routeRecord;
        }
        return null;
    }

    /*
     * 获取当前路由匹配规则
     */
    public getRoutes(): RouteMatch[] {
        return this.routeMatches;
    }

    /**
     * 新增单个路由匹配规则
     */
    // public addRoute(route: RouteConfig) {
    //     this.routes.push(route);
    //     this.routeMatches = createRouteMatches(this.routes);
    // }

    /**
     * 新增多个路由匹配规则
     */
    // public addRoutes(routes: RouteConfig[]) {
    //     this.routes.push(...routes);
    //     this.routeMatches = createRouteMatches(this.routes);
    // }
}

/**
 * 创建路由匹配器
 */
export function createRouterMatcher(routes: RouteConfig[]): RouterMatcher {
    return new RouteMatcher(routes);
}

/**
 * 生成打平的路由匹配规则
 */
function createRouteMatches(
    routes: RouteConfig[],
    parent?: RouteMatch
): RouteMatch[] {
    const routeMatches: RouteMatch[] = [];
    for (const route of routes) {
        routeMatches.push(
            ...createRouteMatch(
                {
                    ...route,
                    path: Array.isArray(route.path) ? route.path : [route.path]
                },
                parent
            )
        );
    }
    return routeMatches;
}

/**
 * 生成单个路由匹配规则
 */
function createRouteMatch(
    route: RouteConfig & { path: string },
    parent?: RouteMatch
): RouteMatch;
function createRouteMatch(
    route: RouteConfig & { path: string[] },
    parent?: RouteMatch
): RouteMatch[];
function createRouteMatch(
    route: RouteConfig,
    parent?: RouteMatch
): RouteMatch | RouteMatch[] {
    const pathList = Array.isArray(route.path) ? route.path : [route.path];
    const routeMatches: RouteMatch[] = pathList.reduce<RouteMatch[]>(
        (acc, item, index) => {
            const { children } = route;
            const path = normalizePath(item, parent?.path);
            let regex: RegExp;
            try {
                regex = pathToRegexp(path);
            } catch (error) {
                console.warn(
                    `@create route rule failed on path: ${path}`,
                    route
                );
                return acc;
            }
            const toPath = compile(path, { encode: encodePath });
            const parseParams = match(path, { decode });
            const current: RouteMatch = {
                regex,
                match: (path: string) => {
                    return regex.test(path);
                },
                parse: (
                    path: string
                ): {
                    params: Record<string, string>;
                    query: Record<string, string>;
                    queryArray: Record<string, string[]>;
                    hash: string;
                } => {
                    const { pathname, query, queryArray, hash } =
                        parsePath(path);
                    const { params } = parseParams(pathname) || { params: {} };
                    return {
                        params: Object.assign({}, params), // parse的 params 是使用 Object.create(null) 创建的没有原型的对象，需要进行包装处理
                        query,
                        queryArray,
                        hash
                    };
                },
                compile: (
                    { params = {}, query = {}, queryArray = {}, hash = '' } = {
                        params: {},
                        query: {},
                        queryArray: {},
                        hash: ''
                    }
                ) => {
                    const pathString = toPath(params);
                    return stringifyPath({
                        pathname: pathString,
                        query,
                        queryArray,
                        hash
                    });
                },
                path,
                appType: route.appType || parent?.appType || '',
                component: route.component,
                asyncComponent: route.asyncComponent,
                meta: route.meta || {},
                redirect: route.redirect,
                /**
                 * 第一个 path 作为基准，后续 path 会内部重定向到第一个 path
                 * 同时如果父路由存在内部跳转，子路由也需要处理内部跳转
                 */
                internalRedirect:
                    index > 0 || parent?.internalRedirect
                        ? createRouteMatch(
                              {
                                  ...route,
                                  path: pathList[0]
                              },
                              parent?.internalRedirect || parent
                          )
                        : undefined,
                matched: [...(parent?.matched || []), route]
            };
            if (children && children.length > 0) {
                acc.push(...createRouteMatches(children, current));
            }
            acc.push(current);
            return acc;
        },
        []
    );
    return Array.isArray(route.path)
        ? routeMatches
        : routeMatches[routeMatches.length - 1];
}
