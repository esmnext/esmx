import type { RouteMatchResult } from './matcher';
import { type NavigationActionType, NavigationResultType } from './types';
import type {
    Route,
    RouteMatcher,
    RouteMeta,
    RouteState,
    RouterRawLocation
} from './types';

export function parseRoute(args: {
    location: URL;
    base: URL;
    matcher: RouteMatcher;
    raw: RouterRawLocation;
}):
    | {
          navResultType: NavigationResultType.notFound;
      }
    | {
          navResultType: NavigationResultType.success;
          location: URL;
          route: Route;
      } {
    const { raw, location, base } = args;
    // 匹配路由
    const matched = args.matcher(location, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return {
            navResultType: NavigationResultType.notFound
        };
    }
    // 重新构造 URL 参数
    const lastMatch = matched.matches[matched.matches.length - 1];
    if (typeof raw === 'object' && raw.params) {
        const current = location.pathname.split('/');
        const next = new URL(
            lastMatch.compile(location).substring(1),
            base
        ).pathname.split('/');
        next.forEach((item, index) => {
            current[index] = item || current[index];
        });
        location.pathname = current.join('/');
        Object.assign(matched.params, raw.params);
    }
    const route = createRoute(raw, location, base, matched);
    return {
        navResultType: NavigationResultType.success,
        location,
        route
    };
}

export function createRoute(
    raw: RouterRawLocation,
    locationURL: URL,
    baseURL: URL,
    match: RouteMatchResult
): Route {
    const query: Record<string, string | undefined> = {};
    const queryArray: Record<string, string[]> = {};

    new Set(locationURL.searchParams.keys()).forEach((key) => {
        const value = locationURL.searchParams.get(key);
        if (typeof value === 'string') {
            query[key] = value;
        }
        queryArray[key] = locationURL.searchParams.getAll(key);
    });
    const state: RouteState =
        typeof raw === 'object' && raw.state ? raw.state : {};
    const meta: RouteMeta = match.matches?.[0].route.meta ?? {};
    const path = locationURL.pathname.substring(baseURL.pathname.length);
    const fullPath = `${path}${locationURL.search}${locationURL.hash}`;
    const matched = match.matches.map((item) => item.route);
    return {
        hash: locationURL.hash,
        host: locationURL.host,
        hostname: locationURL.hostname,
        href: locationURL.href,
        origin: locationURL.origin,
        pathname: locationURL.pathname,
        port: locationURL.port,
        protocol: locationURL.protocol,
        search: locationURL.search,
        params: match.params,
        query,
        queryArray,
        state,
        meta,
        path,
        fullPath,
        matched
    };
}
