import { type MusicStore, musicStore, uniqueKeys } from 'ssr-share/src/store';
import Vue, { getCurrentInstance } from 'vue';

// 扩展 Vue 实例类型
declare module 'vue/types/vue' {
    interface Vue {
        $musicStore: any;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        musicStore?: any;
    }
}

// Vue 2 响应式 Music Store 插件
export class Vue2MusicStore {
    private _store: MusicStore;
    private _reactiveStore: Record<string, any> = {};
    private _cleanupFunctions: Array<() => void> = [];
    private _vueInstance: Vue;

    constructor(store: MusicStore = musicStore) {
        this._store = store;
        this._vueInstance = new Vue({ data: () => ({}) });
        this.createReactiveStore();
    }

    private createReactiveStore(): void {
        // 为 Reactive 实例，创建响应式包装
        uniqueKeys.ref.forEach((key) => {
            const value = this._store[key];
            // 使用 Vue 2 的响应式系统
            const reactiveData = Vue.observable({ value: value.value });

            // 监听原始 Reactive 的变化，同步到 Vue observable
            const unsubscribeFromReactive = value.addListener(
                (newValue, oldValue) => {
                    if (reactiveData.value !== newValue) {
                        Vue.set(reactiveData, 'value', newValue);
                    }
                }
            );

            // 监听 Vue observable 的变化，同步到原始 Reactive
            const unwatch = this._vueInstance.$watch(
                () => reactiveData.value,
                (newValue: any, oldValue: any) => {
                    if (newValue !== value.value) {
                        value.value = newValue;
                    }
                },
                { deep: true }
            );

            this._reactiveStore[key] = reactiveData;
            this._cleanupFunctions.push(unsubscribeFromReactive);
            this._cleanupFunctions.push(unwatch);
        });

        // 绑定方法到原始 store
        uniqueKeys.fn.forEach((key) => {
            const value = this._store[key];
            this._reactiveStore[key] = value.bind(this._store);
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
        this._vueInstance.$destroy();
        this._reactiveStore = {};
    }
}

// 创建默认实例
let globalStoreInstance: Vue2MusicStore | null = null;

// Vue 2 插件安装函数
export const Vue2MusicStorePlugin = {
    install(VueConstructor: typeof Vue, options?: { store?: MusicStore }) {
        // 防止重复安装
        if (globalStoreInstance) {
            VueConstructor.prototype.$musicStore =
                globalStoreInstance.getStore();
            return;
        }
        // 创建全局单例
        globalStoreInstance = new Vue2MusicStore(options?.store);
        // 添加全局属性
        VueConstructor.prototype.$musicStore = globalStoreInstance.getStore();
    }
};

// Mixin 用于在组件中使用 music store
export const musicStoreMixin = {
    computed: {
        musicStore(this: Vue): any {
            return this.$musicStore;
        }
    }
};

// 组合式 API 钩子函数 - 适用于 Vue 2.7
export function useMusicStore(): Vue2MusicStoreType {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error(
            'useMusicStore must be called within a component setup function'
        );
    }

    // 从当前实例获取 $musicStore
    const store =
        instance.proxy?.$musicStore || (instance as any).ctx?.$musicStore;

    if (!store) {
        throw new Error(
            'Music store not found. Make sure Vue2MusicStorePlugin is installed.'
        );
    }

    return store;
}

// 导出类型
export type Vue2MusicStoreType = ReturnType<Vue2MusicStore['getStore']>;
