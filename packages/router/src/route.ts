import { parseLocation } from './location';
import {
    type Route,
    type RouteHandleHook,
    type RouteHandleResult,
    type RouteLocationRaw,
    RouteStatus,
    type RouteType,
    type RouterParsedOptions
} from './types';

export function createRoute(
    options: RouterParsedOptions,
    toType: RouteType,
    toRaw: RouteLocationRaw,
    from: URL | null
): Route {
    const { base, normalizeURL } = options;
    const to = normalizeURL(parseLocation(toRaw, base), from);
    const isSameOrigin = to.origin === base.origin;
    const isSameBase = to.pathname.length >= base.pathname.length;
    const match = isSameOrigin && isSameBase ? options.matcher(to, base) : null;
    let handle: RouteHandleHook | null = null;
    let handleResult: RouteHandleResult | null = null;
    let handled = false;
    const path = match
        ? to.pathname.substring(options.base.pathname.length - 1)
        : to.pathname;
    const fullPath = match
        ? `${path}${to.search}${to.hash}`
        : to.pathname + to.search + to.hash;
    const state = typeof toRaw === 'object' && toRaw.state ? toRaw.state : {};
    const matched = match ? match.matches : [];
    const keepScrollPosition = Boolean(
        typeof toRaw === 'object' && toRaw.keepScrollPosition
    );
    const route: Route = {
        status: RouteStatus.resolve,
        get handle() {
            return handle;
        },
        set handle(val) {
            if (typeof val !== 'function') {
                handle = null;
                return;
            }
            handle = function handle(this: Route, ...args) {
                if (this.status !== RouteStatus.success) {
                    throw new Error(
                        `Cannot call route handle hook - current status is ${this.status} (expected: ${RouteStatus.success})`
                    );
                }
                if (handled) {
                    throw new Error(
                        'Route handle hook can only be called once per navigation'
                    );
                }
                handled = true;
                return val.call(this, ...args);
            };
        },
        get handleResult() {
            return handleResult;
        },
        set handleResult(val) {
            handleResult = val;
        },
        get req() {
            return options.req;
        },
        get res() {
            return options.res;
        },
        type: toType,
        url: to,
        params: {},
        query: {},
        queryArray: {},
        state,
        get meta() {
            return this.config?.meta || {};
        },
        path,
        fullPath,
        matched,
        keepScrollPosition,
        get config() {
            return this.matched[this.matched.length - 1] || null;
        }
    };

    for (const key of to.searchParams.keys()) {
        const values = to.searchParams.getAll(key);
        route.query[key] = values[0] || '';
        route.queryArray[key] = values;
    }
    if (match) {
        if (typeof toRaw === 'object' && toRaw.params) {
            const lastMatch = match.matches[match.matches.length - 1];
            const current = to.pathname.split('/');
            const next = new URL(
                lastMatch.compile(toRaw.params).substring(1),
                options.base
            ).pathname.split('/');
            next.forEach((item, index) => {
                current[index] = item || current[index];
            });
            to.pathname = current.join('/');
            Object.assign(match.params, toRaw.params);
        }
    }
    return route;
}
