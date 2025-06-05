import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { createRoute } from './route';
import { type RouteTask, RouteTaskType, createRouteTask } from './route-task';
import { AFTER_TASKS, BEFORE_TASKS } from './route-task-config';
import {
    type Route,
    type RouteConfirmHook,
    type RouteHandleHook,
    type RouteLocationRaw,
    type RouteNotifyHook,
    type RouteState,
    RouteType,
    type RouterOptions,
    type RouterParsedOptions
} from './types';
import { isESModule, isValidConfirmHookResult, removeFromArray } from './util';

export class Router {
    private _options: RouterOptions;
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    private _tasks: Record<RouteTaskType, RouteConfirmHook> = {
        [RouteTaskType.location]: (to, from) => {
            if (to.matched.length === 0) {
                return this.options.location;
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
                            matched.component = isESModule(result)
                                ? result.default
                                : result;
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
            for (const guard of this._guards.beforeEach) {
                const result = await guard(to, from);
                if (isValidConfirmHookResult(result)) {
                    return result;
                }
            }
        },
        [RouteTaskType.push]: async () => {
            return async (to) => {
                this._route = to;
                this._microApp._update(this);
                this._navigation.push(to);
            };
        },
        [RouteTaskType.replace]: async () => {
            return async (to) => {
                this._route = to;
                this._microApp._update(this);
                this._navigation.push(to);
            };
        },
        [RouteTaskType.popstate]: async () => {
            return async (to) => {
                this._route = to;
                this._microApp._update(this);
                // TODO: 只有 URL 变化了才更新导航
                this._navigation.replace(to);
            };
        },
        [RouteTaskType.reload]: async () => {
            return async (to) => {
                this._route = to;
                this._microApp._update(this, true);
                this._navigation.replace(to);
            };
        },
        [RouteTaskType.pushWindow]: async () => {
            return this.options.location;
        },
        [RouteTaskType.replaceWindow]: async (to) => {
            return this.options.location;
        },
        [RouteTaskType.afterEach]: (to, from) => {
            for (const guard of this._guards.afterEach) {
                guard(to, from);
            }
        }
    };
    private _guards = {
        beforeEach: [] as RouteConfirmHook[],
        afterEach: [] as RouteNotifyHook[]
    };
    public get route() {
        if (this._route === null) {
            throw new Error(`Route is not ready.`);
        }
        return this._route;
    }
    public constructor(options: RouterOptions) {
        this._options = options;
        this.options = parsedOptions(options);
        this._navigation = new Navigation(
            this.options,
            (url: string, state: RouteState) => {
                this.popstate({ url, state });
            }
        );
    }
    public push(toRaw: RouteLocationRaw): Promise<Route> {
        return this._transitionTo(RouteType.push, toRaw);
    }
    public replace(toRaw: RouteLocationRaw) {
        return this._transitionTo(RouteType.replace, toRaw);
    }
    public pushWindow(toRaw?: RouteLocationRaw): Promise<Route> {
        return this._transitionTo(
            RouteType.pushWindow,
            toRaw ?? this.route.url.href
        );
    }
    public replaceWindow(toRaw?: RouteLocationRaw): Promise<Route> {
        return this._transitionTo(
            RouteType.replaceWindow,
            toRaw ?? this.route.url.href
        );
    }
    public reload(toRaw?: RouteLocationRaw): Promise<Route> {
        return this._transitionTo(
            RouteType.reload,
            toRaw ?? this.route.url.href
        );
    }
    public async back(): Promise<Route | null> {
        const result = await this._navigation.go(-1);
        if (result === null) {
            return null;
        }
        return this._transitionTo(RouteType.back, {
            url: result.url,
            state: result.state
        });
    }
    public async go(index: number): Promise<Route | null> {
        const result = await this._navigation.go(index);
        if (result === null) {
            return null;
        }
        return this._transitionTo(RouteType.go, {
            url: result.url,
            state: result.state
        });
    }
    public async forward(): Promise<Route | null> {
        const result = await this._navigation.go(1);
        if (result === null) {
            return null;
        }
        return this._transitionTo(RouteType.back, {
            url: result.url,
            state: result.state
        });
    }
    public popstate(toRaw: RouteLocationRaw) {
        return this._transitionTo(RouteType.popstate, toRaw);
    }
    public resolve(toRaw: RouteLocationRaw): Route {
        return createRoute(this.options, null, toRaw, this._route?.url ?? null);
    }
    public createLayer(options?: RouterOptions): Router {
        return new Router({
            ...this._options,
            ...options
        });
    }
    public pushLayer(toRaw: RouteLocationRaw) {}
    public async renderToString(throwError = false): Promise<string | null> {
        try {
            const result = await this._microApp.app?.renderToString?.();
            return result ?? null;
        } catch (e) {
            if (throwError) {
                throw e;
            } else {
                console.error(e);
            }
            return null;
        }
    }
    public beforeEach(guard: RouteConfirmHook) {
        this._guards.beforeEach.push(guard);
    }
    public unBeforeEach(guard: RouteConfirmHook) {
        removeFromArray(this._guards.beforeEach, guard);
    }
    public afterEach(guard: RouteNotifyHook) {
        this._guards.afterEach.push(guard);
    }
    public unAfterEach(guard: RouteNotifyHook) {
        removeFromArray(this._guards.afterEach, guard);
    }
    public destroy() {
        this._navigation.destroy();
        this._microApp.destroy();
    }
    private async _transitionTo(
        toType: RouteType,
        toRaw: RouteLocationRaw
    ): Promise<Route> {
        const { _tasks, options, _route: from } = this;
        const to = await this._runTask(
            BEFORE_TASKS,
            createRoute(options, toType, toRaw, from?.url ?? null),
            from
        );
        if (typeof to.handle === 'function') {
            to.handleResult = await to.handle(to, from);
            await this._runTask(AFTER_TASKS, to, from);
        }
        await createRouteTask({
            options,
            to,
            from,
            tasks: [
                {
                    name: RouteTaskType.afterEach,
                    task: _tasks[RouteTaskType.afterEach]
                }
            ]
        });
        return to;
    }
    private _runTask(
        config: Record<RouteType, RouteTaskType[]>,
        to: Route,
        from: Route | null
    ) {
        const names: RouteTaskType[] = to.type ? config[to.type] : [];
        const { _tasks, options } = this;
        const tasks: RouteTask[] = names.map((name) => {
            return {
                name,
                task: _tasks[name]
            } satisfies RouteTask;
        });
        return createRouteTask({
            options,
            to,
            from,
            tasks
        });
    }
}
