import type {
    HistoryActionType,
    NavReturnType,
    RouteRecord,
    RouterHistory,
    RouterRawLocation
} from '../types';
import { BaseRouterHistory } from './base';

export class AbstractHistory
    extends BaseRouterHistory
    implements RouterHistory
{
    stackTop = 0;
    stack: RouteRecord[] = [];

    async init() {
        const { initUrl } = this.router.options;
        if (initUrl !== void 0) {
            // 存在 initUrl 则用 initUrl 进行初始化
            await this.replace(initUrl);
        }
    }

    destroy() {}

    // 设置监听函数
    setupListeners() {}

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
            return { navType: type, type: 'success' };
        }
        // console.log('location: %o -> %o', location, res.url);
        location = { path: res.url };

        if (type === 'forceReload') {
            window.location.reload();
            return { navType: type, type: 'success' };
        }

        return this.transitionTo(
            location,
            (route) => {
                const top = replace ? this.stackTop : this.stackTop + 1;
                this.stack = this.stack.slice(0, top).concat(route);
                this.stackTop = top;
            },
            type
        );
    }

    go(delta: number): void {
        const targetIndex = this.stackTop + delta;
        // 浏览器在跳转到不存在的历史记录时不会进行跳转
        if (targetIndex < 0 || targetIndex >= this.stack.length) {
            // 如果在弹层路由回退，则关闭弹层
            if (this.router.isLayer && targetIndex < 0) {
                this.router.closeLayer({
                    type: 'back'
                });
            }
            return;
        }
        const route = this.stack[targetIndex];
        this.stackTop = targetIndex;
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
