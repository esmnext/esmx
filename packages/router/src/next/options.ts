import { DEFAULT_ON_OPEN_CROSS, DEFAULT_SCROLL_BEHAVIOR } from './default';
import { createMatcher } from './matcher';
import {
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
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        onOpenCrossOrigin: options.onOpenCrossOrigin ?? DEFAULT_ON_OPEN_CROSS,
        onOpenCrossApp: options.onOpenCrossApp ?? DEFAULT_ON_OPEN_CROSS,
        scrollBehavior: options.scrollBehavior ?? DEFAULT_SCROLL_BEHAVIOR
    };
    return result;
}
