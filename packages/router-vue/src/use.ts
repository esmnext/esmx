import type { Route, Router, RouterLinkProps } from '@esmx/router';
import {
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
const ROUTER_VIEW_DEPTH_KEY = Symbol('router-view-depth');

const routerContextProperty =
    createSymbolProperty<RouterContext>(ROUTER_CONTEXT_KEY);

const routerViewDepthProperty = createSymbolProperty<number>(
    ROUTER_VIEW_DEPTH_KEY
);

function getCurrentProxy(): VueInstance {
    const instance = getCurrentInstance();
    if (!instance || !instance.proxy) {
        throw new Error(
            '[@esmx/router-vue] Must be used within setup() or other composition functions'
        );
    }
    return instance.proxy;
}

function findRouterContext(vm?: VueInstance): RouterContext {
    // If no vm provided, try to get current instance
    if (!vm) {
        vm = getCurrentProxy();
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

    throw new Error(
        '[@esmx/router-vue] Router context not found. Please ensure useProvideRouter() is called in a parent component.'
    );
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
function useRouterContext(): RouterContext {
    // First try to get context from provide/inject (works in setup)
    const injectedContext = inject<RouterContext>(ROUTER_INJECT_KEY);
    if (injectedContext) {
        return injectedContext;
    }

    // Fallback to component hierarchy traversal (works after mount)
    const proxy = getCurrentProxy();
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
    return useRouterContext().router;
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
    return useRouterContext().route;
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
    const proxy = getCurrentProxy();

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
 * Get the current RouterView depth in nested routing scenarios.
 * Returns the depth of the current RouterView component in the component tree.
 * Useful for advanced routing scenarios where you need to know the nesting level.
 *
 * @param isRender - Whether this is used in a RouterView component that needs to provide depth for children (default: false)
 * @returns Current RouterView depth (0 for root level, 1 for first nested level, etc.)
 * @throws {Error} If called outside setup()
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <p>Current RouterView depth: {{ depth }}</p>
 *     <RouterView />
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * import { useRouterViewDepth } from '@esmx/router-vue';
 *
 * // Get current depth without providing for children
 * const depth = useRouterViewDepth();
 * console.log('Current RouterView depth:', depth); // 0, 1, 2, etc.
 *
 * // Get current depth and provide depth + 1 for children (used in RouterView component)
 * const depth = useRouterViewDepth(true);
 * </script>
 * ```
 */
export function _useRouterViewDepth(isRender?: boolean): number {
    const depth = inject(ROUTER_VIEW_DEPTH_KEY, 0);

    if (isRender) {
        provide(ROUTER_VIEW_DEPTH_KEY, depth + 1);
        const proxy = getCurrentProxy();
        routerViewDepthProperty.set(proxy, depth + 1);
    }

    return depth;
}
/**
 * Get the current RouterView depth in nested routing scenarios.
 * Returns the depth of the current RouterView component in the component tree.
 * Useful for advanced routing scenarios where you need to know the nesting level.
 *
 * @returns Current RouterView depth (0 for root level, 1 for first nested level, etc.)
 * @throws {Error} If called outside setup()
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <p>Current RouterView depth: {{ depth }}</p>
 *     <RouterView />
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * import { useRouterViewDepth } from '@esmx/router-vue';
 *
 * // Get current depth without providing for children
 * const depth = useRouterViewDepth();
 * console.log('Current RouterView depth:', depth); // 0, 1, 2, etc.
 * </script>
 * ```
 */
export function useRouterViewDepth(): number {
    return _useRouterViewDepth();
}

/**
 * Get injected RouterView depth from a Vue instance's ancestors.
 * Traverses parent chain to find the value provided under ROUTER_VIEW_DEPTH_KEY.
 *
 * @param instance - Vue component instance to start from
 * @returns Injected RouterView depth value from nearest ancestor
 * @throws {Error} If no ancestor provided ROUTER_VIEW_DEPTH_KEY
 */
export function getRouterViewDepth(instance: VueInstance): number {
    let current = instance.$parent;
    while (current) {
        const value = routerViewDepthProperty.get(current);
        if (typeof value === 'number') return value;
        current = current.$parent;
    }
    throw new Error(
        '[@esmx/router-vue] RouterView depth not found. Please ensure a RouterView exists in ancestor components.'
    );
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
