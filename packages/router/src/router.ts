import URLParse from 'url-parse';

import { createHistory } from './history';
import { createRouterMatcher } from './matcher';
import {
    type HistoryState,
    type NavigationGuard,
    type NavigationGuardAfter,
    type RegisteredConfig,
    type RegisteredConfigMap,
    type Route,
    type RouteRecord,
    type RouterBase,
    type RouterHistory,
    type RouterInitOptions,
    type RouterInstance,
    type RouterMatcher,
    RouterMode,
    type RouterOptions,
    type RouterRawLocation,
    type RouterScrollBehavior,
    StateLayerConfigKey
} from './types';
import { inBrowser, normalizePath, regexDomain } from './utils';

const baseValue = Number(Date.now());
let layerIdOffset = 0;

function getLatestLayerId() {
    return baseValue + ++layerIdOffset;
}

/**
 * 路由类
 */
export class Router implements RouterInstance {
    /**
     * 当前路由对象的上级路由对象
     */
    parent: RouterInstance | null = null;

    /* 路由配置 */
    options: RouterOptions;

    /**
     * 路由固定前置路径
     * 需要注意的是如果使用函数返回 base，需要尽量保证相同的路径返回相同base
     */
    base: RouterBase;

    /* 路由模式 */
    mode: RouterMode;

    /* 路由匹配器 */
    matcher: RouterMatcher;

    /* 路由history类 */
    history: RouterHistory;

    /* 滚动行为 */
    scrollBehavior: RouterScrollBehavior;

    /* 当前路由信息 */
    route: Route = {
        href: '',
        origin: '',
        host: '',
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',

        params: {},
        query: {},
        queryArray: {},
        state: {},
        meta: {},
        base: '',
        path: '',
        fullPath: '',
        matched: []
    };

    constructor(options: RouterOptions) {
        this.options = options;
        this.matcher = createRouterMatcher(options.routes || []);

        this.mode =
            options.mode ||
            (inBrowser ? RouterMode.HISTORY : RouterMode.ABSTRACT);

        this.base = options.base || '';

        this.scrollBehavior =
            options.scrollBehavior ||
            ((to, from, savedPosition) => {
                if (savedPosition) return savedPosition;
                return {
                    left: 0,
                    top: 0
                };
            });

        this.history = createHistory({
            router: this,
            mode: this.mode
        });
    }

    /* 更新路由 */
    updateRoute(route: RouteRecord) {
        const curAppType = this.route?.matched[0]?.appType;
        const appType = route.matched[0]?.appType;
        this.applyRoute(route);

        const curRegisterConfig =
            curAppType && this.registeredConfigMap[curAppType];
        const registerConfig = appType && this.registeredConfigMap[appType];

        if (registerConfig) {
            const { mounted, generator } = registerConfig;
            if (!mounted) {
                registerConfig.config = generator(this);
                registerConfig.config?.mount();
                registerConfig.mounted = true;

                this.layerMap[this.layerId] = {
                    router: this,
                    config: registerConfig.config,
                    destroyed: false
                };
                if (
                    !this.layerConfigList.find(
                        (item) => item.id === this.layerId
                    )
                ) {
                    this.layerConfigList.push({
                        id: this.layerId,
                        depth: 0
                    });
                }
            }
            registerConfig.config?.updated();
        }

        if (curAppType !== appType && curRegisterConfig) {
            curRegisterConfig.config?.destroy();
            curRegisterConfig.mounted = false;
        }
    }

    /* 应用路由 */
    protected applyRoute(route: RouteRecord) {
        let url = '';
        const { fullPath } = route;
        if (inBrowser && !regexDomain.test(fullPath)) {
            url = normalizePath(fullPath, location.origin);
        } else {
            url = normalizePath(fullPath);
        }

        const {
            hash,
            host,
            hostname,
            href,
            origin,
            pathname,
            port,
            protocol,
            query
        } = new URLParse(url);
        Object.assign(
            this.route,
            {
                href,
                origin,
                host,
                protocol,
                hostname,
                port,
                pathname,
                search: query,
                hash
            },
            route
        );
    }

    /* 解析路由 */
    resolve(location: RouterRawLocation): RouteRecord {
        return this.history.resolve(location);
    }

