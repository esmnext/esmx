import type { RouteLocation, RouteLocationInput } from './types';
import { isNotNullish } from './util';

/**
 * Normalizes a URL input into a URL object.
 * @param url - The URL or string to normalize.
 * @param base - The base URL to resolve against if the input is relative.
 * @returns A URL object.
 */
export function normalizeURL(url: string | URL, base: URL): URL {
    if (url instanceof URL) {
        return url;
    }

    // Handle protocol-relative URLs (e.g., //example.com)
    if (url.startsWith('//')) {
        // Use the current base URL's protocol for security and consistency
        const protocol = base.protocol;
        return new URL(`${protocol}${url}`);
    }

    // Handle root-relative paths
    if (url.startsWith('/')) {
        const newBase = new URL('.', base);
        const parsed = new URL(url, newBase);
        // This ensures that the path is resolved relative to the base's path directory.
        parsed.pathname = newBase.pathname.slice(0, -1) + parsed.pathname;
        return parsed;
    }

    try {
        // Try to parse as an absolute URL.
        // This is the WHATWG standard approach (new URL()) and works consistently across all modern browsers and Node.js.
        // We use a try-catch block because the standard URL constructor throws an error for invalid URLs.
        //
        // NOTE: While `URL.parse()` might be observed in Chromium-based browsers (e.g., Chrome, Edge),
        // it is a non-standard, legacy feature implemented by the V8 engine for Node.js compatibility.
        // It is not part of the WHATWG URL Standard and is not supported by other browsers like Firefox or Safari.
        // Therefore, relying on it would compromise cross-browser compatibility.
        return new URL(url);
    } catch (e) {
        // Otherwise, parse as a relative URL
        return new URL(url, base);
    }
}

/**
 * Parses a RouteLocationInput object into a full URL.
 * @param toInput - The route location input.
 * @param baseURL - The base URL to resolve against.
 * @returns The parsed URL object.
 */
export function parseLocation(toInput: RouteLocationInput, baseURL: URL): URL {
    if (typeof toInput === 'string') {
        return normalizeURL(toInput, baseURL);
    }
    const url = normalizeURL(toInput.path ?? toInput.url ?? '', baseURL);
    const searchParams = url.searchParams;

    // Priority: queryArray > query > query in path
    const mergedQuery: Record<string, string | string[]> = {};

    // First, add query values
    if (toInput.query) {
        Object.entries(toInput.query).forEach(([key, value]) => {
            if (typeof value !== 'undefined') {
                mergedQuery[key] = value;
            }
        });
    }

    // Then, add queryArray values (higher priority)
    if (toInput.queryArray) {
        Object.entries(toInput.queryArray).forEach(([key, value]) => {
            if (typeof value !== 'undefined') {
                mergedQuery[key] = value;
            }
        });
    }

    Object.entries(mergedQuery).forEach(([key, value]) => {
        searchParams.delete(key); // Clear previous params with the same name
        value = Array.isArray(value) ? value : [value];
        value
            .filter((v) => isNotNullish(v) && !Number.isNaN(v))
            .forEach((v) => {
                searchParams.append(key, String(v));
            });
    });

    // Set the hash (URL fragment identifier)
    if (toInput.hash) {
        url.hash = toInput.hash;
    }

    return url;
}

/**
 * Resolves RouteLocationInput with fallback from previous route
 * @param toInput - The route location input
 * @param from - The previous route URL (optional)
 * @returns Resolved RouteLocation object
 */
export function resolveRouteLocationInput(
    toInput: RouteLocationInput = '/',
    from: URL | null = null
): RouteLocation {
    if (typeof toInput === 'string') {
        return { path: toInput };
    }

    if (
        toInput &&
        typeof toInput === 'object' &&
        typeof toInput.path !== 'string' &&
        typeof toInput.url !== 'string' &&
        from !== null
    ) {
        return { ...toInput, url: from.href };
    }

    return toInput;
}
