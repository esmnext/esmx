import { LAYER_ID } from './increment-id';
import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { createRoute } from './route';
import { type RouteTask, RouteTaskType, createRouteTask } from './route-task';
import { AFTER_TASKS, BEFORE_TASKS } from './route-task-config';
import { RouteType } from './types';
import type {
    Route,
    RouteConfirmHook,
    RouteHandleHook,
    RouteLocationRaw,
    RouteNotifyHook,
    RouteState,
    RouterLayerOptions,
    RouterLayerResult,
    RouterOptions,
    RouterParsedOptions
} from './types';
import { isESModule, isValidConfirmHookResult, removeFromArray } from './util';

export class Router {
    public readonly options: RouterOptions;
    public readonly parsedOptions: RouterParsedOptions;
    public readonly isLayer: boolean;
    private _route: null | Route = null;
    private readonly _navigation: Navigation;
    private readonly _microApp: MicroApp = new MicroApp();
    private _destroys: Array<() => void> = [];

    private readonly _tasks: Record<RouteTaskType, RouteConfirmHook> = {
        [RouteTaskType.location]: (to, from) => {
            if (to.matched.length === 0) {
                return this.parsedOptions.location;
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
                to.state = this._navigation.push(to);
            };
        },
        [RouteTaskType.replace]: async () => {
            return async (to, from) => {
                this._route = to;
                this._microApp._update(this);
                this._applyReplace(to, from);
            };
        },
        [RouteTaskType.popstate]: async () => {
            return async (to, from) => {
                this._route = to;
                this._microApp._update(this);
                this._applyReplace(to, from);
            };
        },
        [RouteTaskType.reload]: async () => {
            return async (to, from) => {
                this._route = to;
                this._microApp._update(this, true);
                this._applyReplace(to, from);
            };
        },
        [RouteTaskType.pushWindow]: async () => {
            return this.parsedOptions.location;
        },
        [RouteTaskType.replaceWindow]: async (to) => {
            return this.parsedOptions.location;
        },
        [RouteTaskType.afterEach]: (to, from) => {
            for (const guard of this._guards.afterEach) {
                guard(to, from);
            }
        }
    };
    private _applyReplace(to: Route, from: Route | null) {
        // TODO: 只有 URL 变化了才更新导航
        to.state = this._navigation.replace(to);
    }
    private readonly _guards = {
        beforeEach: [] as RouteConfirmHook[],
        afterEach: [] as RouteNotifyHook[]
    };
    public get route() {
        if (this._route === null) {
            throw new Error(`Route is not ready.`);
        }
        return this._route;
    }
    public get id() {
        return this.parsedOptions.id;
    }
    public constructor(options: RouterOptions) {
        this.options = options;
        this.parsedOptions = parsedOptions(options);
        this.isLayer = this.parsedOptions.layer?.enable === true;

        this._navigation = new Navigation(
            this.parsedOptions,
            (url: string, state: RouteState) => {
                this._transitionTo(RouteType.none, {
                    url,
                    state
                });
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
    public resolve(toRaw: RouteLocationRaw): Route {
        return createRoute(
            this.parsedOptions,
            RouteType.none,
            toRaw,
            this._route?.url ?? null
        );
    }
    public async createLayer(
        toRaw: RouteLocationRaw,
        options?: RouterOptions
    ): Promise<{ promise: Promise<RouterLayerResult>; router: Router }> {
        const layer: Required<RouterLayerOptions> = {
            enable: true,
            params: {},
            shouldClose: () => false,
            autoPush: true,
            push: true,
            destroyed: () => {},
            ...options?.layer
        };
        const promise = new Promise<RouterLayerResult>((resolve) => {
            const destroyed = layer.destroyed;
            layer.destroyed = (result) => {
                if (result.type === 'push' && layer.autoPush) {
                    const href = result.route.url.href;
                    if (layer.push) {
                        this.push(href);
                    } else {
                        this.replace(href);
                    }
                }
                destroyed?.(result);
                resolve(result);
            };
        });
        const router = new Router({
            rootStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '1000',
                background: 'rgba(0, 0,0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            ...this.options,
            id: `${this.id}__route_layer__${LAYER_ID.generate()}`,
            ...options,
            layer
        });
        await router.replace(toRaw);
        return {
            promise,
            router
        };
    }
    public async pushLayer(
        toRaw: RouteLocationRaw,
        layer?: Partial<RouterLayerOptions>,
        options?: RouterOptions
    ): Promise<RouterLayerResult> {
        const { promise } = await this.createLayer(toRaw, {
            ...options,
            layer: {
                ...layer,
                ...options?.layer
            }
        });
        return promise;
    }
    public closeLayer() {
        if (this.isLayer) {
            this._destroys.push(() => {
                this.parsedOptions.layer?.destroyed?.({
                    type: 'close',
                    route: this._route
                });
            });
            this.destroy();
        }
    }
    public async renderToString(throwError = false): Promise<string | null> {
        try {
            const result = await this._microApp.app?.renderToString?.();
            return result ?? null;
        } catch (e) {
            if (throwError) throw e;
            else console.error(e);
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
        this._destroys.forEach((func) => func());
        this._destroys.splice(0);
    }
    private async _transitionTo(
        toType: RouteType,
        toRaw: RouteLocationRaw
    ): Promise<Route> {
        const { _tasks, parsedOptions: options, _route: from } = this;
        const to = await this._runTask(
            BEFORE_TASKS,
            createRoute(options, toType, toRaw, from?.url ?? null),
            from
        );
        if (typeof to.handle === 'function') {
            to.handleResult = await to.handle(to, from);
            await this._runTask(AFTER_TASKS, to, from);
        }
        return createRouteTask({
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
    }
    private _runTask(
        config: Record<RouteType, RouteTaskType[]>,
        to: Route,
        from: Route | null
    ) {
        const names: RouteTaskType[] = to.type ? config[to.type] : [];
        const { _tasks, parsedOptions: options } = this;
        const tasks = names.map<RouteTask>((name) => ({
            name,
            task: _tasks[name]
        }));
        return createRouteTask({
            options,
            to,
            from,
            tasks
        });
    }
}
