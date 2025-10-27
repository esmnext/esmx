import { version } from 'vue';
import type { Ref } from 'vue';

export const isVue3 = version.startsWith('3.');

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

    return component;
}
