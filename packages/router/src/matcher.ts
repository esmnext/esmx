import { compile, match } from 'path-to-regexp';
import type { RouteConfig, RouteMatcher, RouteParsedConfig } from './types';

export function createMatcher(routes: RouteConfig[]): RouteMatcher {
    const compiledRoutes = createRouteMatches(routes);
    return (currentURL: URL, baseUrl: URL) => {
        const requestPath = currentURL.pathname.substring(
            baseUrl.pathname.length - 1
        );
        const matches: RouteParsedConfig[] = [];
        const params: Record<string, string> = {};
        const findMatchingRoutes = (routes: RouteParsedConfig[]): boolean => {
            for (const item of routes) {
                const result = item.match(requestPath);
                if (result || findMatchingRoutes(item.children)) {
                    matches.unshift(item);
                    if (typeof result === 'object') {
                        Object.assign(params, result.params);
                    }
                    return true;
                }
            }
            return false;
        };
        findMatchingRoutes(compiledRoutes);
        return { matches, params };
    };
}

function createRouteMatches(
    routes: RouteConfig[],
    base = ''
): RouteParsedConfig[] {
    return routes.map((route: RouteConfig): RouteParsedConfig => {
        const compilePath = joinPathname(route.path, base);
        return {
            ...route,
            compilePath,
            match: match(compilePath),
            compile: compile(compilePath),
            meta: route.meta || {},
            children: Array.isArray(route.children)
                ? createRouteMatches(route.children, compilePath)
                : []
        };
    });
}

export function joinPathname(pathname: string, base = '') {
    return '/' + `${base}/${pathname}`.split('/').filter(Boolean).join('/');
}
