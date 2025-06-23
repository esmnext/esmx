/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouterOptions } from '../src';
import { fallback, parsedOptions } from '../src/options';
import {
    createRequest,
    createResponse,
    createRoute,
    createRouter
} from './util';

describe('options.ts - Node.js Environment Tests', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getBaseUrl edge cases in Node.js environment', () => {
        it('should use default URL and NOT warn when in a non-browser environment without request context', async () => {
            const opts = parsedOptions({});

            expect(opts.base.href).toBe('https://www.esmnext.com/');

            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should use default URL and warn when base is an invalid URL string', async () => {
            const options: RouterOptions = {
                base: 'this-is-not-a-valid-url' as any
            };
            const opts = parsedOptions(options);

            expect(opts.base.href).toBe('https://www.esmnext.com/');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to parse base URL')
            );
        });

        it('should handle complex server environment scenarios', async () => {
            const testCases = [
                { options: {}, expectedUrl: 'https://www.esmnext.com/' },
                {
                    options: { base: new URL('https://custom.com') },
                    expectedUrl: 'https://custom.com/'
                },
                {
                    options: {
                        req: createRequest({
                            headers: { host: 'example.com' },
                            url: '/test'
                        })
                    },
                    expectedUrl: 'http://example.com/'
                },
                {
                    options: {
                        req: createRequest({
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

        it('should handle port number logic with and without port', async () => {
            const testCases = [
                {
                    description: 'with port',
                    headers: {
                        host: 'localhost',
                        'x-forwarded-port': '3000'
                    } as Record<string, string>,
                    expectedUrl: 'http://localhost:3000/',
                    expectedPort: '3000'
                },
                {
                    description: 'without port',
                    headers: { host: 'localhost' } as Record<string, string>,
                    expectedUrl: 'http://localhost/',
                    expectedPort: ''
                }
            ];

            for (const testCase of testCases) {
                const opts = parsedOptions({
                    req: createRequest({ headers: testCase.headers, url: '/' })
                });
                expect(opts.base.href, testCase.description).toBe(
                    testCase.expectedUrl
                );
                expect(opts.base.port, `${testCase.description} - port`).toBe(
                    testCase.expectedPort
                );
            }
        });

        it('should handle req.url being undefined (line 34 coverage)', async () => {
            const req = createRequest({ headers: { host: 'example.com' } });
            req.url = undefined;

            const opts = parsedOptions({ req });
            expect(opts.base.href).toBe('http://example.com/');
        });

        it('should parse base URL from request headers', async () => {
            const opts = parsedOptions({
                req: createRequest({
                    headers: {
                        host: 'example.com',
                        'x-forwarded-proto': 'https'
                    },
                    url: '/api/test'
                })
            });
            expect(opts.base.href).toBe('https://example.com/api/');
        });

        it('should handle various x-forwarded headers', async () => {
            const testCases = [
                {
                    description: 'x-forwarded-host header',
                    headers: {
                        host: 'internal.com',
                        'x-forwarded-host': 'public.com',
                        'x-forwarded-proto': 'https'
                    } as Record<string, string>,
                    expectedUrl: 'https://public.com/'
                },
                {
                    description: 'x-forwarded-port header',
                    headers: {
                        host: 'example.com',
                        'x-forwarded-proto': 'https',
                        'x-forwarded-port': '8443'
                    } as Record<string, string>,
                    expectedUrl: 'https://example.com:8443/'
                }
            ];

            for (const testCase of testCases) {
                const opts = parsedOptions({
                    req: createRequest({ headers: testCase.headers })
                });
                expect(opts.base.href, testCase.description).toBe(
                    testCase.expectedUrl
                );
            }
        });

        it('should handle encrypted and non-encrypted sockets', async () => {
            const testCases = [
                {
                    description: 'encrypted socket',
                    encrypted: true,
                    expectedUrl: 'https://example.com/'
                },
                {
                    description: 'non-encrypted socket',
                    encrypted: false,
                    expectedUrl: 'http://example.com/'
                }
            ];

            for (const testCase of testCases) {
                const opts = parsedOptions({
                    req: createRequest({
                        headers: { host: 'example.com' },
                        url: '/',
                        encrypted: testCase.encrypted
                    })
                });
                expect(opts.base.href, testCase.description).toBe(
                    testCase.expectedUrl
                );
            }
        });

        it('should handle missing host header', async () => {
            const opts = parsedOptions({
                req: createRequest({
                    headers: { 'x-forwarded-proto': 'https' }
                })
            });
            expect(opts.base.href).toBe('https://localhost/');
        });

        it('should handle x-real-ip header as fallback', async () => {
            const opts = parsedOptions({
                req: createRequest({
                    headers: {
                        'x-real-ip': 'real.example.com',
                        'x-forwarded-proto': 'https'
                    }
                })
            });
            expect(opts.base.href).toBe('https://real.example.com/');
        });

        it('should handle complex URL path', async () => {
            const opts = parsedOptions({
                req: createRequest({
                    headers: {
                        host: 'example.com',
                        'x-forwarded-proto': 'https'
                    },
                    url: '/api/v1/users?id=123'
                })
            });
            expect(opts.base.href).toBe('https://example.com/api/v1/');
        });

        it('should use default URL when no req provided in server environment', async () => {
            const opts = parsedOptions({});
            expect(opts.base.href).toBe('https://www.esmnext.com/');
        });
    });

    describe('parsedOptions default values in Node.js environment', () => {
        it('should use default empty function for handleLayerClose when not provided', () => {
            const options: RouterOptions = {};

            const opts = parsedOptions(options);

            expect(opts.handleLayerClose).toBeDefined();
            expect(typeof opts.handleLayerClose).toBe('function');

            const realRouter = createRouter();
            expect(() => opts.handleLayerClose(realRouter)).not.toThrow();
            realRouter.destroy();
        });

        it('should use provided handleLayerClose function when specified', () => {
            const customHandler = vi.fn();
            const options: RouterOptions = {
                handleLayerClose: customHandler
            };

            const opts = parsedOptions(options);

            expect(opts.handleLayerClose).toBe(customHandler);
            expect(opts.handleLayerClose).not.toBe(() => {});

            const realRouter = createRouter();
            opts.handleLayerClose(realRouter);
            expect(customHandler).toHaveBeenCalledWith(realRouter);
            realRouter.destroy();
        });

        it('should use default empty function for handleBackBoundary when not provided', () => {
            const options: RouterOptions = {};

            const opts = parsedOptions(options);

            expect(opts.handleBackBoundary).toBeDefined();
            expect(typeof opts.handleBackBoundary).toBe('function');

            const realRouter = createRouter();
            expect(() => opts.handleBackBoundary(realRouter)).not.toThrow();
            realRouter.destroy();
        });

        it('should use provided handleBackBoundary function when specified', () => {
            const customHandler = vi.fn();
            const options: RouterOptions = {
                handleBackBoundary: customHandler
            };

            const opts = parsedOptions(options);

            expect(opts.handleBackBoundary).toBe(customHandler);

            const realRouter = createRouter();
            opts.handleBackBoundary(realRouter);
            expect(customHandler).toHaveBeenCalledWith(realRouter);
            realRouter.destroy();
        });
    });

    describe('fallback in Node.js environment', () => {
        it('should handle server-side redirects properly', async () => {
            const res = createResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 301
            });
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should do nothing when no res context in server environment', async () => {
            const route = createRoute({
                url: 'https://example.com/test'
            });
            const router = createRouter();

            expect(() => fallback(route, null, router)).not.toThrow();
        });

        it('should handle invalid redirect status codes', async () => {
            const res = createResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 200 // Invalid redirect status code
            });
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(302);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid redirect status code 200')
            );
        });

        it('should handle valid redirect status codes', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const statusCode of validCodes) {
                const route = createRoute({
                    url: 'https://example.com/redirect',
                    statusCode
                });

                fallback(route, null, router);
                expect(res.statusCode).toBe(statusCode);
            }
        });

        it('should handle server-side redirect with default status code', async () => {
            const route = createRoute();
            const res = createResponse();
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(302);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                route.url.href
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should use custom status code when valid', async () => {
            const route = createRoute({ statusCode: 301 });
            const res = createResponse();
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                route.url.href
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should handle invalid status codes by defaulting to 302', async () => {
            const testCases = [
                { statusCode: null, description: 'null statusCode' },
                { statusCode: 0, description: 'zero statusCode' }
            ];

            for (const testCase of testCases) {
                const route = createRoute({ statusCode: testCase.statusCode });
                const res = createResponse();
                const router = createRouter({ res });

                fallback(route, null, router);

                expect(res.statusCode, testCase.description).toBe(302);
            }
        });

        it('should use default status code if not specified', async () => {
            const res = createResponse();
            const route = createRoute({
                url: 'https://example.com/redirect'
            });
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(302); // Default redirect code
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should handle 304 Not Modified differently (no Location header)', async () => {
            const res = createResponse();
            const route = createRoute({
                url: 'https://example.com/unmodified',
                statusCode: 304
            });
            const router = createRouter({ res });

            fallback(route, null, router);

            expect(res.statusCode).toBe(304);
            expect(res.end).toHaveBeenCalled();
        });
    });
});
