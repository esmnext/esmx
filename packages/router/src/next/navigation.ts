import { type Route, RouterMode, type RouterParsedOptions } from './types';

export class Navigation {
    public options: RouterParsedOptions;
    private history: History;
    public constructor(options: RouterParsedOptions) {
        this.options = options;
        this.history =
            options.mode === RouterMode.history
                ? window.history
                : new MemoryHistory();
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
    public go(index: number) {
        this.history.go(index);
    }
    public forward() {
        this.history.forward();
    }
    public back() {
        this.history.back();
    }
}

export class MemoryHistory implements History {
    private entries: Array<{ state: any; url: string }> = [];
    private index = -1;
    public length = 0;
    public scrollRestoration: ScrollRestoration = 'auto';
    public state: any = null;

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

        // 添加新记录
        this.entries.push({
            state: data,
            url: url?.toString() || '/'
        });

        this.index++;
        this.length = this.entries.length;
        this.state = data;
    }

    public replaceState(
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        if (this.index >= 0) {
            this.entries[this.index] = {
                state: data,
                url: url?.toString() || '/'
            };
            this.state = data;
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
            this.index = newIndex;
            const entry = this.entries[this.index];
            this.state = entry.state;
        }
    }
}
