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
                ctx.options.onOpen(ctx.to);
                return ctx.finish();
            }
        },
        [TaskType.callBridge]: async (ctx: RouteTaskContext) => {
            const { to } = ctx;
            if (!to.matchConfig || !to.matchConfig.env) {
                return;
            }
            let envBridge: EnvBridge | null = null;
            if (typeof to.matchConfig.env === 'function') {
                envBridge = to.matchConfig.env;
            } else if (typeof to.matchConfig.env === 'object') {
                const { require, handle } = to.matchConfig.env;
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
        [TaskType.asyncComponent]: async (ctx: RouteTaskContext) => {},
        [TaskType.applyApp]: (ctx: RouteTaskContext) => {
            this._route = ctx.to;
            this._microApp._update(
                this,
                ctx.navigationType === NavigationType.reload
            );
        },
        [TaskType.applyNavigation]: (ctx: RouteTaskContext) => {
            this._navigation.push(ctx.to);
            ctx.finish();
        },
        [TaskType.applyWindow]: (ctx: RouteTaskContext) => {
            ctx.options.onOpen(ctx.to);
            ctx.finish();
        }
    } satisfies Record<string, RouteTaskCallback>;
    private _taskMaps = {
        [NavigationType.push]: [
            TaskType.outside,
            TaskType.callBridge,
            TaskType.applyApp,
            TaskType.applyNavigation
        ],
        [NavigationType.replace]: [
            TaskType.outside,
            TaskType.applyApp,
            TaskType.applyNavigation
        ],
        [NavigationType.openWindow]: [
            TaskType.outside,
            TaskType.callBridge,
            TaskType.applyWindow
        ],
        [NavigationType.replaceWindow]: [
            TaskType.outside,
            TaskType.applyWindow
        ],
        [NavigationType.reload]: [TaskType.outside, TaskType.applyApp],
        [NavigationType.back]: [TaskType.applyApp],
        [NavigationType.go]: [TaskType.applyApp],
        [NavigationType.forward]: [TaskType.applyApp],
        [NavigationType.popstate]: [TaskType.applyApp]
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
