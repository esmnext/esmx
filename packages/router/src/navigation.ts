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
    private _navigation: History;
    private _destroy: () => void;
    private _promiseResolve: ((data: NavigationGoResult) => void) | null = null;
    public constructor(
        options: RouterParsedOptions,
        update?: (url: string, state: RouteState) => void
    ) {
        this.options = options;
        this._navigation =
            options.mode === RouterMode.history
                ? window.history
                : new MemoryHistory();
        const _subscribe: NavigationSubscribe = (
            url: string,
            state: RouteState
        ) => {
            const { _promiseResolve } = this;
            if (_promiseResolve) {
                _promiseResolve({
                    type: 'success',
                    url,
                    state
                });
            } else if (update) {
                update(url, state);
            }
            this._promiseResolve = null;
        };
        this._destroy =
            this._navigation instanceof MemoryHistory
                ? subscribeMemory(this._navigation, _subscribe)
                : subscribeHtmlHistory(_subscribe);
    }
    public push(route: Route): RouteState {
        const state: RouteState = {
            ...route.state,
            [PAGE_ID_KEY]: PAGE_ID.generate()
        };
        this._navigation.pushState(state, '', route.fullPath);
        return Object.freeze(state);
    }
    public replace(route: Route): RouteState {
        const { _navigation } = this;
        const oldState = _navigation.state;
        const oldId =
            oldState && typeof oldState[PAGE_ID_KEY] === 'number'
                ? oldState[PAGE_ID_KEY]
                : PAGE_ID.generate();
        const id = PAGE_ID.equal(0) ? PAGE_ID.generate() : oldId;
        const state: RouteState = Object.freeze({
            ...oldState,
            ...route.state,
            [PAGE_ID_KEY]: id
        });
        _navigation.replaceState(state, '', route.fullPath);
        return Object.freeze(state);
    }
    public go(index: number): Promise<NavigationGoResult> {
        if (this._promiseResolve) {
            return Promise.resolve(null);
        }
        return new Promise<NavigationGoResult>((resolve, reject) => {
            this._promiseResolve = resolve;
            this._navigation.go(index);
            setTimeout(() => {
                resolve(null);
            }, 80);
        });
    }
    public forward(): Promise<NavigationGoResult> {
        return this.go(1);
    }
    public back(): Promise<NavigationGoResult> {
        return this.go(-1);
    }
    public destroy() {
        this._promiseResolve = null;
        this._destroy?.();
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

    public onPopState(cb: NavigationSubscribe): void {
        if (typeof cb !== 'function') return;
        this._popStateCbs.add(cb);
    }

    public offPopState(cb: NavigationSubscribe): void {
        if (typeof cb !== 'function') return;
        this._popStateCbs.delete(cb);
    }
}

// 为了单元测试导出
export function subscribeMemory(
    history: MemoryHistory,
    cb: NavigationSubscribe
) {
    history.onPopState(cb);
    return () => history.offPopState(cb);
}

const winPopStateCbs = new WeakMap<NavigationSubscribe, () => void>();
function subscribeHtmlHistory(cb: NavigationSubscribe) {
    if (typeof cb !== 'function') return () => {};
    if (!winPopStateCbs.has(cb)) {
        const wrapper = () => cb(location.href, history.state || {});
        winPopStateCbs.set(cb, wrapper);
        window.addEventListener('popstate', wrapper);
    }
    return () => {
        const wrapper = winPopStateCbs.get(cb);
        if (!wrapper) return;
        window.removeEventListener('popstate', wrapper);
        winPopStateCbs.delete(cb);
    };
}
