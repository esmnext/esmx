import { describe, expect, it } from 'vitest';
import { resolveRouteLocationInput } from '../src/location';

describe('resolveRouteLocationInput', () => {
    describe('undefined input handling', () => {
        it('should use default parameter when undefined is passed implicitly', () => {
            // When called without arguments, the default '/' parameter is used
            const result = resolveRouteLocationInput();
            expect(result).toEqual({ path: '/' });
        });

        it('should use default parameter even when undefined is explicitly passed', () => {
            const from = new URL(
                'http://localhost/previous/path?query=value#hash'
            );
            // JavaScript default parameters kick in even when undefined is explicitly passed
            const result = resolveRouteLocationInput(undefined as any, from);
            expect(result).toEqual({ path: '/' });
        });

        it('should use default parameter when undefined is passed without from URL', () => {
            const result = resolveRouteLocationInput(undefined as any, null);
            expect(result).toEqual({ path: '/' });
        });
    });

    describe('string input', () => {
        it('should convert string to path object', () => {
            const result = resolveRouteLocationInput('/user/123');
            expect(result).toEqual({ path: '/user/123' });
        });
    });

    describe('object input with path', () => {
        it('should return object as-is when path exists', () => {
            const input = { path: '/user/123', state: { id: 123 } };
            const result = resolveRouteLocationInput(input);
            expect(result).toBe(input);
        });

        it('should return object as-is when url exists', () => {
            const input = {
                url: 'https://example.com',
                state: { external: true }
            };
            const result = resolveRouteLocationInput(input);
            expect(result).toBe(input);
        });
    });

    describe('object input without path/url', () => {
        it('should return object as-is when from is null', () => {
            const input = { state: { new: true } };
            const result = resolveRouteLocationInput(input, null);
            expect(result).toBe(input);
        });

        it('should add url from previous route when conditions are met', () => {
            const input = {
                state: { updated: true },
                query: { tab: 'profile' }
            };
            const from = new URL('http://localhost/user/456?sort=name#info');

            const result = resolveRouteLocationInput(input, from);

            expect(result).toEqual({
                state: { updated: true },
                query: { tab: 'profile' },
                url: 'http://localhost/user/456?sort=name#info'
            });
            expect(result).not.toBe(input);
        });

        it('should handle empty query and hash correctly', () => {
            const input = { state: { test: true } };
            const from = new URL('http://localhost/simple/path');

            const result = resolveRouteLocationInput(input, from);

            expect(result).toEqual({
                state: { test: true },
                url: 'http://localhost/simple/path'
            });
        });
    });

    describe('edge cases', () => {
        it('should not override when path is empty string', () => {
            const input = { path: '', state: { test: true } };
            const from = new URL('http://localhost/user/456');

            const result = resolveRouteLocationInput(input, from);
            expect(result).toBe(input);
        });

        it('should not override when url is empty string', () => {
            const input = { url: '', state: { test: true } };
            const from = new URL('http://localhost/user/456');

            const result = resolveRouteLocationInput(input, from);
            expect(result).toBe(input);
        });

        it('should handle complex URL with all components', () => {
            const input = { query: { new: 'param' } };
            const from = new URL(
                'http://localhost:3000/complex/path?existing=value&multi=1&multi=2#section'
            );

            const result = resolveRouteLocationInput(input, from);

            expect(result).toEqual({
                query: { new: 'param' },
                url: 'http://localhost:3000/complex/path?existing=value&multi=1&multi=2#section'
            });
        });
    });

    describe('type safety', () => {
        it('should handle non-string properties correctly', () => {
            const input = {
                path: null as any,
                url: undefined as any,
                state: { test: true }
            };
            const from = new URL('http://localhost/fallback');

            const result = resolveRouteLocationInput(input, from);

            expect(result).toEqual({
                path: null,
                url: 'http://localhost/fallback',
                state: { test: true }
            });
        });

        it('should handle null input with from URL', () => {
            const from = new URL('http://localhost/fallback/path');
            const result = resolveRouteLocationInput(null as any, from);
            expect(result).toBe(null);
        });

        it('should handle null input without from URL', () => {
            const result = resolveRouteLocationInput(null as any, null);
            expect(result).toBe(null);
        });
    });

    describe('integration with Route constructor', () => {
        it('should handle routeOptions.toInput being undefined', () => {
            // Test the exact scenario used in Route constructor: routeOptions.toInput could be undefined
            const routeOptions = {
                toInput: undefined,
                from: new URL('http://localhost/current/path?param=value')
            };

            const result = resolveRouteLocationInput(
                routeOptions.toInput,
                routeOptions.from
            );

            // Since toInput is undefined, default parameter kicks in
            expect(result).toEqual({ path: '/' });
        });

        it('should work with valid route options object', () => {
            const routeOptions = {
                toInput: {
                    state: { navigatedFromSearch: true },
                    query: { filter: 'active' }
                },
                from: new URL(
                    'http://localhost/products?category=electronics#reviews'
                )
            };

            const result = resolveRouteLocationInput(
                routeOptions.toInput,
                routeOptions.from
            );

            expect(result).toEqual({
                state: { navigatedFromSearch: true },
                query: { filter: 'active' },
                url: 'http://localhost/products?category=electronics#reviews'
            });
        });
    });
});
