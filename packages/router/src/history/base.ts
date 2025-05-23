import normalizeUrl from 'normalize-url';
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
import { createRouteRecord } from '../utils/creator';
import { mergeUrl, regexScheme, url2str } from '../utils/path';
import { assert } from '../utils/warn';

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

    /**
     * 规范化路由路径
     * @example
     * this._normLocation(location).fullPath 的输出：
     * * `` -> `/`
     * * `/xxx` -> `/xxx`
     * * `xxx` -> `/xxx`
     * * `./xxx` -> `/./xxx`
     * * `../xxx` -> `/../xxx`
     * * `//xxx` -> `/xxx`
     * * `.` -> `/.`
     * * `..` -> `/..`
     * * `https://xxx` -> `/`
     * * `/xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
     * * `xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
     * * `./xxx?a=&b=1&b=2&c#h` -> `/./xxx?a=&b=1&b=2&c=#h`
     * * `../xxx?a=&b=1&b=2&c#h` -> `/../xxx?a=&b=1&b=2&c=#h`
     * * `//xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
     * * `?a=&b=1&b=2&c#h` -> `/?a=&b=1&b=2&c=#h`
     * * `.?a=&b=1&b=2&c#h` -> `/.?a=&b=1&b=2&c=#h`
     * * `..?a=&b=1&b=2&c#h` -> `/..?a=&b=1&b=2&c=#h`
     * * `./?a=&b=1&b=2&c#h` -> `/.?a=&b=1&b=2&c=#h`
     * * `../?a=&b=1&b=2&c#h` -> `/..?a=&b=1&b=2&c=#h`
     * * `./.?a=&b=1&b=2&c#h` -> `/./.?a=&b=1&b=2&c=#h`
     * * `../.?a=&b=1&b=2&c#h` -> `/../.?a=&b=1&b=2&c=#h`
     * * `././?a=&b=1&b=2&c#h` -> `/./.?a=&b=1&b=2&c=#h`
     * * `.././?a=&b=1&b=2&c#h` -> `/../.?a=&b=1&b=2&c=#h`
     * * `https://xxx?a=&b=1&b=2&c#h` -> `/?a=&b=1&b=2&c=#h`
     */
    protected _normLocation(location: RouterRawLocation) {
        const rawLocation =
            typeof location === 'string' ? { path: location } : location;
        if (rawLocation.path === void 0) {
            rawLocation.path = this.current.fullPath;
        }
        const t = normalizeLocation(rawLocation, this.router.base);
        return {
            ...t,
            fullPath:
                stringifyPath({
                    pathname: t.path,
                    query: t.query || {},
                    queryArray: t.queryArray,
                    hash: t.hash || ''
                }) || ''
        };
    }

    /** 解析路由 */
    resolve(location: RouterRawLocation): RouteRecord {
        const normLoc = this._normLocation(location);

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
        type: HistoryActionType = 'push'
    ) {
        // 寻找即将跳转路径匹配到的路由对象
        const route = this.resolve(location);

        this.abortTask();

        // 禁止重复跳转
        if (type !== 'reload' && isEqualRoute(this.current, route)) {
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
        const path =
            typeof location === 'string'
                ? location
                : stringifyPath({ ...location, pathname: location.path });
        // 这里应该分为三种情况：带协议的、相对路径、绝对路径(相对于根的相对路径)
        const isWithProtocol = regexScheme.test(path) || path.startsWith('//');
        const isAbsolute = path.startsWith('/');
        const isRelative = !isWithProtocol && !isAbsolute;
        const base = this.router.base ? new URL(this.router.base) : void 0;
        let url = '';
        if (isWithProtocol) {
            // 通过 URL 来解析和规范化 URL，第二个参数是为了 '//' 开头的时候拼接协议
            url = new URL(path, 'http://localhost').href;
        } else if (base) {
            if (isAbsolute) {
                url = mergeUrl(new URL(path, base), base)!.href;
            } else {
                const currentUrl = mergeUrl(
                    new URL(this.current.fullPath, base),
                    base
                )!;
                url = new URL(path, currentUrl).href;
            }
        } else {
            // 在没有 base 的时候的一些处理
            url = this._normLocation(location).fullPath;
            try {
                url = normalizeUrl(url, {
                    stripWWW: false,
                    removeQueryParameters: false,
                    sortQueryParameters: false
                });
            } catch (error) {
                try {
                    url = new URL(url, base).href;
                } catch (error) {
                    assert(false, `Invalid URL: ${url}`);
                }
            }
        }

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
