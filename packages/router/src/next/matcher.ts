import { type MatchFunction, match } from 'path-to-regexp';
import type { RouteConfig } from './types';

interface RouteMatchConfig {
    route: RouteConfig;
    pathname: string;
    children: RouteMatchConfig[];
    match: MatchFunction;
}

export class Matcher {
    private compiledRoutes: RouteMatchConfig[];
    public constructor(routes: RouteConfig[]) {
        this.compiledRoutes = createRouteMatches(routes);
    }
    public match(url: URL, baseUrl: URL) {
        const matchPath = url.pathname.substring(baseUrl.pathname.length - 1);
        const matchedRoutes: RouteConfig[] = [];
        const collectMatchedRoutes = (routes: RouteMatchConfig[]): boolean => {
            for (const route of routes) {
                if (
                    route.match(matchPath) ||
                    collectMatchedRoutes(route.children)
                ) {
                    matchedRoutes.unshift(route.route);
                    return true;
                }
            }
            return false;
        };
        collectMatchedRoutes(this.compiledRoutes);
        return matchedRoutes;
    }
}

function createRouteMatches(
    routes: RouteConfig[],
    base = ''
): RouteMatchConfig[] {
    return routes.map((route: RouteConfig): RouteMatchConfig => {
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
