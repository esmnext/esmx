/** Internal {@link ScrollToOptions | `ScrollToOptions`}: `left` and `top` properties always have values */
interface _ScrollPosition extends ScrollToOptions {
    left: number;
    top: number;
}

export interface ScrollPositionElement extends ScrollToOptions {
    /**
     * A valid CSS selector. Some special characters need to be escaped (https://mathiasbynens.be/notes/css-escapes).
     * @example
     * Here are some examples:
     *
     * - `.title`
     * - `.content:first-child`
     * - `#marker`
     * - `#marker\~with\~symbols`
     * - `#marker.with.dot`: Selects `class="with dot" id="marker"`, not `id="marker.with.dot"`
     *
     */
    el: string | Element;
}

/** Scroll parameters */
export type ScrollPosition = ScrollToOptions | ScrollPositionElement;

/** Get current window scroll position */
export const winScrollPos = (): _ScrollPosition => ({
    left: window.scrollX,
    top: window.scrollY
});

/** Get element position for scrolling in document */
function getElementPosition(
    el: Element,
    offset: ScrollToOptions
): _ScrollPosition {
    const docRect = document.documentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return {
        behavior: offset.behavior,
        left: elRect.left - docRect.left - (offset.left || 0),
        top: elRect.top - docRect.top - (offset.top || 0)
    };
}

/** Scroll to specified position */
export function scrollToPosition(position: ScrollPosition): void {
    if ('el' in position) {
        const positionEl = position.el;

        const el =
            typeof positionEl === 'string'
                ? document.querySelector(positionEl)
                : positionEl;

        if (!el) return;

        position = getElementPosition(el, position);
    }

    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo(position);
    } else {
        window.scrollTo(
            Number.isFinite(position.left) ? position.left! : window.scrollX,
            Number.isFinite(position.top) ? position.top! : window.scrollY
        );
    }
}

/** Stored scroll positions */
export const scrollPositions = new Map<string, _ScrollPosition>();

const POSITION_KEY = '__scroll_position_key';

/** Save scroll position */
export function saveScrollPosition(
    key: string,
    scrollPosition = winScrollPos()
) {
    scrollPosition = { ...scrollPosition };
    scrollPositions.set(key, scrollPosition);

    try {
        if (location.href !== key) return;
        // preserve the existing history state as it could be overridden by the user
        const stateCopy = {
            ...(history.state || {}),
            [POSITION_KEY]: scrollPosition
        };
        history.replaceState(stateCopy, '');
    } catch (error) {}
}

/** Get saved scroll position */
export function getSavedScrollPosition(
    key: string,
    defaultValue: _ScrollPosition | null = null
): _ScrollPosition | null {
    const scroll = scrollPositions.get(key) || history.state[POSITION_KEY];

    // Saved scroll position should not be used multiple times, next time should use newly saved position
    scrollPositions.delete(key);
    return scroll || defaultValue;
}
