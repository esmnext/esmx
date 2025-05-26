import type {
    HistoryActionType,
    NavReturnType,
    RouterHistory,
    RouterInstance,
    RouterRawLocation
} from '../types';
import {
    computeScrollPosition,
    getKeepScrollPosition,
    getSavedScrollPosition,
    normalizeLocation,
    openWindow,
    saveScrollPosition,
    scrollToPosition
} from '../utils';
import { BaseRouterHistory } from './base';

export class HtmlHistory extends BaseRouterHistory implements RouterHistory {
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
        const current = Object.assign({}, this.current);

        // 当路由变化时触发跳转事件
        this.transitionTo(this.getCurrentLocation(), async (route) => {
            const { state } = window.history;
            saveScrollPosition(current.fullPath, computeScrollPosition());
            await new Promise((s) => setTimeout(s));
            if (state.keepScrollPosition) return;
            const savedPosition = getSavedScrollPosition(route.fullPath);
            const position = await this.router.scrollBehavior(
                current,
                route,
                savedPosition
            );
            if (!position) return;
            await this.router.options.nextTick?.();
            scrollToPosition(position);
        });
    };

    async init() {
        const { initUrl } = this.router.options;
        let route = this.getCurrentLocation();
        if (initUrl !== void 0) {
            // 存在 initUrl 则用 initUrl 进行初始化
            route = this.resolve(initUrl) as any;
        } else
            try {
                // state 是 any 类型，这里将其当做对象可能会抛出错误，因此用 try-catch 包裹
                const state = history.state || {};
                route.state = {
                    ...state,
                    _ancientRoute: state._ancientRoute ?? true // 最古历史的标记, 在调用返回事件时如果有这个标记则直接调用没有历史记录的钩子
                };
            } catch (e) {}
        await this.replace(route as RouterRawLocation);
        this.setupListeners();
    }

    // 设置监听函数
    setupListeners() {
        window.addEventListener('popstate', this.onPopState);
    }

    destroy() {
        window.removeEventListener('popstate', this.onPopState);
    }

    // 所有的跳转方法都汇总到这里做统一处理
    protected async _jump({
        type,
        // 如果没有传入 location 则使用当前路由的 fullPath
        location = { path: this.current.fullPath }
    }: {
        type: HistoryActionType;
        location?: RouterRawLocation;
    }): NavReturnType {
        const replace = ['replace', 'reload', 'forceReload'].includes(type);

        const res = await this.decodeURL({ type, location });
        if (res.isExternalUrl) {
            if (res.externalUrlHandlerRes) {
                return { navType: type, type: 'success' };
            }
            if (replace) {
                window.location.replace(res.url);
            } else {
                const { hostname, href } = new URL(res.url);
                openWindow(href, hostname);
            }
            return { navType: type, type: 'success' };
        }
        location = { path: res.url };

        if (type === 'forceReload') {
            window.location.reload();
            return { navType: type, type: 'success' };
        }

        const current = Object.assign({}, this.current);
        return this.transitionTo(
            location,
            (route) => {
                const keepScrollPosition = getKeepScrollPosition(location);
                if (!keepScrollPosition) {
                    saveScrollPosition(
                        current.fullPath,
                        computeScrollPosition()
                    );
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
            },
            type
        );
    }

    go(delta: number): void {
        if (delta === -1) {
            this.back();
            return;
        }
        window.history.go(delta);
    }

    forward(): void {
        window.history.forward();
    }

    protected timer: NodeJS.Timeout | null = null;

    back(): void {
        const oldState = history.state;
        const noBackNavigation = this.router.options.noBackNavigation;
        if (oldState._ancientRoute === true) {
            noBackNavigation?.(this.router);
            return;
        }

        window.history.back();
        this.timer = setTimeout(() => {
            if (history.state === oldState) {
                noBackNavigation?.(this.router);
            }
            this.timer = null;
        }, 80);
    }
}
