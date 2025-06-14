import { Route } from './route';
import { RouteStatus } from './types';
import type {
    RouteConfirmHook,
    RouteConfirmHookResult,
    RouterParsedOptions
} from './types';
import { isValidConfirmHookResult } from './util';

/**
 * 路由任务控制器
 * 用于控制任务的执行和取消
 */
export class RouteTaskController {
    private _aborted = false;

    /**
     * 创建路由任务控制器
     */
    constructor() {
        // 每次创建任务都是新实例，默认未中断
    }

    /**
     * 终止当前任务
     */
    abort(): void {
        this._aborted = true;
    }

    /**
     * 检查任务是否被取消
     * @param name 当前任务名称，用于日志
     * @returns 如果任务应该被取消返回 true，否则返回 false
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
     * 路由任务控制器（可选）
     * 用于控制任务的执行和取消
     */
    controller?: RouteTaskController;
}

export async function createRouteTask(opts: RouteTaskOptions) {
    const { to, from, tasks, controller } = opts;

    // 开始执行任务时，将状态从 resolved 改为 pending
    if (to.status === RouteStatus.resolved) {
        to.status = RouteStatus.pending;
    }

    for (const task of tasks) {
        // 任务执行前检查是否应该被取消
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

        // 任务执行后检查是否应该被取消
        if (controller?.shouldCancel(task.name)) {
            to.status = RouteStatus.aborted;
            break;
        }

        if (!isValidConfirmHookResult(result)) continue;
        if (typeof result === 'function') {
            // 导航确认成功
            to.status = RouteStatus.success;
            to.handle = result;
            break;
        }
        if (result === false) {
            // 导航被终止
            to.status = RouteStatus.aborted;
            break;
        }
        // 导航重定向，传递控制器
        return createRouteTask({
            ...opts,
            to: new Route({
                options: opts.options,
                toType: to.type,
                toInput: result,
                from: to.url
            }),
            from: to,
            controller
        });
    }

    // 所有任务执行完成，但没有返回handle函数
    // 如果状态仍为pending，说明任务链执行完成但没有获得处理函数，标识为失败
    if (to.status === RouteStatus.pending) {
        to.status = RouteStatus.error;
    }

    return to;
}

export enum RouteTaskType {
    location = 'location',
    env = 'env',
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
