import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteType } from './types';
import type { RouterOptions } from './types';

// Create a real IncomingMessage object
function createIncomingMessage(options: {
    headers?: Record<string, string | string[]>;
    url?: string;
    method?: string;
    httpVersion?: string;
}): IncomingMessage {
    const socket = new Socket();
    const req = new IncomingMessage(socket);

    // Set basic properties
    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.httpVersion = options.httpVersion || '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;

    // Set headers
    if (options.headers) {
        Object.assign(req.headers, options.headers);
    }

    return req;
}

// Create a real ServerResponse object
function createServerResponse(): ServerResponse {
    const socket = new Socket();
    const res = new ServerResponse(new IncomingMessage(socket));

    // Add methods needed for testing
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

// Create a real Route object
function createRoute(
    options: {
        path?: string;
        url?: string;
        statusCode?: number | null;
        type?: RouteType;
        isPush?: boolean;
    } = {}
): Route {
    // Create basic RouterParsedOptions
    const routerOptions = parsedOptions({
        base: new URL('http://localhost/'),
        routes: [{ path: '/test', component: 'TestComponent' }]
    });

    // Construct RouteOptions parameters
    const routeOptions = {
        options: routerOptions,
        toType: options.type || RouteType.none,
        toInput: options.url || options.path || '/',
        from: null
    };

    const route = new Route(routeOptions);

    // Set statusCode (if provided)
    if (options.statusCode !== undefined) {
        route.statusCode = options.statusCode;
    }

    return route;
}

describe('options.ts - Node.js Environment Tests', () => {
    let consoleSpy: any;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        consoleSpy.mockRestore();
    });

    describe('getBaseUrl edge cases in Node.js environment', () => {
        beforeEach(() => {
            // Ensure isBrowser is consistently false for all tests in this suite
            vi.doMock('./util', () => ({
                isBrowser: false
            }));
        });
        afterEach(() => {
            vi.doUnmock('./util');
        });
        it('should use default URL and NOT warn when in a non-browser environment without request context', async () => {
            // This test verifies the fallback behavior in a server environment where no `req` object is provided.
            // In this case, it should silently fall back to the default URL without a warning.
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({});

            // Should use the default URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // Should NOT log a warning
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should use default URL and warn when base is an invalid URL string', async () => {
            // This test replaces 'should trigger unknown context with invalid sourceUrl'.
            // It provides an invalid `base` option and checks for the warning.
            const { parsedOptions } = await import('./options');

            // Pass an invalid URL string as the base
            const options: RouterOptions = {
                base: 'this-is-not-a-valid-url' as any
            };
            const opts = parsedOptions(options);

            // Should fall back to the default URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // Should log a warning about the failed parsing
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to parse base URL')
            );
        });

        it('should handle complex server environment scenarios', async () => {
            // Test various complex server-side scenarios
            const { parsedOptions } = await import('./options');

            // Test various server configurations
            const testCases = [
                { options: {}, expectedUrl: 'https://www.esmnext.com/' },
                {
                    options: { base: new URL('https://custom.com') },
                    expectedUrl: 'https://custom.com/'
                },
                {
                    options: {
                        req: createIncomingMessage({
                            headers: { host: 'example.com' },
                            url: '/test'
                        })
                    },
                    // The path is cleaned up, so the final result is http://example.com/
                    expectedUrl: 'http://example.com/'
                },
                {
                    // Test with port number (covers line 35)
                    options: {
                        req: createIncomingMessage({
                            headers: {
                                host: 'example.com',
                                'x-forwarded-port': '8080'
                            },
                            url: '/api'
                        })
                    },
                    expectedUrl: 'http://example.com:8080/'
                }
            ];

            for (const testCase of testCases) {
                const opts = parsedOptions(testCase.options as RouterOptions);
                expect(opts.base.href).toBe(testCase.expectedUrl);
            }
        });

        it('should specifically test port number logic for line 35 coverage', async () => {
            // Specifically test the port number logic on line 35
            const { parsedOptions } = await import('./options');

            // Create a request that explicitly includes a port number
            const options: RouterOptions = {
                req: createIncomingMessage({
                    headers: {
                        host: 'localhost',
                        'x-forwarded-port': '3000'
                    },
                    url: '/'
                })
            };

            const opts = parsedOptions(options);

            // Verify that the port number is correctly included in the URL
            expect(opts.base.href).toBe('http://localhost:3000/');
            expect(opts.base.port).toBe('3000');
        });

        it('should test line 35 without port number', async () => {
            // Test the branch on line 35 where no port number is present
            const { parsedOptions } = await import('./options');

            // Create a request without a port number
            const options: RouterOptions = {
                req: createIncomingMessage({
                    headers: {
                        host: 'localhost'
                        // Note: no 'x-forwarded-port'
                    },
                    url: '/'
                })
            };

            const opts = parsedOptions(options);

            // Verify the URL does not contain a port number
            expect(opts.base.href).toBe('http://localhost/');
            expect(opts.base.port).toBe('');
        });

        it('should handle req.url being undefined (line 34 coverage)', async () => {
            // Test the req.url || '' branch on line 34
            const { parsedOptions } = await import('./options');

            // Create a request where req.url is undefined
            const req = createIncomingMessage({
                headers: {
                    host: 'example.com'
                }
                // Note: no url property, so req.url will be undefined
            });

            // Manually set url to undefined
            req.url = undefined;

            const options: RouterOptions = { req };
            const opts = parsedOptions(options);

            // Verify the URL is constructed correctly, with an empty path
            expect(opts.base.href).toBe('http://example.com/');
        });
    });

    describe('DEFAULT_LOCATION in Node.js environment', () => {
        beforeEach(() => {
            // Ensure isBrowser is consistently false for Node.js tests
            vi.doMock('./util', () => ({
                isBrowser: false
            }));
        });

        afterEach(() => {
            // Restore the spy and unmock after each test
            vi.doUnmock('./util');
        });
        it('should handle server-side redirects properly', async () => {
            const { DEFAULT_LOCATION } = await import('./options');

            const res = createServerResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 301
            });

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should do nothing when no res context in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');

            const route = createRoute({
                url: 'https://example.com/test'
            });

            // Should not throw an error in server environment without res context
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
            expect(() => DEFAULT_LOCATION(route, null, {})).not.toThrow();
        });

        it('should handle invalid redirect status codes', async () => {
            const { DEFAULT_LOCATION } = await import('./options');

            const res = createServerResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 200 // Invalid redirect status code
            });

            DEFAULT_LOCATION(route, null, { res });

            // Should use the default 302 status code
            expect(res.statusCode).toBe(302);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid redirect status code 200')
            );
        });

        it('should handle valid redirect status codes', async () => {
            const { DEFAULT_LOCATION } = await import('./options');

            const res = createServerResponse();

            // Test all valid redirect status codes
            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const statusCode of validCodes) {
                const route = createRoute({
                    url: 'https://example.com/redirect',
                    statusCode
                });

                DEFAULT_LOCATION(route, null, { res });
                expect(res.statusCode).toBe(statusCode);
            }
        });
    });
});
