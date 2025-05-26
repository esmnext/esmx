
import type { RouterRawLocation } from './location';
import type { RouteRecord } from './route';
import type { RouterInstance } from './router';

/**
 * HTML5 history state value 支持的类型
 * @description HTML5 history state 不支持所有的数据类型，比如 Symbol Function 类型就是无法写入state 的
 *
 * @internal
 */
export type HistoryStateValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | HistoryState
    | HistoryStateValue[];

/**
 * HTML history.state的数据类型
 */
export interface HistoryState {
    [x: number]: HistoryStateValue;
    [x: string]: HistoryStateValue;
}

export type HistoryActionType = 'push' | 'replace' | 'reload' | 'forceReload' | 'pushWindow' | 'pushLayer';

export type NavReturnType<T extends any = undefined> = Promise<{
    navType: HistoryActionType;
    type: 'error' | 'success' | 'aborted' | 'cancelled' | 'duplicated';
    data?: T;
}>;

/**
 * 路由历史
 */
export interface RouterHistory {
    /**
     * 路由实例
     */
    readonly router: RouterInstance;

    /**
     * 匹配的当前路由
     */
    readonly current: RouteRecord;

    /**
     * 解析路由
     */
    resolve: (location: RouterRawLocation) => RouteRecord;

    /**
     * 更新路由
     */
    updateRoute: (route: RouteRecord) => void;

    /**
     * 跳转方法，会创建新的历史纪录
     */
    push: (location: RouterRawLocation) => NavReturnType;

    /**
     * 跳转方法，替换当前历史记录
     */
    replace: (location: RouterRawLocation) => NavReturnType;

    /**
     * 新开浏览器窗口的方法，在服务端会调用 push 作为替代
     */
    pushWindow: (location: RouterRawLocation) => NavReturnType;

    /**
     * 刷新当前路由。会将实例卸载并重新挂载。
     */
    reload: (location?: RouterRawLocation) => NavReturnType;

    /**
     * 强制刷新当前路由。浏览器会刷新网页。
     */
    forceReload: (location?: RouterRawLocation) => NavReturnType;

    /**
     * 路由移动到指定历史记录方法
     */
    go: (delta: number) => void;

    /**
     * 路由历史记录前进方法
     */
    forward: () => void;

    /**
     * 路由历史记录后退方法
     */
    back: () => void;

    /**
     * 初始化方法
     */
    init: () => Promise<void>;

    /**
     * 卸载方法
     */
    destroy: () => void;
}

/**
 * 路由模式
 */
export enum RouterMode {
    /**
     * hash模式
     * 按 Hanson 要求，不支持hash模式
     */
    // HASH = 'hash',

    /**
     * history模式
     * @description 客户端默认使用 history 模式
     */
    HISTORY = 'history',

    /**
     * 虚拟路由模式
     * @description 此模式不存在历史记录，服务端默认使用 abstract 模式
     */
    ABSTRACT = 'abstract'
}
