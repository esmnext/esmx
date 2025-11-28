/**
 * @vitest-environment node
 */
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    type MockInstance,
    vi
} from 'vitest';
import type { RouterOptions } from '../src';
import { fallback } from '../src/options';
import { createRequest, createResponse, createRouter } from './util';

describe('options.ts - Node.js Environment Tests', () => {
    let consoleSpy: MockInstance<typeof console.log>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('getBaseUrl edge cases in Node.js environment', () => {
        it('should use default URL and NOT warn when in a non-browser environment without request context', async () => {
            const router = createRouter({});

            expect(router.parsedOptions.base.href).toBe('https://esmx.dev/');

            expect(consoleSpy).not.toHaveBeenCalled();

            router.destroy();
        });

        it('should handle complex server environment scenarios', async () => {
            const testCases = [
                { options: {}, expectedUrl: 'https://esmx.dev/' },
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
                const router = createRouter(testCase.options as RouterOptions);
                expect(router.parsedOptions.base.href).toBe(
                    testCase.expectedUrl
                );
                router.destroy();
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
                const router = createRouter({
                    req: createRequest({ headers: testCase.headers, url: '/' })
                });
                expect(
                    router.parsedOptions.base.href,
                    testCase.description
                ).toBe(testCase.expectedUrl);
                expect(
                    router.parsedOptions.base.port,
                    `${testCase.description} - port`
                ).toBe(testCase.expectedPort);
                router.destroy();
            }
        });

        it('should handle req.url being undefined (line 34 coverage)', async () => {
            const req = createRequest({ headers: { host: 'example.com' } });
            req.url = undefined;

            const router = createRouter({ req });
            expect(router.parsedOptions.base.href).toBe('http://example.com/');
            router.destroy();
        });

        it('should parse base URL from request headers', async () => {
            const router = createRouter({
                req: createRequest({
                    headers: {
                        host: 'example.com',
                        'x-forwarded-proto': 'https'
                    },
                    url: '/api/test'
                })
            });
            expect(router.parsedOptions.base.href).toBe(
                'https://example.com/api/'
            );
            router.destroy();
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
                const router = createRouter({
                    req: createRequest({ headers: testCase.headers })
                });
                expect(
                    router.parsedOptions.base.href,
                    testCase.description
                ).toBe(testCase.expectedUrl);
                router.destroy();
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
                const router = createRouter({
                    req: createRequest({
                        headers: { host: 'example.com' },
                        url: '/',
                        encrypted: testCase.encrypted
                    })
                });
                expect(
                    router.parsedOptions.base.href,
                    testCase.description
                ).toBe(testCase.expectedUrl);
                router.destroy();
            }
        });

        it('should handle missing host header', async () => {
            const router = createRouter({
                req: createRequest({
                    headers: { 'x-forwarded-proto': 'https' }
                })
            });
            expect(router.parsedOptions.base.href).toBe('https://localhost/');
            router.destroy();
        });

        it('should handle x-real-ip header as fallback', async () => {
            const router = createRouter({
                req: createRequest({
                    headers: {
                        'x-real-ip': 'real.example.com',
                        'x-forwarded-proto': 'https'
                    }
                })
            });
            expect(router.parsedOptions.base.href).toBe(
                'https://real.example.com/'
            );
            router.destroy();
        });

        it('should handle complex URL path', async () => {
            const router = createRouter({
                req: createRequest({
                    headers: {
                        host: 'example.com',
                        'x-forwarded-proto': 'https'
                    },
                    url: '/api/v1/users?id=123'
                })
            });
            expect(router.parsedOptions.base.href).toBe(
                'https://example.com/api/v1/'
            );
            router.destroy();
        });

        it('should use default URL when no req provided in server environment', async () => {
            const router = createRouter({});
            expect(router.parsedOptions.base.href).toBe('https://esmx.dev/');
            router.destroy();
        });
    });

    describe('parsedOptions default values in Node.js environment', () => {
        it('should use default empty function for handleLayerClose when not provided', () => {
            const router = createRouter({});

            expect(router.parsedOptions.handleLayerClose).toBeDefined();
            expect(typeof router.parsedOptions.handleLayerClose).toBe(
                'function'
            );

            const realRouter = createRouter();
            expect(() =>
                router.parsedOptions.handleLayerClose(realRouter)
            ).not.toThrow();
            realRouter.destroy();
            router.destroy();
        });

        it('should use provided handleLayerClose function when specified', () => {
            const customHandler = vi.fn();
            const router = createRouter({
                handleLayerClose: customHandler
            });

            expect(router.parsedOptions.handleLayerClose).toBe(customHandler);
            expect(router.parsedOptions.handleLayerClose).not.toBe(() => {});

            const realRouter = createRouter();
            router.parsedOptions.handleLayerClose(realRouter);
            expect(customHandler).toHaveBeenCalledWith(realRouter);
            realRouter.destroy();
            router.destroy();
        });

        it('should use default empty function for handleBackBoundary when not provided', () => {
            const router = createRouter({});

            expect(router.parsedOptions.handleBackBoundary).toBeDefined();
            expect(typeof router.parsedOptions.handleBackBoundary).toBe(
                'function'
            );

            const realRouter = createRouter();
            expect(() =>
                router.parsedOptions.handleBackBoundary(realRouter)
            ).not.toThrow();
            realRouter.destroy();
            router.destroy();
        });

        it('should use provided handleBackBoundary function when specified', () => {
            const customHandler = vi.fn();
            const router = createRouter({
                handleBackBoundary: customHandler
            });

            expect(router.parsedOptions.handleBackBoundary).toBe(customHandler);

            const realRouter = createRouter();
            router.parsedOptions.handleBackBoundary(realRouter);
            expect(customHandler).toHaveBeenCalledWith(realRouter);
            realRouter.destroy();
            router.destroy();
        });
    });

    describe('fallback in Node.js environment', () => {
        it('should handle server-side redirects properly', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve({
                url: 'https://example.com/redirect',
                statusCode: 301
            });

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should do nothing when no res context in server environment', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve('https://example.com/test');

            expect(() =>
                fallback(targetRoute, router.route, router)
            ).not.toThrow();
        });

        it('should handle invalid redirect status codes', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve({
                url: 'https://example.com/redirect',
                statusCode: 200 // Invalid redirect status code
            });

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(302);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid redirect status code 200')
            );
        });

        it('should handle valid redirect status codes', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const statusCode of validCodes) {
                const targetRoute = router.resolve({
                    url: 'https://example.com/redirect',
                    statusCode
                });

                fallback(targetRoute, router.route, router);
                expect(res.statusCode).toBe(statusCode);
            }
        });

        it('should handle server-side redirect with default status code', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve('/');

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(302);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                targetRoute.url.href
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should use custom status code when valid', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve({ path: '/', statusCode: 301 });

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                targetRoute.url.href
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should handle invalid status codes by defaulting to 302', async () => {
            const testCases = [
                { statusCode: null, description: 'null statusCode' },
                { statusCode: 0, description: 'zero statusCode' }
            ];

            for (const testCase of testCases) {
                const res = createResponse();
                const router = createRouter({ res });

                await router.push('/current');

                const targetRoute = router.resolve({
                    path: '/',
                    statusCode: testCase.statusCode
                });

                fallback(targetRoute, router.route, router);

                expect(res.statusCode, testCase.description).toBe(302);
            }
        });

        it('should use default status code if not specified', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve('https://example.com/redirect');

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(302); // Default redirect code
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should handle 304 Not Modified differently (no Location header)', async () => {
            const res = createResponse();
            const router = createRouter({ res });

            await router.push('/current');

            const targetRoute = router.resolve({
                url: 'https://example.com/unmodified',
                statusCode: 304
            });

            fallback(targetRoute, router.route, router);

            expect(res.statusCode).toBe(304);
            expect(res.end).toHaveBeenCalled();
        });
    });
});
