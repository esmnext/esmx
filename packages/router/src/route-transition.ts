import { Route } from './route';
import {
    type RouteTask,
    RouteTaskController,
    createRouteTask
} from './route-task';
import type { Router } from './router';
import {
    getSavedScrollPosition,
    saveScrollPosition,
    scrollToPosition,
    winScrollPos
} from './scroll';
import { RouteType } from './types';

import type {
    RouteConfirmHook,
    RouteConfirmHookResult,
    RouteHandleHook,
    RouteLocationInput,
    RouteNotifyHook
} from './types';
import {
    isBrowser,
    isRouteMatched,
    isUrlEqual,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

/**
 * Route transition hooks responsible for handling different stages of the navigation process.
 * Each hook is responsible for a specific aspect of route transition.
 */
export const ROUTE_TRANSITION_HOOKS = {
    async fallback(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        if (to.matched.length === 0) {
            return router.parsedOptions.fallback;
        }
    },

    async override(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        const result = await to.config?.override?.(to, from, router);
        if (isValidConfirmHookResult(result)) {
            return result;
        }
    },

    async asyncComponent(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
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

    async beforeLeave(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        if (!from?.matched.length) return;

        // Find routes that need to be left (routes in 'from' but not in 'to').
        const leavingRoutes = from.matched.filter(
            (fromRoute) => !to.matched.some((toRoute) => toRoute === fromRoute)
        );

        // Execute beforeLeave guards in order from child to parent.
        for (let i = leavingRoutes.length - 1; i >= 0; i--) {
            const route = leavingRoutes[i];
            if (route.beforeLeave) {
                const result = await route.beforeLeave(to, from, router);
                if (isValidConfirmHookResult(result)) {
                    return result;
                }
            }
        }
    },

    async beforeEnter(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        if (!to.matched.length) return;

        // Find routes that need to be entered (routes in 'to' but not in 'from').
        const enteringRoutes = to.matched.filter(
            (toRoute) =>
                !from?.matched.some((fromRoute) => fromRoute === toRoute)
        );

        // Execute beforeEnter guards in order from parent to child.
        for (const route of enteringRoutes) {
            if (route.beforeEnter) {
                const result = await route.beforeEnter(to, from, router);
                if (isValidConfirmHookResult(result)) {
                    return result;
                }
            }
        }
    },

    async beforeUpdate(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
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
                    const result = await route.beforeUpdate(to, from, router);
                    if (isValidConfirmHookResult(result)) {
                        return result;
                    }
                }
            }
        }
    },

    async beforeEach(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        // Access the transition instance from the router to get guards
        const transition = router.transition;
        for (const guard of transition.guards.beforeEach) {
            const result = await guard(to, from, router);
            if (isValidConfirmHookResult(result)) {
                return result;
            }
        }
    },

    async confirm(
        to: Route,
        from: Route | null,
        router: Router
    ): Promise<RouteConfirmHookResult> {
        if (to.confirm) {
            const result = await to.confirm(to, from, router);
            if (isValidConfirmHookResult(result)) {
                return result;
            }
        }

        if (isBrowser && 'scrollRestoration' in window.history)
            window.history.scrollRestoration = 'manual';
        // handle scroll position
        if (from && isBrowser && !router.isLayer)
            switch (to.type) {
                case RouteType.push:
                case RouteType.replace: {
                    if (!to.keepScrollPosition) {
                        saveScrollPosition(from.url.href);
                        scrollToPosition({ left: 0, top: 0 });
                    } else {
                        to.applyNavigationState({
                            __keepScrollPosition: to.keepScrollPosition
                        });
                    }
                    break;
                }
                case RouteType.go:
                case RouteType.forward:
                case RouteType.back:
                // for popstate
                case RouteType.unknown: {
                    saveScrollPosition(from.url.href);
                    setTimeout(async () => {
                        const state = window.history.state;
                        if (state?.__keepScrollPosition) {
                            return;
                        }
                        const savedPosition = getSavedScrollPosition(
                            to.url.href,
                            { left: 0, top: 0 }
                        );
                        if (!savedPosition) return;
                        await router.parsedOptions.nextTick();
                        scrollToPosition(savedPosition);
                    });
                    break;
                }
            }

        switch (to.type) {
            case RouteType.push:
                return ROUTE_TYPE_HANDLERS.push;
            case RouteType.replace:
                return ROUTE_TYPE_HANDLERS.replace;
            case RouteType.restartApp:
                return ROUTE_TYPE_HANDLERS.restartApp;
            case RouteType.pushWindow:
                return ROUTE_TYPE_HANDLERS.pushWindow;
            case RouteType.replaceWindow:
                return ROUTE_TYPE_HANDLERS.replaceWindow;
            case RouteType.pushLayer:
                return ROUTE_TYPE_HANDLERS.pushLayer;
            default:
                return ROUTE_TYPE_HANDLERS.default;
        }
    }
} satisfies Record<string, RouteConfirmHook>;

