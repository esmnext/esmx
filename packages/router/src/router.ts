import URLParse from 'url-parse';

import { createHistory } from './history';
import { createRouterMatcher } from './matcher';
import {
    type CloseLayerArgs,
    type NavigationGuard,
    type NavigationGuardAfter,
    type PushLayerExtArgs,
    type RegisteredConfig,
    type RegisteredConfigGenerator,
    type RegisteredConfigMap,
    type Route,
    type RouteRecord,
    type RouterBase,
    type RouterHistory,
    type RouterInstance,
    type RouterLayerInfo,
    type RouterMatcher,
    RouterMode,
    type RouterOptions,
    type RouterRawLocation,
    type RouterScrollBehavior
} from './types';
import { inBrowser, normalizePath, regexDomain } from './utils';
import { arrRmEle, getSubObj } from './utils/utils';

const mgDataCtx = (...ctxs: RouterOptions['dataCtx'][]) =>
    ctxs.reduce<RouterOptions['dataCtx']>(
        (acc, ctx) => (ctx ? { ...(acc || {}), ...ctx } : acc),
        void 0
    );

/**
 * 路由类
 */
export class Router implements RouterInstance {
    static idCount = 0;

    layer: RouterLayerInfo = {
        id: -1,
        get depth() {
            let depth = 0;
            let p = this.parent;
            while (p && ++depth) p = p.layer.parent;
            return depth;
        },
        parent: null,
        children: [],
        root: this
    };

    get isLayer() {
        return this.layer.parent !== null;
    }

    /* 路由配置 */
    options: RouterOptions;

    /**
     * 可选的 路由固定前置路径。需要传入完整的带协议的 URL
     * * 注意：如果传入的是一个字符串，则需要保证该字符串是一个合法的 URL，否则会抛出异常
     * * 注意：尾随斜杠在解析相对路由时是有意义的。例如：在 push(`./a`)，`http://example.com/en` 会解析成 `http://example.com/a`，`http://example.com/en/` 会解析成 `http://example.com/en/a`。
     * @example `https://www.google.com:443/en/`
     */
    base?: RouterBase;

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

        if (options.base) this.base = new URL(options.base).href;

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

