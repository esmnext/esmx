import { RouterLink } from './router-link';
import { RouterView } from './router-view';
import { getRoute, getRouter } from './use';
import { defineRouterProperties, isVue2 } from './util';

interface VueApp {
    config?: {
        globalProperties: Record<string, unknown>;
    };
    prototype?: Record<string, unknown>;
    component(name: string, component: unknown): void;
}

/**
 * Vue plugin for \@esmx/router integration.
 * Registers RouterLink and RouterView components globally.
 * Compatible with both Vue 2.7+ and Vue 3.
 *
 * @example
 *
 * Vue 3 installation
 *
 * ```typescript
 * import { createApp } from 'vue';
 * import { Router } from '@esmx/router';
 * import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
 *
 * const routes = [
 *   { path: '/', component: Home },
 *   { path: '/about', component: About }
 * ];
 *
 * const router = new Router({ routes });
 * const app = createApp({
 *   setup() {
 *     useProvideRouter(router);
 *   }
 * });
 *
 * app.use(RouterPlugin);
 * app.mount('#app');
 * ```
 *
 * @example
 *
 * Vue 2 installation
 *
 * ```typescript
 * import Vue from 'vue';
 * import { Router } from '@esmx/router';
 * import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
 *
 * const routes = [
 *   { path: '/', component: Home },
 *   { path: '/about', component: About }
 * ];
 *
 * const router = new Router({ routes });
 * Vue.use(RouterPlugin);
 *
 * new Vue({
 *   setup() {
 *     useProvideRouter(router);
 *   }
 * }).$mount('#app');
 * ```
 */
export const RouterPlugin = {
    /**
     * Install the router plugin.
     * @param app Vue application instance (Vue 3) or Vue constructor (Vue 2)
     */
    install(app: unknown): void {
        if (!app) {
            throw new Error('[@esmx/router-vue] Invalid Vue app instance');
        }

        const vueApp = app as VueApp;
        const target = vueApp.config?.globalProperties || vueApp.prototype;

        if (!target) {
            throw new Error('[@esmx/router-vue] Invalid Vue app instance');
        }
        if (isVue2) {
            defineRouterProperties(
                target,
                function (this: any) {
                    return getRouter(this);
                },
                function (this: any) {
                    return getRoute(this);
                }
            );
        } else {
            const throwError = () => {
                throw new Error(
                    '[@esmx/router-vue] Router not provided. Please call useProvideRouter() in your root component setup.'
                );
            };
            defineRouterProperties(target, throwError, throwError, true);
        }

        // Register global components
        vueApp.component('RouterLink', RouterLink);
        vueApp.component('RouterView', RouterView);
    }
};
