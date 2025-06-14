import { Route } from './route';
import {
    type RouteTask,
    RouteTaskController,
    RouteTaskType,
    createRouteTask
} from './route-task';
import type { Router } from './router';
import { RouteStatus, RouteType } from './types';
import type {
    RouteConfirmHook,
    RouteHandleHook,
    RouteLocationInput,
    RouteNotifyHook
} from './types';
import {
    isRouteMatched,
    isUrlEqual,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

// 任务配置 - 从 route-task-config.ts 合并过来
const BEFORE_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.push
    ],
    [RouteType.replace]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replace
    ],
    [RouteType.pushWindow]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.pushWindow
    ],
    [RouteType.replaceWindow]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replaceWindow
    ],
    [RouteType.restartApp]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.restartApp
    ],
    [RouteType.back]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.go]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.forward]: [
        RouteTaskType.location,
        RouteTaskType.env,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.none]: []
};

/**
 * 路由转换器
 * 负责管理所有路由转换逻辑，包括守卫执行、任务处理、状态更新等
 */
export class RouteTransition {
    private readonly router: Router;

    // 当前路由状态 - 从 Router 迁移过来
    private _route: Route | null = null;

    // 任务控制器
    private _taskController: RouteTaskController | null = null;

    // 守卫数组（从 Router 移动，改为 guards）
    public readonly guards = {
        beforeEach: [] as RouteConfirmHook[],
        afterEach: [] as RouteNotifyHook[]
    };

