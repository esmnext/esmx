import { createMatcher } from './matcher';
import { RouterMode } from './types';
import type { Route, RouterOptions, RouterParsedOptions } from './types';
import { isBrowser } from './util';

/**
 * Gets the base URL object for the router.
 * @param options - Router options.
 * @returns The processed URL object.
 */
function getBaseUrl(options: RouterOptions): URL {
    // Determine the URL source
    let sourceUrl: string | URL;
    let context = '';

    if (options.base) {
        sourceUrl = options.base;
    } else if (isBrowser) {
        sourceUrl = location.origin;
    } else if (options.req) {
        // Server-side: try to get it from the req object
        const { req } = options;
        const protocol =
            req.headers['x-forwarded-proto'] ||
            req.headers['x-forwarded-protocol'] ||
            (req.socket && 'encrypted' in req.socket && req.socket.encrypted
                ? 'https'
                : 'http');
        const host =
            req.headers['x-forwarded-host'] ||
            req.headers.host ||
            req.headers['x-real-ip'] ||
            'localhost';
        const port = req.headers['x-forwarded-port'];
        const path = req.url || '';

        sourceUrl = `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
        context = 'from request headers';
    } else {
        // Server environment without req, or other unknown cases
        sourceUrl = 'https://www.esmnext.com/';
        context = !isBrowser
            ? 'server environment without request context'
            : 'unknown context';
    }

    // Parse the URL, falling back to a default on failure.
    // Use a try-catch block with the standard URL constructor for robustness.
    let base: URL;
    try {
        base = new URL('.', sourceUrl);
    } catch (e) {
        console.warn(
            `Failed to parse base URL ${context ? `(${context})` : ''}'${sourceUrl}', using default: https://www.esmnext.com/`
        );
        base = new URL('https://www.esmnext.com/');
    }

    // Clean up and return
    base.search = base.hash = '';
    return base;
}

export function parsedOptions(
    options: RouterOptions = {}
): RouterParsedOptions {
    const base = getBaseUrl(options);
    const routes = Array.from(options.routes ?? []);
    return Object.freeze<RouterParsedOptions>({
        rootStyle: options.rootStyle ? { ...options.rootStyle } : false,
        root: options.root || '',
        context: options.context ?? {},
        env: options.env || '',
        req: options.req || null,
        res: options.res || null,
        layer: options.layer ? { ...options.layer } : null,
        base,
        mode: isBrowser
            ? (options.mode ?? RouterMode.history)
            : RouterMode.memory,
        routes,
        apps:
            typeof options.apps === 'function'
                ? options.apps
                : Object.assign({}, options.apps),
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        location: options.location ?? DEFAULT_LOCATION,
        onBackNoResponse: options.onBackNoResponse ?? (() => {})
    });
}

export function DEFAULT_LOCATION(
    to: Route,
    from: Route | null,
    context?: { res?: any }
) {
    const href = to.url.href;

    // Server-side environment: handle application-level redirects and status codes
    if (!isBrowser && context?.res) {
        // Determine status code: prioritize route-specified code, default to 302 temporary redirect
        let statusCode = 302;

        // Validate redirect status code (3xx series)
        const validRedirectCodes = [300, 301, 302, 303, 304, 307, 308];
        if (to.statusCode && validRedirectCodes.includes(to.statusCode)) {
            statusCode = to.statusCode;
        } else if (to.statusCode) {
            console.warn(
                `Invalid redirect status code ${to.statusCode}, using default 302`
            );
        }

        // Set redirect response
        context.res.statusCode = statusCode;
        context.res.setHeader('Location', href);
        context.res.end();
        return;
    }

    // Client-side environment: handle browser navigation
    if (isBrowser) {
        if (to.isPush) {
            try {
                const newWindow = window.open(href);
                if (!newWindow) {
                    location.href = href;
                } else {
                    newWindow.opener = null; // Sever the relationship between the new window and the current one
                }
                return newWindow;
            } catch {}
        }
        location.href = href;
    }

    // Do nothing in a server environment without a res context
}
