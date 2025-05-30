import { DEFAULT_ON_OPEN, DEFAULT_SCROLL_BEHAVIOR } from './default';
import { createMatcher } from './matcher';
import {
    type NavigationType,
    type OpenType,
    RouterMode,
    type RouterOptions,
    type RouterParsedOptions
} from './types';

const isBrowser = typeof window === 'object';

export function parsedOptions(options: RouterOptions): RouterParsedOptions {
    const mode =
        options.mode ?? (isBrowser ? RouterMode.history : RouterMode.abstract);
    const base = options.base ?? (isBrowser ? new URL(location.href) : null);
    const routes = options.routes ?? [];
    if (base === null) {
        throw new Error(
            `Router 'base' option is required. Please provide a 'base' URL in options.`
        );
    }
    const result: RouterParsedOptions = {
        base,
        mode,
        routes,
        apps: options.apps ?? {},
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        onOpen: (url: URL, navType: NavigationType, openType: OpenType) => {
            const result = options.onOpen?.(url, navType, openType);
            if (result !== false) {
                DEFAULT_ON_OPEN(url, navType, openType);
            }
            return true;
        },
        scrollBehavior: options.scrollBehavior ?? DEFAULT_SCROLL_BEHAVIOR
    };
    return result;
}
