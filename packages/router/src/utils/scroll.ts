import type {
    RouterRawLocation,
    ScrollPosition,
    ScrollPositionCoordinates,
    _ScrollPositionNormalized
} from '../types';
import { warn } from './warn';

/**
 * 获取当前滚动位置
 */
export const computeScrollPosition = (): _ScrollPositionNormalized => ({
    left: window.scrollX,
    top: window.scrollY
});

/**
 * 获取元素位置
 */
function getElementPosition(
    el: Element,
    offset: ScrollPositionCoordinates
): _ScrollPositionNormalized {
    const docRect = document.documentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return {
        behavior: offset.behavior,
        left: elRect.left - docRect.left - (offset.left || 0),
        top: elRect.top - docRect.top - (offset.top || 0)
    };
}

/**
 * 滚动到指定位置
 */
export function scrollToPosition(position: ScrollPosition): void {
    let scrollToOptions: ScrollPositionCoordinates;

    if ('el' in position) {
        const positionEl = position.el;
        const isIdSelector =
            typeof positionEl === 'string' && positionEl.startsWith('#');

        const el =
            typeof positionEl === 'string'
                ? isIdSelector
                    ? document.getElementById(positionEl.slice(1))
                    : document.querySelector(positionEl)
                : positionEl;

        if (!el) {
            return;
        }
        scrollToOptions = getElementPosition(el, position);
    } else {
        scrollToOptions = position;
    }

    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo(scrollToOptions);
    } else {
        window.scrollTo(
            scrollToOptions.left != null
                ? scrollToOptions.left
                : window.scrollX,
            scrollToOptions.top != null ? scrollToOptions.top : window.scrollY
        );
    }
}

/**
 * 存储的滚动位置
 */
export const scrollPositions = new Map<string, _ScrollPositionNormalized>();

const POSITION_KEY = '__scroll_position_key';

/**
 * 保存滚动位置
 */
export function saveScrollPosition(
    key: string,
    scrollPosition: _ScrollPositionNormalized
) {
    scrollPositions.set(key, scrollPosition);
    // preserve existing history state as it could be overriden by the user
    const stateCopy = Object.assign({}, window.history.state);
    stateCopy[POSITION_KEY] = scrollPosition;

    try {
        const protocolAndPath =
            window.location.protocol + '//' + window.location.host;
        const absolutePath = window.location.href.replace(protocolAndPath, '');
        window.history.replaceState(stateCopy, '', absolutePath);
    } catch (error) {
        warn(`Failed to save scroll position.`, error);
    }
}

/**
 * 获取存储的滚动位置
 */
export function getSavedScrollPosition(
    key: string
): _ScrollPositionNormalized | null {
    const scroll = scrollPositions.get(key) || history.state[POSITION_KEY];

    // 保存的滚动位置信息不应当被多次使用, 下一次应当使用新保存的位置信息
    scrollPositions.delete(key);
    return scroll || null;
}

/**
 * 获取跳转配置的保持滚动位置参数
 */
export function getKeepScrollPosition(location: RouterRawLocation): boolean {
    if (typeof location === 'string') return false;
    return location.keepScrollPosition || false;
}
