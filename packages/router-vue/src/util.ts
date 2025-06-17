import { version } from 'vue';

/**
 * 缓存Vue版本检测结果
 */
export const IS_VUE3 = version.startsWith('3.');

/**
 * 创建Symbol属性访问器
 */
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

/**
 * 检查对象是否为 ES 模块
 */
export function isESModule(obj: any): boolean {
    return Boolean(obj?.__esModule) || obj?.[Symbol.toStringTag] === 'Module';
}

/**
 * 解析组件，处理 ES 模块格式
 */
export function resolveComponent(component: any): any {
    if (!component) return null;

    if (isESModule(component)) {
        return component.default || component;
    }

    return component;
}

/**
 * 获取当前Vue实例（兼容Vue 2/3）
 */
export function getCurrentInstance(): any {
    if (IS_VUE3) {
        const { getCurrentInstance: getVue3Instance } = require('vue');
        return getVue3Instance();
    }
    return null;
}
