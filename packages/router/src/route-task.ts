import { createRoute } from './route';
import { RouteStatus } from './types';
import type {
    Route,
    RouteConfirmHook,
    RouteConfirmHookResult,
    RouterParsedOptions
} from './types';
import { isValidConfirmHookResult } from './util';

export interface RouteTaskOptions {
    to: Route;
    from: Route | null;
    tasks: RouteTask[];
    options: RouterParsedOptions;
}

export async function createRouteTask(opts: RouteTaskOptions) {
    const { to, from, tasks } = opts;
    for (const item of tasks) {
        let result: RouteConfirmHookResult | null = null;
        try {
            result = await item.task(to, from);
        } catch (e) {
            console.error(`[${item.name}] route confirm hook error: ${e}`);
            to.status = RouteStatus.error;
            break;
        }
        if (!isValidConfirmHookResult(result)) continue;
        if (typeof result === 'function') {
            // 导航确认成功
            to.status = RouteStatus.success;
            to.handle = result;
            break;
        }
        if (
            result === false ||
            (result instanceof Boolean && !result.valueOf())
        ) {
            // 导航被终止
            to.status = RouteStatus.aborted;
            break;
        }
        // 导航重定向
        return createRouteTask({
            ...opts,
            to: createRoute(opts.options, to.type, result, to.url),
            from: to
        });
    }
    return to;
}

export enum RouteTaskType {
    location = 'location',
    env = 'env',
    asyncComponent = 'asyncComponent',
    beforeEach = 'beforeEach',
    push = 'push',
    replace = 'replace',
    popstate = 'popstate',
    reload = 'reload',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow',
    afterEach = 'afterEach'
}

export interface RouteTask {
    name: RouteTaskType;
    task: RouteConfirmHook;
}
