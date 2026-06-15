import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { headSymbol } from '@unhead/vue';
import { BaseApp, getAppState, setAppState } from 'ssr-micro-shared/index';
import { createSSRApp, h } from 'vue';
import AppComponent from './app.vue';

class Vue3App extends BaseApp {
    private app: ReturnType<typeof createSSRApp>;

    constructor(router: Router) {
        super(router);
        this.app = createSSRApp({
            setup: () => {
                useProvideRouter(router);
            },
            render: () => h(AppComponent)
        });
        // Point @unhead/vue's `useHead` at the shared router-scoped head so the
        // component uses idiomatic `useHead` while still writing to the one head
        // that owns the document. `app.use(head)` is just `provide(headSymbol)`.
        this.app.provide(headSymbol, this.head);
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'vue3',
            frameworkVisits: {
                vue3: (getAppState(this.router).frameworkVisits.vue3 || 0) + 1
            }
        });
        this.app.mount(container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'vue3',
            frameworkVisits: {
                vue3: (getAppState(this.router).frameworkVisits.vue3 || 0) + 1
            }
        });
        this.onMount(container);
    }

    protected onUnmount(): void {
        this.app.unmount();
    }

    async renderToString(): Promise<string> {
        const { renderToString } = await import('@vue/server-renderer');
        const html = await renderToString(this.app);
        return html?.trim() ? `<div>${html}</div>` : '';
    }
}

export function createVue3App(router: Router): RouterMicroAppOptions {
    const app = new Vue3App(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}
