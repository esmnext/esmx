import { parseLocation } from './location';
import type { RouteMatchResult } from './matcher';
import {
    type Awaitable,
    type NavigationResult,
    NavigationType,
    type Route,
    type RouteMeta,
    type RouteState,
    type RouterParsedOptions,
    type RouterRawLocation
} from './types';

export function parseRoute(
    options: RouterParsedOptions,
    raw: RouterRawLocation
):
    | {
          navType: NavigationType.open;
          location: URL;
      }
    | {
          navType: NavigationType.open;
          location: URL;
      }
    | {
          navType: NavigationType.notFound;
          location: URL;
      }
    | {
          navType: NavigationType.resolve;
          location: URL;
          route: Route;
      } {
    const { base, normalizeURL } = options;
    const location = normalizeURL(parseLocation(raw, base), raw);
    // 处理外站逻辑
    if (location.origin !== base.origin) {
        return {
            navType: NavigationType.open,
            location
        };
    }
    if (location.pathname.length < base.pathname.length) {
        return {
            navType: NavigationType.open,
            location
        };
    }
    // 匹配路由
    const matched = options.matcher(location, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return {
            navType: NavigationType.notFound,
            location
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
        navType: NavigationType.resolve,
        location,
        route
    };
}

export async function handleRoute<T extends NavigationType>({
    options,
    location,
    handle,
    navType
}: {
    options: RouterParsedOptions;
    location: RouterRawLocation;
    navType: T;
    handle: (result: {
        navType: T;
        location: URL;
        route: Route;
    }) => Awaitable<NavigationResult>;
}): Promise<NavigationResult> {
    const result = parseRoute(options, location);
    switch (result.navType) {
        case NavigationType.open:
            options.onOpen(result.location, result.navType);
            return {
                navType: NavigationType.open,
                location: result.location
            };
        case NavigationType.notFound:
            return result;
    }
    return handle({
        navType,
        location: result.location,
        route: result.route
    });
}

export function createRoute(
    raw: RouterRawLocation,
    location: URL,
    baseURL: URL,
    match: RouteMatchResult
): Route {
    const route = createRouteByURL(location);

    location.searchParams.keys().forEach((key) => {
        const value = location.searchParams.get(key);
        if (typeof value === 'string') {
            route.query[key] = value;
        }
        route.queryArray[key] = location.searchParams.getAll(key) || [];
    });
    route.state = typeof raw === 'object' && raw.state ? raw.state : {};
    route.meta = match.matches?.[0].route.meta ?? {};
    route.path = location.pathname.substring(baseURL.pathname.length - 1);
    route.fullPath = `${route.path}${location.search}${location.hash}`;
    route.matched = match.matches.map((item) => item.route);
    return route;
}

export function createRouteByURL(location: URL): Route {
    return {
        location,
        hash: location.hash,
        host: location.host,
        hostname: location.hostname,
        href: location.href,
        origin: location.origin,
        pathname: location.pathname,
        port: location.port,
        protocol: location.protocol,
        search: location.search,
        params: {},
        query: {},
        queryArray: {},
        state: {},
        meta: {},
        path: location.pathname,
        fullPath: location.pathname + location.search + location.hash,
        matched: []
    };
}
