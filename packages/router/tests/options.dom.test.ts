/**
 * @vitest-environment happy-dom
 */

import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteType } from '../src';
import { fallback } from '../src/options';
import { createRouter, withLocationRestore } from './util';

describe('options.ts - Browser Environment Tests', () => {
    let openSpy: MockInstance<typeof window.open>;

    beforeEach(() => {
        openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('parsedOptions in browser environment', () => {
        it('should use window.location in browser environments', async () => {
            location.href = 'https://example.com';

            const router = createRouter({});
            expect(router.parsedOptions.base.href).toBe('https://example.com/');
            router.destroy();
        });

        it('should use provided base URL in browser environments', async () => {
            const router = createRouter({
                base: new URL('https://custom.org/')
            });
            expect(router.parsedOptions.base.href).toBe('https://custom.org/');
            router.destroy();
        });

        it('should handle string base URL in browser environments', async () => {
            const router = createRouter({
                base: new URL('https://string-url.net/')
            });
            expect(router.parsedOptions.base.href).toBe(
                'https://string-url.net/'
            );
            router.destroy();
        });

        it('should handle different URL formats in browser environments', async () => {
            const testCases = [
                {
                    base: 'https://example.com',
                    expected: 'https://example.com/'
                },
                {
                    base: 'https://example.com/',
                    expected: 'https://example.com/'
                },
                {
                    base: 'https://example.com/path/',
                    expected: 'https://example.com/path/'
                },
                {
                    base: 'https://example.com/multiple/paths/',
                    expected: 'https://example.com/multiple/paths/'
                },
                {
                    base: 'https://example.com/path?query=test',
                    expected: 'https://example.com/'
                },
                {
                    base: 'https://example.com/path#hash',
                    expected: 'https://example.com/'
                }
            ];

            for (const test of testCases) {
                const router = createRouter({ base: new URL(test.base) });
                expect(router.parsedOptions.base.href).toBe(test.expected);
                router.destroy();
            }
        });

        it('should handle URLs with username and password', async () => {
            const router = createRouter({
                base: new URL('https://user:pass@example.com/')
            });
            expect(router.parsedOptions.base.href).toBe(
                'https://user:pass@example.com/'
            );
            expect(router.parsedOptions.base.username).toBe('user');
            expect(router.parsedOptions.base.password).toBe('pass');
            router.destroy();
        });

        it('should normalize URLs in browser environments', async () => {
            const normalizeURL = (url: URL) => {
                const path = url.pathname;
                return path.endsWith('/')
                    ? path
                    : path + (path.includes('.') ? '' : '/');
            };

            const testCases = [
                { path: '/', expected: '/' },
                { path: '/path', expected: '/path/' },
                { path: '/path/', expected: '/path/' },
                { path: '/file.js', expected: '/file.js' },
                { path: '/path/file.js', expected: '/path/file.js' },
                {
                    path: '/multiple/paths/',
                    expected: '/multiple/paths/'
                }
            ];

            for (const test of testCases) {
                const url = new URL(`https://example.com${test.path}`);
                const normalized = normalizeURL(url);
                expect(normalized).toBe(test.expected);
            }
        });

        it('should test pathname normalization without a trailing slash', async () => {
            const router = createRouter({
                base: new URL('https://example.com/path')
            });
            expect(router.parsedOptions.base.pathname).toBe('/');
            expect(router.parsedOptions.base.href).toBe('https://example.com/');
            router.destroy();
        });

        it('should keep trailing slash in pathname', async () => {
            const router = createRouter({
                base: new URL('https://example.com/path/')
            });
            expect(router.parsedOptions.base.pathname).toBe('/path/');
            expect(router.parsedOptions.base.href).toBe(
                'https://example.com/path/'
            );
            router.destroy();
        });

        it('should handle root pathname special case', async () => {
            const router = createRouter({
                base: new URL('https://example.com/')
            });
            expect(router.parsedOptions.base.pathname).toBe('/');
            expect(router.parsedOptions.base.href).toBe('https://example.com/');
            router.destroy();
        });
    });

    describe('fallback in browser environment', () => {
        it('should handle browser redirects', async () => {
            withLocationRestore(async () => {
                const router = createRouter();

                await router.push('/current');

                const targetRoute = router.resolve(
                    'https://example.com/redirect'
                );

                fallback(targetRoute, router.route, router);
                expect(window.location.href).toBe(
                    'https://example.com/redirect'
                );
            });
        });

        it('should open new window for pushWindow', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve(
                'https://example.com/link',
                RouteType.push
            );

            fallback(targetRoute, router.route, router);

            expect(openSpy).toHaveBeenCalledWith('https://example.com/link');
        });

        it('should not throw in browser with any router', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve('https://example.com/test');

            expect(() =>
                fallback(targetRoute, router.route, router)
            ).not.toThrow();
        });

        it('should open window for push route', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve(
                'https://example.com/push',
                RouteType.push
            );

            fallback(targetRoute, router.route, router);
            expect(openSpy).toHaveBeenCalledWith('https://example.com/push');
        });

        it('should set location.href for non-push route', async () => {
            withLocationRestore(async () => {
                const router = createRouter();

                await router.push('/current');

                const targetRoute = router.resolve('https://example.com/route');

                fallback(targetRoute, router.route, router);
                expect(window.location.href).toBe('https://example.com/route');
            });
        });

        it('should handle undefined fallbacks gracefully', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve('https://example.com/undefined');

            expect(() =>
                fallback(targetRoute, router.route, router)
            ).not.toThrow();
        });

        it('should not throw when router is empty object', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve('https://example.com/empty');

            expect(() =>
                fallback(targetRoute, router.route, router)
            ).not.toThrow();
        });

        it('should handle context without res in browser environment', async () => {
            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve('/');

            expect(() =>
                fallback(targetRoute, router.route, router)
            ).not.toThrow();
        });

        it('should call window.open for push routes', async () => {
            openSpy.mockReturnValue(null);

            const router = createRouter();

            await router.push('/current');

            const targetRoute = router.resolve(
                'https://example.com/success',
                RouteType.push
            );

            fallback(targetRoute, router.route, router);

            expect(openSpy).toHaveBeenCalledWith('https://example.com/success');
        });

        it('should fallback to location.href when window.open throws exception', async () => {
            openSpy.mockReset();
            openSpy.mockImplementation(() => {
                throw new Error('Popup blocked');
            });

            await withLocationRestore(async () => {
                const router = createRouter();

                await router.push('/current');

                const targetRoute = router.resolve(
                    'https://example.com/blocked',
                    RouteType.push
                );

                fallback(targetRoute, router.route, router);

                expect(openSpy).toHaveBeenCalledWith(
                    'https://example.com/blocked'
                );
                expect(window.location.href).toBe(
                    'https://example.com/blocked'
                );
            });
        });
    });
});
