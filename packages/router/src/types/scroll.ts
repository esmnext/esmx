
import type { Awaitable } from "./common";
import type { RouteRecord } from "./route";

/**
 * Scroll position 与 {@link https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions | `ScrollToOptions`} 相似.
 * 注意并不是所有浏览器都支持`behavior`属性.
 */
export interface ScrollPositionCoordinates {
    behavior?: ScrollOptions['behavior'];
    left?: number;
    top?: number;
}

/**
 * 内部使用的 {@link ScrollPositionCoordinates} `left` 和 `top` 属性始终有值.
 * 必须是 HistoryStateValue 支持的类型.
 * @internal
 */
export interface _ScrollPositionNormalized {
    behavior?: ScrollOptions['behavior'];
    left: number;
    top: number;
}

export interface ScrollPositionElement extends ScrollToOptions {
    /**
     * 一个合法的 CSS 选择器. 部分特殊字符需要被转义 (https://mathiasbynens.be/notes/css-escapes).
     * @example
     * 这里是部分示例:
     *
     * - `.title`
     * - `.content:first-child`
     * - `#marker`
     * - `#marker\~with\~symbols`
     * - `#marker.with.dot`: 选中的是 `class="with dot" id="marker"`, 而不是 `id="marker.with.dot"`
     *
     */
    el: string | Element;
}

/**
 * 滚动行为处理器类型
 */
export type ScrollBehaviorHandler<T> = (
    to: RouteRecord,
    from: RouteRecord,
    savedPosition: T | undefined
) => Awaitable<ScrollPosition | false | undefined>;

/**
 * 滚动参数
 */
export type ScrollPosition = ScrollPositionCoordinates | ScrollPositionElement;

/**
 * @param to - 前往的路由
 * @param from - 离开的路由
 * @param savedPosition - 存储的位置，如果不存在则为 null
 */
export type RouterScrollBehavior = (
    to: RouteRecord,
    from: RouteRecord,
    savedPosition: ScrollPosition | null
) => Awaitable<ScrollPosition | false | undefined>;