    // 任务定义 - 完全按照原 Router 的逻辑
    private readonly _tasks: Record<RouteTaskType, RouteConfirmHook> = {
        [RouteTaskType.location]: (to, from) => {
            if (to.matched.length === 0) {
                return this.router.parsedOptions.location;
            }
        },
        [RouteTaskType.env]: async (to, from) => {
            if (!to.config || !to.config.env) {
                return;
            }
            let routeHandle: RouteHandleHook | null = null;
            if (typeof to.config.env === 'function') {
                routeHandle = to.config.env;
            } else if (typeof to.config.env === 'object') {
                const { require, handle } = to.config.env;
                if (typeof require === 'function' && require(to, from)) {
                    routeHandle = handle || null;
                } else {
                    routeHandle = handle || null;
                }
            }
            if (routeHandle) {
                return routeHandle;
            }
        },
        [RouteTaskType.asyncComponent]: async (to, from) => {
            await Promise.all(
                to.matched.map(async (matched) => {
                    const { asyncComponent, component } = matched;
                    if (!component && typeof asyncComponent === 'function') {
                        try {
                            const result = await asyncComponent();
                            matched.component = result;
                        } catch {
                            throw new Error(
                                `Async component '${matched.compilePath}' is not a valid component.`
                            );
                        }
                    }
                })
            );
        },
        [RouteTaskType.beforeEach]: async (to, from) => {
            for (const guard of this.guards.beforeEach) {
                const result = await guard(to, from);
                if (isValidConfirmHookResult(result)) {
                    return result;
                }
            }
        },
        [RouteTaskType.beforeLeave]: async (to, from) => {
            if (!from?.matched.length) return;

            // 找出需要离开的路由（在 from 中但不在 to 中的路由）
            const leavingRoutes = from.matched.filter(
                (fromRoute) =>
                    !to.matched.some((toRoute) => toRoute === fromRoute)
            );

            // 按照从子路由到父路由的顺序执行 beforeLeave
            for (let i = leavingRoutes.length - 1; i >= 0; i--) {
                const route = leavingRoutes[i];
                if (route.beforeLeave) {
                    const result = await route.beforeLeave(to, from);
                    if (isValidConfirmHookResult(result)) {
                        return result;
                    }
                }
            }
        },
        [RouteTaskType.beforeEnter]: async (to, from) => {
            if (!to.matched.length) return;

            // 找出需要进入的路由（在 to 中但不在 from 中的路由）
            const enteringRoutes = to.matched.filter(
                (toRoute) =>
                    !from?.matched.some((fromRoute) => fromRoute === toRoute)
            );

            // 按照从父路由到子路由的顺序执行 beforeEnter
            for (const route of enteringRoutes) {
                if (route.beforeEnter) {
                    const result = await route.beforeEnter(to, from);
                    if (isValidConfirmHookResult(result)) {
                        return result;
                    }
                }
            }
        },
        [RouteTaskType.beforeUpdate]: async (to, from) => {
            // beforeUpdate 只在完全相同的路由组合中的参数变化时执行
            // 快速检查：如果连最终路由配置都不同，肯定不是相同组合
            if (!isRouteMatched(to, from, 'route')) return;

            // 详细检查：两个路由的 matched 数组必须完全相同
            if (!from || to.matched.length !== from.matched.length) return;
            const isSameRouteSet = to.matched.every(
                (toRoute, index) => toRoute === from.matched[index]
            );
            if (!isSameRouteSet) return;

            // 只有在路径参数或查询参数变化时才执行 beforeUpdate
            if (!isRouteMatched(to, from, 'exact')) {
                // 按照从父路由到子路由的顺序执行 beforeUpdate
                for (const route of to.matched) {
                    if (route.beforeUpdate) {
                        const result = await route.beforeUpdate(to, from);
                        if (isValidConfirmHookResult(result)) {
                            return result;
                        }
                    }
                }
            }
        },
        [RouteTaskType.push]: async () => {
            return async (to, from) => {
                // 更新内部路由状态
                this._route = to;
                this.router.microApp._update(this.router);
                // 变化时执行 push，未变化执行 replace
                if (!isUrlEqual(to.url, from?.url)) {
                    const newState = this.router.navigation.push(to);
                    to.mergeState(newState);
                } else {
                    const newState = this.router.navigation.replace(to);
                    to.mergeState(newState);
                }
            };
        },
        [RouteTaskType.replace]: async () => {
            return async (to, from) => {
                // 更新内部路由状态
                this._route = to;
                this.router.microApp._update(this.router);
                // 始终执行替换
                const newState = this.router.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.popstate]: async () => {
            return async (to, from) => {
                // 更新内部路由状态
                this._route = to;
                this.router.microApp._update(this.router);
                // 有变化时执行 replace
                if (!isUrlEqual(to.url, from?.url)) {
                    const newState = this.router.navigation.replace(to);
                    to.mergeState(newState);
                }
            };
        },
        [RouteTaskType.restartApp]: async () => {
            return async (to, from) => {
                // 更新内部路由状态
                this._route = to;
                this.router.microApp._update(this.router, true);
                const newState = this.router.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.pushWindow]: async () => {
            return this.router.parsedOptions.location;
        },
        [RouteTaskType.replaceWindow]: async (to) => {
            return this.router.parsedOptions.location;
        }
    };

    constructor(router: Router) {
        this.router = router;
    }

    get route(): Route | null {
        return this._route;
    }

    public beforeEach(guard: RouteConfirmHook): () => void {
        this.guards.beforeEach.push(guard);
        // 返回清理函数
        return () => {
            removeFromArray(this.guards.beforeEach, guard);
        };
    }

    public afterEach(guard: RouteNotifyHook): () => void {
        this.guards.afterEach.push(guard);
        // 返回清理函数
        return () => {
            removeFromArray(this.guards.afterEach, guard);
        };
    }

    public abort(): void {
        this._taskController?.abort();
    }

    public destroy(): void {
        // 终止当前任务
        this._taskController?.abort();
        this._taskController = null;
    }

    // 核心路由转换方法 - 完全按照原 Router 的 _transitionTo 逻辑
    public async to(
        toType: RouteType,
        toInput: RouteLocationInput
    ): Promise<Route> {
        const { _tasks } = this;
        const from = this._route;
        const to = await this._runTask(
            BEFORE_TASKS,
            new Route({
                options: this.router.parsedOptions,
                toType,
                toInput,
                from: from?.url ?? null
            }),
            from
        );
        if (typeof to.handle === 'function') {
            to.handleResult = await to.handle(to, from);
        }

        // 导航完成后，只有在状态为 success 时才调用 afterEach 守卫
        // 这确保了只有成功的导航才会触发 afterEach，被取消的导航不会触发
        if (to.status === RouteStatus.success) {
            for (const guard of this.guards.afterEach) {
                guard(to, from);
            }
        }

        return to;
    }

    // 运行任务 - 完全按照原 Router 的 _runTask 逻辑
    private _runTask(
        config: Record<RouteType, RouteTaskType[]>,
        to: Route,
        from: Route | null
    ) {
        // 终止之前的任务
        this._taskController?.abort();

        // 创建新的任务控制器
        this._taskController = new RouteTaskController();

        const names: RouteTaskType[] = to.type ? config[to.type] : [];
        const { _tasks } = this;
        const tasks = names.map<RouteTask>((name) => ({
            name,
            task: _tasks[name]
        }));

        return createRouteTask({
            options: this.router.parsedOptions,
            to,
            from,
            tasks,
            controller: this._taskController
        });
    }
}
