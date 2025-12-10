import type { Route, Router } from '@esmx/router';
import type { Ref } from 'vue';
import { version } from 'vue';

export const isVue2 = version.startsWith('2.');

/**
 * Define $router and $route properties on a target object.
 * Used to set up global properties for Vue components.
 *
 * @param target - The target object to define properties on (e.g., globalProperties or prototype)
 * @param routerGetter - Getter function for $router (can use `this` in Vue 2)
 * @param routeGetter - Getter function for $route (can use `this` in Vue 2)
 * @param configurable - Whether the properties should be configurable (default: false)
 */
export function defineRouterProperties(
    target: Record<string, unknown>,
    routerGetter: (this: unknown) => Router,
    routeGetter: (this: unknown) => Route,
    configurable = false
): void {
    Object.defineProperties(target, {
        $router: {
            configurable,
            enumerable: false,
            get: routerGetter
        },
        $route: {
            configurable,
            enumerable: false,
            get: routeGetter
        }
    });
}

export function createSymbolProperty<T>(symbol: symbol) {
    return {
        set(instance: any, value: T): void {
            instance[symbol] = value;
        },
        get(instance: any): T | undefined {
            return symbol in instance ? instance[symbol] : void 0;
        }
    } as const;
}

export function createDependentProxy<T extends object>(
    obj: T,
    dep: Ref<any>
): T {
    return new Proxy(obj, {
        get(target, prop, receiver) {
            dep.value;
            return Reflect.get(target, prop, receiver);
        }
    });
}

export function isESModule(obj: unknown): obj is Record<string | symbol, any> {
    if (!obj || typeof obj !== 'object') return false;
    const module = obj as Record<string | symbol, any>;
    return (
        Boolean(module.__esModule) || module[Symbol.toStringTag] === 'Module'
    );
}

export function resolveComponent(component: unknown): unknown {
    if (!component) return null;

    if (isESModule(component)) {
        return component.default || component;
    }

    if (
        component &&
        typeof component === 'object' &&
        !Array.isArray(component) &&
        'default' in component &&
        Object.keys(component).length === 1
    ) {
        return component.default;
    }

    return component;
}
