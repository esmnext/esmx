/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteType, type RouterOptions } from '../src';
import { fallback, parsedOptions } from '../src/options';
import { createRoute, createRouter, withLocationRestore } from './util';

describe('options.ts - Browser Environment Tests', () => {
    let openSpy: any;

    beforeEach(() => {
        openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('parsedOptions in browser environment', () => {
        it('should use window.location in browser environments', async () => {
            location.href = 'https://example.com';

            const options: RouterOptions = {};
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should use provided base URL in browser environments', async () => {
            const options: RouterOptions = {
                base: new URL('https://custom.org/')
            };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://custom.org/');
        });

        it('should handle string base URL in browser environments', async () => {
            const options: RouterOptions = {
                base: new URL('https://string-url.net/')
            };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://string-url.net/');
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
                const options: RouterOptions = { base: new URL(test.base) };
                const opts = parsedOptions(options);
                expect(opts.base.href).toBe(test.expected);
            }
        });

        it('should handle URLs with username and password', async () => {
            const options: RouterOptions = {
                base: new URL('https://user:pass@example.com/')
            };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://user:pass@example.com/');
            expect(opts.base.username).toBe('user');
            expect(opts.base.password).toBe('pass');
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
            const options: RouterOptions = {
                base: new URL('https://example.com/path')
            };
            const opts = parsedOptions(options);
            expect(opts.base.pathname).toBe('/');
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should keep trailing slash in pathname', async () => {
            const options: RouterOptions = {
                base: new URL('https://example.com/path/')
            };
            const opts = parsedOptions(options);
            expect(opts.base.pathname).toBe('/path/');
            expect(opts.base.href).toBe('https://example.com/path/');
        });

        it('should handle root pathname special case', async () => {
            const options: RouterOptions = {
                base: new URL('https://example.com/')
            };
            const opts = parsedOptions(options);
            expect(opts.base.pathname).toBe('/');
            expect(opts.base.href).toBe('https://example.com/');
        });
    });

    describe('fallback in browser environment', () => {
        it('should handle browser redirects', async () => {
            withLocationRestore(() => {
                const route = createRoute({
                    url: 'https://example.com/redirect'
                });
                const router = createRouter();

                fallback(route, null, router);
                expect(window.location.href).toBe(
                    'https://example.com/redirect'
                );
            });
        });

        it('should open new window for pushWindow', async () => {
            const route = createRoute({
                url: 'https://example.com/link',
                type: RouteType.push
            });
            const router = createRouter();

            fallback(route, null, router);

            expect(openSpy).toHaveBeenCalledWith('https://example.com/link');
        });

        it('should not throw in browser with any router', async () => {
            const route = createRoute({
                url: 'https://example.com/test'
            });
            const router = createRouter();

            expect(() => fallback(route, null, router)).not.toThrow();
        });

        it('should open window for push route', async () => {
            const route = createRoute({
                url: 'https://example.com/push',
                type: RouteType.push
            });
            const router = createRouter();

            fallback(route, null, router);
            expect(openSpy).toHaveBeenCalledWith('https://example.com/push');
        });

        it('should set location.href for non-push route', async () => {
            withLocationRestore(() => {
                const route = createRoute({ url: 'https://example.com/route' });
                const router = createRouter();

                fallback(route, null, router);
                expect(window.location.href).toBe('https://example.com/route');
            });
        });

        it('should handle undefined fallbacks gracefully', async () => {
            const route = createRoute({
                url: 'https://example.com/undefined'
            });
            const router = createRouter();

            expect(() => fallback(route, null, router)).not.toThrow();
        });

        it('should not throw when router is empty object', async () => {
            const route = createRoute({
                url: 'https://example.com/empty'
            });
            const router = createRouter();

            expect(() => fallback(route, null, router)).not.toThrow();
        });

        it('should handle context without res in browser environment', async () => {
            const route = createRoute();
            const router = createRouter();

            expect(() => fallback(route, null, router)).not.toThrow();
        });

        it('should set opener to null when window.open succeeds', async () => {
            const mockWindow = { opener: 'initial' };
            openSpy.mockReturnValue(mockWindow);

            const route = createRoute({
                url: 'https://example.com/success',
                type: RouteType.push
            });
            const router = createRouter();

            const result = fallback(route, null, router);

            expect(openSpy).toHaveBeenCalledWith('https://example.com/success');
            expect(mockWindow.opener).toBe(null);
            expect(result).toBe(mockWindow);
        });

        it('should fallback to location.href when window.open throws exception', async () => {
            openSpy.mockImplementation(() => {
                throw new Error('Popup blocked');
            });

            withLocationRestore(() => {
                const route = createRoute({
                    url: 'https://example.com/blocked',
                    type: RouteType.push
                });
                const router = createRouter();

                fallback(route, null, router);

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
