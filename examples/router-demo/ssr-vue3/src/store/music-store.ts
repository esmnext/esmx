import { type MusicStore, Reactive, musicStore } from 'ssr-share/src/store';
import { type App, type Plugin, inject, ref, watch } from 'vue';

// Vue 3 响应式 Music Store 插件
export class Vue3MusicStore {
    private _store: MusicStore;
    private _reactiveStore: Record<string, any> = {};
    private _cleanupFunctions: Array<() => void> = [];

    constructor(store: MusicStore = musicStore) {
        this._store = store;
        this.createReactiveStore();
    }

    private createReactiveStore(): void {
        // 遍历 store 的所有属性和方法
        const allKeys = [
            ...Object.keys(this._store),
            ...Object.getOwnPropertyNames(Object.getPrototypeOf(this._store))
        ];

        // 去重并过滤掉 constructor
        const uniqueKeys = [...new Set(allKeys)].filter(
            (key) => key !== 'constructor'
        );

        uniqueKeys.forEach((key) => {
            const value = (this._store as any)[key];

            // 如果是 Reactive 实例，创建响应式包装
            if (value instanceof Reactive) {
                // 使用 Vue 3 的 ref 创建响应式引用
                const vueRef = ref(value.value);

                // 监听原始 Reactive 的变化，同步到 Vue ref
                const unsubscribeFromReactive = value.addListener(
                    (newValue, oldValue) => {
                        if (vueRef.value !== newValue) {
                            vueRef.value = newValue;
                        }
                    }
                );

                // 监听 Vue ref 的变化，同步到原始 Reactive
                const unsubscribeFromVue = watch(
                    vueRef,
                    (newValue: any, oldValue: any) => {
                        if (newValue !== value.value) {
                            value.value = newValue;
                        }
                    },
                    { deep: true }
                );

                this._reactiveStore[key] = vueRef;
                this._cleanupFunctions.push(unsubscribeFromReactive);
                this._cleanupFunctions.push(unsubscribeFromVue);
            } else if (typeof value === 'function') {
                // 绑定方法到原始 store
                this._reactiveStore[key] = value.bind(this._store);
            } else {
                // 其他属性直接赋值
                this._reactiveStore[key] = value;
            }
        });
    }

    // 获取响应式 store
    getStore(): any {
        return this._reactiveStore;
    }

    // 清理资源
    destroy(): void {
        this._cleanupFunctions.forEach((cleanup) => cleanup());
        this._cleanupFunctions = [];
        this._reactiveStore = {};
    }
}

// Vue 3 插件安装函数
export const Vue3MusicStorePlugin: Plugin = {
    install(app: App, options?: { store?: MusicStore }) {
        const storeInstance = new Vue3MusicStore(options?.store);

        // 提供全局 music store
        app.provide('musicStore', storeInstance.getStore());

        // 添加全局属性
        app.config.globalProperties.$musicStore = storeInstance.getStore();

        // 在应用卸载时清理资源
        const originalUnmount = app.unmount;
        app.unmount = function () {
            storeInstance.destroy();
            return originalUnmount.call(this);
        };
    }
};

// 组合式 API 钩子
export function useMusicStore(): any {
    // 这个函数需要在组件内部使用，通过 inject 获取 store
    return inject('musicStore');
}

// 创建默认实例
export const vue3MusicStore = new Vue3MusicStore();

// 导出类型
export type Vue3MusicStoreType = ReturnType<Vue3MusicStore['getStore']>;
