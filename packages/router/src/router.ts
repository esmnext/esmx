import { LAYER_ID } from './increment-id';
import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { Route } from './route';
import {
    type RouteTask,
    RouteTaskController,
    RouteTaskType,
    createRouteTask
} from './route-task';
import { BEFORE_TASKS } from './route-task-config';
import { RouteStatus, RouteType, RouterMode } from './types';
import type {
    RouteConfirmHook,
    RouteHandleHook,
    RouteLocationRaw,
    RouteMatchType,
    RouteNotifyHook,
    RouteState,
    RouterLayerOptions,
    RouterLayerResult,
    RouterOptions,
    RouterParsedOptions
} from './types';
import {
    isRouteMatched,
    isUrlEqual,
    isValidConfirmHookResult,
    removeFromArray
} from './util';

export class Router {
    public readonly options: RouterOptions;
    public readonly parsedOptions: RouterParsedOptions;
    public readonly isLayer: boolean;
    private _route: null | Route = null;
    public readonly navigation: Navigation;
    public readonly microApp: MicroApp = new MicroApp();
    private _destroys: Array<() => void> = [];

    // 任务控制器相关
    private _taskId = 0;

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
            for (const guard of this._guards.beforeEach) {
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
                this._route = to;
                this.microApp._update(this);
                // 变化时执行 push，未变化执行 replace
                if (!isUrlEqual(to.url, from?.url)) {
                    const newState = this.navigation.push(to);
                    to.mergeState(newState);
                } else {
                    const newState = this.navigation.replace(to);
                    to.mergeState(newState);
                }
            };
        },
        [RouteTaskType.replace]: async () => {
            return async (to, from) => {
                this._route = to;
                this.microApp._update(this);
                // 始终执行替换
                const newState = this.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.popstate]: async () => {
            return async (to, from) => {
                this._route = to;
                this.microApp._update(this);
                // 有变化时执行 replace
                if (!isUrlEqual(to.url, from?.url)) {
                    const newState = this.navigation.replace(to);
                    to.mergeState(newState);
                }
            };
        },
        [RouteTaskType.restartApp]: async () => {
            return async (to, from) => {
                this._route = to;
                this.microApp._update(this, true);
                const newState = this.navigation.replace(to);
                to.mergeState(newState);
            };
        },
        [RouteTaskType.pushWindow]: async () => {
            return this.parsedOptions.location;
        },
        [RouteTaskType.replaceWindow]: async (to) => {
            return this.parsedOptions.location;
        }
    };

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

        this.navigation = new Navigation(
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
    public replace(toRaw: RouteLocationRaw): Promise<Route> {
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
    public restartApp(): Promise<Route>;
    public restartApp(toRaw: RouteLocationRaw): Promise<Route>;
    public restartApp(toRaw?: RouteLocationRaw | undefined): Promise<Route> {
        return this._transitionTo(
            RouteType.restartApp,
            toRaw ?? this.route.url.href
        );
    }
    public async back(): Promise<Route | null> {
        const result = await this.navigation.go(-1);
        if (result === null) {
            // 调用 onBackNoResponse 钩子
            if (this.parsedOptions.onBackNoResponse) {
                this.parsedOptions.onBackNoResponse(this);
            }
            return null;
        }
        return this._transitionTo(RouteType.back, {
            url: result.url,
            state: result.state
        });
    }
    public async go(index: number): Promise<Route | null> {
        // go(0) 在浏览器中会刷新页面，但在路由库中我们直接返回 null
        if (index === 0) {
            return null;
        }

        const result = await this.navigation.go(index);
        if (result === null) {
            // 当向后导航无响应时调用 onBackNoResponse 钩子
            if (index < 0 && this.parsedOptions.onBackNoResponse) {
                this.parsedOptions.onBackNoResponse(this);
            }
            return null;
        }
        return this._transitionTo(RouteType.go, {
            url: result.url,
            state: result.state
        });
    }
    public async forward(): Promise<Route | null> {
        const result = await this.navigation.go(1);
        if (result === null) {
            return null;
        }
        return this._transitionTo(RouteType.forward, {
            url: result.url,
            state: result.state
        });
    }
    /**
     * 解析路由位置而不进行实际导航
     *
     * 此方法用于解析路由配置并返回对应的路由对象，但不会触发实际的页面导航。
     * 主要用于以下场景：
     * - 生成链接URL而不进行跳转
     * - 预检查路由匹配情况
     * - 获取路由参数、元信息等
     * - 测试路由配置的有效性
     *
     * @param toRaw 目标路由位置，可以是字符串路径或路由配置对象
     * @returns 解析后的路由对象，包含完整的路由信息
     *
     * @example
     * ```typescript
     * // 解析字符串路径
     * const route = router.resolve('/user/123');
     * const url = route.url.href; // 获取完整URL
     *
     * // 解析命名路由
     * const userRoute = router.resolve({
     *   name: 'user',
     *   params: { id: '123' }
     * });
     * console.log(userRoute.params.id); // '123'
     *
     * // 检查路由有效性
     * const testRoute = router.resolve('/some/path');
     * if (testRoute.matched.length > 0) {
     *   // 路由匹配成功
     * }
     * ```
     */
    public resolve(toRaw: RouteLocationRaw): Route {
        return new Route({
            options: this.parsedOptions,
            toType: RouteType.none,
            toRaw,
            from: this._route?.url ?? null
        });
    }

    /**
     * 判断路由是否匹配当前路由
     *
     * @param targetRoute 要比较的目标路由对象
     * @param matchType 匹配类型
     * - 'route': 路由级匹配，比较路由配置是否相同
     * - 'exact': 完全匹配，比较路径是否完全相同
     * - 'include': 包含匹配，判断当前路径是否包含目标路径
     * @returns 是否匹配
     */
    public isRouteMatched(
        targetRoute: Route,
        matchType: RouteMatchType
    ): boolean {
        const currentRoute = this._route;
        if (!currentRoute) return false;

        return isRouteMatched(targetRoute, currentRoute, matchType);
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
            mode: RouterMode.abstract,
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
            id: `${this.id}__route_layer__${LAYER_ID.next()}`,
            ...options,
            onBackNoResponse: (router) => {
                // 当返回操作无响应时，关闭弹层
                router.closeLayer();
                // 如果原有 onBackNoResponse 存在，也调用它
                options?.onBackNoResponse?.(router);
            },
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
            const result = await this.microApp.app?.renderToString?.();
            return result ?? null;
        } catch (e) {
            if (throwError) throw e;
            else console.error(e);
            return null;
        }
    }
    public beforeEach(guard: RouteConfirmHook): () => void {
        this._guards.beforeEach.push(guard);
        // 返回清理函数
        return () => {
            removeFromArray(this._guards.beforeEach, guard);
        };
    }

    public afterEach(guard: RouteNotifyHook): () => void {
        this._guards.afterEach.push(guard);
        // 返回清理函数
        return () => {
            removeFromArray(this._guards.afterEach, guard);
        };
    }
    public destroy() {
        // 重置任务ID为0，取消所有正在进行的任务
        this._taskId = 0;

        this.navigation.destroy();
        this.microApp.destroy();
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
            new Route({ options, toType, toRaw, from: from?.url ?? null }),
            from
        );
        if (typeof to.handle === 'function') {
            to.handleResult = await to.handle(to, from);
        }

        // 导航完成后，只有在状态为 success 时才调用 afterEach 守卫
        // 这确保了只有成功的导航才会触发 afterEach，被取消的导航不会触发
        if (to.status === RouteStatus.success) {
            for (const guard of this._guards.afterEach) {
                guard(to, from);
            }
        }

        return to;
    }
    private _runTask(
        config: Record<RouteType, RouteTaskType[]>,
        to: Route,
        from: Route | null
    ) {
        this._taskId++;

        const names: RouteTaskType[] = to.type ? config[to.type] : [];
        const { _tasks, parsedOptions: options } = this;
        const tasks = names.map<RouteTask>((name) => ({
            name,
            task: _tasks[name]
        }));

        // 直接构造 controller 对象
        const controller = new RouteTaskController(() => this._taskId);

        return createRouteTask({
            options,
            to,
            from,
            tasks,
            controller
        });
    }
}
