import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { type RouteTask, createRoute, createRouteTask } from './route';
import {
    type Route,
    type RouteConfirmHook,
    type RouteHandleHook,
    type RouteLocationRaw,
    type RouteNotifyHook,
    type RouteState,
    RouteStatus,
    RouteType,
    type RouterOptions,
    type RouterParsedOptions
} from './types';
import { isESModule, isValidConfirmHookResult, removeFromArray } from './util';
class TaskType {
    public static location = 'location';
    public static env = 'env';
    public static asyncComponent = 'asyncComponent';
    public static beforeEach = 'beforeEach';
    public static afterEach = 'afterEach';
}

export class Router {
    private _options: RouterOptions;
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    private _tasks = {
        [TaskType.location]: (to, from) => {
            if (to.matched.length === 0) {
                return true;
            }
            return null;
        },
        [TaskType.env]: async (to, from) => {
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
                to.config.env = routeHandle;
                return true;
            }
        },
        [TaskType.asyncComponent]: async (to, from) => {
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
                                `Async component '${matched.absolutePath}' is not a valid component.`
                            );
                        }
                    }
                })
            );
        },
        [TaskType.beforeEach]: async (to, from) => {
            for (const guard of this._guards.beforeEach) {
                const result = await guard(to, from);
                if (isValidConfirmHookResult(result)) {
                    return result;
                }
            }
        },
        [TaskType.afterEach]: (to, from) => {
            for (const guard of this._guards.afterEach) {
                guard(to, from);
            }
            return true;
        }
    } satisfies Record<string, RouteConfirmHook>;
    private _taskMaps = {
        [RouteType.push]: [
            TaskType.location,
            TaskType.env,
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.replace]: [
            TaskType.location,
            TaskType.env,
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.pushWindow]: [
            TaskType.location,
            TaskType.asyncComponent,
            TaskType.env,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.replaceWindow]: [
            TaskType.location,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.reload]: [
            TaskType.location,
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.back]: [
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.go]: [
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.forward]: [
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ],
        [RouteType.popstate]: [
            TaskType.asyncComponent,
            TaskType.beforeEach,
            TaskType.afterEach
        ]
    } satisfies Record<string, TaskType[]>;
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
        return createRoute(
            RouteType.resolve,
            toRaw,
            this.options,
            this._route?.url ?? null
        );
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
        navigationType: RouteType,
        toRaw: RouteLocationRaw
    ) {
        const names: string[] = this._taskMaps[navigationType] ?? [];
        const { _tasks, options, _route: from } = this;
        const tasks: RouteTask[] = names.map((name) => {
            return {
                name,
                task: _tasks[name]
            } satisfies RouteTask;
        });
        const to = await createRouteTask({
            navigationType,
            toRaw,
            from,
            options,
            tasks
        });
        if (to.status === RouteStatus.success) {
            // 没有匹配到任何路由，或者是打开新窗口，都是要调用 location 钩子函数
            if (to.matched.length === 0) {
                to.handleResult = await this.options.location(to, from);
                return to;
            }
            // 更新导航
            switch (to.type) {
                case RouteType.push:
                    this._route = to;
                    this._microApp._update(this);
                    this._navigation.push(to);
                    break;
                case RouteType.replace:
                    this._route = to;
                    this._microApp._update(this);
                    this._navigation.replace(to);
                    break;
                case RouteType.back:
                case RouteType.go:
                case RouteType.forward:
                case RouteType.popstate:
                    this._route = to;
                    this._microApp._update(this);
                    // TODO: 只有 URL 变化了才更新导航
                    this._navigation.replace(to);
                    break;
                case RouteType.reload:
                    this._route = to;
                    this._microApp._update(this, true);
                    this._navigation.replace(to);
                    break;
                case RouteType.pushWindow:
                case RouteType.replaceWindow:
                    to.handleResult = await this.options.location(to, from);
                    break;
            }
        }
        return to;
    }
}
