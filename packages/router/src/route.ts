import { parseLocation } from './location';
import { RouteStatus } from './types';
import type {
    Route,
    RouteHandleHook,
    RouteHandleResult,
    RouteLocationRaw,
    RouteMatchResult,
    RouteType,
    RouterParsedOptions
} from './types';
import { isNonEmptyPlainObject, isPlainObject } from './util';

/**
 * 将用户传入的参数拼接到URL路径中
 * @param match 路由匹配结果
 * @param toRaw 用户传入的路由位置对象
 * @param base 基础URL
 * @param to 当前解析的URL对象
 */
export function applyRouteParams(
    match: RouteMatchResult,
    toRaw: RouteLocationRaw,
    base: URL,
    to: URL
): void {
    if (
        !isPlainObject(toRaw) ||
        !isNonEmptyPlainObject(toRaw.params) ||
        !match.matches.length
    ) {
        return;
    }

    // 获取最后匹配的路由配置
    const lastMatch = match.matches[match.matches.length - 1];

    // 分割当前路径
    const current = to.pathname.split('/');

    // 用用户参数编译新路径并分割
    const next = new URL(
        lastMatch.compile(toRaw.params).substring(1),
        base
    ).pathname.split('/');

    // 用新路径片段替换当前路径片段
    next.forEach((item, index) => {
        current[index] = item || current[index];
    });

    // 更新URL路径
    to.pathname = current.join('/');

    // 合并参数到匹配结果中，用户参数优先
    Object.assign(match.params, toRaw.params);
}

export function createRoute(
    options: RouterParsedOptions,
    toType: RouteType,
    toRaw: RouteLocationRaw,
    from: URL | null
): Route {
    const base = options.base;
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
    const state = isPlainObject(toRaw) && toRaw.state ? toRaw.state : {};
    const matched = match ? match.matches : [];
    const keepScrollPosition = isPlainObject(toRaw)
        ? Boolean(toRaw.keepScrollPosition)
        : false;
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

    // 应用用户传入的路由参数（如果匹配成功）
    if (match) {
        applyRouteParams(match, toRaw, base, to);
    }

    return route;
}
