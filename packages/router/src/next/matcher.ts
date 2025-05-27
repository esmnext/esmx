import { type MatchFunction, compile, match } from 'path-to-regexp';
import type { RouteConfig } from './types';

export interface RouteMatch {
    route: RouteConfig;
    pathname: string;
    children: RouteMatch[];
    match: MatchFunction;
    compile: (params?: Record<string, any>) => string;
}
export type RouteMatchFunc = (currentURL: URL, baseURL: URL) => RouteMatch[];

export function createMatcher(routes: RouteConfig[]): RouteMatchFunc {
    const compiledRoutes = createRouteMatches(routes);
    return (currentURL: URL, baseUrl: URL) => {
        const requestPath = currentURL.pathname.substring(
            baseUrl.pathname.length - 1
        );
        const matchedRoutes: RouteMatch[] = [];
        const findMatchingRoutes = (routes: RouteMatch[]): boolean => {
            for (const item of routes) {
                const result = item.match(requestPath);
                if (result || findMatchingRoutes(item.children)) {
                    matchedRoutes.unshift(item);
                    return true;
                }
            }
            return false;
        };
        findMatchingRoutes(compiledRoutes);
        return matchedRoutes;
    };
}

function createRouteMatches(routes: RouteConfig[], base = ''): RouteMatch[] {
    return routes.map((route: RouteConfig): RouteMatch => {
        const pathname = '/' + joinPathname(route.path, base);
        return {
            pathname,
            route,
            match: match(pathname),
            compile: compile(pathname),
            children: Array.isArray(route.children)
                ? createRouteMatches(route.children, pathname)
                : []
        };
    });
}

export function joinPathname(pathname: string, base = '') {
    return `${base}/${pathname}`.split('/').filter(Boolean).join('/');
}
