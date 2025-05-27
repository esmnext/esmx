import { type MatcherFunc, createMatcher } from './matcher';
import type {
    Route,
    RouteInput,
    RouterOptions,
    RouterRawLocation
} from './types';

export class Router {
    public options: RouterOptions;
    private matcher: MatcherFunc;
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

// Router
// Route
// Matcher
// HtmlHistory extend base -> 依赖注入
// AbstractHistory  extend base -> 依赖注入
