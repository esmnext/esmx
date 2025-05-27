import { type MatchFunction, match } from 'path-to-regexp';
import type { RouteConfig } from './types';

export interface RouteMatch {
    route: RouteConfig;
    pathname: string;
    children: RouteMatch[];
    match: MatchFunction;
}
export type MatcherFunc = (url: URL, baseUrl: URL) => RouteConfig[];

export function createMatcher(routes: RouteConfig[]): MatcherFunc {
    const compiledRoutes = createRouteMatches(routes);
    return (url: URL, baseUrl: URL) => {
        const matchPath = url.pathname.substring(baseUrl.pathname.length - 1);
        const routes: RouteConfig[] = [];
        const matcher = (matches: RouteMatch[]): boolean => {
            for (const match of matches) {
                if (match.match(matchPath) || matcher(match.children)) {
                    routes.unshift(match.route);
                    return true;
                }
            }
            return false;
        };
        matcher(compiledRoutes);
        return routes;
    };
}

function createRouteMatches(routes: RouteConfig[], base = ''): RouteMatch[] {
    return routes.map((route: RouteConfig): RouteMatch => {
        const pathname = '/' + joinPathname(route.path, base);
        return {
            pathname,
            route,
            match: match(pathname),
            children: Array.isArray(route.children)
                ? createRouteMatches(route.children, pathname)
                : []
        };
    });
}

export function joinPathname(pathname: string, base = '') {
    return `${base}/${pathname}`.split('/').filter(Boolean).join('/');
}
