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
    private readonly initId: number;
    private readonly getId: () => number;

    /**
     * 创建路由任务控制器
     * @param getId 获取当前任务ID的函数
     */
    constructor(getId: () => number) {
        this.getId = getId;
        this.initId = getId();
    }

    /**
     * 检查任务是否应该被取消
     * @param name 当前任务名称，用于日志
     * @returns 如果任务应该被取消返回 true，否则返回 false
     */
    shouldCancel(name: string): boolean {
        const id = this.getId();
        if (id !== this.initId) {
            console.warn(
                `[${name}] route task cancelled after execution due to task id change (${this.initId} -> ${id})`
            );
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
                toRaw: result,
                from: to.url
            }),
            from: to,
            controller
        });
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
