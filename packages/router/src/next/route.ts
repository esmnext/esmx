import { parseLocation } from './location';
import {
    type Route,
    type RouteConfirmHook,
    type RouteLocationRaw,
    RouteStatus,
    type RouteType,
    type RouterParsedOptions
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
        status: RouteStatus.resolve,
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
export interface RouteTaskOptions {
    navigationType: RouteType;
    toRaw: RouteLocationRaw;
    from: Route | null;
    options: RouterParsedOptions;
    tasks: RouteTask[];
}

export async function createRouteTask(opts: RouteTaskOptions) {
    const to: Route = createRoute(
        opts.navigationType,
        opts.toRaw,
        opts.options,
        opts.from?.url ?? null
    );
    const from: Route | null = opts.from;
    const list: Array<RouteTask> = [];
    for (const item of list) {
        let result: unknown | boolean | RouteLocationRaw | null = null;
        let isError = false;
        try {
            result = await item.task(to, from);
        } catch (e) {
            console.error(`[${item.name}] route confirm hook error: ${e}`);
            isError = true;
        }
        if (isError) {
            // 任务处理失败
            to.status = RouteStatus.error;
            break;
        } else if (result === false) {
            // 导航被取消
            to.status = RouteStatus.aborted;
            break;
        } else if (result === true) {
            // 导航被确认
            to.status = RouteStatus.success;
            break;
        } else if (result) {
            // 重定向
            return createRouteTask({
                navigationType: opts.navigationType,
                toRaw: result,
                from,
                options: opts.options,
                tasks: opts.tasks
            });
        }
    }
    return to;
}

export interface RouteTask {
    name: string;
    task: RouteConfirmHook;
}
