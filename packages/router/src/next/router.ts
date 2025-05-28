import { parsedOptions } from './options';
import { parseRoute } from './route';
import {
    type NavigationAction,
    type NavigationResult,
    NavigationType,
    type RouterOptions,
    type RouterParsedOptions,
    type RouterRawLocation
} from './types';

export class Router {
    public options: RouterParsedOptions;
    public constructor(options: RouterOptions) {
        this.options = parsedOptions(options);
    }
    private _update(action: NavigationAction): Promise<NavigationResult> {}
    private _parseRoute(rawLocation: RouterRawLocation) {
        return parseRoute(this.options, rawLocation);
    }
    public push(rawLocation: RouterRawLocation) {
        return this._update({
            type: NavigationType.push,
            rawLocation
        });
    }
    public replace(rawLocation: RouterRawLocation) {
        return this._update({
            type: NavigationType.replace,
            rawLocation
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
