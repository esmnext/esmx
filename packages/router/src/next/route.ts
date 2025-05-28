import { rawLocationToURL } from './location';
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
    rawLocation: RouterRawLocation
): Promise<
    | {
          type: NavigationType.crossOrigin;
          url: URL;
      }
    | { type: NavigationType.notFound }
    | { type: NavigationType.update; route: Route }
> {
    const { base, normalizeURL, onOpenCrossOrigin } = options;
    const location = await normalizeURL(rawLocationToURL(rawLocation, base));
    // 处理外站逻辑
    if (location.origin !== base.origin) {
        return {
            type: NavigationType.crossOrigin,
            url: location
        };
    }
    // 匹配路由
    const matched = options.matcher(location, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return {
            type: NavigationType.notFound
        };
    }
    // 重新构造 URL 参数
    const lastMatch = matched.matches[matched.matches.length - 1];
    if (typeof rawLocation === 'object' && rawLocation.params) {
        const current = location.pathname.split('/');
        const next = new URL(
            lastMatch.compile(location).substring(1),
            base
        ).pathname.split('/');
        next.forEach((item, index) => {
            current[index] = item || current[index];
        });
        location.pathname = current.join('/');
        Object.assign(matched.params, rawLocation.params);
    }
    const route = createRoute(rawLocation, location, base, matched);
    return {
        type: NavigationType.update,
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
