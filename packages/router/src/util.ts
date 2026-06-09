import type { Route, RouteConfirmHookResult, RouteMatchType } from './types';
export const isBrowser = typeof window === 'object';

export function isNotNullish(value: unknown): boolean {
    return (
        value !== undefined &&
        value !== null &&
        !Number.isNaN(
            value instanceof Number
                ? value.valueOf() // For new Number() cases
                : value
        )
    );
}

export function isPlainObject(o: unknown): o is Record<string, any> {
    return (
        o?.constructor === Object ||
        Object.prototype.toString.call(o) === '[object Object]'
    );
}

/**
 * Check if value is a valid non-empty plain object
 * Only check enumerable string keys to ensure it's a proper plain object
 * @param value Value to check
 * @returns true if it's a valid non-empty plain object
 */
export function isNonEmptyPlainObject(
    value: unknown
): value is Record<string, any> {
    if (!isPlainObject(value)) {
        return false;
    }
    // Only check enumerable string keys to ensure valid properties of plain object
    return Object.keys(value as Record<string, any>).length > 0;
}

export const removeFromArray = <T>(arr: T[], ele: T) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    const i = Number.isNaN(ele)
        ? // If ele is NaN, use findIndex to search for NaN, because NaN !== NaN, so we can't use indexOf directly
          arr.findIndex((item) => Number.isNaN(item))
        : arr.indexOf(ele);
    if (i === -1) return;
    arr.splice(i, 1);
};

export function isValidConfirmHookResult(
    result: unknown
): result is Exclude<RouteConfirmHookResult, void> {
    return (
        result === false ||
        typeof result === 'function' ||
        typeof result === 'string' ||
        isPlainObject(result)
    );
}

export function isUrlEqual(url1: URL, url2?: URL | null): boolean {
    // If url2 doesn't exist, return false
    if (!url2) {
        return false;
    }

    // If it's the same object reference, return true directly
    if (url1 === url2) {
        return true;
    }

    // Copy and sort query parameters
    (url1 = new URL(url1)).searchParams.sort();
    (url2 = new URL(url2)).searchParams.sort();
    // Normalize trailing empty hash:
    // new URL('https://a.com/path#').href includes a trailing '#',
    // but new URL('https://a.com/path').href does not.
    // Assigning hash to itself triggers the setter to re-normalize the URL,
    // ensuring both forms produce the same href.
    url1.hash = url1.hash;
    url2.hash = url2.hash;
    return url1.href === url2.href;
}

/**
 * Compare if two routes match
 *
 * @param fromRoute First route object
 * @param toRoute Second route object, may be null
 * @param matchType Match type
 * - 'route': Route-level matching, compare if route configurations are the same
 * - 'exact': Exact matching, compare if full paths are the same
 * - 'include': Include matching, check if route1 path starts with route2 path
 * @returns Whether they match
 */
export function isRouteMatched(
    fromRoute: Route,
    toRoute: Route | null,
    matchType: RouteMatchType
): boolean {
    if (!toRoute) return false;

    switch (matchType) {
        case 'route':
            // Route-level matching - compare route configurations
            return fromRoute.config === toRoute.config;

        case 'exact':
            // Exact matching - full paths are identical
            return fromRoute.fullPath === toRoute.fullPath;

        case 'include':
            // Include matching - route1 path contains route2 path
            return fromRoute.fullPath.startsWith(toRoute.fullPath);

        default:
            return false;
    }
}

export function decodeParams<T extends Record<string, string | string[]>>(
    params: T
): T {
    const result = {} as T;

    for (const key in params) {
        const value = params[key];
        if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                decodeURIComponent(item)
            ) as T[typeof key];
        } else {
            result[key] = decodeURIComponent(value) as T[typeof key];
        }
    }

    return result;
}

/**
 * Validates that SSR renderToString output contains exactly one root HTML element.
 * Non-production only - throws if validation fails.
 */
export function validateSsrRootElement(html: string): void {
    const trimmed = html.trim();
    const firstMatch = trimmed.match(/^<([a-zA-Z][^\s>]*)/);
    const firstTag = firstMatch?.[1];
    const lastTag = trimmed.match(/<\/([a-zA-Z][^\s>]*)>\s*$/)?.[1];
    if (!firstTag || firstTag !== lastTag) {
        throw new Error(
            'SSR renderToString() must return exactly one root HTML element. ' +
                'Current output: ' +
                trimmed.slice(0, 100)
        );
    }
    // Find the ROOT element's matching close tag by depth-counting occurrences
    // of the root tag, so a single root that nests same-tag children (e.g. a
    // `<div>` wrapping child `<div>`s — very common) is not mistaken for
    // multiple roots. A naive "first `</tag>`" scan matches an inner close and
    // wrongly reports trailing content. Anything after the matched root close is
    // a sibling root → invalid.
    const tagRe = new RegExp(`<(/?)${firstTag}(?:\\s[^>]*)?(/?)>`, 'g');
    let depth = 0;
    let rootCloseEnd = -1;
    let tag: RegExpExecArray | null = tagRe.exec(trimmed);
    while (tag !== null) {
        if (tag[1] === '/') {
            depth--;
            if (depth === 0) {
                rootCloseEnd = tagRe.lastIndex;
                break;
            }
        } else if (tag[2] !== '/') {
            depth++;
        }
        tag = tagRe.exec(trimmed);
    }
    if (rootCloseEnd === -1 || trimmed.slice(rootCloseEnd).trim().length > 0) {
        throw new Error(
            'SSR renderToString() must return exactly one root HTML element. ' +
                'Current output: ' +
                trimmed.slice(0, 100)
        );
    }
}
