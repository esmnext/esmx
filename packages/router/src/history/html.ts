import type { RouterInstance, RouterRawLocation } from '../types';
import {
    computeScrollPosition,
    getKeepScrollPosition,
    getSavedScrollPosition,
    isPathWithProtocolOrDomain,
    normalizeLocation,
    openWindow,
    saveScrollPosition,
    scrollToPosition
} from '../utils';
import { BaseRouterHistory } from './base';

export class HtmlHistory extends BaseRouterHistory {
    constructor(router: RouterInstance) {
        super(router);

        if ('scrollRestoration' in window.history) {
            // 只有在 html 模式下才需要修改历史滚动模式
            window.history.scrollRestoration = 'manual';
        }
    }

    // 获取当前地址，包括 path query hash
    getCurrentLocation() {
        const { href } = window.location;
        const { state } = window.history;
        const { path, base, ...rest } = normalizeLocation(
            href,
            this.router.base
        );
        return {
            path: path.replace(new RegExp(`^(${base})`), ''),
            base,
            ...rest,
            state
        };
    }

    onPopState = (e: PopStateEvent) => {
        if (this.isFrozen) return;
        if (this.router.checkLayerState(e.state)) return;

        const current = Object.assign({}, this.current);

        // 当路由变化时触发跳转事件
        this.transitionTo(this.getCurrentLocation(), async (route) => {
            const { state } = window.history;
            saveScrollPosition(current.fullPath, computeScrollPosition());
            setTimeout(async () => {
                const keepScrollPosition = state.keepScrollPosition;
                if (keepScrollPosition) {
                    return;
                }
                const savedPosition = getSavedScrollPosition(route.fullPath);
                const position = await this.router.scrollBehavior(
                    current,
                    route,
                    savedPosition
                );

                const { nextTick } = this.router.options;
                if (position) {
                    nextTick && (await nextTick());
                    scrollToPosition(position);
                }
            });
        });
    };

    async init({ replace }: { replace?: boolean } = { replace: true }) {
        const { initUrl } = this.router.options;
        let route = this.getCurrentLocation();
        if (initUrl !== undefined) {
            // 存在 initUrl 则用 initUrl 进行初始化
            route = this.resolve(initUrl) as any;
        } else {
            const state = history.state || {};
            route.state = {
                ...state,
                _ancientRoute: state._ancientRoute ?? true // 最古历史的标记, 在调用返回事件时如果有这个标记则直接调用没有历史记录的钩子
            };
        }
        if (replace) {
            await this.replace(route as RouterRawLocation);
        } else {
            await this.push(route as RouterRawLocation);
        }
        this.setupListeners();
    }

    // 设置监听函数
    setupListeners() {
        window.addEventListener('popstate', this.onPopState);
    }

    destroy() {
        window.removeEventListener('popstate', this.onPopState);
    }

    pushWindow(location: RouterRawLocation) {
        if (this.isFrozen) return;
        this.handleOutside(location, false, true);
    }

    replaceWindow(location: RouterRawLocation) {
        if (this.isFrozen) return;
        this.handleOutside(location, true, true);
    }

    // 处理外站跳转逻辑
    handleOutside(
        location: RouterRawLocation,
        replace = false,
        // 是否是 pushWindow/replaceWindow 触发的
        isTriggerWithWindow = false
    ) {
        const base = this.router.base;
        const { flag, route } = isPathWithProtocolOrDomain(location, base);
        const router = this.router;
        const { handleOutside, validateOutside } = router.options;

        // 不以域名开头 或 域名相同 都认为是同域
        const isSameHost = !flag || window.location.hostname === route.hostname;

        // 如果 不是 pushWindow/replaceWindow 触发的
        if (!isTriggerWithWindow) {
            // 如果域名相同 和 非外站（存在就算同域也会被视为外站的情况） 则跳出
            if (isSameHost && !validateOutside?.({ router, location, route })) {
                return false;
            }
        }

        // 如果有配置跳转外站函数，则执行配置函数
        // 如果配置函数返回 true 则认为其处理了打开逻辑，跳出
        const res = handleOutside?.({
            router,
            route,
            replace,
            isTriggerWithWindow,
            isSameHost
        });
        if (res === false) {
            // 如果配置函数返回 false 则跳出
            return true;
        }

        if (replace) {
            window.location.replace(route.href);
        } else {
            const { hostname, href } = route;
            openWindow(href, hostname);
        }

        return true;
    }

    // 新增路由记录跳转
    async push(location: RouterRawLocation) {
        await this.jump(location, false);
    }

    // 替换当前路由记录跳转
    async replace(location: RouterRawLocation) {
        await this.jump(location, true);
    }

    // 跳转方法
    async jump(location: RouterRawLocation, replace = false) {
        if (this.isFrozen) return;
        if (this.handleOutside(location, replace)) {
            return;
        }

        const current = Object.assign({}, this.current);
        await this.transitionTo(location, (route) => {
            const keepScrollPosition = getKeepScrollPosition(location);
            if (!keepScrollPosition) {
                saveScrollPosition(current.fullPath, computeScrollPosition());
                scrollToPosition({ left: 0, top: 0 });
            }

            const state = Object.assign(
                replace
                    ? { ...history.state, ...route.state }
                    : { ...route.state, _ancientRoute: false },
                { keepScrollPosition }
            );
            window.history[replace ? 'replaceState' : 'pushState'](
                state,
                '',
                route.fullPath
            );

            this.router.updateLayerState(route);
        });
    }

    go(delta: number): void {
        if (this.isFrozen) return;
        window.history.go(delta);
    }

    forward(): void {
        if (this.isFrozen) return;
        window.history.forward();
    }

    protected timer: NodeJS.Timeout | null = null;

    back(): void {
        if (this.isFrozen) return;
        const oldState = history.state;
        const noBackNavigation = this.router.options.noBackNavigation;
        if (oldState._ancientRoute === true) {
            noBackNavigation && noBackNavigation(this.router);
            return;
        }

        window.history.back();
        this.timer = setTimeout(() => {
            if (history.state === oldState) {
                noBackNavigation && noBackNavigation(this.router);
            }
            this.timer = null;
        }, 80);
    }
}
