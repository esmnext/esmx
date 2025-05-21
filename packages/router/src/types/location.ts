
import type { HistoryState } from './history';

/**
 * 路由跳转等事件使用的参数
 */
export interface RouterLocation {
    path?: string;
    /**
     * 按 Hanson 要求加入 undefined 类型
     */
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    params?: Record<string, string>;
    hash?: string;
    state?: HistoryState;
}

/**
 * 路由跳转等事件使用的参数
 */
export type RouterRawLocation =
    | (RouterLocation & {
          /**
           * 设置此参数后，不保存滚动位置，跳转后页面位置仍在原处
           */
          keepScrollPosition?: boolean;
      })
    | string;
