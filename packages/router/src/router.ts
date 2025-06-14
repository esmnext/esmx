import { LAYER_ID } from './increment-id';
import { MicroApp } from './micro-app';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteTransition } from './route-transition';
import { RouteType, RouterMode } from './types';
import type {
    RouteConfirmHook,
    RouteLocationInput,
    RouteMatchType,
    RouteNotifyHook,
    RouteState,
    RouterLayerOptions,
    RouterLayerResult,
    RouterOptions,
    RouterParsedOptions
} from './types';
import { isRouteMatched } from './util';

export class Router {
    public readonly options: RouterOptions;
    public readonly parsedOptions: RouterParsedOptions;
    public readonly isLayer: boolean;
    public readonly navigation: Navigation;
    public readonly microApp: MicroApp = new MicroApp();
    private _destroys: Array<() => void> = [];

    // 路由转换器
    public readonly transition = new RouteTransition(this);
    public get route() {
        const route = this.transition.route;
        if (route === null) {
            throw new Error(`Route is not ready.`);
        }
        return route;
    }

    // 内部使用的route访问器，不会抛出异常
    private get _currentRoute() {
        return this.transition.route;
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
                this.transition.to(RouteType.none, {
                    url,
                    state
                });
            }
        );
    }
    public push(totoInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.push, totoInput);
    }
    public replace(totoInput: RouteLocationInput): Promise<Route> {
        return this.transition.to(RouteType.replace, totoInput);
    }
    public pushWindow(totoInput?: RouteLocationInput): Promise<Route> {
        return this.transition.to(
            RouteType.pushWindow,
            totoInput ?? this.route.url.href
        );
    }
    public replaceWindow(totoInput?: RouteLocationInput): Promise<Route> {
        return this.transition.to(
            RouteType.replaceWindow,
            totoInput ?? this.route.url.href
        );
    }
    public restartApp(): Promise<Route>;
    public restartApp(totoInput: RouteLocationInput): Promise<Route>;
    public restartApp(
        totoInput?: RouteLocationInput | undefined
    ): Promise<Route> {
        return this.transition.to(
            RouteType.restartApp,
            totoInput ?? this.route.url.href
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
        return this.transition.to(RouteType.back, {
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
        return this.transition.to(RouteType.go, {
            url: result.url,
            state: result.state
        });
    }
    public async forward(): Promise<Route | null> {
        const result = await this.navigation.go(1);
        if (result === null) {
            return null;
        }
        return this.transition.to(RouteType.forward, {
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
     * @param totoInput 目标路由位置，可以是字符串路径或路由配置对象
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
    public resolve(totoInput: RouteLocationInput): Route {
        return new Route({
            options: this.parsedOptions,
            toType: RouteType.none,
            totoInput,
            from: this._currentRoute?.url ?? null
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
        const currentRoute = this._currentRoute;
        if (!currentRoute) return false;

        return isRouteMatched(targetRoute, currentRoute, matchType);
    }

    public async createLayer(
        totoInput: RouteLocationInput,
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
            mode: RouterMode.memory,
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
        await router.replace(totoInput);
        return {
            promise,
            router
        };
    }
    public async pushLayer(
        totoInput: RouteLocationInput,
        layer?: Partial<RouterLayerOptions>,
        options?: RouterOptions
    ): Promise<RouterLayerResult> {
        const { promise } = await this.createLayer(totoInput, {
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
                    route: this.route
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
        return this.transition.beforeEach(guard);
    }

    public afterEach(guard: RouteNotifyHook): () => void {
        return this.transition.afterEach(guard);
    }

    public destroy() {
        // 终止当前任务
        this.transition.destroy();

        this.navigation.destroy();
        this.microApp.destroy();
        this._destroys.forEach((destroy) => destroy());
        this._destroys.length = 0;
    }
}
