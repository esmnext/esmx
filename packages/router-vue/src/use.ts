import type { Route, Router, RouterLinkProps } from '@esmx/router';
import {
    type Ref,
    computed,
    getCurrentInstance,
    inject,
    onBeforeUnmount,
    provide,
    ref
} from 'vue';
import { createDependentProxy, createSymbolProperty } from './util';

export interface VueInstance {
    $parent?: VueInstance | null;
    $root?: VueInstance | null;
    $children?: VueInstance[] | null;
}

interface RouterContext {
    router: Router;
    route: Route;
}

const ROUTER_CONTEXT_KEY = Symbol('router-context');
const ROUTER_INJECT_KEY = Symbol('router-inject');

const ERROR_MESSAGES = {
    SETUP_ONLY: (fnName: string) =>
        `[@esmx/router-vue] ${fnName}() can only be called during setup()`,
    CONTEXT_NOT_FOUND:
        '[@esmx/router-vue] Router context not found. ' +
        'Please ensure useProvideRouter() is called in a parent component.'
} as const;

const routerContextProperty =
    createSymbolProperty<RouterContext>(ROUTER_CONTEXT_KEY);

function getCurrentProxy(functionName: string): VueInstance {
    const instance = getCurrentInstance();
    if (!instance || !instance.proxy) {
        throw new Error(ERROR_MESSAGES.SETUP_ONLY(functionName));
    }
    return instance.proxy;
}

function findRouterContext(vm?: VueInstance): RouterContext {
    // If no vm provided, try to get current instance
    if (!vm) {
        vm = getCurrentProxy('findRouterContext');
    }

    let context = routerContextProperty.get(vm);
    if (context) {
        return context;
    }

    let current = vm.$parent;
    while (current) {
        context = routerContextProperty.get(current);
        if (context) {
            routerContextProperty.set(vm, context);
            return context;
        }
        current = current.$parent;
    }

    throw new Error(ERROR_MESSAGES.CONTEXT_NOT_FOUND);
}

/**
 * Get router instance from a Vue component instance.
 * This is a lower-level function used internally by useRouter().
 * Use this in Options API, use useRouter() in Composition API.
 *
 * @param instance - Vue component instance (optional, will use getCurrentInstance if not provided)
 * @returns Router instance
 * @throws {Error} If router context is not found
 *
 * @example
 * ```typescript
 * // Options API usage
 * import { defineComponent } from 'vue';
 * import { getRouter } from '@esmx/router-vue';
 *
 * export default defineComponent({
 *   mounted() {
 *     const router = getRouter(this);
 *     router.push('/dashboard');
 *   },
 *   methods: {
 *     handleNavigation() {
 *       const router = getRouter(this);
 *       router.replace('/profile');
 *     }
 *   }
 * });
 *
 * // Can also be called without instance (uses getCurrentInstance internally)
 * const router = getRouter(); // Works in globalProperties getters
 * ```
 */
export function getRouter(instance?: VueInstance): Router {
    return findRouterContext(instance).router;
}

/**
 * Get current route from a Vue component instance.
 * This is a lower-level function used internally by useRoute().
 * Use this in Options API, use useRoute() in Composition API.
 *
 * @param instance - Vue component instance (optional, will use getCurrentInstance if not provided)
 * @returns Current route object
 * @throws {Error} If router context is not found
 *
 * @example
 * ```typescript
 * // Options API usage
 * import { defineComponent } from 'vue';
 * import { getRoute } from '@esmx/router-vue';
 *
 * export default defineComponent({
 *   computed: {
 *     routeInfo() {
 *       const route = getRoute(this);
 *       return {
 *         path: route.path,
 *         params: route.params,
 *         query: route.query
 *       };
 *     }
 *   }
 * });
 *
 * // Can also be called without instance (uses getCurrentInstance internally)
 * const route = getRoute(); // Works in globalProperties getters
 * ```
 */
export function getRoute(instance?: VueInstance): Route {
    return findRouterContext(instance).route;
}

/**
 * Get router context using the optimal method available.
 * First tries provide/inject (works in setup), then falls back to hierarchy traversal.
 */
