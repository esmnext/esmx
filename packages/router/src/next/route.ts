import { parseLocation } from './location';
import type {
    Awaitable,
    Route,
    RouteMatchResult,
    RouteRawLocation,
    RouteType,
    RouterParsedOptions
} from './types';

export function parseRoute(
    navigationType: RouteType,
    options: RouterParsedOptions,
    raw: RouteRawLocation
): Route {
    const { base, normalizeURL } = options;
    const loc = normalizeURL(parseLocation(raw, base), raw);
    // 处理外站逻辑
    if (loc.origin !== base.origin) {
        return createRoute(navigationType, raw, loc, base);
    }
    if (loc.pathname.length < base.pathname.length) {
        return createRoute(navigationType, raw, loc, base);
    }
    // 匹配路由
    const matched = options.matcher(loc, base);
    // 没有匹配任何路由
    if (matched.matches.length === 0) {
        return createRoute(navigationType, raw, loc, base);
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
    return createRoute(navigationType, raw, loc, base, matched);
}

export function createRoute(
    navigationType: RouteType,
    raw: RouteRawLocation,
    loc: URL,
    base: URL,
    match?: RouteMatchResult
): Route {
    const route: Route = {
        type: navigationType,
        url: loc,
        params: {},
        query: {},
        queryArray: {},
        state: typeof raw === 'object' && raw.state ? raw.state : {},
        meta: {},
        path: loc.pathname,
        fullPath: loc.pathname + loc.search + loc.hash,
        matched: [],
        matchConfig: null
    };

    for (const key of loc.searchParams.keys()) {
        const values = loc.searchParams.getAll(key);
        route.query[key] = values[0] || '';
        route.queryArray[key] = values;
    }
    if (match) {
        route.matchConfig = match.matches[match.matches.length - 1];
        route.meta = route.matchConfig.meta || {};
        route.path = loc.pathname.substring(base.pathname.length - 1);
        route.fullPath = `${route.path}${loc.search}${loc.hash}`;
        route.matched = match.matches;
    }
    return route;
}

export function createRouteTask(opts: RouteTaskOptions) {
    let finish = false;
    const ctx = {
        navigationType: opts.navigationType,
        to: parseRoute(opts.navigationType, opts.options, opts.to),
        from: opts.from,
        options: opts.options,
        finish() {
            finish = true;
        },
        async redirect(to: RouteRawLocation) {
            finish = true;
            this.to = await createRouteTask({
                ...opts,
                to
            }).run();
        }
    };
    const list: Array<RouteTask> = [];
    return {
        add(...items: RouteTask[]) {
            list.push(...items);
            return this;
        },
        async run() {
            for (const item of list) {
                await item.task(ctx);
                if (finish) {
                    break;
                }
            }
            return ctx.to;
        }
    };
}

export interface RouteTaskOptions {
    navigationType: RouteType;
    to: RouteRawLocation;
    from: Route | null;
    options: RouterParsedOptions;
}
export interface RouteTaskContext {
    navigationType: RouteType;
    to: Route;
    from: Route | null;
    options: RouterParsedOptions;
    finish: () => void;
    redirect: (to: RouteRawLocation) => Promise<void>;
}

export interface RouteTask {
    name: string;
    task: RouteTaskCallback;
}

export type RouteTaskCallback = (ctx: RouteTaskContext) => Awaitable<void>;
