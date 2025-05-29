import { DEFAULT_ON_OPEN_CROSS, DEFAULT_SCROLL_BEHAVIOR } from './default';
import { createMatcher } from './matcher';
import { RouterMode } from './types';
import type { RouterOptions, RouterParsedOptions } from './types';

const isBrowser = typeof window === 'object';

export function parsedOptions(options: RouterOptions): RouterParsedOptions {
    // 仅保留路径的目录，并去除 query 和 hash 部分
    const base = URL.parse('.', options.base);
    if (!base) {
        throw new Error(
            `Router 'base' option must be a valid URL. Received: ${options.base}`
        );
    }
    const mode =
        options.mode ?? (isBrowser ? RouterMode.history : RouterMode.abstract);
    const routes = options.routes ?? [];
    return {
        base,
        mode,
        routes,
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? (({ url }) => url),
        externalUrlHandler: async (args) => {
            if (options.externalUrlHandler?.(args) === false) {
                return;
            }
            return DEFAULT_ON_OPEN_CROSS(args);
        },
        scrollBehavior: options.scrollBehavior ?? DEFAULT_SCROLL_BEHAVIOR
    };
}
