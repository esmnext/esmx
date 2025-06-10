import { parseLocation } from './location';
import { RouteStatus } from './types';
import type {
    Route,
    RouteHandleHook,
    RouteHandleResult,
    RouteLocationRaw,
    RouteType,
    RouterParsedOptions
} from './types';

export function createRoute(
    options: RouterParsedOptions,
    toType: RouteType,
    toRaw: RouteLocationRaw,
    from: URL | null
): Route {
    const base = new URL(options.base);
    const to = options.normalizeURL(parseLocation(toRaw, base), from);
    const isSameOrigin = to.origin === base.origin;
    const isSameBase = to.pathname.startsWith(base.pathname);
    const match = isSameOrigin && isSameBase ? options.matcher(to, base) : null;
    let handle: RouteHandleHook | null = null;
    let handleResult: RouteHandleResult | null = null;
    let handled = false;
    const path = match
        ? to.pathname.substring(base.pathname.length - 1)
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
        get isPush() {
            return this.type.startsWith('push');
        },
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

    for (const key of new Set(to.searchParams.keys())) {
        route.query[key] = to.searchParams.get(key)!;
        route.queryArray[key] = to.searchParams.getAll(key);
    }
    if (!(match && typeof toRaw === 'object' && toRaw.params)) {
        return route;
    }
    // 将params参数拼接回路径
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
    return route;
}
