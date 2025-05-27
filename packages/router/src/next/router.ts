import { rawLocationToURL } from './location';
import { type RouteMatchFunc, createMatcher } from './matcher';
import { createRoute } from './route';
import {
    type NavigationAction,
    type NavigationResult,
    NavigationType,
    type RouterOptions,
    type RouterRawLocation
} from './types';

export class Router {
    public options: RouterOptions;
    private matcher: RouteMatchFunc;
    public constructor(options: RouterOptions) {
        this.options = options;
        this.matcher = createMatcher(options.routes);
    }
    private _update(input: NavigationAction): Promise<NavigationResult> {}
    public async parseRoute(raw: RouterRawLocation): Promise<NavigationResult> {
        const { base, normalizeURL, externalUrlHandler } = this.options;
        let location = rawLocationToURL(raw, base);
        if (normalizeURL) {
            location = normalizeURL?.(location);
        }
        // 处理外站逻辑
        if (location.origin !== base.origin) {
            externalUrlHandler?.(location);
            return {
                type: NavigationType.external
            };
        }
        // 匹配路由
        const matched = this.matcher(location, base);
        // 没有匹配任何路由
        if (matched.matches.length === 0) {
            return {
                type: NavigationType.notFound
            };
        }
        // 重新构造 URL 参数
        const lastMatch = matched.matches[matched.matches.length - 1];
        if (typeof raw === 'object' && raw.params) {
            const current = location.pathname.split('/');
            const next = new URL(
                lastMatch.compile(location).substring(1),
                base
            ).pathname.split('/');
            next.forEach((item, index) => {
                current[index] = item || current[index];
            });
            location.pathname = current.join('/');
            Object.assign(matched.params, raw.params);
        }
        const route = createRoute(raw, location, base, matched);
    }
    public push(location: RouterRawLocation) {
        return this._update({
            type: NavigationType.push,
            location
        });
    }
    public replace(options: RouterRawLocation) {
        return this._update({
            type: NavigationType.replace,
            location
        });
    }
    public go(index: number) {
        return this._update({
            type: NavigationType.go,
            index
        });
    }
    public forward() {
        return this._update({
            type: NavigationType.forward
        });
    }
    public back() {
        return this._update({
            type: NavigationType.back
        });
    }
    public pushLayer() {
        return this._update({
            type: NavigationType.pushLayer
        });
    }
    public openWindow() {
        return this._update({
            type: NavigationType.openWindow
        });
    }
    public reload() {
        return this._update({
            type: NavigationType.reload
        });
    }
    public forceReload() {
        return this._update({
            type: NavigationType.forceReload
        });
    }
}
