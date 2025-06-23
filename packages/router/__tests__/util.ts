import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { vi } from 'vitest';
import {
    Route,
    type RouteLocation,
    RouteType,
    type RouterOptions
} from '../src';
import { parsedOptions } from '../src/options';
import { Router } from '../src/router';
export function createRequest(
    options: {
        headers?: Record<string, string | string[]>;
        url?: string;
        method?: string;
        httpVersion?: string;
        encrypted?: boolean;
    } = {}
): IncomingMessage {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.httpVersion = options.httpVersion || '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    if (options.headers) {
        Object.assign(req.headers, options.headers);
    }

    // Support explicit encrypted setting or auto-detect from headers
    const isEncrypted =
        options.encrypted !== undefined
            ? options.encrypted
            : options.headers?.['x-forwarded-proto'] === 'https';

    if (isEncrypted !== undefined) {
        Object.defineProperty(req.socket, 'encrypted', { value: isEncrypted });
    }

    return req;
}

export function createResponse(): ServerResponse {
    const socket = new Socket();
    const res = new ServerResponse(new IncomingMessage(socket));

    const headers: Record<string, string> = {};
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = vi.fn(
        (name: string, value: string | number | readonly string[]) => {
            headers[name.toLowerCase()] = String(value);
            return originalSetHeader(name, value);
        }
    );
    res.getHeader = vi.fn((name: string) => headers[name.toLowerCase()]);
    res.end = vi.fn();

    return res;
}

export function createRouter(options?: Partial<RouterOptions>): Router {
    const routerOptions: RouterOptions = {
        base: new URL('http://localhost/'),
        routes: [{ path: '/test', component: 'TestComponent' }],
        ...options
    };

    return new Router(routerOptions);
}

export function createRoute(
    options: {
        path?: string;
        url?: string;
        statusCode?: number | null;
        type?: RouteType;
    } = {}
): Route {
    const baseUrl = new URL('http://localhost/');
    const routerOptions: RouterOptions = {
        base: baseUrl,
        routes: [{ path: '/test', component: 'TestComponent' }]
    };

    const navigationType = options.type || RouteType.none;
    const routeLocation: RouteLocation = {};

    if (options.url) {
        routeLocation.url = options.url;
    } else {
        routeLocation.path = options.path || '/';
    }

    if (options.statusCode !== undefined) {
        routeLocation.statusCode = options.statusCode;
    }

    return new Route({
        options: parsedOptions(routerOptions),
        toType: navigationType,
        toInput: routeLocation,
        from: null
    });
}

/**
 * Helper function to save and restore window.location.href for DOM tests
 * @param testFn - Test function to execute
 * @returns The result of the test function
 */
export function withLocationRestore<T>(testFn: () => T): T {
    if (typeof window === 'undefined') {
        return testFn();
    }

    const originalHref = window.location.href;
    try {
        return testFn();
    } finally {
        window.location.href = originalHref;
    }
}
