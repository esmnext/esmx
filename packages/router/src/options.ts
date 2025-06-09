import { DEFAULT_LOCATION } from './default';
import { createMatcher } from './matcher';
import {
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
        id: options.id ?? 'app',
        context: options.context ?? {},
        env: options.env || '',
        req: options.req || null,
        res: options.res || null,
        layer: options.layer ?? null,
        base,
        mode,
        routes,
        apps: options.apps ?? {},
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        location: options.location ?? DEFAULT_LOCATION
    };
    return result;
}
