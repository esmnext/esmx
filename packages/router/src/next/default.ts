import type { Route } from './types';

export function DEFAULT_ON_OPEN(route: Route) {
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
