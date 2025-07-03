import { PAGE_ID } from './increment-id';
import { RouterMode } from './types';
import type { RouteState, RouterParsedOptions } from './types';

type NavigationSubscribe = (url: string, state: RouteState) => void;
type NavigationGoResult = null | {
    type: 'success';
    url: string;
    state: RouteState;
};

const PAGE_ID_KEY = '__pageId__';

export class Navigation {
    public readonly options: RouterParsedOptions;
    private readonly _history: History | MemoryHistory;
    private readonly _unSubscribePopState: () => void;
    private _promiseResolve:
        | ((url?: string | null, state?: RouteState) => void)
        | null = null;

    public constructor(
        options: RouterParsedOptions,
        onUpdated?: NavigationSubscribe
    ) {
        const history: History =
            options.mode === RouterMode.history
                ? window.history
                : new MemoryHistory();
        const onPopStateChange: NavigationSubscribe = (url, state) => {
            const dispatchEvent = this._promiseResolve || onUpdated;
            dispatchEvent?.(url, state);
        };
        const subscribePopState =
            history instanceof MemoryHistory
                ? history.onPopState(onPopStateChange)
                : subscribeHtmlHistory(onPopStateChange);
        this.options = options;
        this._history = history;
        this._unSubscribePopState = subscribePopState;
    }
    public get length(): number {
        return this._history.length;
    }

    private _push(
        history: History,
        data: any,
        url?: string | URL | null
    ): RouteState {
        const state = Object.freeze({
            ...(data || {}),
            [PAGE_ID_KEY]: PAGE_ID.next()
        });
        history.pushState(state, '', url);
        return state;
    }

    private _replace(
        history: History,
        data: any,
        url?: string | URL | null
    ): RouteState {
        const oldId = history.state?.[PAGE_ID_KEY];
        const state = Object.freeze({
            ...(data || {}),
            [PAGE_ID_KEY]: typeof oldId === 'number' ? oldId : PAGE_ID.next()
        });
        history.replaceState(state, '', url);
        return state;
    }

    public push(data: any, url?: string | URL | null): RouteState {
        return this._push(this._history, data, url);
    }

    public replace(data: any, url?: string | URL | null): RouteState {
        return this._replace(this._history, data, url);
    }

    public pushHistoryState(data: any, url?: string | URL | null) {
        this._push(history, data, url);
    }

    public replaceHistoryState(data: any, url?: string | URL | null) {
        this._replace(history, data, url);
    }

    public backHistoryState() {
        return this._go(history, -1);
    }

    private _go(history: History, index: number): Promise<NavigationGoResult> {
        if (this._promiseResolve) {
            return Promise.resolve(null);
        }
        return new Promise<NavigationGoResult>((resolve) => {
            this._promiseResolve = (url, state) => {
                this._promiseResolve = null;
                if (typeof url !== 'string') return resolve(null);
                resolve({ type: 'success', url, state: state || {} });
            };
            setTimeout(this._promiseResolve, 80);
            history.go(index);
        });
    }
    public go(delta?: number): Promise<NavigationGoResult> {
        return this._go(this._history, delta || 0);
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
    private readonly _popStateCbs = new Set<NavigationSubscribe>();
    public scrollRestoration: ScrollRestoration = 'auto';
    // Return null when no current entry to align with browser history.state behavior
    // Browser history.state can be null when no state was provided
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
        // Remove all entries after the current position
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
        // Simulate the async popstate event of html history as closely as possible
        setTimeout(() => {
            this._popStateCbs.forEach((cb) => cb(entry.url, entry.state));
        });
    }

    public onPopState(cb: NavigationSubscribe) {
        if (typeof cb !== 'function') return () => {};
        this._popStateCbs.add(cb);
        return () => this._popStateCbs.delete(cb);
    }
}

function subscribeHtmlHistory(cb: NavigationSubscribe) {
    // Use history.state || {} to handle null state from browser history
    // Browser history.state can be null, but we normalize it to empty object
    const wrapper = () => cb(location.href, history.state || {});
    window.addEventListener('popstate', wrapper);
    return () => window.removeEventListener('popstate', wrapper);
}
