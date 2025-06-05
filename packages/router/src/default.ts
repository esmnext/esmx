import type { Route } from './types';

export function DEFAULT_LOCATION(to: Route, from: Route | null) {
    try {
        const newWindow = window.open(to.url.href);
        if (!newWindow) {
            location.href = to.url.href;
        } else {
            newWindow.opener = null; // 解除新窗口与当前窗口的关系
        }
    } catch (e) {
        location.href = to.url.href;
    }
}
