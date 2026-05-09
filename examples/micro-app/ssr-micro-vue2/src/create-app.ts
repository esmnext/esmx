import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import { BaseApp } from 'ssr-micro-shared/src/index';
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
        this.app.$mount(container, true);
    }

    protected onUnmount(): void {
        this.app.$destroy();
    }

    async renderToString(): Promise<string> {
        const { createRenderer } = await import('vue-server-renderer');
        const renderer = createRenderer();
        return renderer.renderToString(this.app);
    }
}

export function createVue2App(router): RouterMicroAppOptions {
    const app = new Vue2App(router);
    return {
        mount: (root) => app.mount(root),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}