function useRouterContext(functionName: string): RouterContext {
    // First try to get context from provide/inject (works in setup)
    const injectedContext = inject<RouterContext>(ROUTER_INJECT_KEY);
    if (injectedContext) {
        return injectedContext;
    }

    // Fallback to component hierarchy traversal (works after mount)
    const proxy = getCurrentProxy(functionName);
    return findRouterContext(proxy);
}

/**
 * Get the router instance in a Vue component.
 * Must be called within setup() or other composition functions.
 * Use this in Composition API, use getRouter() in Options API.
 *
 * @returns Router instance for navigation and route management
 * @throws {Error} If called outside setup() or router context not found
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useRouter } from '@esmx/router-vue';
 *
 * const router = useRouter();
 *
 * const navigateToHome = () => {
 *   router.push('/home');
 * };
 *
 * const goBack = () => {
 *   router.back();
 * };
 *
 * const navigateWithQuery = () => {
 *   router.push({
 *     path: '/search',
 *     query: { q: 'vue router', page: '1' }
 *   });
 * };
 * </script>
 * ```
 */
export function useRouter(): Router {
    return useRouterContext('useRouter').router;
}

/**
 * Get the current route information in a Vue component.
 * Returns a reactive reference that automatically updates when the route changes.
 * Must be called within setup() or other composition functions.
 * Use this in Composition API, use getRoute() in Options API.
 *
 * @returns Current route object with path, params, query, etc.
 * @throws {Error} If called outside setup() or router context not found
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <h1>{{ route.meta?.title || 'Page' }}</h1>
 *     <p>Path: {{ route.path }}</p>
 *     <p>Params: {{ JSON.stringify(route.params) }}</p>
 *     <p>Query: {{ JSON.stringify(route.query) }}</p>
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * import { useRoute } from '@esmx/router-vue';
 * import { watch } from 'vue';
 *
 * const route = useRoute();
 *
 * watch(() => route.path, (newPath) => {
 *   console.log('Route changed to:', newPath);
 * });
 * </script>
 * ```
 */
export function useRoute(): Route {
    return useRouterContext('useRoute').route;
}

/**
 * Provide router context to child components.
 * This must be called in a parent component to make the router available
 * to child components via useRouter() and useRoute().
 *
 * @param router - Router instance to provide to child components
 * @throws {Error} If called outside setup()
 *
 * @example
 * ```typescript
 * // Vue 3 usage
 * import { createApp } from 'vue';
 * import { Router } from '@esmx/router';
 * import { useProvideRouter } from '@esmx/router-vue';
 *
 * const routes = [
 *   { path: '/', component: () => import('./Home.vue') },
 *   { path: '/about', component: () => import('./About.vue') }
 * ];
 *
 * const router = new Router({ routes });
 * const app = createApp({
 *   setup() {
 *     useProvideRouter(router);
 *   }
 * });
 * app.mount('#app');
 * ```
 */
export function useProvideRouter(router: Router): void {
    const proxy = getCurrentProxy('useProvideRouter');

    const dep = ref(0);

    const proxiedRouter = createDependentProxy(router, dep);
    const proxiedRoute = createDependentProxy(router.route, dep);

    const context: RouterContext = {
        router: proxiedRouter,
        route: proxiedRoute
    };

    provide(ROUTER_INJECT_KEY, context);
    routerContextProperty.set(proxy, context);

    const unwatch = router.afterEach((to: Route) => {
        if (router.route === to) {
            to.syncTo(proxiedRoute);
            dep.value++;
        }
    });

    onBeforeUnmount(unwatch);
}

/**
 * Create reactive link helpers for navigation elements.
 * Returns computed properties for link attributes, classes, and event handlers.
 *
 * @param props - RouterLink properties configuration
 * @returns Computed link resolver with attributes and event handlers
 *
 * @example
 * ```vue
 * <template>
 *   <a
 *     v-bind="link.attributes"
 *     v-on="link.createEventHandlers()"
 *     :class="{ active: link.isActive }"
 *   >
 *     Home
 *   </a>
 * </template>
 *
 * <script setup lang="ts">
 * import { useLink } from '@esmx/router-vue';
 *
 * const link = useLink({
 *   to: '/home',
 *   type: 'push',
 *   exact: 'include'
 * }).value;
 * </script>
 * ```
 */
export function useLink(props: RouterLinkProps) {
    const router = useRouter();

    return computed(() => {
        return router.resolveLink(props);
    });
}
