import {
    RouteNavigationAbortedError,
    RouteSelfRedirectionError,
    RouteTaskCancelledError,
    RouteTaskExecutionError
} from './error';
import { Route } from './route';
import type { Router } from './router';
import type { RouteConfirmHook, RouteConfirmHookResult } from './types';
import { isUrlEqual, isValidConfirmHookResult } from './util';

/**
 * Controls the execution and cancellation of a route task.
 */
export class RouteTaskController {
    private _aborted = false;

    /**
     * Aborts the current task.
     */
    abort(): void {
        this._aborted = true;
    }

    shouldCancel(name: string): boolean {
        if (this._aborted) {
            return true;
        }
        return false;
    }
}

export interface RouteTaskOptions {
    to: Route;
    from: Route | null;
    tasks: RouteTask[];
    router: Router;
    /**
     * Optional route task controller.
     * Used to control the execution and cancellation of the task.
     */
    controller?: RouteTaskController;
}

export async function createRouteTask(opts: RouteTaskOptions): Promise<Route> {
    const { to, from, tasks, controller, router } = opts;

    for (const task of tasks) {
        if (controller?.shouldCancel(task.name)) {
            throw new RouteTaskCancelledError(task.name, to, from);
        }

        let result: RouteConfirmHookResult | null = null;
        try {
            result = await task.task(to, from, router);
        } catch (e) {
            throw new RouteTaskExecutionError(task.name, to, from, e);
        }

        if (controller?.shouldCancel(task.name)) {
            throw new RouteTaskCancelledError(task.name, to, from);
        }

        if (!isValidConfirmHookResult(result)) continue;
        if (typeof result === 'function') {
            to.handle = result;
            return to;
        }
        if (result === false) {
            throw new RouteNavigationAbortedError(task.name, to, from);
        }
        const nextTo = new Route({
            options: router.parsedOptions,
            toType: to.type,
            toInput: result,
            from: to.url
        });
        if (isUrlEqual(nextTo.url, to.url)) {
            throw new RouteSelfRedirectionError(to.fullPath, to, from);
        }
        return createRouteTask({
            ...opts,
            to: nextTo,
            from: to,
            controller
        });
    }
    return to;
}

export enum RouteTaskType {
    fallback = 'fallback',
    override = 'override',
    asyncComponent = 'asyncComponent',
    beforeEach = 'beforeEach',
    beforeEnter = 'beforeEnter',
    beforeUpdate = 'beforeUpdate',
    beforeLeave = 'beforeLeave',
    confirm = 'confirm'
}

export interface RouteTask {
    name: string;
    task: RouteConfirmHook;
}
