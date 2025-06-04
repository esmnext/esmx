import { parseLocation } from './location';
import type {
    Awaitable,
    Route,
    RouteHandleResult,
    RouteLocationRaw,
    RouteType,
    RouterParsedOptions
} from './types';

export function createRoute(
    navigationType: RouteType,
    toRaw: RouteLocationRaw,
    options: RouterParsedOptions,
    from: URL | null
): Route {
    const { base, normalizeURL } = options;
    const to = normalizeURL(parseLocation(toRaw, base), from);
    const isSameOrigin = to.origin === base.origin;
    const isSameBase = to.pathname.length >= base.pathname.length;
    const match = isSameOrigin && isSameBase ? options.matcher(to, base) : null;
    const route: Route = {
        handleResult: null,
        req: null,
        res: null,
        type: navigationType,
        url: to,
        params: {},
        query: {},
        queryArray: {},
        state: typeof toRaw === 'object' && toRaw.state ? toRaw.state : {},
        meta: {},
        path: to.pathname,
        fullPath: to.pathname + to.search + to.hash,
        matched: [],
        config: null
    };

    for (const key of to.searchParams.keys()) {
        const values = to.searchParams.getAll(key);
        route.query[key] = values[0] || '';
        route.queryArray[key] = values;
    }
    if (match) {
        route.config = match.matches[match.matches.length - 1];
        route.meta = route.config.meta || {};
        route.path = to.pathname.substring(options.base.pathname.length - 1);
        route.fullPath = `${route.path}${to.search}${to.hash}`;
        route.matched = match.matches;
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

export async function createRouteTask(opts: RouteTaskOptions) {
    let finish = false;
    const ctx: RouteTaskContext = {
        to: createRoute(
            opts.navigationType,
            opts.toRaw,
            opts.options,
            opts.from?.url ?? null
        ),
        from: opts.from,
        options: opts.options,
        finish(result: RouteHandleResult = null) {
            this.to.handleResult =
                result && typeof result === 'object' ? result : null;
            finish = true;
        },
        async redirect(to: RouteLocationRaw) {
            finish = true;
            this.to = await createRouteTask({
                ...opts,
                toRaw: to
            });
        }
    };
    const list: Array<RouteTask> = [];
    for (const item of list) {
        await item.task(ctx);
        if (finish) {
            break;
        }
    }
    return ctx.to;
}

export interface RouteTaskOptions {
    navigationType: RouteType;
    toRaw: RouteLocationRaw;
    from: Route | null;
    options: RouterParsedOptions;
    tasks: RouteTask[];
}
export interface RouteTaskContext {
    to: Route;
    from: Route | null;
    options: RouterParsedOptions;
    finish: (result?: RouteHandleResult) => void;
    redirect: (to: RouteLocationRaw) => Promise<void>;
}

export interface RouteTask {
    name: string;
    task: RouteTaskCallback;
}

export type RouteTaskCallback = (ctx: RouteTaskContext) => Awaitable<void>;
