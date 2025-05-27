import type { RouteMatchResult } from './matcher';
import type { Route, RouteMeta, RouteState, RouterRawLocation } from './types';

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
