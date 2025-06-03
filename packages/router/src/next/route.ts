import { parseLocation } from './location';
import type { RouteMatchResult } from './matcher';
import {
    type Awaitable,
    type NavigationResult,
    NavigationType,
    type Route,
    type RouterParsedOptions,
    type RouterRawLocation
} from './types';

export function parseRoute(
    options: RouterParsedOptions,
    raw: RouterRawLocation
): Route {
    const { base, normalizeURL } = options;
    const loc = normalizeURL(parseLocation(raw, base), raw);
    // 处理外站逻辑
    if (loc.origin !== base.origin) {
        return createRouteByURL(loc);
    }
    if (loc.pathname.length < base.pathname.length) {
        return createRouteByURL(loc);
    }
    // 匹配路由
    const matched = options.matcher(loc, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return createRouteByURL(loc);
    }
    // 重新构造 URL 参数
    const lastMatch = matched.matches[matched.matches.length - 1];
    if (typeof raw === 'object' && raw.params) {
        const current = loc.pathname.split('/');
        const next = new URL(
            lastMatch.compile(raw.params).substring(1),
            base
        ).pathname.split('/');
        next.forEach((item, index) => {
            current[index] = item || current[index];
        });
        loc.pathname = current.join('/');
        Object.assign(matched.params, raw.params);
    }
    return createRoute(raw, loc, base, matched);
}

export async function handleRoute<T extends NavigationType>({
    options,
    loc,
    handle,
    navType
}: {
    options: RouterParsedOptions;
    loc: RouterRawLocation;
    navType: T;
    handle: (result: {
        navType: T;
        route: Route;
    }) => Awaitable<NavigationResult>;
}): Promise<NavigationResult> {
    const route = parseRoute(options, loc);
    if (!route.matched.length) {
        return {
            navType: NavigationType.open,
            route
        };
    }
    return handle({
        navType,
        route
    });
}

export function createRoute(
    raw: RouterRawLocation,
    loc: URL,
    baseURL: URL,
    match: RouteMatchResult
): Route {
    const route = createRouteByURL(loc);

    for (const key of loc.searchParams.keys()) {
        const values = loc.searchParams.getAll(key);
        route.query[key] = values[0] || '';
        route.queryArray[key] = values;
    }
    route.state = typeof raw === 'object' && raw.state ? raw.state : {};
    route.meta = match.matches?.[0].route.meta ?? {};
    route.path = loc.pathname.substring(baseURL.pathname.length - 1);
    route.fullPath = `${route.path}${loc.search}${loc.hash}`;
    route.matched = match.matches.map((item) => item.route);
    return route;
}

export function createRouteByURL(loc: URL): Route {
    return {
        loc: loc,
        params: {},
        query: {},
        queryArray: {},
        state: {},
        meta: {},
        path: loc.pathname,
        fullPath: loc.pathname + loc.search + loc.hash,
        matched: []
    };
}
