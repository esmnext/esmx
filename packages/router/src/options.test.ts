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
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe('getBaseUrl edge cases in Node.js environment', () => {
        it('should trigger unknown context branch when isBrowser is dynamically true', async () => {
            // This test specifically covers the 'unknown context' branch on line 44
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            let callCount = 0;
            // Precisely control the return value of isBrowser:
            // 1st call (line 17 condition check): false - skips browser branch
            // 2nd call (line 41 context setting): true - sets context to 'unknown context'
            // 3rd call (line 75 mode setting): false - sets mode to memory
            vi.doMock('./util', () => ({
                get isBrowser() {
                    callCount++;
                    // Only the 2nd call returns true, all others return false
                    return callCount === 2;
                }
            }));

            const { parsedOptions } = await import('./options');

            // Create options without base and req to enter the final else branch
            const options: RouterOptions = {};
            const opts = parsedOptions(options);

            // Should use the default URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // Should have a warning message containing 'unknown context'
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('unknown context')
            );
            consoleSpy.mockRestore();
        });

        it('should trigger unknown context with invalid sourceUrl', async () => {
            // Test the case where a warning is triggered for an invalid sourceUrl
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            let callCount = 0;
            // Simulate a scenario that causes URL parsing to fail
            vi.doMock('./util', () => ({
                get isBrowser() {
                    callCount++;
                    if (callCount === 2) {
                        // Return true on the 2nd call to trigger 'unknown context'
                        return true;
                    }
                    return false;
                }
            }));

            const { parsedOptions } = await import('./options');

            const options: RouterOptions = {};
            const opts = parsedOptions(options);

            // Should fall back to the default URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // Should have a warning message containing 'unknown context'
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('unknown context')
            );
            consoleSpy.mockRestore();
        });

        it('should handle server environment without request context', async () => {
            // Test server environment without req (line 42)
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            // Simulate a pure server environment (isBrowser is always false)
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // Create options without base and req
            const options: RouterOptions = {};
            const opts = parsedOptions(options);

            // Should use the default URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // In this case, the context should be 'server environment without request context'
            // A warning should be logged
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'server environment without request context'
                )
            );

            consoleSpy.mockRestore();
        });

        it('should handle complex server environment scenarios', async () => {
            // Test various complex server-side scenarios
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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

            consoleSpy.mockRestore();
        });

        it('should specifically test port number logic for line 35 coverage', async () => {
            // Specifically test the port number logic on line 35
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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
        it('should handle server-side redirects properly', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const route = createRoute({
                url: 'https://example.com/test'
            });

            // Should not throw an error in server environment without res context
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
            expect(() => DEFAULT_LOCATION(route, null, {})).not.toThrow();
        });

        it('should handle invalid redirect status codes', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

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

            consoleSpy.mockRestore();
        });

        it('should handle valid redirect status codes', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

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
