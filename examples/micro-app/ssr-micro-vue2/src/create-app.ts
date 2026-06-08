import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import {
    BaseApp,
    getAppState,
    setAppState,
    setSsrStyles
} from 'ssr-micro-shared/src/index';
import Vue from 'vue';
import AppComponent from './app.vue';

Vue.use(RouterPlugin);

class Vue2App extends BaseApp {
    private app: Vue;

    constructor(router: Router) {
        super(router);
        this.app = new Vue({
            setup: () => {
                useProvideRouter(router);
            },
            render: (h) => h(AppComponent)
        });
    }

    protected getHead() {
        return {
            title: 'Vue 2 Micro-App',
            meta: [
                {
                    name: 'description',
                    content: 'This page is rendered by a Vue 2.7 micro-app.'
                }
            ]
        };
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'vue2',
            frameworkVisits: {
                vue2: (getAppState(this.router).frameworkVisits.vue2 || 0) + 1
            }
        });
        const el = document.createElement('div');
        container.appendChild(el);
        this.app.$mount(el);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'vue2',
            frameworkVisits: {
                vue2: (getAppState(this.router).frameworkVisits.vue2 || 0) + 1
            }
        });
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
        // Note: Vue2 uses replacement hydration logic via $mount(container, true).
        // Unlike other frameworks, it does not require an extra <div> wrapper
        // because the hydration process replaces the entire container content.
        return html?.trim() || '';
    }
}

export function createVue2App(router: Router): RouterMicroAppOptions {
    const app = new Vue2App(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}
