import { version } from 'vue';

export const isVue3 = version.startsWith('3.');

export function createSymbolProperty<T>(symbol: symbol) {
    type InstanceWithSymbol = Record<string | symbol, any>;

    return {
        set(instance: InstanceWithSymbol, value: T): void {
            instance[symbol] = value;
        },
        get(instance: InstanceWithSymbol): T | undefined {
            return instance[symbol];
        }
    } as const;
}

export function isESModule(obj: any): boolean {
    return Boolean(obj?.__esModule) || obj?.[Symbol.toStringTag] === 'Module';
}

export function resolveComponent(component: any): any {
    if (!component) return null;

    if (isESModule(component)) {
        return component.default || component;
    }

    return component;
}
