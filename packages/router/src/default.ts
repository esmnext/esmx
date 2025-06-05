import type { Route } from './types';

export function DEFAULT_LOCATION(to: Route, from: Route | null) {
    const href = to.url.href;
    if (to.type.startsWith('push')) {
        try {
            const newWindow = window.open(href);
            if (!newWindow) {
                location.href = href;
            } else {
                newWindow.opener = null; // 解除新窗口与当前窗口的关系
            }
            return newWindow;
        } catch {}
    }
    location.href = href;
}
