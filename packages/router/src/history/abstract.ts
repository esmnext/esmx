import type {
    Route,
    RouteRecord,
    RouterInstance,
    RouterRawLocation
} from '../types';
import { isPathWithProtocolOrDomain, normalizeLocation } from '../utils';
import { BaseRouterHistory } from './base';

export class AbstractHistory extends BaseRouterHistory {
    index: number;
    stack: RouteRecord[];

    constructor(router: RouterInstance) {
        super(router);
        this.index = -1;
        this.stack = [];
    }

    async init({ replace }: { replace?: boolean } = { replace: true }) {
        const { initUrl } = this.router.options;
        if (initUrl !== undefined) {
            // 存在 initUrl 则用 initUrl 进行初始化
            if (replace) {
                await this.replace(initUrl);
            } else {
                await this.push(initUrl);
            }
        }
    }

    destroy() {}

    // 设置监听函数
    setupListeners() {}

    // 服务端判断是否是相同域名
    isSameHost(location: RouterRawLocation, route: Route) {
        const rawLocation =
            typeof location === 'string' ? { path: location } : location;
        if (rawLocation.path === undefined) {
            rawLocation.path = this.current.fullPath;
        }

        // 服务端 base 需要包含域名，判断 base 是否包含传入路径的域名即可
        const { base } = normalizeLocation(rawLocation, this.router.base);

        return base.includes(route.hostname);
    }

    // 处理外站跳转逻辑
    handleOutside(
        location: RouterRawLocation,
        replace = false,
        isTriggerWithWindow = false
    ) {
        const base = this.router.base;
        const { flag, route } = isPathWithProtocolOrDomain(location, base);
        if (!flag) {
            // 如果不以域名开头则跳出
            return false;
        }

        const router = this.router;
        const { validateOutside, handleOutside } = router.options;

        // 如果域名相同 和 非外站（存在就算同域也会被视为外站的情况） 则跳出
        const isSameHost = this.isSameHost(location, route);
        if (isSameHost && !validateOutside?.({ router, location, route })) {
            return false;
        }

        // 如果有配置跳转外站函数，则执行配置函数
        handleOutside?.({
            router,
            route,
            replace,
            isTriggerWithWindow,
            isSameHost
        });

        return true;
    }

    // 新增路由记录跳转
    async push(location: RouterRawLocation) {
        await this.jump(location, false);
    }

    /**
     * 新开浏览器窗口的方法，在服务端会调用 push 作为替代
     */
    async pushWindow(location: RouterRawLocation) {
        await this._jump(location, false, true);
    }

    // 替换当前路由记录跳转
    async replace(location: RouterRawLocation) {
        await this.jump(location, true);
    }

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     */
    async replaceWindow(location: RouterRawLocation) {
        await this._jump(location, true, true);
    }

    // 跳转方法
    async jump(location: RouterRawLocation, replace = false) {
        await this._jump(location, replace);
    }

    async _jump(
        location: RouterRawLocation,
        replace = false,
        isTriggerWithWindow = false
    ) {
        if (this.handleOutside(location, replace, isTriggerWithWindow)) {
            return;
        }

        await this.transitionTo(location, (route) => {
            const index = replace ? this.index : this.index + 1;
            this.stack = this.stack.slice(0, index).concat(route);
        });
    }

    go(delta: number): void {
        const targetIndex = this.index + delta;
        // 浏览器在跳转到不存在的历史记录时不会进行跳转
        if (targetIndex < 0 || targetIndex >= this.stack.length) {
            return;
        }
        const route = this.stack[targetIndex];
        this.index = targetIndex;
        this.updateRoute(route);
    }

    /* 路由历史记录前进方法 */
    forward() {
        this.go(1);
    }

    /* 路由历史记录后退方法 */
    back() {
        this.go(-1);
    }
}
