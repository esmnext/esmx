import type { NavigationType, Route, RouterScrollBehavior } from './types';
export const DEFAULT_SCROLL_BEHAVIOR: RouterScrollBehavior = (
    to,
    from,
    savedPosition
) => {
    if (savedPosition) {
        return savedPosition;
    }
    return {
        top: 0,
        left: 0,
        behavior: 'auto'
    };
};

export function DEFAULT_ON_OPEN(route: Route, navType: NavigationType) {
    try {
        const newWindow = window.open(route.url.href);
        if (!newWindow) {
            location.href = route.url.href;
        } else {
            newWindow.opener = null; // 解除新窗口与当前窗口的关系
        }
    } catch (e) {
        location.href = route.url.href;
    }
}
