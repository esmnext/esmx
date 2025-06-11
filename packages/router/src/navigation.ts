import { PAGE_ID } from './increment-id';
import { RouterMode } from './types';
import type { Route, RouteState, RouterParsedOptions } from './types';

type NavigationSubscribe = (url: string, state: RouteState) => void;
type NavigationGoResult = null | {
    type: 'success';
    url: string;
    state: RouteState;
};

const PAGE_ID_KEY = '__pageId__';

export class Navigation {
    public options: RouterParsedOptions;
    private _history: History;
    private _unSubscribePopState: () => void;
    private _promiseResolve:
        | ((url?: string | null, state?: RouteState) => void)
        | null = null;

    public constructor(
        options: RouterParsedOptions,
        onUpdated?: NavigationSubscribe
    ) {
        this.options = options;
        this._history =
            options.mode === RouterMode.history
                ? window.history
                : new MemoryHistory();
        const onPopStateChange: NavigationSubscribe = (url, state) => {
            (this._promiseResolve || onUpdated)?.(url, state);
        };
        this._unSubscribePopState =
            this._history instanceof MemoryHistory
                ? this._history.onPopState(onPopStateChange)
                : subscribeHtmlHistory(onPopStateChange);
    }

    public push(route: Route): RouteState {
        const state: RouteState = Object.freeze({
            ...(route.state || {}),
            [PAGE_ID_KEY]: PAGE_ID.next()
        });
        this._history.pushState(state, '', route.fullPath);
        return state;
    }

    public replace(route: Route): RouteState {
        const oldId = this._history.state?.[PAGE_ID_KEY];
        const state: RouteState = Object.freeze({
            ...(route.state || {}),
            [PAGE_ID_KEY]: typeof oldId === 'number' ? oldId : PAGE_ID.next()
        });
        this._history.replaceState(state, '', route.fullPath);
        return state;
    }

    public go(index: number): Promise<NavigationGoResult> {
        if (this._promiseResolve) {
            return Promise.resolve(null);
        }
        return new Promise<NavigationGoResult>((resolve) => {
            this._promiseResolve = (url, state) => {
                this._promiseResolve = null;
                if (url === void 0 || url === null) return resolve(null);
                resolve({ type: 'success', url, state: state! });
            };
            setTimeout(this._promiseResolve, 80);
            this._history.go(index);
        });
    }
    public forward(): Promise<NavigationGoResult> {
        return this.go(1);
    }
    public back(): Promise<NavigationGoResult> {
        return this.go(-1);
    }

    public destroy() {
        this._promiseResolve?.();
        this._unSubscribePopState();
    }
}

export class MemoryHistory implements History {
    private _entries: Array<{ state: any; url: string }> = [];
    private _index = -1;
    private get _curEntry() {
        const idx = this._index;
        if (idx < 0 || idx >= this.length) return null;
        return this._entries[idx];
    }
    private _popStateCbs = new Set<NavigationSubscribe>();
    public scrollRestoration: ScrollRestoration = 'auto';
    public get state() {
        return this._curEntry?.state ?? null;
    }
    public get url() {
        return this._curEntry?.url ?? '';
    }

    constructor() {
        this.pushState(null, '', '/');
    }
    public get length() {
        return this._entries.length;
    }

    public pushState(
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        // 移除当前位置之后的所有记录
        this._entries.splice(this._index + 1);
        this._entries.push({ state: data, url: url?.toString() ?? this.url });
        this._index = this._entries.length - 1;
    }

    public replaceState(
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        const curEntry = this._curEntry;
        if (!curEntry) return;
        curEntry.state = { ...data };
        if (url) curEntry.url = url.toString();
    }

    public back(): void {
        this.go(-1);
    }
    public forward(): void {
        this.go(1);
    }
    public go(delta?: number): void {
        if (!delta) return;
        const newIdx = this._index + delta;
        if (newIdx < 0 || newIdx >= this.length) return;
        this._index = newIdx;
        const entry = this._curEntry!;
        this._popStateCbs.forEach((cb) => cb(entry.url, entry.state));
    }

    public onPopState(cb: NavigationSubscribe) {
        if (typeof cb !== 'function') return () => {};
        this._popStateCbs.add(cb);
        return () => this._popStateCbs.delete(cb);
    }
}

function subscribeHtmlHistory(cb: NavigationSubscribe) {
    const wrapper = () => cb(location.href, history.state || {});
    window.addEventListener('popstate', wrapper);
    return () => window.removeEventListener('popstate', wrapper);
}
