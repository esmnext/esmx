import { Route } from './route';
import { RouteStatus } from './types';
import type {
    RouteConfirmHook,
    RouteConfirmHookResult,
    RouterParsedOptions
} from './types';
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

    /**
     * Checks if the task has been cancelled.
     * @param name - The name of the current task, for logging purposes.
     * @returns True if the task should be cancelled, false otherwise.
     */
    shouldCancel(name: string): boolean {
        if (this._aborted) {
            console.warn(`[${name}] route task cancelled`);
            return true;
        }
        return false;
    }
}

export interface RouteTaskOptions {
    to: Route;
    from: Route | null;
    tasks: RouteTask[];
    options: RouterParsedOptions;
    /**
     * Optional route task controller.
     * Used to control the execution and cancellation of the task.
     */
    controller?: RouteTaskController;
}

export async function createRouteTask(opts: RouteTaskOptions) {
    const { to, from, tasks, controller } = opts;

    // When starting the task, change the status from resolved to pending.
    if (to.status === RouteStatus.resolved) {
        to.status = RouteStatus.pending;
    }

    for (const task of tasks) {
        // Check if the task should be cancelled before execution.
        if (controller?.shouldCancel(task.name)) {
            to.status = RouteStatus.aborted;
            break;
        }

        let result: RouteConfirmHookResult | null = null;
        try {
            result = await task.task(to, from);
        } catch (e) {
            console.error(`[${task.name}] route confirm hook error: ${e}`);
            to.status = RouteStatus.error;
            break;
        }

        // Check if the task should be cancelled after execution.
        if (controller?.shouldCancel(task.name)) {
            to.status = RouteStatus.aborted;
            break;
        }

        if (!isValidConfirmHookResult(result)) continue;
        if (typeof result === 'function') {
            // Navigation confirmed successfully.
            to.status = RouteStatus.success;
            to.handle = result;
            break;
        }
        if (result === false) {
            // Navigation was aborted.
            to.status = RouteStatus.aborted;
            break;
        }
        // Navigation is redirected, pass the controller.
        const nextTo = new Route({
            options: opts.options,
            toType: to.type,
            toInput: result,
            from: to.url
        });
        if (isUrlEqual(nextTo.url, to.url)) {
            console.error(
                `[@esmx/router] Detected a self-redirection to "${to.fullPath}". Aborting navigation.`
            );
            to.status = RouteStatus.error;
            break;
        }
        return createRouteTask({
            ...opts,
            to: nextTo,
            from: to,
            controller
        });
    }

    // All tasks have been executed, but no handle function was returned.
    // If the status is still pending, it means the task chain completed without a handler, marking it as an error.
    if (to.status === RouteStatus.pending) {
        to.status = RouteStatus.error;
    }

    return to;
}

export enum RouteTaskType {
    location = 'location',
    override = 'override',
    asyncComponent = 'asyncComponent',
    beforeEach = 'beforeEach',
    beforeEnter = 'beforeEnter',
    beforeUpdate = 'beforeUpdate',
    beforeLeave = 'beforeLeave',
    push = 'push',
    replace = 'replace',
    popstate = 'popstate',
    restartApp = 'restartApp',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow'
}

export interface RouteTask {
    name: RouteTaskType;
    task: RouteConfirmHook;
}
