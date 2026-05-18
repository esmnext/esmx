import type { RouterMicroAppOptions } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';
import { createHead } from '@unhead/vue/client';
import {
    BaseApp,
    getAppState,
    setAppState,
    setRouterHead
} from 'ssr-micro-shared/src/index';
import { createSSRApp, h } from 'vue';
import AppComponent from './app.vue';

class Vue3App extends BaseApp {
    private app: ReturnType<typeof createSSRApp>;
    private head = createHead();

    constructor(router) {
        super(router);
        this.app = createSSRApp({
            setup: () => {
                useProvideRouter(router);
            },
            render: () => h(AppComponent)
        });
        this.app.use(this.head);
        setRouterHead(router, this.head);
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

export function createVue3App(router): RouterMicroAppOptions {
    const app = new Vue3App(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}