/**
 * Route type handlers configuration.
 * Maps each route type to its corresponding navigation handler function.
 * These handlers perform the actual navigation operations like updating browser state,
 * managing micro-app updates, and handling different navigation patterns.
 */
export const ROUTE_TYPE_HANDLERS = {
    push(to, from, router) {
        router.transition.route = to;
        router.microApp._update(router);
        if (!isUrlEqual(to.url, from?.url)) {
            const newState = router.navigation.push(to.state, to.url);
            to.applyNavigationState(newState);
        } else {
            const newState = router.navigation.replace(to.state, to.url);
            to.applyNavigationState(newState);
        }
    },
    replace(to, from, router) {
        router.transition.route = to;
        router.microApp._update(router);
        const newState = router.navigation.replace(to.state, to.url);
        to.applyNavigationState(newState);
    },
    restartApp(to, from, router) {
        router.transition.route = to;
        router.microApp._update(router, true);
        const newState = router.navigation.replace(to.state, to.url);
        to.applyNavigationState(newState);
    },
    pushWindow(to, from, router) {
        return router.parsedOptions.fallback(to, from, router);
    },
    replaceWindow(to, from, router) {
        return router.parsedOptions.fallback(to, from, router);
    },
    async pushLayer(to, from, router) {
        const { promise } = await router.createLayer(to);
        return promise;
    },
    default(to, from, router) {
        router.transition.route = to;
        router.microApp._update(router);
        if (!isUrlEqual(to.url, from?.url)) {
            const newState = router.navigation.replace(to.state, to.url);
            to.applyNavigationState(newState);
        }
    }
} satisfies Record<string, RouteHandleHook>;

/**
 * Route transition pipeline configuration.
 * Defines the sequence of hooks and guards that should be executed for each route type.
 * The order matters: hooks are executed sequentially from first to last.
 *
 * Pipeline stages:
 * - fallback: Handle unmatched routes
 * - override: Allow route override logic
 * - beforeLeave: Execute before leaving current route
 * - beforeEach: Global navigation guard
 * - beforeUpdate: Execute before updating route (same component)
 * - beforeEnter: Execute before entering new route
 * - asyncComponent: Load async components
 * - confirm: Final confirmation and navigation execution
 */