    /**
     * 新增单个路由匹配规则
     */
    // addRoutes(routes: RouteConfig[]) {
    //     this.matcher.addRoutes(routes);
    // }

    /**
     * 新增多个路由匹配规则
     */
    // addRoute(route: RouteConfig): void {
    //     this.matcher.addRoute(route);
    // }

    /* 初始化 */
    async init(options: RouterInitOptions = {}) {
        const { parent = null, route, replace = true } = options;

        await this.history.init({
            replace
        });

        const layerId = getLatestLayerId();
        this.layerId = layerId;
        let layerMap: RouterInstance['layerMap'] = {};
        let layerConfigList: RouterInstance['layerConfigList'] = [];
        if (parent && route) {
            const appType = route.matched[0]?.appType;
            if (!appType) return;
            const registerConfig = parent.registeredConfigMap[appType];
            if (!registerConfig) return;

            parent.freeze();
            this.registeredConfigMap = parent.registeredConfigMap;
            const { generator } = registerConfig;
            const config = generator(this);
            config.mount();
            config.updated();
            layerMap = parent.layerMap;

            layerMap[layerId] = {
                router: this,
                config,
                destroyed: false
            };
            layerConfigList = parent.layerConfigList;
        }
        if (!layerConfigList.find((item) => item.id === layerId)) {
            layerConfigList.push({
                id: layerId,
                depth: 0
            });
        }
        this.parent = parent;
        this.layerMap = layerMap;
        this.layerConfigList = layerConfigList;
    }

    /**
     * 卸载方法
     */
    async destroy() {
        // this.history.destroy();
    }

    /* 已注册的app配置 */
    registeredConfigMap: RegisteredConfigMap = {};

    /* app配置注册 */
    register(
        name: string,
        config: (router: RouterInstance) => RegisteredConfig
    ) {
        this.registeredConfigMap[name] = {
            generator: config,
            mounted: false
        };
    }

    /* 全局路由守卫 */
    readonly guards: {
        beforeEach: NavigationGuard[];
        afterEach: NavigationGuardAfter[];
    } = {
        beforeEach: [],
        afterEach: []
    };

    /* 注册全局路由前置守卫 */
    beforeEach(guard: NavigationGuard) {
        this.guards.beforeEach.push(guard);
    }

    /* 卸载全局路由前置守卫 */
    unBindBeforeEach(guard: NavigationGuard) {
        const i = this.guards.beforeEach.findIndex((item) => item === guard);
        this.guards.beforeEach.splice(i, 1);
    }

    /* 注册全局路由后置守卫 */
    afterEach(guard: NavigationGuardAfter) {
        this.guards.afterEach.push(guard);
    }

    /* 卸载全局路由后置守卫 */
    unBindAfterEach(guard: NavigationGuardAfter) {
        const i = this.guards.afterEach.findIndex((item) => item === guard);
        this.guards.afterEach.splice(i, 1);
    }

    /* 路由跳转方法，会创建新的历史记录 */
    async push(location: RouterRawLocation) {
        await this.history.push(location);
    }

    /* 路由跳转方法，会替换当前的历史记录 */
    async replace(location: RouterRawLocation) {
        await this.history.replace(location);
    }

    /**
     * 当前路由弹层id，用于区分不同的路由弹层
     */
    layerId = 0;

    /**
     * 路由弹层配置
     * key为路由弹层id
     */
    layerConfigList: Array<{
        /**
         * 路由弹层id
         */
        id: number;
        /**
         * 路由弹层深度
         */
        depth: number;
    }> = [];

    /**
     * 路由弹层id与路由实例的map
     */
    layerMap: Record<
        number,
        {
            router: RouterInstance;
            config: RegisteredConfig;
            destroyed: boolean;
        }
    > = {};

    /**
     * 路由是否冻结
     */
    isFrozen = false;

    /**
     * 路由冻结方法
     */
    freeze() {
        this.isFrozen = true;
    }

    /**
     * 路由解冻方法
     */
    unfreeze() {
        this.isFrozen = false;
    }

