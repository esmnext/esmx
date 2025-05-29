import { parseLocation } from './location';
import { Navigation } from './navigation';
import { parsedOptions } from './options';
import { parseRoute } from './route';
import { NavigationActionType, NavigationResultType } from './types';
import type {
    NavigationResult,
    RegisteredConfig,
    RegisteredConfigMap,
    Route,
    RouteState,
    RouterOptions,
    RouterParsedOptions,
    RouterRawLocation
} from './types';
import { openWindow } from './util';

export class Router {
    public options: RouterParsedOptions;
    protected _route: null | Route = null;
    protected _navigation: Navigation;

    public get route() {
        if (this._route === null) {
            throw new Error(`Route is not ready.`);
        }
        return this._route;
    }

    public constructor(options: RouterOptions) {
        this.options = parsedOptions(options);
        this._navigation = new Navigation(
            this.options,
            (url: string, state: RouteState) => {
                return this._update(NavigationActionType.popstate, {
                    path: url,
                    state
                });
            }
        );
    }

    protected async _normURL(
        rawLoc: RouterRawLocation,
        type: NavigationActionType
    ) {
        const { base, normalizeURL } = this.options;
        const location = await normalizeURL({
            url: parseLocation(rawLoc, base),
            raw: rawLoc,
            type,
            router: this
        });
        // 处理外站逻辑
        if (!location.href.startsWith(base.href)) {
            return {
                navResultType: NavigationResultType.external,
                location
            };
        }
        return {
            navResultType: NavigationResultType.success,
            location
        };
    }

    protected async _update(
        type: NavigationActionType,
        raw: RouterRawLocation
    ): Promise<NavigationResult> {
        // 是否是类似浏览器的历史操作
        const isHistoryAction =
            type === NavigationActionType.go ||
            type === NavigationActionType.back ||
            type === NavigationActionType.forward ||
            type === NavigationActionType.popstate;

        let normLoc = this.options.base;
        // 如果不是 go 等类型，则需要先标准化URL，如果是外部链接，则直接返回
        if (!isHistoryAction) {
            const normResult = await this._normURL(raw, type);
            // 如果是外部链接，则直接返回
            if (normResult.navResultType === NavigationResultType.external) {
                return {
                    navResultType: NavigationResultType.external,
                    navActionType: type,
                    location: normResult.location,
                    result: this.options.externalUrlHandler({
                        url: normResult.location,
                        router: this,
                        type
                    })
                };
            }
            normLoc = normResult.location;
        }

        // 如果是打开新窗口的操作，则直接用解析后的 URL 新开窗口
        if (type === NavigationActionType.openWindow) {
            setTimeout(() => openWindow(normLoc));
            return {
                navActionType: NavigationActionType.openWindow,
                navResultType: NavigationResultType.success,
                location: normLoc
            };
        }

        // 如果是 forceReload，则直接用解析后的 URL 刷新页面
        if (type === NavigationActionType.forceReload) {
            setTimeout(() => (location.href = normLoc.href));
            return {
                navActionType: NavigationActionType.forceReload,
                navResultType: NavigationResultType.success,
                location: normLoc
            };
        }

        // 其他类型的导航都需要处理路由匹配和应用
        const result = parseRoute({
            matcher: this.options.matcher,
            base: this.options.base,
            raw,
            location: normLoc
        });
        if (result.navResultType === NavigationResultType.notFound) {
            return {
                navResultType: NavigationResultType.notFound,
                navActionType: type,
                location: normLoc
            };
        }
        // 匹配路由成功后有可能会重新构造 URL
        normLoc = result.location;
        // 如果是 push 或 replace 或 go 等类型，则应用路由并返回
        if (
            isHistoryAction ||
            type === NavigationActionType.push ||
            type === NavigationActionType.replace
        ) {
            this._applyRoute(
                result.route,
                type === NavigationActionType.replace
            );
            return {
                navResultType: NavigationResultType.success,
                navActionType: type,
                location: normLoc,
                route: result.route
            };
        }

        // 剩下的还有 pushLayer 和 reload
        return {
            navResultType: NavigationResultType.error,
            navActionType: type,
            location: normLoc,
            error: new Error(`type ${type} is not supported yet.`)
        };
    }

    protected _applyRoute(route: Route, replace = false) {
        const oldRegCfg = this._getCurrentRegisteredCfg();
        this._route = route;
        const curRegCfg = this._getCurrentRegisteredCfg();

        if (curRegCfg) {
            const { mounted, generator } = curRegCfg;
            if (!mounted) {
                curRegCfg.config = generator(this);
                curRegCfg.config.mount?.();
                curRegCfg.mounted = true;
            }
            curRegCfg.config?.update?.();
        }

        if (oldRegCfg && oldRegCfg.appName !== curRegCfg?.appName) {
            this._destroyApp(oldRegCfg);
        }

        this._navigation.push(route, replace);
    }

    public push(location: RouterRawLocation) {
        return this._update(NavigationActionType.push, location);
    }
    public replace(location: RouterRawLocation) {
        return this._update(NavigationActionType.replace, location);
    }
    public pushLayer(location: RouterRawLocation) {
        return this._update(NavigationActionType.pushLayer, location);
    }
    public openWindow(location: RouterRawLocation) {
        return this._update(NavigationActionType.openWindow, location);
    }
    public forceReload(location: RouterRawLocation) {
        return this._update(NavigationActionType.forceReload, location);
    }
    public reload(location?: RouterRawLocation) {
        return this._update(
            NavigationActionType.reload,
            location ?? this.route.href
        );
    }

    // TODO: 实现一个 await popstate 之类的方法，将所有逻辑都收拢到 this._update 方法中
    public go(index: number) {
        return this._navigation.go(index);
    }
    public forward() {
        return this.go(1);
    }
    public back() {
        return this.go(-1);
    }

    protected _registeredCfgMap: RegisteredConfigMap = {};

    public register(
        appName: string,
        generator: (router: Router) => RegisteredConfig
    ) {
        this._registeredCfgMap[appName] = {
            appName,
            mounted: false,
            generator
        };
    }

    protected _destroyApp(cfg: string | RegisteredConfigMap[string]) {
        if (typeof cfg === 'string') {
            cfg = this._registeredCfgMap[cfg];
        }
        if (!cfg?.mounted) return;
        cfg.config?.destroy?.();
        cfg.mounted = false;
        cfg.config = void 0;
    }
    protected _destroyAllApp() {
        for (const appType in this._registeredCfgMap) {
            this._destroyApp(appType);
        }
    }

    /** 获取当前生效的路由的注册配置 */
    protected _getCurrentRegisteredCfg() {
        const appType = this._route?.matched[0]?.appType;
        return appType ? this._registeredCfgMap[appType] : null;
    }

    public destroy() {
        this._navigation.destroy();
        this._destroyAllApp();
        this._registeredCfgMap = {};
    }
}
