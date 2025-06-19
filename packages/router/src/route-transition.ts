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

// Task configuration - This structure defines the sequence of tasks for each route type.
const BEFORE_TASKS: Record<RouteType, RouteTaskType[]> = {
    [RouteType.push]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.push
    ],
    [RouteType.replace]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replace
    ],
    [RouteType.pushWindow]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.pushWindow
    ],
    [RouteType.replaceWindow]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.replaceWindow
    ],
    [RouteType.restartApp]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.restartApp
    ],
    [RouteType.back]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.go]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
        RouteTaskType.beforeLeave,
        RouteTaskType.beforeEach,
        RouteTaskType.beforeUpdate,
        RouteTaskType.beforeEnter,
        RouteTaskType.asyncComponent,
        RouteTaskType.popstate
    ],
    [RouteType.forward]: [
        RouteTaskType.fallback,
        RouteTaskType.override,
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
 * Route Transition Manager
 * Responsible for managing all route transition logic, including guard execution,
 * task processing, and status updates.
 */
export class RouteTransition {
    private readonly router: Router;

    public route: Route | null = null;

    // Task controller for the current transition.
    private _controller: RouteTaskController | null = null;

    // Guard arrays, responsible for storing navigation guards.
    public readonly guards = {
        beforeEach: [] as RouteConfirmHook[],
        afterEach: [] as RouteNotifyHook[]
    };

    // Task definitions - follows the original Router logic for each task type.
    private readonly _tasks: Record<RouteTaskType, RouteConfirmHook> = {
        [RouteTaskType.fallback]: (to, from) => {
            if (to.matched.length === 0) {
                return this.router.parsedOptions.fallback;
            }
        },
        [RouteTaskType.override]: async (to, from) => {
            if (!to.config || !to.config.override) {
                return;
            }
            // Skip override during initial route loading
            if (!from) {
                return;
            }
            const overrideHandler = await to.config.override(to, from);
            if (typeof overrideHandler === 'function') {
                return overrideHandler;
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

            // Find routes that need to be left (routes in 'from' but not in 'to').
            const leavingRoutes = from.matched.filter(
                (fromRoute) =>
                    !to.matched.some((toRoute) => toRoute === fromRoute)
            );

            // Execute beforeLeave guards in order from child to parent.
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

            // Find routes that need to be entered (routes in 'to' but not in 'from').
            const enteringRoutes = to.matched.filter(
                (toRoute) =>
                    !from?.matched.some((fromRoute) => fromRoute === toRoute)
            );

            // Execute beforeEnter guards in order from parent to child.
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
            // beforeUpdate is only executed when parameters change within the exact same route combination.
            // Quick check: if the final route configs are different, it's definitely not the same combination.
            if (!isRouteMatched(to, from, 'route')) return;

            // Detailed check: the 'matched' arrays of both routes must be identical.
            if (!from || to.matched.length !== from.matched.length) return;
            const isSameRouteSet = to.matched.every(
                (toRoute, index) => toRoute === from.matched[index]
            );
            if (!isSameRouteSet) return;

            // Only execute beforeUpdate when path parameters or query parameters change.
            if (!isRouteMatched(to, from, 'exact')) {
                // Execute beforeUpdate guards in order from parent to child.
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
                // Update internal route state.
                this.route = to;
                this.router.microApp._update(this.router);
                // Execute push on change, replace if unchanged.
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
                // Update internal route state.
                this.route = to;
                this.router.microApp._update(this.router);
                // Always execute replace.
                const newState = this.router.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.popstate]: async () => {
            return async (to, from) => {
                // Update internal route state.
                this.route = to;
                this.router.microApp._update(this.router);
                // Execute replace on change.
                if (!isUrlEqual(to.url, from?.url)) {
                    const newState = this.router.navigation.replace(to);
                    to.mergeState(newState);
                }
            };
        },
        [RouteTaskType.restartApp]: async () => {
            return async (to, from) => {
                // Update internal route state.
                this.route = to;
                this.router.microApp._update(this.router, true);
                const newState = this.router.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.pushWindow]: async () => {
            return this.router.parsedOptions.fallback;
        },
        [RouteTaskType.replaceWindow]: async (to) => {
            return this.router.parsedOptions.fallback;
        }
    };

    constructor(router: Router) {
        this.router = router;
    }

    public beforeEach(guard: RouteConfirmHook): () => void {
        this.guards.beforeEach.push(guard);
        // Return a cleanup function.
        return () => {
            removeFromArray(this.guards.beforeEach, guard);
        };
    }

    public afterEach(guard: RouteNotifyHook): () => void {
        this.guards.afterEach.push(guard);
        // Return a cleanup function.
        return () => {
            removeFromArray(this.guards.afterEach, guard);
        };
    }

    public destroy(): void {
        // Abort the current task.
        this._controller?.abort();
        this._controller = null;
    }

    // Core route transition method - follows the original Router's _transitionTo logic.
    public async to(
        toType: RouteType,
        toInput: RouteLocationInput
    ): Promise<Route> {
        const from = this.route;
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

        // After navigation is complete, only call afterEach guards if the status is 'success'.
        // This ensures that only successful navigations trigger afterEach, while cancelled ones do not.
        if (to.status === RouteStatus.success) {
            for (const guard of this.guards.afterEach) {
                guard(to, from);
            }
        }

        return to;
    }

    // Run task - follows the original Router's _runTask logic.
    private _runTask(
        config: Record<RouteType, RouteTaskType[]>,
        to: Route,
        from: Route | null
    ) {
        // Abort previous tasks.
        this._controller?.abort();

        // Create a new task controller.
        this._controller = new RouteTaskController();

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
            controller: this._controller
        });
    }
}
