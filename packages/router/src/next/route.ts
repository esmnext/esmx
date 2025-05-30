import { parseLocation } from './location';
import type { RouteMatchResult } from './matcher';
import {
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
          type: NavigationType.crossOrigin;
          location: URL;
      }
    | {
          type: NavigationType.crossApp;
          location: URL;
      }
    | {
          type: NavigationType.notFound;
          location: URL;
      }
    | {
          type: NavigationType.resolve;
          location: URL;
          route: Route;
      } {
    const { base, normalizeURL } = options;
    const location = normalizeURL(parseLocation(raw, base), raw);
    // 处理外站逻辑
    if (location.origin !== base.origin) {
        return {
            type: NavigationType.crossOrigin,
            location
        };
    }
    if (location.pathname.length < base.pathname.length) {
        return {
            type: NavigationType.crossApp,
            location
        };
    }
    // 匹配路由
    const matched = options.matcher(location, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return {
            type: NavigationType.notFound,
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
        type: NavigationType.resolve,
        location,
        route
    };
}

export async function handleRoute<T extends NavigationType>({
    options,
    location,
    handle,
    type
}: {
    options: RouterParsedOptions;
    location: RouterRawLocation;
    type: T;
    handle: (result: {
        type: T;
        location: URL;
        route: Route;
    }) => Promise<NavigationResult>;
}): Promise<NavigationResult> {
    const result = parseRoute(options, location);
    const replace = type.startsWith('replace');
    switch (result.type) {
        case NavigationType.crossOrigin:
            options.onOpenCrossOrigin(result.location, replace, type);
            return {
                type: NavigationType.crossOrigin,
                location: result.location
            };
        case NavigationType.crossApp:
            options.onOpenCrossApp(result.location, replace, type);
            return {
                type: NavigationType.crossApp,
                location: result.location
            };
        case NavigationType.notFound:
            return result;
    }
    return handle({
        type,
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
    const query: Record<string, string | undefined> = {};
    const queryArray: Record<string, string[]> = {};

    location.searchParams.keys().forEach((key) => {
        const value = location.searchParams.get(key);
        if (typeof value === 'string') {
            query[key] = value;
        }
        queryArray[key] = location.searchParams.getAll(key) || [];
    });
    const state: RouteState =
        typeof raw === 'object' && raw.state ? raw.state : {};
    const meta: RouteMeta = match.matches?.[0].route.meta ?? {};
    const path = location.pathname.substring(baseURL.pathname.length);
    const fullPath = `${path}${location.search}${location.hash}`;
    const matched = match.matches.map((item) => item.route);
    return {
        hash: location.hash,
        host: location.host,
        hostname: location.hostname,
        href: location.href,
        origin: location.origin,
        pathname: location.pathname,
        port: location.port,
        protocol: location.protocol,
        search: location.search,
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
