import type { RouteState } from './types';

export class Navigation {
    public history: History;
    public constructor(history: History) {
        this.history = history;
    }
    public push(location: URL, state: RouteState) {
        history.pushState(
            {
                ...history.state,
                ...state
            },
            '',
            location.toString()
        );
    }
    public replace(location: URL, state: RouteState) {
        history.replaceState(
            {
                ...history.state,
                ...state
            },
            '',
            location.toString()
        );
    }
    public go(index: number) {
        history.go(index);
    }
    public forward() {
        history.forward();
    }
    public back() {
        history.back();
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
