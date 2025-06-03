import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import {
    type RouteTask,
    type RouteTaskCallback,
    type RouteTaskContext,
    createRouteTask,
    parseRoute
} from './route';
import { NavigationType } from './types';
import type {
    EnvBridge,
    Route,
    RouteState,
    RouterOptions,
    RouterParsedOptions,
    RouterRawLocation
} from './types';
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class TaskType {
    public static outside = 'outside';
    public static envBridge = 'envBridge';
    public static applyRoute = 'applyRoute';
    public static push = 'push';
    public static replace = 'replace';
    public static open = 'open';
    public static reload = 'reload';
}

export class Router {
    private _options: RouterOptions;
    public options: RouterParsedOptions;
    private _route: null | Route = null;
    private _navigation: Navigation;
    private _microApp: MicroApp = new MicroApp();

    private _tasks = {
        // 检查是否是外部链接
        [TaskType.outside]: (ctx: RouteTaskContext) => {
            if (ctx.to.matched.length === 0) {
                ctx.options.onOpen(ctx.to);
                return ctx.finish();
            }
        },
        [TaskType.envBridge]: async (ctx: RouteTaskContext) => {
            const { to } = ctx;
            if (!to.config || !to.config.env) {
                return;
            }
            let envBridge: EnvBridge | null = null;
            if (typeof to.config.env === 'function') {
                envBridge = to.config.env;
            } else if (typeof to.config.env === 'object') {
                const { require, handle } = to.config.env;
                if (typeof require === 'function' && require(to)) {
                    envBridge = handle || null;
                } else {
                    envBridge = handle || null;
                }
            }
            if (envBridge) {
                envBridge(to);
                ctx.finish();
            }
        },
        // 应用当前的 URL
        [TaskType.applyRoute]: (ctx: RouteTaskContext) => {
            this._route = ctx.to;
            this._microApp._update(this);
        },
        [TaskType.push]: (ctx: RouteTaskContext) => {
            this._navigation.push(ctx.to);
            ctx.finish();
        },
        [TaskType.replace]: (ctx: RouteTaskContext) => {
            this._navigation.push(ctx.to);
            ctx.finish();
        },
        [TaskType.open]: (ctx: RouteTaskContext) => {
            ctx.options.onOpen(ctx.to);
            ctx.finish();
        },
        [TaskType.reload]: (ctx: RouteTaskContext) => {
            this._microApp._update(this);
            ctx.finish();
        }
    } satisfies Record<string, RouteTaskCallback>;
    private _taskMaps = {
        [NavigationType.push]: [
            TaskType.outside,
            TaskType.envBridge,
            TaskType.applyRoute,
            TaskType.push
        ],
        [NavigationType.replace]: [
            TaskType.outside,
            TaskType.envBridge,
            TaskType.applyRoute,
            TaskType.replace
        ],
        [NavigationType.openWindow]: [
            TaskType.outside,
            TaskType.envBridge,
            TaskType.open
        ],
        [NavigationType.replaceWindow]: [
            TaskType.outside,
            TaskType.envBridge,
            TaskType.open
        ],
        [NavigationType.reload]: [TaskType.outside, TaskType.reload],
        [NavigationType.back]: [TaskType.outside],
        [NavigationType.go]: [TaskType.outside],
        [NavigationType.forward]: [TaskType.outside],
        [NavigationType.popstate]: [TaskType.outside]
    } satisfies Record<string, TaskType[]>;

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
                return this._transitionTo(NavigationType.push, {
                    url,
                    state
                });
            }
        );
    }
    public push(location: RouterRawLocation): Promise<Route> {
        return this._transitionTo(NavigationType.push, location);
    }
    public replace(location: RouterRawLocation) {
        return this._transitionTo(NavigationType.replace, location);
    }
    public openWindow(location?: RouterRawLocation): Promise<Route> {
        return this._transitionTo(
            NavigationType.openWindow,
            location ?? this.route.url.href
        );
    }
    public replaceWindow(location?: RouterRawLocation): Promise<Route> {
        return this._transitionTo(
            NavigationType.replaceWindow,
            location ?? this.route.url.href
        );
    }
    public reload(location?: RouterRawLocation): Promise<Route> {
        return this._transitionTo(
            NavigationType.reload,
            location ?? this.route.url.href
        );
    }
    public async back(): Promise<Route | null> {
        const result = await this._navigation.go(-1);
        if (result === null) {
            return null;
        }
        return this._transitionTo(NavigationType.back, {
            url: result.url,
            state: result.state
        });
    }
    public async go(index: number): Promise<Route | null> {
        const result = await this._navigation.go(index);
        if (result === null) {
            return null;
        }
        return this._transitionTo(NavigationType.go, {
            url: result.url,
            state: result.state
        });
    }
    public createLayer(options?: RouterOptions): Router {
        return new Router({
            ...this._options,
            ...options
        });
    }
    public async forward(): Promise<Route | null> {
        const result = await this._navigation.go(1);
        if (result === null) {
            return null;
        }
        return this._transitionTo(NavigationType.back, {
            url: result.url,
            state: result.state
        });
    }
    public resolve(loc: RouterRawLocation): Route {
        return parseRoute(NavigationType.resolve, this.options, loc);
    }

    public pushLayer(loc: RouterRawLocation) {}
    private _transitionTo(
        navigationType: NavigationType,
        to: RouterRawLocation
    ) {
        const names: string[] = this._taskMaps[navigationType] ?? [];
        const { _tasks } = this;
        const tasks = names.map((name) => {
            return {
                name,
                task: _tasks[name]
            } satisfies RouteTask;
        });
        return createRouteTask({
            navigationType,
            to,
            from: this._route,
            options: this.options
        })
            .add(...tasks)
            .run();
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
