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

export async function parseRoute(
    options: RouterParsedOptions,
    raw: RouterRawLocation
): Promise<
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
      }
> {
    const { base, normalizeURL } = options;
    const location = await normalizeURL(parseLocation(raw, base), raw);
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

export async function handleRoute({
    options,
    location,
    replace,
    handle,
    navType
}: {
    options: RouterParsedOptions;
    location: RouterRawLocation;
    replace: boolean;
    navType: NavigationType;
    handle: (location: URL, route: Route) => Promise<NavigationResult>;
}): Promise<NavigationResult> {
    const result = await parseRoute(options, location);
    switch (result.type) {
        case NavigationType.crossOrigin:
            return {
                type: NavigationType.crossOrigin,
                location: result.location,
                result: options.onOpenCrossOrigin(
                    result.location,
                    replace,
                    navType
                )
            };
        case NavigationType.crossApp:
            return {
                type: NavigationType.crossApp,
                location: result.location,
                result: options.onOpenCrossApp(
                    result.location,
                    replace,
                    navType
                )
            };
        case NavigationType.notFound:
            return result;
    }
    return handle(result.location, result.route);
}

export function createRoute(
    raw: RouterRawLocation,
    locationURL: URL,
    baseURL: URL,
    match: RouteMatchResult
): Route {
    const query: Record<string, string | undefined> = {};
    const queryArray: Record<string, string[]> = {};

    locationURL.searchParams.keys().forEach((key) => {
        const value = locationURL.searchParams.get(key);
        if (typeof value === 'string') {
            query[key] = value;
        }
        queryArray[key] = locationURL.searchParams.getAll(key) || [];
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
