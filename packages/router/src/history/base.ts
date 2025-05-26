import { type Tasks, createTasks } from '../task-pipe';
import type {
    Awaitable,
    HistoryActionType,
    NavReturnType,
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
    normalizeLocation
} from '../utils';
import { createRouteRecord } from '../utils/creator';
import { routeLoc2URL, url2str } from '../utils/path';

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
        const normLoc = normalizeLocation(
            location,
            this.router.base,
            this.current.fullPath
        );

        // 匹配成功则返回匹配值
        const matcher = this.router.matcher.match(normLoc, {
            base: normLoc.base
        });
        if (matcher) return matcher;

        // 匹配失败则返回目标路径
        return createRouteRecord(normLoc);
    }

    /** 核心跳转方法 */
    async transitionTo(
        location: RouterRawLocation,
        onComplete?: (route: RouteRecord) => void,
        type: HistoryActionType = 'push',
        route = this.resolve(location)
    ): NavReturnType {
        // 寻找即将跳转路径匹配到的路由对象
        this.router.guards.afterMatch.forEach((hook) => {
            hook({
                from: this.current,
                to: route,
                router: this.router,
                navType: type,
                isEqualRoute: isEqualRoute(this.current, route),
                isSameRoute: isSameRoute(this.current, route)
            });
        });
        this.abortTask();

        // 禁止重复跳转
        if (type !== 'reload' && isEqualRoute(this.current, route)) {
            return { navType: type, type: 'duplicated' };
        }

        return this.runTask(this.current, route, onComplete, type);
    }

    /**
     * 重定向方法
     */
    async redirectTo(
        location: RouterRawLocation,
        from: RouteRecord,
        onComplete?: (route: RouteRecord) => void,
        type: HistoryActionType = 'push'
    ) {
        return this.transitionTo(location, onComplete, type, {
            ...this.resolve(location),
            redirectedFrom: from
        });
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
        onComplete?: (route: RouteRecord) => void,
        type: HistoryActionType = 'push'
    ): NavReturnType {
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
        let taskRes: Awaited<NavReturnType>['type'] | '' = '';
        await guardBeforeTasks.run({
            cb: async (res) => {
                switch (typeof res) {
                    case 'boolean':
                        if (!res) {
                            this.tasks?.abort();
                            taskRes = 'cancelled';
                        }
                        break;

                    case 'undefined':
                        break;

                    default:
                        await this.redirectTo(res, from, onComplete, type);
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
            taskRes = 'success';
        } else if (!taskRes && this.tasks?.status === 'aborted') {
            taskRes = 'aborted';
        }

        return { navType: type, type: taskRes || 'error' };
    }

    /**
     * 解析 URL，如果是外链则在此触发外链跳转回调
     */
    async decodeURL({
        type,
        location
    }: {
        type: HistoryActionType;
        location: RouterRawLocation;
    }): Promise<{
        url: string;
        isExternalUrl: boolean;
        externalUrlHandlerRes: boolean | undefined;
    }> {
        const base = this.router.base ? new URL(this.router.base) : void 0;
        let url = routeLoc2URL(location, this.current.fullPath, base).href;
        url =
            (
                await this.router.options.normalizeURL?.({
                    url: new URL(url),
                    router: this.router,
                    type
                })
            )?.href ?? url;

        // base 的 `protocol://[[username][:password]@]hostname[:port]/[pathname]` 部分
        const baseFullPath =
            base &&
            url2str(base, ['origin', 'username', 'password', 'pathname']);
        const isExternalUrl = !!base && !url.startsWith(baseFullPath!);
        let externalUrlHandlerRes: boolean | undefined;
        if (isExternalUrl) {
            // 如果是外链则在此触发外链跳转回调
            externalUrlHandlerRes =
                await this.router.options.externalUrlHandler?.({
                    url: new URL(url),
                    router: this.router,
                    type
                });
        } else {
            // 如果非外链，则去掉base部分，还原成绝对路径
            url = url.replace(baseFullPath!, '');
            if (url.at(0) !== '/') {
                url = '/' + url;
            }
        }

        return {
            url,
            isExternalUrl,
            externalUrlHandlerRes
        };
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
    }): NavReturnType;

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
