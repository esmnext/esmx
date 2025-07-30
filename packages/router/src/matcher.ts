import { compile, match } from 'path-to-regexp';
import type { RouteConfig, RouteMatcher, RouteParsedConfig } from './types';

export function createMatcher(routes: RouteConfig[]): RouteMatcher {
    const compiledRoutes = createRouteMatches(routes);
    return (
        toURL: URL,
        baseURL: URL,
        cb?: (item: RouteParsedConfig) => boolean
    ) => {
        const matchPath = toURL.pathname.substring(baseURL.pathname.length - 1);
        const matches: RouteParsedConfig[] = [];
        const params: Record<string, string | string[]> = {};
        const collectMatchingRoutes = (
            routes: RouteParsedConfig[]
        ): boolean => {
            for (const item of routes) {
                if (cb && !cb(item)) {
                    continue;
                }
                // Depth-first traversal
                if (
                    item.children.length &&
                    collectMatchingRoutes(item.children)
                ) {
                    matches.unshift(item);
                    return true;
                }
                const result = item.match(matchPath);
                if (result) {
                    matches.unshift(item);
                    if (typeof result === 'object') {
                        Object.assign(params, result.params);
                    }
                    return true;
                }
            }
            return false;
        };
        collectMatchingRoutes(compiledRoutes);
        return { matches: Object.freeze(matches), params };
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
