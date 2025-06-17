import type { ComponentPublicInstance } from 'vue';
import { RouterLink } from './router-link';
import { RouterView } from './router-view';
import { getRoute, getRouter } from './use';

export const RouterPlugin = {
    install(app: any) {
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

        // 注册全局组件
        app.component('RouterLink', RouterLink);
        app.component('RouterView', RouterView);
    }
};