const ROUTE_TRANSITION_PIPELINE = {
    [RouteType.push]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        ROUTE_TRANSITION_HOOKS.override,
        ROUTE_TRANSITION_HOOKS.beforeLeave,
        ROUTE_TRANSITION_HOOKS.beforeEach,
        ROUTE_TRANSITION_HOOKS.beforeUpdate,
        ROUTE_TRANSITION_HOOKS.beforeEnter,
        ROUTE_TRANSITION_HOOKS.asyncComponent,
        ROUTE_TRANSITION_HOOKS.confirm
    ],

    [RouteType.replace]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        ROUTE_TRANSITION_HOOKS.override,
        ROUTE_TRANSITION_HOOKS.beforeLeave,
        ROUTE_TRANSITION_HOOKS.beforeEach,
        ROUTE_TRANSITION_HOOKS.beforeUpdate,
        ROUTE_TRANSITION_HOOKS.beforeEnter,
        ROUTE_TRANSITION_HOOKS.asyncComponent,
        ROUTE_TRANSITION_HOOKS.confirm
    ],
    [RouteType.pushWindow]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        ROUTE_TRANSITION_HOOKS.override,
        // ROUTE_TRANSITION_HOOKS.beforeLeave
        ROUTE_TRANSITION_HOOKS.beforeEach,
        // ROUTE_TRANSITION_HOOKS.beforeUpdate
        // ROUTE_TRANSITION_HOOKS.beforeEnter
        // ROUTE_TRANSITION_HOOKS.asyncComponent
        ROUTE_TRANSITION_HOOKS.confirm
    ],

    [RouteType.replaceWindow]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        ROUTE_TRANSITION_HOOKS.override,
        ROUTE_TRANSITION_HOOKS.beforeLeave,
        ROUTE_TRANSITION_HOOKS.beforeEach,
        // ROUTE_TRANSITION_HOOKS.beforeUpdate
        // ROUTE_TRANSITION_HOOKS.beforeEnter
        // ROUTE_TRANSITION_HOOKS.asyncComponent
        ROUTE_TRANSITION_HOOKS.confirm
    ],
    [RouteType.pushLayer]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        ROUTE_TRANSITION_HOOKS.override,
        // ROUTE_TRANSITION_HOOKS.beforeLeave
        ROUTE_TRANSITION_HOOKS.beforeEach,
        // ROUTE_TRANSITION_HOOKS.beforeUpdate
        // ROUTE_TRANSITION_HOOKS.beforeEnter
        // ROUTE_TRANSITION_HOOKS.asyncComponent
        ROUTE_TRANSITION_HOOKS.confirm
    ],
    [RouteType.restartApp]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        // ROUTE_TRANSITION_HOOKS.override,
        ROUTE_TRANSITION_HOOKS.beforeLeave,
        ROUTE_TRANSITION_HOOKS.beforeEach,
        ROUTE_TRANSITION_HOOKS.beforeUpdate,
        ROUTE_TRANSITION_HOOKS.beforeEnter,
        ROUTE_TRANSITION_HOOKS.asyncComponent,
        ROUTE_TRANSITION_HOOKS.confirm
    ],

    [RouteType.unknown]: [
        ROUTE_TRANSITION_HOOKS.fallback,
        // ROUTE_TRANSITION_HOOKS.override,
        ROUTE_TRANSITION_HOOKS.beforeLeave,
        ROUTE_TRANSITION_HOOKS.beforeEach,
        ROUTE_TRANSITION_HOOKS.beforeUpdate,
        ROUTE_TRANSITION_HOOKS.beforeEnter,
        ROUTE_TRANSITION_HOOKS.asyncComponent,
        ROUTE_TRANSITION_HOOKS.confirm
    ]
} satisfies Record<string, RouteConfirmHook[]>;

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

    constructor(router: Router) {
        this.router = router;
    }

    public beforeEach(guard: RouteConfirmHook): () => void {
        this.guards.beforeEach.push(guard);
        return () => {
            removeFromArray(this.guards.beforeEach, guard);
        };
    }

    public afterEach(guard: RouteNotifyHook): () => void {
        this.guards.afterEach.push(guard);
        return () => {
            removeFromArray(this.guards.afterEach, guard);
        };
    }

    public destroy(): void {
        this._controller?.abort();
        this._controller = null;
    }

    public async to(
        toType: RouteType,
        toInput: RouteLocationInput
    ): Promise<Route> {
        const from = this.route;
        const to = await this._runTask(
            new Route({
                options: this.router.parsedOptions,
                toType,
                toInput,
                from: from?.url ?? null
            }),
            from
        );
        if (typeof to.handle === 'function') {
            to.handleResult = await to.handle(to, from, this.router);
        }

        if (to.handle) {
            for (const guard of this.guards.afterEach) {
                guard(to, from, this.router);
            }
        }

        return to;
    }

    private async _runTask(to: Route, from: Route | null): Promise<Route> {
        this._controller?.abort();
        this._controller = new RouteTaskController();
        const taskFunctions: RouteConfirmHook[] =
            ROUTE_TRANSITION_PIPELINE[to.type] ||
            ROUTE_TRANSITION_PIPELINE[RouteType.unknown];
        const tasks = taskFunctions.map<RouteTask>((taskFn) => ({
            name: taskFn.name,
            task: taskFn
        }));

        return createRouteTask({
            to,
            from,
            tasks,
            controller: this._controller,
            router: this.router
        });
    }
}
