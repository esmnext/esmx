import {
    type NavigationResult,
    NavigationType,
    type Route,
    type RouteState,
    RouterMode,
    type RouterParsedOptions
} from './types';

type NavigationSubscribe = (url: string, state: RouteState) => void;

export class Navigation {
    public options: RouterParsedOptions;
    private history: History;
    private _destroy: () => void;
    private _promiseResolve: ((result: NavigationResult) => void) | null = null;
    public constructor(
        options: RouterParsedOptions,
        update?: (url: string, state: RouteState) => Promise<NavigationResult>
    ) {
        this.options = options;
        this.history =
            options.mode === RouterMode.history
                ? window.history
                : new MemoryHistory();
        const _subscribe: NavigationSubscribe = (
            url: string,
            state: RouteState
        ) => {
            const { _promiseResolve } = this;
            if (_promiseResolve) {
                if (update) {
                    update(url, state).then(_promiseResolve);
                } else {
                    _promiseResolve({
                        type: NavigationType.error
                    });
                }
            } else if (update) {
                update(url, state);
            }
            this._promiseResolve = null;
        };
        this._destroy =
            this.history instanceof MemoryHistory
                ? subscribeMemory(this.history, _subscribe)
                : subscribeHtmlHistory(_subscribe);
    }
    public push(route: Route, replace = false) {
        const nextState = {
            ...history.state,
            ...route.state
        };
        if (replace) {
            this.history.replaceState(nextState, '', route.fullPath);
        } else {
            this.history.pushState(nextState, '', route.fullPath);
        }
    }
    public go(index: number): Promise<NavigationResult> {
        if (this._promiseResolve) {
            return Promise.resolve({
                type: NavigationType.duplicate
            });
        }
        return new Promise<NavigationResult>((resolve, reject) => {
            this._promiseResolve = resolve;
            this.history.go(index);
            setTimeout(() => {
                reject(false);
            }, 80);
        });
    }
    public forward(): Promise<NavigationResult> {
        return this.go(1);
    }
    public back(): Promise<NavigationResult> {
        return this.go(-1);
    }
    public destroy() {
        this._promiseResolve = null;
        this._destroy?.();
    }
}

export class MemoryHistory implements History {
    private entries: Array<{ state: any; url: string }> = [];
    private index = -1;
    public length = 0;
    public scrollRestoration: ScrollRestoration = 'auto';
    public state: any = null;
    public url = '/';

    constructor() {
        this.pushState(null, '', '/');
    }

    public pushState(
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        // 移除当前位置之后的所有记录
        this.entries.splice(this.index + 1);

        if (typeof url === 'string' || url instanceof URL) {
            this.replaceState(data, unused, url);
        }
    }

    public replaceState(
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        if (this.index >= 0) {
            const prevUrl = this.entries[this.index].url;
            this.entries[this.index] = {
                ...this.entries[this.index],
                state: data,
                url: url ? url.toString() : prevUrl
            };
            this._applyByIndex(this.index);
        }
    }

    public back(): void {
        this.go(-1);
    }

    public forward(): void {
        this.go(1);
    }

    public go(delta?: number): void {
        if (!delta) return;

        const newIndex = this.index + delta;

        if (newIndex >= 0 && newIndex < this.entries.length) {
            this._applyByIndex(newIndex);
        }
    }
    public _applyByIndex(index: number) {
        const entry = this.entries[index];
        if (entry) {
            this.index = index;
            this.state = entry.state;
            this.url = entry.url;
            this.length = this.entries.length;
        }
    }
}

function subscribeMemory(history: MemoryHistory, cb: NavigationSubscribe) {
    const _go = history.go;
    history.go = function (delta?: number) {
        _go.call(this, delta);
        cb(history.url, history.state);
    };
    return () => {};
}
function subscribeHtmlHistory(cb: NavigationSubscribe) {
    const popstate = () => {
        cb(location.href, history.state);
    };
    window.addEventListener('popstate', popstate);
    return () => {
        window.removeEventListener('popstate', popstate);
    };
}
