import type { Route, Router, RouterLinkProps } from '@esmx/router';
import {
    type ComponentPublicInstance,
    type Ref,
    computed,
    getCurrentInstance,
    onBeforeUnmount,
    ref
} from 'vue';
import { createSymbolProperty } from './util';

// Simplified mock Vue instance type for type compatibility
interface VueInstance {
    $parent?: VueInstance | null;
    $root?: VueInstance | null;
    $children?: VueInstance[] | null;
}

interface RouterContext {
    router: Router;
    route: Ref<Route>;
}

const ROUTER_CONTEXT_KEY = Symbol('router-context');

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

function findRouterContext(vm: VueInstance): RouterContext {
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

export function getRouter(instance: VueInstance): Router {
    return findRouterContext(instance).router;
}

export function getRoute(instance: VueInstance): Route {
    return findRouterContext(instance).route.value;
}

export function useRouter(): Router {
    const proxy = getCurrentProxy('useRouter');
    return getRouter(proxy);
}

export function useRoute(): Route {
    const proxy = getCurrentProxy('useRoute');
    return getRoute(proxy);
}

export function useProvideRouter(router: Router): void {
    const proxy = getCurrentProxy('useProvideRouter');

    const context: RouterContext = {
        router,
        route: ref(router.route) as Ref<Route>
    };

    routerContextProperty.set(proxy, context);

    const unwatch = router.afterEach((to: Route) => {
        to.syncTo(context.route.value);
    });

    onBeforeUnmount(unwatch);
}

/**
 * useLink Hook
 */
export function useLink(props: RouterLinkProps) {
    const router = useRouter();

    return computed(() => router.resolveLink(props));
}
