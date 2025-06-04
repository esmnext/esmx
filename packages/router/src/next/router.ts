import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import {
    type RouteTask,
    type RouteTaskCallback,
    type RouteTaskContext,
    createRoute,
    createRouteTask
} from './route';
import {
    type Route,
    type RouteHandleHook,
    type RouteLocationRaw,
    type RouteNotifyHook,
    type RouteState,
    RouteType,
    type RouterOptions,
    type RouterParsedOptions
} from './types';
import { isESModule } from './util';
class TaskType {
    public static outside = 'outside';
    public static callBridge = 'callBridge';
    public static asyncComponent = 'asyncComponent';
    public static applyApp = 'applyApp';
    public static applyNavigation = 'applyNavigation';
    public static applyWindow = 'applyWindow';
}

export class Router {
    private _options: RouterOptions;
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    private _tasks = {
        [TaskType.outside]: (ctx: RouteTaskContext) => {
            if (ctx.to.matched.length === 0) {
                ctx.options.location(ctx.to, ctx.from);
                return ctx.finish();
            }
        },
        [TaskType.callBridge]: async (ctx: RouteTaskContext) => {
            const { to } = ctx;
            if (!to.config || !to.config.env) {
                return;
            }
            let routeHandle: RouteHandleHook | null = null;
            if (typeof to.config.env === 'function') {
                routeHandle = to.config.env;
            } else if (typeof to.config.env === 'object') {
                const { require, handle } = to.config.env;
                if (
                    typeof require === 'function' &&
                    require(ctx.to, ctx.from)
                ) {
                    routeHandle = handle || null;
                } else {
                    routeHandle = handle || null;
                }
            }
            if (routeHandle) {
                ctx.finish(await routeHandle(ctx.to, ctx.from));
            }
        },
        [TaskType.asyncComponent]: async (ctx: RouteTaskContext) => {
            return Promise.all(
                ctx.to.matched.map(async (matched) => {
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
        [TaskType.applyApp]: (ctx: RouteTaskContext) => {
            this._route = ctx.to;
            this._microApp._update(this, ctx.to.type === RouteType.reload);
        },
        [TaskType.applyNavigation]: (ctx: RouteTaskContext) => {
            this._navigation.push(ctx.to);
            ctx.finish();
        },
        [TaskType.applyWindow]: (ctx: RouteTaskContext) => {
            ctx.options.location(ctx.to, ctx.from);
            ctx.finish();
        }
    } satisfies Record<string, RouteTaskCallback>;
    private _taskMaps = {
        [RouteType.push]: [
            TaskType.outside,
            TaskType.callBridge,
            TaskType.asyncComponent,
            TaskType.applyApp,
            TaskType.applyNavigation
        ],
        [RouteType.replace]: [
            TaskType.outside,
            TaskType.asyncComponent,
            TaskType.applyApp,
            TaskType.applyNavigation
        ],
        [RouteType.openWindow]: [
            TaskType.outside,
            TaskType.asyncComponent,
            TaskType.callBridge,
            TaskType.applyWindow
        ],
        [RouteType.replaceWindow]: [TaskType.outside, TaskType.applyWindow],
        [RouteType.reload]: [
            TaskType.outside,
            TaskType.asyncComponent,
            TaskType.applyApp
        ],
        [RouteType.back]: [TaskType.asyncComponent, TaskType.applyApp],
        [RouteType.go]: [TaskType.asyncComponent, TaskType.applyApp],
        [RouteType.forward]: [TaskType.asyncComponent, TaskType.applyApp],
        [RouteType.popstate]: [TaskType.asyncComponent, TaskType.applyApp]
    } satisfies Record<string, TaskType[]>;
    private _guards = {
        beforeEach: [],
        afterEach: []
    } satisfies Record<string, RouteNotifyHook[]>;
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
    public openWindow(toRaw?: RouteLocationRaw): Promise<Route> {
        return this._transitionTo(
            RouteType.openWindow,
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
    private _transitionTo(navigationType: RouteType, toRaw: RouteLocationRaw) {
        const names: string[] = this._taskMaps[navigationType] ?? [];
        const { _tasks } = this;
        const tasks: RouteTask[] = names.map((name) => {
            return {
                name,
                task: _tasks[name]
            } satisfies RouteTask;
        });
        return createRouteTask({
            navigationType,
            toRaw,
            from: this._route,
            options: this.options,
            tasks
        });
    }
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
    public destroy() {
        this._navigation.destroy();
        this._microApp.destroy();
    }
}
