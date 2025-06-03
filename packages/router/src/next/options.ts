import { DEFAULT_ON_OPEN, DEFAULT_SCROLL_BEHAVIOR } from './default';
import { createMatcher } from './matcher';
import {
    type NavigationType,
    type Route,
    RouterMode,
    type RouterOptions,
    type RouterParsedOptions
} from './types';
import { isBrowser } from './util';

export function parsedOptions(options: RouterOptions): RouterParsedOptions {
    const mode = isBrowser
        ? (options.mode ?? RouterMode.history)
        : RouterMode.abstract;
    const base = options.base ?? (isBrowser ? new URL(location.href) : null);
    const routes = options.routes ?? [];
    if (base === null) {
        throw new Error(
            `Router 'base' option is required. Please provide a 'base' URL in options.`
        );
    }
    const result: RouterParsedOptions = {
        env: options.env || '',
        req: options.req || null,
        res: options.res || null,
        base,
        mode,
        routes,
        apps: options.apps ?? {},
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        onOpen: (route: Route, navType: NavigationType) => {
            if (isBrowser) {
                const result = options.onOpen?.(route, navType);
                if (result !== false) {
                    DEFAULT_ON_OPEN(route, navType);
                }
            }
            return true;
        },
        onServerLocation(route, navType) {
            return true;
        },
        scrollBehavior: options.scrollBehavior ?? DEFAULT_SCROLL_BEHAVIOR
    };
    return result;
}
