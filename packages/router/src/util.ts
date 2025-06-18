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
    // Avoid trailing hash symbol impact from empty hash
    // biome-ignore lint/correctness/noSelfAssign:
    url1.hash = url1.hash;
    // biome-ignore lint/correctness/noSelfAssign:
    url2.hash = url2.hash;
    return url1.href === url2.href;
}

/**
 * Compare if two routes match
 *
 * @param route1 First route object
 * @param route2 Second route object, may be null
 * @param matchType Match type
 * - 'route': Route-level matching, compare if route configurations are the same
 * - 'exact': Exact matching, compare if full paths are the same
 * - 'include': Include matching, check if route1 path starts with route2 path
 * @returns Whether they match
 */
export function isRouteMatched(
    route1: Route,
    route2: Route | null,
    matchType: RouteMatchType
): boolean {
    if (!route2) return false;

    switch (matchType) {
        case 'route':
            // Route-level matching - compare route configurations
            return route1.config === route2.config;

        case 'exact':
            // Exact matching - full paths are identical
            return route1.fullPath === route2.fullPath;

        case 'include':
            // Include matching - route1 path contains route2 path
            return route1.fullPath.startsWith(route2.fullPath);

        default:
            return false;
    }
}
