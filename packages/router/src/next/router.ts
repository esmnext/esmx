import { rawLocationToURL } from './location';
import { type RouteMatchFunc, createMatcher } from './matcher';
import { createRoute } from './route';
import type {
    Route,
    RouteInput,
    RouteResult,
    RouterOptions,
    RouterRawLocation
} from './types';

export class Router {
    public options: RouterOptions;
    private matcher: RouteMatchFunc;
    public constructor(options: RouterOptions) {
        this.options = options;
        this.matcher = createMatcher(options.routes);
    }
    private _update(input: RouteInput): Promise<RouteResult> {
        // switch (input.type) {
        //     case 'push':
        //         break;
        //     // case 'pushLayer':
        //     //     const result = await XXX('')
        //     //     if (XXXX) {
        //     //         return this._update({})
        //     //     }
        //     case 'reload':
        //         //  1、销毁实例，再创建实例
        //         //  2. replace('sss') ->
        //         break;
        // }
    }
    public async parseRoute(raw: RouterRawLocation): Promise<RouteResult> {
        const { base, normalizeURL, externalUrlHandler } = this.options;
        let location = rawLocationToURL(raw, base);
        if (normalizeURL) {
            location = normalizeURL?.(location);
        }
        // 处理外站逻辑
        if (location.origin !== base.origin) {
            externalUrlHandler?.(location);
            return {
                type: 'external'
            };
        }
        // 匹配路由
        const matched = this.matcher(location, base);
        // 没有匹配任何路由
        if (matched.matches.length === 0) {
            return {
                type: 'notFound'
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
        console.log('route', route);
    }
    public push(location: RouterRawLocation) {
        return this._update({
            type: 'push',
            location
        });
    }
    public replace(options: RouterRawLocation) {
        return this._update({
            type: 'replace',
            location
        });
    }
    public go(index: number) {
        return this._update({
            type: 'go',
            index
        });
    }
    public forward() {
        return this._update({
            type: 'forward'
        });
    }
    public back() {
        return this._update({
            type: 'back'
        });
    }
    public pushLayer() {
        return this._update({
            type: 'pushLayer'
        });
    }
    public openWindow() {
        return this._update({
            type: 'openWindow'
        });
    }
    public reload() {
        return this._update({
            type: 'reload'
        });
    }
    public forceReload() {
        return this._update({
            type: 'forceReload'
        });
    }
}