    /**
     * 打开路由弹层方法，会创建新的路由实例并调用注册的 register 方法
     * 服务端会使用 push 作为替代
     */
    async pushLayer(location: RouterRawLocation) {
        if (this.isFrozen) return;
        const route = this.resolve(location);
        if (route.fullPath === this.route.fullPath) return;
        if (!inBrowser) {
            this.push(location);
            return;
        }
        const router = createRouter({
            ...this.options,
            initUrl: route.fullPath
        });
        await router.init({ parent: this, route, replace: false });
    }

    /**
     * 更新路由弹层方法
     * @param state 参数为history.state
     * @description 没有传入 state 时使用当前配置更新 history.state，传入了 state 时使用传入的 state 更新当前配置
     */
    checkLayerState(state: HistoryState) {
        // state 中存放的 layerConfig 配置
        const stateLayerConfigList =
            (state[StateLayerConfigKey] as typeof this.layerConfigList) || [];

        // 所有的 layerId 列表
        const layerConfigList = Object.keys(this.layerMap).map(Number);
        // state中存放的可用的 layerId 列表
        const stateLayerIdList = stateLayerConfigList
            .map(({ id }) => id)
            .filter((id) => {
                return layerConfigList.includes(id);
            });
        if (stateLayerIdList.length === 0) {
            // 没有可用的 layerId 列表时跳出
            return false;
        }
        if (
            stateLayerIdList.length === 1 &&
            stateLayerIdList[0] === this.layerId
        ) {
            // 只有一个可用的 layerId 并且就是当前的layerId时跳出
            return false;
        }

        const createList: number[] = [];
        const destroyList: number[] = [];
        Object.entries(this.layerMap).forEach(([key, value]) => {
            if (stateLayerIdList.includes(Number(key))) {
                if (value.destroyed) {
                    createList.push(Number(key));
                }
            } else {
                destroyList.push(Number(key));
            }
        });
        if (createList.length === 0 && destroyList.length === 0) {
            // 没有需要创建的 layerId 列表 并且 没有需要销毁的 layerId 列表时跳出
            return false;
        }

        const activeId = Math.max(...stateLayerIdList);

        layerConfigList.forEach((id) => {
            const { router } = this.layerMap[id];
            if (activeId === id) {
                router.unfreeze();
            } else {
                router.freeze();
            }
        });

        destroyList.forEach((id) => {
            const layer = this.layerMap[id];
            if (!layer.destroyed) {
                const { router, config } = layer;
                config.destroy();
                router.destroy();
                router.freeze();
                layer.destroyed = true;
            }
        });

        createList.forEach((id) => {
            const layer = this.layerMap[id];
            if (layer.destroyed) {
                const { router, config } = layer;
                config.mount();
                router.unfreeze();
                layer.destroyed = false;
            }
        });
        this.layerConfigList = stateLayerConfigList;

        return true;
    }

    updateLayerState(route: RouteRecord) {
        const layerConfig = this.layerConfigList.find((item) => {
            return item.id === this.layerId;
        });
        if (layerConfig) layerConfig.depth++;
        const stateConfigList = this.layerConfigList.filter(({ id }) => {
            return !this.layerMap[id]?.destroyed;
        });
        const state = {
            ...history.state,
            [StateLayerConfigKey]: stateConfigList
        };
        window.history.replaceState(state, '', route.fullPath);
    }

    /**
     * 新开浏览器窗口的方法，在服务端会调用 push 作为替代
     */
    pushWindow(location: RouterRawLocation) {
        this.history.pushWindow(location);
    }

    /**
     * 替换当前浏览器窗口的方法，在服务端会调用 replace 作为替代
     */
    replaceWindow(location: RouterRawLocation) {
        this.history.replaceWindow(location);
    }

    /* 前往特定路由历史记录的方法，可以在历史记录前后移动 */
    go(delta = 0) {
        this.history.go(delta);
    }

    /* 路由历史记录前进方法 */
    forward() {
        this.history.forward();
    }

    /* 路由历史记录后退方法 */
    back() {
        this.history.back();
    }

    /* 根据获取当前所有活跃的路由Record对象 */
    getRoutes() {
        return this.matcher.getRoutes();
    }
}

export function createRouter(options: RouterOptions): RouterInstance {
    return new Router(options);
}
