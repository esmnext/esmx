import type { RouterParsedOptions, RouterScrollBehavior } from './types';
import { NavigationActionType } from './types';
import { openWindow } from './util';

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

export const DEFAULT_ON_OPEN_CROSS: RouterParsedOptions['externalUrlHandler'] =
    ({ url, type }) => {
        const replace = [
            NavigationActionType.replace,
            NavigationActionType.reload,
            NavigationActionType.forceReload
        ].includes(type);
        if (replace) {
            location.replace(url);
            return;
        }
        openWindow(url);
    };
