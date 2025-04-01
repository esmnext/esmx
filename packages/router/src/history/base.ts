import { type Tasks, createTasks } from '../task-pipe';
import type {
    Awaitable,
    NavigationGuard,
    NavigationGuardAfter,
    RouteRecord,
    RouterHistory,
    RouterInstance,
    RouterRawLocation
} from '../types';
import {
    isESModule,
    isEqualRoute,
    isSameRoute,
    normalizeLocation,
    stringifyPath
} from '../utils';

/**
 * 创建一个路由记录
 */
function createRouteRecord(route: Partial<RouteRecord> = {}): RouteRecord {
    return {
        base: '',
        path: '/',
        fullPath: '/',
        meta: {},
        matched: [],
        query: {},
        queryArray: {},
        params: {},
        hash: '',
        state: {},
        ...route
    };
}

export abstract class BaseRouterHistory implements RouterHistory {
    /**
     * 路由类实例
     */
    public router: RouterInstance;

    /**
     * 路由是否冻结
     */
    public get isFrozen() {
        return this.router.isFrozen;
    }

    /**
     * 匹配的当前路由
     */
    public current: RouteRecord = createRouteRecord();

    constructor(router: RouterInstance) {
        this.router = router;
        Object.defineProperty(this, 'router', {
            enumerable: false
        });
    }

    /**
     * 更新当前路由
     */
    updateRoute(route: RouteRecord) {
        this.current = route;
        this.router.updateRoute(route);
    }

    /**
     * 解析路由
     */
    resolve(location: RouterRawLocation): RouteRecord {
        const rawLocation =
            typeof location === 'string' ? { path: location } : location;
        if (rawLocation.path === undefined) {
            rawLocation.path = this.current.fullPath;
        }
        const { base, ...normalizedLocation } = normalizeLocation(
            rawLocation,
            this.router.base
        );

        // 匹配成功则返回匹配值
        const matcher = this.router.matcher.match(normalizedLocation, { base });
        if (matcher) {
            return matcher;
        }

        // 匹配失败则返回目标路径
        const {
            path = '',
            params = {},
            query = {},
            queryArray = {},
            hash = '',
            state = {}
        } = normalizedLocation;
        const route = createRouteRecord({
            base,
            fullPath: stringifyPath({
                pathname: path,
                query,
                queryArray,
                hash
            }),
            path,
            params,
            query,
            queryArray,
            hash,
            state
        });
        return route;
    }

    /**
     * 核心跳转方法
     */
    async transitionTo(
        location: RouterRawLocation,
        onComplete?: (route: RouteRecord) => void
    ) {
        if (this.isFrozen) return;
        // 寻找即将跳转路径匹配到的路由对象
        const route = this.resolve(location);

        this.abortTask();

        // 禁止重复跳转
        if (isEqualRoute(this.current, route)) {
            return;
        }

        await this.runTask(this.current, route, onComplete);
    }

    /**
     * TODO 逻辑解耦，抽离到task
     * 重定向方法
     */
    async redirectTo(
        location: RouterRawLocation,
        from: RouteRecord,
        onComplete?: (route: RouteRecord) => void
    ) {
        // 寻找即将跳转路径匹配到的路由对象
        const route = this.resolve(location);
        this.abortTask();

        // 禁止重复跳转
        if (isEqualRoute(this.current, route)) {
            return;
        }

        await this.runTask(
            this.current,
            {
                ...route,
                redirectedFrom: from
            },
            onComplete
        );
    }

    /* 当前执行的任务 */
    tasks: Tasks | null = null;

    /* 取消任务 */
    async abortTask() {
        this.tasks?.abort();
    }

