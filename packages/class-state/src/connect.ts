/* eslint-disable @typescript-eslint/no-this-alias */
import { produce } from 'immer';

import { getStateContext, type State, type StateContext } from './create';
export type StoreParams = Record<string, any>;
export type StoreConstructor = new (cacheKey?: string) => any;

export type StoreInstance<T extends {}> = T & { $: StoreContext<T> };

let currentStateContext: StateContext | null = null;

/**
 * class created
 */
export const LIFE_CYCLE_CREATED = Symbol('class created');
/**
 * class dispose
 */
export const LIFE_CYCLE_DISPOSE = Symbol('class dispose');

export type StoreSubscribe = () => void;

// 订阅的id
let sid = 0;

function noon() {}

export class StoreContext<T extends {}> {
    /**
     * 全局的状态上下文
     */
    private _stateContext: StateContext | null;
    /**
     * 原始实例
     */
    private readonly _raw: T;
    /**
     * 原始实例的代理，每次状态变化时，代理都会更新
     */
    private _proxy: StoreInstance<T>;
    /**
     * 当前的 state 是否是草稿状态
     */
    private _drafting = false;
    /**
     * $ 函数的缓存对象
     */
    private readonly _cacheCommit = new Map<Function, Function>();
    /**
     * 当前的 store 的存储路径
     */
    public readonly keyPath: string;
    /**
     * 最新的状态
     */
    public state: Record<string, any>;
    /**
     * 当前的 store 的 state 是否已经连接到全局的 state 中
     */
    public connecting: boolean;
    private readonly _subs: Array<{ sid: number; cb: StoreSubscribe }> = [];

    public constructor(
        stateContext: StateContext,
        raw: T,
        state: Record<string, any>,
        keyPath: string
    ) {
        this._stateContext = stateContext;
        stateContext.add(keyPath, this);

        this._raw = raw;
        this._proxy = this._createProxyClass();

        this.state = state;
        this.keyPath = keyPath;
        this.connecting = stateContext.hasState(keyPath);

        this.get = this.get.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.dispose = this.dispose.bind(this);
    }

    /**
     * 获取当前代理实例，每次状态变化时，代理实例都会变化
     * 已绑定 this
     */
    public get() {
        this._depend();
        return this._proxy;
    }

    /**
     * 私有函数，外部调用不应该使用
     */
    public _setState(nextState: Record<string, any>) {
        const { _stateContext, keyPath: fullPath, _subs } = this;
        this.state = nextState;
        if (_stateContext) {
            _stateContext.updateState(fullPath, nextState);
        }
        this.connecting = !!_stateContext;
        const store = this._createProxyClass();
        this._proxy = store;

        if (_subs.length) {
            const subs = [..._subs];
            subs.forEach((item) => {
                item.cb();
            });
        }
    }

    /**
     * 销毁实例，释放内存
     * 已绑定 this
     */
    public dispose() {
        const { _stateContext, _proxy } = this;
        call(_proxy, LIFE_CYCLE_DISPOSE);
        if (_stateContext) {
            _stateContext.del(this.keyPath);
            this._stateContext = null;
        }
        this._subs.splice(0);
        this.dispose = noon;
    }

    /**
     * 订阅状态变化
     * @param cb 回调函数
     * 已绑定 this
     * @returns
     */
    public subscribe(cb: StoreSubscribe) {
        const _sid = ++sid;
        this._subs.push({
            sid,
            cb
        });
        return () => {
            const index = this._subs.findIndex((item) => item.sid === _sid);
            if (index > -1) {
                this._subs.splice(index, 1);
            }
        };
    }

    private _depend() {
        const stateContext = this._stateContext;
        if (stateContext) {
            if (this.connecting) {
                stateContext.depend(this.keyPath);
            } else {
                stateContext.depend();
            }
        }
    }

    private _createProxyClass() {
        const storeContext = this;
        return new Proxy(this._raw, {
            get(target, p, receiver) {
                if (p === '$') {
                    return storeContext;
                } else if (typeof p === 'string') {
                    const state = storeContext.state;
                    if (p in state) {
                        storeContext._depend();
                        return state[p];
                    }
                }
                const result = applyStateContext(
                    storeContext._stateContext,
                    () => Reflect.get(target, p, receiver)
                );
                if (
                    typeof result === 'function' &&
                    typeof p === 'string' &&
                    p.startsWith('$')
                ) {
                    let func = storeContext._cacheCommit.get(result);
                    if (!func) {
                        func = storeContext._createProxyCommit(result);
                        storeContext._cacheCommit.set(result, func);
                    }
                    return func;
                }

                return result;
            },
            set(target, p, newValue, receiver) {
                if (typeof p === 'string' && p in storeContext.state) {
                    if (storeContext._drafting) {
                        storeContext.state[p] = newValue;
                        return true;
                    }
                    throw new Error(
                        `Change the state in the agreed commit function, For example, $${p}('${String(newValue)}')`
                    );
                }
                return Reflect.set(target, p, newValue, receiver);
            }
        }) as any;
    }

    private _createProxyCommit(commitFunc: Function) {
        const connectContext = this;
        return function proxyCommit(...args: any) {
            if (connectContext._drafting) {
                return commitFunc.apply(connectContext._proxy, args);
            }

            const prevState = connectContext.state;
            let result: unknown;
            const nextState = produce(prevState, (draft) => {
                connectContext._drafting = true;
                connectContext.state = draft;
                try {
                    result = commitFunc.apply(connectContext._proxy, args);
                    connectContext._drafting = false;
                    connectContext.state = prevState;
                } catch (e) {
                    connectContext._drafting = false;
                    connectContext.state = prevState;
                    throw e;
                }
            });
            connectContext._setState(nextState);
            return result;
        };
    }
}

function getFullPath(name: string, cacheKey?: string) {
    return typeof cacheKey === 'string' ? name + '/' + cacheKey : name;
}

export function connectState(state: State) {
    const stateContext = getStateContext(state);
    return <T extends StoreConstructor>(
        Store: T,
        name: string,
        cacheKey?: string
    ): StoreInstance<InstanceType<T>> => {
        const fullPath = getFullPath(name, cacheKey);
        let storeContext: StoreContext<InstanceType<T>> | null =
            stateContext.get(fullPath);
        if (!storeContext) {
            const store = applyStateContext(
                stateContext,
                () => new Store(cacheKey)
            );
            let storeState: Record<string, any>;
            if (fullPath in state.value) {
                storeState = { ...store, ...state.value[fullPath] };
            } else {
                storeState = { ...store };
            }
            storeContext = new StoreContext<InstanceType<T>>(
                stateContext,
                store,
                storeState,
                fullPath
            );
            call(storeContext.get(), LIFE_CYCLE_CREATED);
        }
        return storeContext.get();
    };
}
/**
 * 查找外部的 store。如果没有找到则返回 null
 */
export function foreignStore<T extends StoreConstructor>(
    Store: T,
    name: string,
    cacheKey?: string
): InstanceType<T> | null {
    if (!currentStateContext) {
        throw new Error('No state context found');
    }
    const fullPath = getFullPath(name, cacheKey);
    const storeContext: StoreContext<InstanceType<T>> | null =
        currentStateContext.get(fullPath);
    if (storeContext) {
        return storeContext.get();
    }
    return null;
}

function call(obj: any, key: symbol) {
    if (typeof obj[key] === 'function') {
        return obj[key]();
    }
}

function applyStateContext<T = void>(
    stateContext: StateContext | null,
    cb: () => T
) {
    const prev = currentStateContext;
    currentStateContext = stateContext;
    const value = cb();
    currentStateContext = prev;
    return value;
}
