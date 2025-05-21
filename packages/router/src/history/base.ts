import { type Tasks, createTasks } from '../task-pipe';
import type {
    Awaitable,
    HistoryActionType,
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
    /** 路由类实例 */
    public router: RouterInstance;

    /** 匹配的当前路由 */
    public current: RouteRecord = createRouteRecord();

    constructor(router: RouterInstance) {
        this.router = router;
        Object.defineProperty(this, 'router', {
            enumerable: false
        });
    }

    /** 更新当前路由 */
    updateRoute(route: RouteRecord) {
        this.current = route;
        this.router.updateRoute(route);
    }

    /** 解析路由 */
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

    /** 核心跳转方法 */
    async transitionTo(
        location: RouterRawLocation,
        onComplete?: (route: RouteRecord) => void
    ) {
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

    /** 当前执行的任务 */
    tasks: Tasks | null = null;

    /** 取消任务 */
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

        /** 前置钩子任务 */
        const guardBeforeTasks = createTasks<NavigationGuard>();

        /** 后置钩子任务 */
        const guardAfterTasks = createTasks<NavigationGuardAfter>();

        /** 加载路由任务 */
        const loadRouteTasks = createTasks<() => Awaitable<any>>();

        if (isSameRoute(from, to)) {
            // from 和 to 是相同路由说明为更新路由
            guardBeforeTasks.add([...beforeEach, ...beforeUpdate]);
        } else {
            // 反之为进入新路由
            guardBeforeTasks.add([
                ...beforeLeave,
                ...beforeEach,
                ...beforeEnter
            ]);
            loadRouteTasks.add(loadRoute);
        }
        guardAfterTasks.add(afterEach);

        this.tasks = guardBeforeTasks;
        await guardBeforeTasks.run({
            cb: async (res) => {
                switch (typeof res) {
                    case 'boolean':
                        res || this.tasks?.abort();
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

            onComplete?.(to);
            this.updateRoute(to);
        }
    }

    // 路由跳转方法
    push(location: RouterRawLocation) {
        return this._jump({ type: 'push', location });
    }
    pushWindow(location: RouterRawLocation) {
        return this._jump({ type: 'pushWindow', location });
    }
    replace(location: RouterRawLocation) {
        return this._jump({ type: 'replace', location });
    }
    replaceWindow(location: RouterRawLocation) {
        return this._jump({ type: 'forceReload', location });
    }
    reload(location?: RouterRawLocation) {
        return this._jump({ type: 'reload', location });
    }
    forceReload(location?: RouterRawLocation) {
        return this._jump({ type: 'forceReload', location });
    }

    // 所有的跳转方法都汇总到这里做统一处理
    protected abstract _jump(args: {
        type: HistoryActionType;
        location?: RouterRawLocation;
    }): Promise<void>;

    // 路由移动到指定历史记录方法
    abstract go(delta: number): void;

    // 路由历史记录前进方法
    abstract forward(): void;

    // 路由历史记录后退方法
    abstract back(): void;

    // 初始化方法
    abstract init(): Promise<void>;

    // 卸载方法
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
) {
    const beforeEach = router.guards.beforeEach.map<NavigationGuard>(
        (guard) => () => guard(from, to)
    );
    const afterEach = router.guards.afterEach.map<NavigationGuardAfter>(
        (guard) => () => guard(from, to)
    );

    const beforeLeave = from.matched.reduce(
        (acc, { beforeLeave }) => {
            beforeLeave && acc.unshift(() => beforeLeave(from, to));
            return acc;
        },
        Array.from(
            router.guards._beforeLeave ?? [],
            (guard) => () => guard(from, to)
        ).reverse() as NavigationGuard[]
    );

    const { beforeEnter, beforeUpdate } = to.matched.reduce(
        (acc, { beforeEnter, beforeUpdate }) => {
            beforeEnter && acc.beforeEnter.push(() => beforeEnter(from, to));
            beforeUpdate && acc.beforeUpdate.push(() => beforeUpdate(from, to));
            return acc;
        },
        {
            beforeEnter: Array.from(
                router.guards._beforeEnter ?? [],
                (guard) => () => guard(from, to)
            ) as NavigationGuard[],
            beforeUpdate: Array.from(
                router.guards._beforeUpdate ?? [],
                (guard) => () => guard(from, to)
            ) as NavigationGuard[]
        }
    );

    const loadRoute = [
        () =>
            Promise.all(
                to.matched
                    .filter((route) => !route.component && route.asyncComponent)
                    .map((route) =>
                        route.asyncComponent!().then((resolved: any) => {
                            if (!resolved)
                                throw new Error(
                                    `Couldn't resolve component at "${
                                        route.path
                                    }". Ensure you passed a function that returns a promise.`
                                );
                            route.component = isESModule(resolved)
                                ? resolved.default
                                : resolved;
                        })
                    )
            ) as Promise<any>
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