        this.layer.id = Router.idCount++;
    }

    /** 获取当前生效的路由的注册配置 */
    protected getCurrentRegisteredCfg() {
        const appType = this.route?.matched[0]?.appType;
        return appType ? this.registeredConfigMap[appType] : null;
    }

    /* 更新路由 */
    updateRoute(route: RouteRecord) {
        const oldRegCfg = this.getCurrentRegisteredCfg();
        this.applyRoute(route);
        const curRegCfg = this.getCurrentRegisteredCfg();

        if (curRegCfg) {
            const { mounted, generator } = curRegCfg;
            if (!mounted) {
                curRegCfg.config = generator(this);
                curRegCfg.config.mount();
                curRegCfg.mounted = true;
            }
            curRegCfg.config?.updated();
        }

        if (oldRegCfg && oldRegCfg.appType !== curRegCfg?.appType) {
            this._destroyApp(oldRegCfg);
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

        const parsedUrl = new URLParse(url);
        Object.assign(
            this.route,
            getSubObj(parsedUrl, ['href', 'origin', 'host', 'protocol']),
            getSubObj(parsedUrl, ['hostname', 'port', 'pathname', 'hash']),
            { search: parsedUrl.query },
            route
        );
    }

    /* 解析路由 */
    resolve(location: RouterRawLocation): RouteRecord {
        return this.history.resolve(location);
    }

    /* 初始化 */
    async init() {
        await this.history.init();
    }

    /**
     * 卸载方法
     */
    destroy() {
        this.history.destroy();
        this._destroyAllApp();
        this.registeredConfigMap = {};
        this.layer.children.forEach((layer) => {
            layer.destroy();
        });
        this.layer.children = [];
        if (this.layer.parent) {
            const parent = this.layer.parent;
            const i = parent.layer.children.findIndex(
                (item) => item === this || item.layer.id === this.layer.id
            );
            if (i !== -1) {
                parent.layer.children.splice(i, 1);
            }
            this.layer.parent = null;
        }
        this.guards = {
            beforeEach: [],
            afterEach: []
        };
    }

    /* 已注册的app配置 */
    registeredConfigMap: RegisteredConfigMap = {};

    /* app配置注册 */
    register(name: string, config: RegisteredConfigGenerator) {
        this.registeredConfigMap[name] = {
            appType: name,
            generator: config,
            mounted: false
        };
    }

    protected _destroyApp(nameOrCfg: string | RegisteredConfigMap[string]) {
        const regCfg =
            typeof nameOrCfg === 'string'
                ? this.registeredConfigMap[nameOrCfg]
                : nameOrCfg;
        if (!regCfg?.mounted) return;
        regCfg.config?.destroy();
        regCfg.mounted = false;
        regCfg.config = void 0;
    }
    protected _destroyAllApp() {
        for (const appType in this.registeredConfigMap) {
            this._destroyApp(appType);
        }
    }

    // 守卫相关逻辑
    guards: RouterInstance['guards'] = {
        beforeEach: [],
        afterEach: []
    };
    beforeEach(guard: NavigationGuard) {
        this.guards.beforeEach.push(guard);
    }
    unBindBeforeEach(guard: NavigationGuard) {
        arrRmEle(this.guards.beforeEach, guard);
    }
    afterEach(guard: NavigationGuardAfter) {
        this.guards.afterEach.push(guard);
    }
    unBindAfterEach(guard: NavigationGuardAfter) {
        arrRmEle(this.guards.afterEach, guard);
    }

    // 路由跳转方法
    push(location: RouterRawLocation) {
        return this.history.push(location);
    }
    replace(location: RouterRawLocation) {
        return this.history.replace(location);
    }
    pushWindow(location: RouterRawLocation) {
        return this.history.pushWindow(location);
    }
    replaceWindow(location: RouterRawLocation) {
        return this.history.forceReload(location);
    }

    /**
     * 刷新当前路由。会将实例卸载并重新挂载。子 layer 会被销毁（相当于调用了一次 closeLayer）
     */
    async reload(location?: RouterRawLocation) {
        this._closeAllChildren();
        this._destroyAllApp();
        await this.history.reload(location);
    }

    /**
     * 强制刷新当前路由。浏览器会刷新网页，服务端调用效果等同于在根路由执行 {@link reload | `reload`}。
     */
    forceReload(location?: RouterRawLocation) {
        if (!inBrowser) {
            return this.layer.root.reload(location);
        }
        return this.history.forceReload(location);
    }

    /**
     * 打开路由弹层方法，会创建新的路由实例并调用注册的 register 方法
     */
    async pushLayer(
        location: RouterRawLocation & PushLayerExtArgs,
        options: PushLayerExtArgs = {}
    ) {
        const hooks = options.hooks || location.hooks || {};
        const dataCtx = options.dataCtx || location.dataCtx;
        const route = this.resolve(location);
        const layerRouter = createRouter({
            ...this.options,
            dataCtx: mgDataCtx(this.dataCtx, dataCtx),
            initUrl: route.fullPath,
            mode: RouterMode.ABSTRACT
        });
        layerRouter.layer.parent = this;
        this.layer.children.push(layerRouter);
        layerRouter.layer.root = this.layer.root;
        for (const regCfg of Object.values(this.registeredConfigMap)) {
            layerRouter.register(regCfg!.appType, regCfg!.generator);
        }
        layerRouter.guards.beforeEach.push((from, to) => {
            if (!hooks.shouldCloseLayer?.(from, to, layerRouter)) return;
            layerRouter.closeLayer({
                data: to.params,
                type: 'close',
                descendantStrategy: 'clear'
            });
            return false;
        });
        await layerRouter.init();
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

    /**
     * 关闭所有的子路由
     */
    protected _closeAllChildren() {
        this.layer.children.slice().forEach((layerRouter) => {
            layerRouter.closeLayer({
                data: {},
                type: 'close',
                descendantStrategy: 'clear'
            });
        });
        this.layer.children = [];
    }

    closeLayer({
        data,
        type = 'close',
        descendantStrategy = 'clear'
    }: CloseLayerArgs = {}) {
        // 如果 descendantStrategy 为 clear，则将所有的子路由都关闭，无论是否是顶层路由
        if (descendantStrategy === 'clear') {
            this._closeAllChildren();
        }
        if (!this.isLayer) return;
        if (descendantStrategy === 'hoisting') {
            const layerInfo = this.layer;
            const parent = layerInfo.parent!;
            layerInfo.children.forEach((layerRouter) => {
                layerRouter.layer.parent = layerInfo.parent;
                parent.layer.children.push(layerRouter);
                for (const regCfg of Object.values(
                    layerRouter.registeredConfigMap
                )) {
                    if (!regCfg!.mounted) continue;
                    regCfg!.config?.updated();
                }
            });
            layerInfo.children = [];
        }
        this.destroy();
    }

    renderToString() {
        const regCfg = this.getCurrentRegisteredCfg();
        if (!regCfg?.mounted) return '';
        return regCfg.config?.renderToString?.() || '';
    }

    get dataCtx(): RouterOptions['dataCtx'] {
        return mgDataCtx(
            this.options.dataCtx,
            this.getCurrentRegisteredCfg()?.config?.dataCtx
        );
    }
}

export function createRouter(options: RouterOptions): RouterInstance {
    return new Router(options);
}