    /**
     * 执行任务
     * 任务分为三部分: 前置守卫（beforeEach、beforeEnter、beforeUpdate、beforeLeave）、加载路由（loadRoute）、后置守卫（afterEach）
     * 根据触发方式不同,执行顺序分别为:
     * 进入路由时: beforeEach -> beforeEnter -> loadRoute -> afterEach
     * 更新路由时: beforeEach -> beforeUpdate -> afterEach
     * 离开路由进入新路由时: beforeLeave -> beforeEach -> beforeEnter -> loadRoute -> afterEach
     * @param from
     * @param to
     */
    async runTask(
        from: RouteRecord,
        to: RouteRecord,
        onComplete?: (route: RouteRecord) => void
    ) {
        const {
            beforeEach,
            beforeEnter,
            beforeUpdate,
            beforeLeave,
            afterEach,
            loadRoute
        } = getNavigationHooks(this.router, from, to);

        /* 前置钩子任务 */
        const guardBeforeTasks: Tasks<NavigationGuard> = createTasks();

        /* 后置钩子任务 */
        const guardAfterTasks: Tasks<NavigationGuardAfter> =
            createTasks<NavigationGuardAfter>();

        /* 加载路由任务 */
        const loadRouteTasks: Tasks<() => Awaitable<any>> =
            createTasks<() => Awaitable<any>>();

        if (isSameRoute(from, to)) {
            // from 和 to 是相同路由说明为更新路由
            guardBeforeTasks.add([...beforeEach, ...beforeUpdate]);

            guardAfterTasks.add(afterEach);
        } else {
            // 反之为进入新路由
            guardBeforeTasks.add([
                ...beforeLeave,
                ...beforeEach,
                ...beforeEnter
            ]);
            loadRouteTasks.add(loadRoute);

            guardAfterTasks.add(afterEach);
        }

        this.tasks = guardBeforeTasks;
        await guardBeforeTasks.run({
            cb: async (res) => {
                switch (typeof res) {
                    case 'boolean':
                        if (!res) {
                            this.tasks?.abort();
                        }
                        break;

                    case 'undefined':
                        break;

                    default:
                        await this.redirectTo(res, from, onComplete);
                        break;
                }
            },
            final: async () => {
                this.tasks = loadRouteTasks;
                await loadRouteTasks.run();
            }
        });

        if (this.tasks?.status === 'finished') {
            this.tasks = null;
            guardAfterTasks.run();

            onComplete && onComplete(to);
            this.updateRoute(to);
        }
    }

    /**
     * 新开浏览器窗口的方法，在服务端会调用 push 作为替代
     */
    abstract pushWindow(location: RouterRawLocation): void;

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     */
    abstract replaceWindow(location: RouterRawLocation): void;

    /**
     * 跳转方法，会创建新的历史纪录
     */
    abstract push(location: RouterRawLocation): Promise<void>;

    /**
     * 跳转方法，替换当前历史记录
     */
    abstract replace(location: RouterRawLocation): Promise<void>;

    /**
     * 路由移动到指定历史记录方法
     */
    abstract go(delta: number): void;

    /* 路由历史记录前进方法 */
    abstract forward(): void;

    /* 路由历史记录后退方法 */
    abstract back(): void;

    /**
     * 初始化方法
     */
    abstract init(params?: { replace?: boolean }): Promise<void>;

    /**
     * 卸载方法
     */
    abstract destroy(): void;
}

/**
 * 获取路由导航钩子
 * 路由守卫钩子时顺序执行的，但是加载路由的钩子不依赖顺序
 */
function getNavigationHooks(
    router: RouterInstance,
    from: RouteRecord,
    to: RouteRecord
): {
    beforeEach: NavigationGuard[];
    afterEach: NavigationGuardAfter[];
    beforeEnter: NavigationGuard[];
    beforeUpdate: NavigationGuard[];
    beforeLeave: NavigationGuard[];
    loadRoute: Array<() => Promise<any>>;
} {
    const beforeEach = router.guards.beforeEach.map((guard) => {
        return () => {
            return guard(from, to);
        };
    });
    const afterEach = router.guards.afterEach.map((guard) => {
        return () => {
            return guard(from, to);
        };
    });

    const { beforeLeave } = from.matched.reduce<{
        beforeLeave: NavigationGuard[];
    }>(
        (acc, { beforeLeave }) => {
            if (beforeLeave) {
                acc.beforeLeave.unshift(() => {
                    return beforeLeave(from, to);
                });
            }
            return acc;
        },
        {
            beforeLeave: []
        }
    );

    const { beforeEnter, beforeUpdate } = to.matched.reduce<{
        beforeEnter: NavigationGuard[];
        beforeUpdate: NavigationGuard[];
    }>(
        (acc, { beforeEnter, beforeUpdate }) => {
            if (beforeEnter) {
                acc.beforeEnter.push(() => {
                    return beforeEnter(from, to);
                });
            }

            if (beforeUpdate) {
                acc.beforeUpdate.push(() => {
                    return beforeUpdate(from, to);
                });
            }
            return acc;
        },
        {
            beforeEnter: [],
            beforeUpdate: []
        }
    );

    const loadRoute = [
        async () => {
            return Promise.all(
                to.matched.reduce<Array<Promise<any>>>((acc, route) => {
                    if (!route.component && route.asyncComponent) {
                        acc.push(
                            new Promise<void>((resolve, reject) => {
                                if (!route.component && route.asyncComponent) {
                                    route.asyncComponent().then((resolved) => {
                                        if (!resolved) {
                                            reject(
                                                new Error(
                                                    `Couldn't resolve component at "${route.path}". Ensure you passed a function that returns a promise.`
                                                )
                                            );
                                        }
                                        route.component = isESModule(resolved)
                                            ? resolved.default
                                            : resolved;
                                        resolve();
                                    });
                                }
                            })
                        );
                    }
                    return acc;
                }, [])
            );
        }
    ];

    return {
        beforeEach,
        afterEach,
        beforeEnter,
        beforeUpdate,
        beforeLeave,
        loadRoute
    };
}
