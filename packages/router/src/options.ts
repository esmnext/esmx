import { DEFAULT_LOCATION } from './default';
import { createMatcher } from './matcher';
import { RouterMode } from './types';
import type { RouterOptions, RouterParsedOptions } from './types';
import { isBrowser } from './util';

export function parsedOptions(options: RouterOptions): RouterParsedOptions {
    if (!options.base && !isBrowser)
        throw new Error(
            `Router 'base' option is required. Please provide a 'base' URL in options.`
        );
    const base = URL.parse('.', options.base ?? location.href);
    if (base === null)
        throw new Error(
            `Invalid 'base' URL provided in router options: ${options.base}. Please provide a valid URL.`
        );
    base.search = base.hash = '';
    const routes = Array.from(options.routes ?? []);
    return Object.freeze<RouterParsedOptions>({
        rootStyle: options.rootStyle ? { ...options.rootStyle } : false,
        id: options.id || 'app',
        context: Object.assign({}, options.context),
        env: options.env || '',
        req: options.req || null,
        res: options.res || null,
        layer: options.layer ? { ...options.layer } : null,
        get base() {
            return base;
        },
        mode: isBrowser
            ? (options.mode ?? RouterMode.history)
            : RouterMode.abstract,
        routes,
        apps:
            typeof options.apps === 'function'
                ? options.apps
                : Object.assign({}, options.apps),
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        location: options.location ?? DEFAULT_LOCATION
    });
}
