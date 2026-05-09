import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import { BaseApp, setSsrStyles } from 'ssr-micro-shared/src/index';
import Vue from 'vue';
import AppComponent from './app.vue';

Vue.use(RouterPlugin);

class Vue2App extends BaseApp {
    private app: Vue;

    constructor(router) {
        super(router);
        this.app = new Vue({
            setup: () => {
                useProvideRouter(router);
            },
            render: (h) => h(AppComponent)
        });
    }

    protected onMount(container: HTMLElement): void {
        const el = document.createElement('div');
        container.appendChild(el);
        this.app.$mount(el);
    }

    protected onHydration(container: HTMLElement): void {
        this.app.$mount(container, true);
    }

    protected onUnmount(): void {
        this.app.$destroy();
    }

    async renderToString(): Promise<string> {
        const { createRenderer } = await import('vue-server-renderer');
        const renderer = createRenderer();
        const ctx: Record<string, unknown> = {};
        const html = await renderer.renderToString(this.app, ctx);
        const fn = ctx.renderStyles as (() => string) | undefined;
        if (fn) {
            setSsrStyles(this.router, fn());
        }
        return html?.trim() || '';
    }
}

export function createVue2App(router): RouterMicroAppOptions {
    const app = new Vue2App(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}
