
import type { HistoryState } from './history';
import type { Route } from './route';

/**
 * 路由跳转等事件使用的参数。
 * 和 {@link Route | `Route`} 的区别在于，{@link RouterLocation| `RouterLocation`} 是入参，{@link Route | `Route`} 是出参
 */
export interface RouterLocation {
    path?: string;
    /**
     * 按 Hanson 要求加入 undefined 类型。
     * 若为 undefined 则在解析时会删掉这个 query
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
