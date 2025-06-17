import type { ComponentPublicInstance } from 'vue';
import { RouterLink } from './router-link';
import { RouterView } from './router-view';
import { getRoute, getRouter } from './use';

/**
 * Vue plugin for @esmx/router integration.
 * Registers RouterLink and RouterView components globally.
 * Compatible with both Vue 2.7+ and Vue 3.
 *
 * @example Vue 3 installation
 * ```typescript
 * import { createApp } from 'vue';
 * import { createRouter } from '@esmx/router';
 * import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
 *
 * const routes = [
 *   { path: '/', component: Home },
 *   { path: '/about', component: About }
 * ];
 *
 * const router = createRouter({ routes });
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
 * @example Vue 2 installation
 * ```typescript
 * import Vue from 'vue';
 * import { createRouter } from '@esmx/router';
 * import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
 *
 * const routes = [
 *   { path: '/', component: Home },
 *   { path: '/about', component: About }
 * ];
 *
 * const router = createRouter({ routes });
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
    install(app: any): void {
        const target = app.config?.globalProperties || app.prototype;

        if (!target) {
            throw new Error('[@esmx/router-vue] Invalid Vue app instance');
        }

        Object.defineProperties(target, {
            $router: {
                get(this: ComponentPublicInstance) {
                    return getRouter(this);
                }
            },
            $route: {
                get(this: ComponentPublicInstance) {
                    return getRoute(this);
                }
            }
        });

        // Register global components
        app.component('RouterLink', RouterLink);
        app.component('RouterView', RouterView);
    }
};
