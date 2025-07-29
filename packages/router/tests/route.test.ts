import { describe, expect, it, vi } from 'vitest';
import { parsedOptions } from '../src/options';
import {
    NON_ENUMERABLE_PROPERTIES,
    Route,
    applyRouteParams
} from '../src/route';
import type { Router } from '../src/router';
import { RouteType, RouterMode } from '../src/types';
import type {
    RouteConfig,
    RouteConfirmHook,
    RouteHandleHook,
    RouterOptions,
    RouterParsedOptions
} from '../src/types';

describe('Route Class Complete Test Suite', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail', requireAuth: true }
            },
            {
                path: '/posts/:postId/comments/:commentId',
                meta: { title: 'Comment Detail' }
            },
            {
                path: '/admin/(.*)',
                meta: { title: 'Admin', role: 'admin' }
            }
        ];

        const routerOptions: RouterOptions = {
            root: '#test',
            context: { version: '1.0.0' },
            routes: mockRoutes,
            mode: RouterMode.history,
            base,
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            fallback: () => {},
            rootStyle: false,
            handleBackBoundary: () => {},
            handleLayerClose: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    describe('🏗️ Constructor Tests', () => {
        describe('Basic Construction', () => {
            it('should create route with default options', () => {
                const route = new Route();

                expect(route.type).toBe(RouteType.push);
                expect(route.isPush).toBe(true);
                expect(route.path).toBe('/');
                expect(route.state).toEqual({});
                expect(route.params).toEqual({});
                expect(route.query).toEqual({});
                expect(route.queryArray).toEqual({});
            });

            it('should correctly handle string path', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.path).toBe('/users/123');
                expect(route.params.id).toBe('123');
                expect(route.type).toBe(RouteType.push);
                expect(route.isPush).toBe(true);
            });

            it('should correctly handle object-form route location', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.replace,
                    toInput: {
                        path: '/users/456',
                        query: { tab: 'profile' },
                        state: { fromPage: 'dashboard' },
                        keepScrollPosition: true
                    }
                });

                expect(route.path).toBe('/users/456');
                expect(route.params.id).toBe('456');
                expect(route.query.tab).toBe('profile');
                expect(route.state.fromPage).toBe('dashboard');
                expect(route.keepScrollPosition).toBe(true);
                expect(route.isPush).toBe(false);
            });
        });

        describe('URL Parsing and Matching', () => {
            it('should correctly parse complex URL', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tab=profile&sort=name#section1'
                });

                expect(route.path).toBe('/users/123');
                expect(route.fullPath).toBe(
                    '/users/123?tab=profile&sort=name#section1'
                );
                expect(route.query.tab).toBe('profile');
                expect(route.query.sort).toBe('name');
                expect(route.url.hash).toBe('#section1');
            });

            it('should handle multi-value query parameters', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tags=js&tags=react&tags=vue'
                });

                expect(route.query.tags).toBe('js'); // First value
                expect(route.queryArray.tags).toEqual(['js', 'react', 'vue']);
            });

            it('should correctly match nested route parameters', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/posts/456/comments/789'
                });

                expect(route.params.postId).toBe('456');
                expect(route.params.commentId).toBe('789');
                expect(route.matched.length).toBeGreaterThan(0);
            });

            it('should handle unmatched routes', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/unknown/path'
                });

                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.meta).toEqual({});
            });
        });

        describe('State and Metadata Handling', () => {
            it('should correctly set route metadata', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.meta.title).toBe('User Detail');
                expect(route.meta.requireAuth).toBe(true);
            });

            it('should correctly initialize state object', () => {
                const options = createOptions();
                const initialState = {
                    userId: 123,
                    permissions: ['read', 'write']
                };
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: initialState }
                });

                expect(route.state).toEqual(initialState);
                expect(route.state).not.toBe(initialState); // Should be new object
            });
        });

        describe('🔍 Cross-domain and Path Calculation Tests', () => {
            it('should handle cross-domain URLs (different origin)', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'https://external.com/api/data'
                });

                // Cross-domain should not match routes
                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.path).toBe('/api/data'); // Use original pathname
                expect(route.fullPath).toBe('/api/data'); // Use original path calculation
            });

            it('should handle URLs with different base paths', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'http://localhost:3000/other/path'
                });

                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.path).toBe('/other/path'); // Use original pathname
            });

            it('should correctly calculate path when matched', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'http://localhost:3000/app/users/123'
                });

                expect(route.path).toBe('/users/123');
                expect(route.matched.length).toBeGreaterThan(0);
            });

            it('should correctly calculate fullPath when unmatched', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'https://external.com/api/data?key=value#section'
                });

                expect(route.fullPath).toBe('/api/data?key=value#section');
                expect(route.path).toBe('/api/data');
            });
        });

        describe('🔧 normalizeURL Integration Tests', () => {
            it('should use custom normalizeURL function', () => {
                const customNormalizeURL = vi.fn(
                    (url: URL, from: URL | null) => {
                        // Custom logic: convert path to lowercase
                        url.pathname = url.pathname.toLowerCase();
                        return url;
                    }
                );

                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/USERS/123'
                });

                expect(customNormalizeURL).toHaveBeenCalled();
                expect(route.path).toBe('/users/123');
            });

            it('should pass from parameter to normalizeURL', () => {
                const customNormalizeURL = vi.fn(
                    (url: URL, from: URL | null) => url
                );
                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });

                const fromURL = new URL('http://localhost:3000/app/previous');
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123',
                    from: fromURL
                });

                expect(customNormalizeURL).toHaveBeenCalledWith(
                    expect.any(URL),
                    fromURL
                );
            });
        });

        describe('Property Enumerability', () => {
            it('should correctly set non-enumerable properties', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                NON_ENUMERABLE_PROPERTIES.forEach((prop) => {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        route,
                        prop
                    );
                    expect(descriptor?.enumerable).toBe(false);
                });
            });

            it('should keep user properties enumerable', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                const userProperties = [
                    'path',
                    'fullPath',
                    'params',
                    'query',
                    'meta',
                    'state'
                ];
                userProperties.forEach((prop) => {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        route,
                        prop
                    );
                    expect(descriptor?.enumerable).toBe(true);
                });
            });
        });
    });

    describe('🔧 Property Tests', () => {
        describe('Read-only Property Validation', () => {
            it('should validate property existence', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                // Validate property existence
                expect(route.path).toBeDefined();
                expect(route.fullPath).toBeDefined();
                expect(route.url).toBeDefined();
                expect(route.params).toBeDefined();
                expect(route.query).toBeDefined();
                expect(route.matched).toBeDefined();
                expect(route.config).toBeDefined();
                expect(route.meta).toBeDefined();
                expect(route.confirm).toBeDefined();
            });
        });

        describe('Computed Property Correctness', () => {
            it('should correctly calculate isPush property', () => {
                const options = createOptions();

                const pushRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/test'
                });
                expect(pushRoute.isPush).toBe(true);

                const pushWindowRoute = new Route({
                    options,
                    toType: RouteType.pushWindow,
                    toInput: '/test'
                });
                expect(pushWindowRoute.isPush).toBe(true);

                const replaceRoute = new Route({
                    options,
                    toType: RouteType.replace,
                    toInput: '/test'
                });
                expect(replaceRoute.isPush).toBe(false);

                const goRoute = new Route({
                    options,
                    toType: RouteType.go,
                    toInput: '/test'
                });
                expect(goRoute.isPush).toBe(false);
            });

            it('should correctly calculate fullPath', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tab=profile#section1'
                });

                expect(route.fullPath).toBe('/users/123?tab=profile#section1');
                expect(route.path).toBe('/users/123');
            });
        });

        describe('Type Validation', () => {
            it('should correctly set all RouteType', () => {
                const options = createOptions();

                Object.values(RouteType).forEach((type) => {
                    const route = new Route({
                        options,
                        toType: type,
                        toInput: '/test'
                    });
                    expect(route.type).toBe(type);
                });
            });
        });

        describe('Confirm Handler Tests', () => {
            it('should initialize confirm as null when not provided', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.confirm).toBeNull();
            });

            it('should set confirm handler when provided in RouteLocation', () => {
                const options = createOptions();
                const mockConfirmHandler = vi.fn();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        confirm: mockConfirmHandler
                    }
                });

                expect(route.confirm).toBe(mockConfirmHandler);
                expect(typeof route.confirm).toBe('function');
            });

            it('should handle confirm as null when toInput is string', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.confirm).toBeNull();
            });

            it('should preserve confirm handler during route cloning', () => {
                const options = createOptions();
                const mockConfirmHandler = vi.fn();
                const originalRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        confirm: mockConfirmHandler
                    }
                });

                const clonedRoute = originalRoute.clone();

                expect(clonedRoute.confirm).toBe(mockConfirmHandler);
                expect(clonedRoute.confirm).toBe(originalRoute.confirm);
            });

            it('should handle null confirm during route cloning', () => {
                const options = createOptions();
                const originalRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                const clonedRoute = originalRoute.clone();

                expect(clonedRoute.confirm).toBeNull();
                expect(clonedRoute.confirm).toBe(originalRoute.confirm);
            });

            it('should make confirm property non-enumerable', () => {
                const options = createOptions();
                const mockConfirmHandler = vi.fn();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        confirm: mockConfirmHandler
                    }
                });

                const keys = Object.keys(route);
                const propertyNames = Object.getOwnPropertyNames(route);
                const descriptor = Object.getOwnPropertyDescriptor(
                    route,
                    'confirm'
                );

                expect(keys).not.toContain('confirm');
                expect(propertyNames).toContain('confirm');
                expect(descriptor?.enumerable).toBe(false);
            });

            it('should be included in NON_ENUMERABLE_PROPERTIES list', () => {
                expect(NON_ENUMERABLE_PROPERTIES).toContain('confirm');
            });
        });
    });

    describe('🎯 Handle mechanism tests', () => {
        describe('Handle setting and getting', () => {
            it('should correctly set and get handle function', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(
                    (to, from, router) => ({
                        result: 'test'
                    })
                );

                route.handle = mockHandle;
                expect(route.handle).toBeDefined();
                expect(typeof route.handle).toBe('function');
            });

            it('should handle null handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.handle = null;
                expect(route.handle).toBeNull();
            });

            it('should handle non-function type handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.handle = 'not a function' as any;
                expect(route.handle).toBeNull();
            });
        });

        describe('Handle execution validation', () => {
            it('should execute handle in correct state', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const mockHandle: RouteHandleHook = vi.fn(
                    (to, from, router) => ({
                        result: 'success'
                    })
                );

                route.handle = mockHandle;

                const result = route.handle!(route, null, mockRouter);
                expect(result).toEqual({ result: 'success' });
                expect(mockHandle).toHaveBeenCalledWith(
                    route,
                    null,
                    mockRouter
                );
            });

            it('should throw exception in error state', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const mockHandle: RouteHandleHook = vi.fn();

                route.handle = mockHandle;

                // Since there's no error status anymore, handle should work normally
                expect(() => {
                    route.handle!(route, null, mockRouter);
                }).not.toThrow();
            });

            it('should prevent repeated handle calls', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const mockHandle: RouteHandleHook = vi.fn(
                    (to, from, router) => ({
                        result: 'test'
                    })
                );

                route.handle = mockHandle;

                route.handle!(route, null, mockRouter);

                expect(() => {
                    route.handle!(route, null, mockRouter);
                }).toThrow(
                    'Route handle hook can only be called once per navigation'
                );
            });
        });

        describe('HandleResult management', () => {
            it('should correctly set and get handleResult', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const result = { data: 'test', status: 'ok' };

                route.handleResult = result;
                expect(route.handleResult).toBe(result);

                route.handleResult = null;
                expect(route.handleResult).toBeNull();
            });
        });

        describe('Handle wrapper function tests', () => {
            it('should test handle calls with double-call prevention', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const mockHandle: RouteHandleHook = vi.fn(
                    (to, from, router) => ({
                        result: 'test'
                    })
                );

                route.handle = mockHandle;

                // Since status concept is removed, the handle should be callable initially
                const firstResult = route.handle!(route, null, mockRouter);
                expect(firstResult).toEqual({ result: 'test' });

                // After first call, subsequent calls should throw due to double-call prevention
                expect(() => route.handle!(route, null, mockRouter)).toThrow(
                    'Route handle hook can only be called once per navigation'
                );
            });

            it('should correctly pass this context and parameters', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const mockHandle: RouteHandleHook = vi.fn(function (
                    this: Route,
                    to: Route,
                    from: Route | null,
                    router: Router
                ) {
                    expect(this).toBe(route);
                    return { context: this, to, from, router };
                });

                route.handle = mockHandle;

                const fromRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/home'
                });
                const result = route.handle!(route, fromRoute, mockRouter);

                expect(mockHandle).toHaveBeenCalledWith(
                    route,
                    fromRoute,
                    mockRouter
                );
                expect(result).toEqual({
                    context: route,
                    to: route,
                    from: fromRoute,
                    router: mockRouter
                });
            });

            it('should handle handle function exceptions', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockRouter = {} as Router;
                const errorHandle: RouteHandleHook = vi.fn(() => {
                    throw new Error('Handle execution failed');
                });

                route.handle = errorHandle;

                expect(() => route.handle!(route, null, mockRouter)).toThrow(
                    'Handle execution failed'
                );
                expect(errorHandle).toHaveBeenCalledOnce();
            });

            it('should handle setHandle boundary cases', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.setHandle(undefined as any);
                expect(route.handle).toBeNull();

                route.setHandle(123 as any);
                expect(route.handle).toBeNull();

                route.setHandle('string' as any);
                expect(route.handle).toBeNull();

                route.setHandle({} as any);
                expect(route.handle).toBeNull();

                route.setHandle([] as any);
                expect(route.handle).toBeNull();
            });
        });
    });

    describe('📊 State management tests', () => {
        describe('Navigation state application', () => {
            it('should correctly apply navigation state', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { a: 1, b: 2 } }
                });

                route.applyNavigationState({ b: 3, c: 4 });
                expect(route.state).toEqual({ a: 1, b: 3, c: 4 });
            });

            it('should handle empty navigation state application', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.applyNavigationState({ __pageId__: 123 });
                expect(route.state).toEqual({ __pageId__: 123 });
            });
        });

        describe('Direct state assignment', () => {
            it('should correctly set single state value', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.state.userId = 123;
                route.state.userName = 'john';

                expect(route.state.userId).toBe(123);
                expect(route.state.userName).toBe('john');
            });

            it('should overwrite existing state value', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { count: 1 } }
                });

                route.state.count = 2;
                expect(route.state.count).toBe(2);
            });
        });

        describe('State isolation', () => {
            it("should ensure different routes' states are independent", () => {
                const options = createOptions();
                const route1 = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/route1', state: { shared: 'value1' } }
                });
                const route2 = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/route2', state: { shared: 'value2' } }
                });

                route1.state.shared = 'modified1';
                expect(route2.state.shared).toBe('value2');
            });
        });

        describe('StatusCode tests', () => {
            it('should correctly set default statusCode', () => {
                const options = createOptions();

                // No statusCode input should default to null
                const routeWithoutCode = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                expect(routeWithoutCode.statusCode).toBe(null);

                // Unmatched routes should also default to null
                const unmatchedRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/completely/unknown/path/that/does/not/match'
                });
                expect(unmatchedRoute.statusCode).toBe(null);
            });

            it('should support statusCode input from RouteLocation', () => {
                const options = createOptions();

                // Pass number statusCode
                const routeWithCode = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: 201 }
                });
                expect(routeWithCode.statusCode).toBe(201);

                // Pass null statusCode
                const routeWithNull = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: null }
                });
                expect(routeWithNull.statusCode).toBe(null);
            });

            it('should set statusCode as non-enumerable', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                const descriptor = Object.getOwnPropertyDescriptor(
                    route,
                    'statusCode'
                );
                expect(descriptor?.enumerable).toBe(false);

                const keys = Object.keys(route);
                expect(keys).not.toContain('statusCode');
            });

            it('should correctly copy statusCode in clone', () => {
                const options = createOptions();
                const originalRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: 500 }
                });

                const clonedRoute = originalRoute.clone();
                expect(clonedRoute.statusCode).toBe(500);

                // statusCode should be readonly, cloned route keeps original value
                expect(clonedRoute.statusCode).toBe(500);
                expect(originalRoute.statusCode).toBe(500);
            });
        });
    });

    describe('🔄 Clone function tests', () => {
        describe('Object independence', () => {
            it('should create completely independent cloned object', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { test: 'value' } }
                });

                const cloned = original.clone();

                expect(cloned).not.toBe(original);
                expect(cloned.state).not.toBe(original.state);
                expect(cloned.params).not.toBe(original.params);
            });

            it('should keep attribute values equal', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        state: { userId: 123, preferences: { theme: 'dark' } }
                    }
                });

                const cloned = original.clone();

                expect(cloned.path).toBe(original.path);
                expect(cloned.type).toBe(original.type);
                expect(cloned.state).toEqual(original.state);
                expect(cloned.params).toEqual(original.params);
            });
        });

        describe('State deep copy', () => {
            it('should deep copy state object', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        state: {
                            user: { id: 123, name: 'John' },
                            settings: { theme: 'dark' }
                        }
                    }
                });

                const cloned = original.clone();

                // Modify cloned object's state should not affect original
                cloned.state.newProp = 'newValue';
                expect(original.state.newProp).toBeUndefined();
            });
        });

        describe('Attribute completeness', () => {
            it('should keep all important attributes', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.pushWindow,
                    toInput: '/users/123?tab=profile#section1'
                });

                const cloned = original.clone();

                expect(cloned.type).toBe(original.type);
                expect(cloned.isPush).toBe(original.isPush);
                expect(cloned.path).toBe(original.path);
                expect(cloned.fullPath).toBe(original.fullPath);
                expect(cloned.query).toEqual(original.query);
                expect(cloned.params).toEqual(original.params);
                expect(cloned.meta).toEqual(original.meta);
            });
        });
    });

    describe('⚠️ Edge case tests', () => {
        describe('Exception input handling', () => {
            it('should handle invalid route type', () => {
                const options = createOptions();
                expect(() => {
                    new Route({
                        options,
                        toType: 'invalid' as any,
                        toInput: '/test'
                    });
                }).not.toThrow();
            });

            it('should handle empty string path', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: ''
                });

                expect(route.path).toBeDefined();
                expect(route.fullPath).toBeDefined();
            });

            it('should handle special character path', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/测试用户/profile?name=张三'
                });

                // URL-encoded path should not contain original Chinese characters
                expect(route.path).toContain('users');
                expect(route.path).toContain('profile');
                expect(route.query.name).toBe('张三');
            });
        });

        describe('Extreme value tests', () => {
            it('should handle very long path', () => {
                const options = createOptions();
                const longPath = '/users/' + 'a'.repeat(1000);

                expect(() => {
                    new Route({
                        options,
                        toType: RouteType.push,
                        toInput: longPath
                    });
                }).not.toThrow();
            });

            it('should handle large number of query parameters', () => {
                const options = createOptions();
                const queryParams = Array.from(
                    { length: 100 },
                    (_, i) => `param${i}=value${i}`
                ).join('&');
                const path = `/test?${queryParams}`;

                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: path
                });

                expect(Object.keys(route.query)).toHaveLength(100);
                expect(route.query.param0).toBe('value0');
                expect(route.query.param99).toBe('value99');
            });
        });
    });

    describe('🔧 Tool function tests', () => {
        describe('applyRouteParams function', () => {
            it('should correctly apply route parameters', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ base });
                const to = new URL('http://localhost:3000/app/users/old-id');
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/users/old-id',
                    params: { id: 'new-id' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe('/app/users/new-id');
                expect(match.params.id).toBe('new-id');
            });

            it('should handle multiple parameters', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/posts/:postId/comments/:commentId' }]
                });
                const to = new URL(
                    'http://localhost:3000/app/posts/123/comments/456'
                );
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/posts/123/comments/456',
                    params: { postId: 'post-999', commentId: 'comment-888' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe(
                    '/app/posts/post-999/comments/comment-888'
                );
                expect(match.params.postId).toBe('post-999');
                expect(match.params.commentId).toBe('comment-888');
            });

            it('should return directly when unmatched', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ routes: [] });
                const to = new URL('http://localhost:3000/app/unknown');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);
                const toInput = { path: '/unknown', params: { id: 'test' } };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe(originalPathname);
            });

            it('should handle non-object toInput parameters', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions();
                const to = new URL('http://localhost:3000/app/users/123');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);

                // Test string type
                applyRouteParams(match, '/users/123', base, to);
                expect(to.pathname).toBe(originalPathname);

                // Test null
                applyRouteParams(match, null as any, base, to);
                expect(to.pathname).toBe(originalPathname);

                // Test undefined
                applyRouteParams(match, undefined as any, base, to);
                expect(to.pathname).toBe(originalPathname);
            });

            it('should handle empty params object', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions();
                const to = new URL('http://localhost:3000/app/users/123');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);

                const toInput = { path: '/users/123', params: {} };
                applyRouteParams(match, toInput, base, to);
                expect(to.pathname).toBe(originalPathname);

                // Test undefined params
                const toInput2 = {
                    path: '/users/123',
                    params: undefined as any
                };
                applyRouteParams(match, toInput2, base, to);
                expect(to.pathname).toBe(originalPathname);
            });

            it('should handle complex path replacement logic', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/users/:id/posts/:postId' }]
                });
                const to = new URL(
                    'http://localhost:3000/app/users/123/posts/456'
                );
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/users/123/posts/456',
                    params: { id: 'user-999', postId: 'post-888' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe('/app/users/user-999/posts/post-888');
                expect(match.params.id).toBe('user-999');
                expect(match.params.postId).toBe('post-888');
            });

            it('should handle path segment empty cases', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/users/:id' }]
                });
                const to = new URL('http://localhost:3000/app/users/123');
                const match = options.matcher(to, base);

                const originalCompile = match.matches[0].compile;
                match.matches[0].compile = vi.fn(() => '/users/'); // Return empty id part

                const toInput = { path: '/users/123', params: { id: '' } };
                applyRouteParams(match, toInput, base, to);

                // Should keep original path fragment
                expect(to.pathname).toBe('/app/users/123');

                match.matches[0].compile = originalCompile;
            });
        });
    });

    describe('🔗 Integration tests', () => {
        describe('With router options integration', () => {
            it('should correctly use custom normalizeURL', () => {
                const customNormalizeURL = vi.fn((url: URL) => {
                    url.pathname = url.pathname.toLowerCase();
                    return url;
                });

                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/USERS/123'
                });

                expect(customNormalizeURL).toHaveBeenCalled();
                expect(route.path).toBe('/users/123');
            });

            it('should correctly handle SSR related attributes', () => {
                const mockReq = {} as any;
                const mockRes = {} as any;
                const options = createOptions({ req: mockReq, res: mockRes });

                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.req).toBe(mockReq);
                expect(route.res).toBe(mockRes);
            });
        });

        describe('With route configuration integration', () => {
            it('should correctly handle nested route configuration', () => {
                const nestedRoutes: RouteConfig[] = [
                    {
                        path: '/admin',
                        meta: { requireAuth: true },
                        children: [
                            {
                                path: '/users',
                                meta: { title: 'User Management' }
                            }
                        ]
                    }
                ];

                const options = createOptions({ routes: nestedRoutes });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/admin/users'
                });

                expect(route.matched.length).toBeGreaterThan(0);
                expect(route.meta.title).toBe('User Management');
            });
        });
    });

    describe('🎭 Performance tests', () => {
        it('should create a large number of route instances within reasonable time', () => {
            const options = createOptions();
            const startTime = performance.now();

            for (let i = 0; i < 1000; i++) {
                new Route({
                    options,
                    toType: RouteType.push,
                    toInput: `/users/${i}`
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // 1000 instances should be created within 100ms
            expect(duration).toBeLessThan(200);
        });

        it('should efficiently handle state operations', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });

            const startTime = performance.now();

            for (let i = 0; i < 1000; i++) {
                route.state[`key${i}`] = `value${i}`;
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // 1000 state setting should be completed within 50ms
            expect(duration).toBeLessThan(50);
            expect(Object.keys(route.state)).toHaveLength(1000);
        });
    });
});

// Supplement missing test cases
describe('🔍 Route Class Depth Test - Missing Scenario Supplement', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail', requireAuth: true }
            },
            {
                path: '/posts/:postId/comments/:commentId',
                meta: { title: 'Comment Detail' }
            }
        ];

        const routerOptions: RouterOptions = {
            root: '#test',
            context: { version: '1.0.0' },
            routes: mockRoutes,
            mode: RouterMode.history,
            base,
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            fallback: () => {},
            rootStyle: false,
            handleBackBoundary: () => {},
            handleLayerClose: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    describe('🔧 applyRouteParams Boundary Condition Tests', () => {
        it('should handle non-object toInput parameters', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions();
            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);

            // Test string type
            applyRouteParams(match, '/users/123', base, to);
            expect(to.pathname).toBe(originalPathname);

            // Test null
            applyRouteParams(match, null as any, base, to);
            expect(to.pathname).toBe(originalPathname);

            // Test undefined
            applyRouteParams(match, undefined as any, base, to);
            expect(to.pathname).toBe(originalPathname);
        });

        it('should handle empty params object', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions();
            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);

            const toInput = { path: '/users/123', params: {} };
            applyRouteParams(match, toInput, base, to);
            expect(to.pathname).toBe(originalPathname);

            // Test undefined params
            const toInput2 = { path: '/users/123', params: undefined as any };
            applyRouteParams(match, toInput2, base, to);
            expect(to.pathname).toBe(originalPathname);
        });

        it('should handle path segment empty cases', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({
                base,
                routes: [{ path: '/users/:id' }]
            });
            const to = new URL('http://localhost:3000/app/users/123');
            const match = options.matcher(to, base);

            const originalCompile = match.matches[0].compile;
            match.matches[0].compile = vi.fn(() => '/users/'); // Return empty id part

            const toInput = { path: '/users/123', params: { id: '' } };
            applyRouteParams(match, toInput, base, to);

            // Should keep original path fragment
            expect(to.pathname).toBe('/app/users/123');

            match.matches[0].compile = originalCompile;
        });
    });

    describe('🎯 Query Parameter Processing Depth Test', () => {
        it('should handle query parameter de-duplication logic', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123?name=john&name=jane&age=25&name=bob'
            });

            // query should only contain the first value
            expect(route.query.name).toBe('john');
            expect(route.query.age).toBe('25');

            // queryArray should contain all values
            expect(route.queryArray.name).toEqual(['john', 'jane', 'bob']);
            expect(route.queryArray.age).toEqual(['25']);
        });

        it('should handle empty query parameter values', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123?empty=&name=john&blank&value=test'
            });

            expect(route.query.empty).toBe('');
            expect(route.query.name).toBe('john');
            expect(route.query.blank).toBe('');
            expect(route.query.value).toBe('test');
        });

        it('should handle special character query parameters', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput:
                    '/users/123?name=%E5%BC%A0%E4%B8%89&symbol=%26%3D%3F%23'
            });

            expect(route.query.name).toBe('张三');
            expect(route.query.symbol).toBe('&=?#');
        });
    });

    describe('🔄 Clone Function Depth Test', () => {
        it('should correctly clone complex state object', () => {
            const options = createOptions();
            const complexState = {
                user: { id: 123, name: 'John', roles: ['admin', 'user'] },
                settings: { theme: 'dark', notifications: true },
                metadata: { created: new Date(), version: 1.0 }
            };

            const original = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/users/123', state: complexState }
            });

            const cloned = original.clone();

            expect(cloned.state).toEqual(original.state);
            expect(cloned.state).not.toBe(original.state);

            // Modify cloned object should not affect original
            cloned.state.newProp = 'newValue';
            expect(original.state.newProp).toBeUndefined();
        });

        it('should keep cloned object _options reference', () => {
            const options = createOptions();
            const original = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            const cloned = original.clone();

            // _options should be the same reference
            expect((cloned as any)._options).toBe((original as any)._options);
        });

        it('should correctly clone routes with query parameters and hash', () => {
            const options = createOptions();
            const original = new Route({
                options,
                toType: RouteType.pushWindow,
                toInput: '/users/123?tab=profile&sort=name#section1'
            });

            const cloned = original.clone();

            expect(cloned.fullPath).toBe(original.fullPath);
            expect(cloned.query).toEqual(original.query);
            expect(cloned.type).toBe(original.type);
            expect(cloned.isPush).toBe(original.isPush);
        });
    });

    describe('🏗️ Constructor Boundary Condition Tests', () => {
        it('should handle keepScrollPosition various values', () => {
            const options = createOptions();

            // Test true value
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: true }
            });
            expect(route1.keepScrollPosition).toBe(true);

            // Test false value
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: false }
            });
            expect(route2.keepScrollPosition).toBe(false);

            // Test truthy value
            const route3 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: 'yes' as any }
            });
            expect(route3.keepScrollPosition).toBe(true);

            // Test falsy value
            const route4 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: 0 as any }
            });
            expect(route4.keepScrollPosition).toBe(false);

            // Test string path (should be false)
            const route5 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });
            expect(route5.keepScrollPosition).toBe(false);
        });

        it('should correctly handle config and meta calculation', () => {
            const options = createOptions();

            // Matched route
            const matchedRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });
            expect(matchedRoute.config).not.toBeNull();
            expect(matchedRoute.meta.title).toBe('User Detail');

            // Unmatched route
            const unmatchedRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/unknown'
            });
            expect(unmatchedRoute.config).toBeNull();
            expect(unmatchedRoute.meta).toEqual({});
        });

        it('should correctly handle matched array freezing', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            // matched array should be frozen
            expect(Object.isFrozen(route.matched)).toBe(true);

            expect(() => {
                (route.matched as any).push({});
            }).toThrow();
        });
    });

    describe('🔒 Property Immutable Test', () => {
        it('should verify read-only property behavior', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            expect(route.params).toBeDefined();
            expect(route.query).toBeDefined();
            expect(route.url).toBeDefined();

            expect(typeof route.params).toBe('object');
            expect(typeof route.query).toBe('object');
            expect(route.url instanceof URL).toBe(true);
        });
    });

    describe('🎨 State Management Special Cases', () => {
        it('should handle state object special keys', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/test',
                    state: {
                        normalKey: 'value',
                        specialKey: 'specialValue'
                    }
                }
            });

            expect(route.state.normalKey).toBe('value');
            expect(route.state.specialKey).toBe('specialValue');
        });

        it('should handle state synchronization special keys', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/source',
                    state: {
                        normal: 'source',
                        special: 'sourceSpecial'
                    }
                }
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/target',
                    state: {
                        existing: 'target',
                        special: 'targetSpecial'
                    }
                }
            });

            sourceRoute.syncTo(targetRoute);

            expect(targetRoute.state.normal).toBe('source');
            expect(targetRoute.state.existing).toBeUndefined();
            expect(targetRoute.state.special).toBe('sourceSpecial');
        });
    });

    describe('🔄 syncTo Method Tests', () => {
        it('should fully synchronize all route attributes', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/users/456',
                    state: { userId: 456, name: 'Jane' },
                    statusCode: 200
                }
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.replace,
                toInput: {
                    path: '/old/path',
                    state: { oldData: 'old' }
                }
            });

            sourceRoute.syncTo(targetRoute);

            expect(targetRoute.statusCode).toBe(200);

            expect(targetRoute.state.userId).toBe(456);
            expect(targetRoute.state.name).toBe('Jane');
            expect(targetRoute.state.oldData).toBeUndefined();

            expect(targetRoute.type).toBe(RouteType.push);
            expect(targetRoute.path).toBe('/users/456');
            expect(targetRoute.fullPath).toBe('/users/456');
            expect(targetRoute.params.id).toBe('456');
        });

        it('should synchronize params object', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/789'
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/posts/123'
            });

            sourceRoute.syncTo(targetRoute);

            expect(targetRoute.params.id).toBe('789');
            expect(targetRoute.params.postId).toBeUndefined();
        });

        it('should synchronize query parameters', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/search?q=test&page=2'
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/old?old=value'
            });

            sourceRoute.syncTo(targetRoute);

            expect(targetRoute.query.q).toBe('test');
            expect(targetRoute.query.page).toBe('2');
            expect(targetRoute.query.old).toBeUndefined();
        });

        it('should synchronize handle related attributes', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });

            const mockRouter = {} as Router;
            const mockHandle = vi.fn();
            sourceRoute.setHandle(mockHandle);
            (sourceRoute as any)._handleResult = { success: true };
            (sourceRoute as any)._handled = true;

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/other'
            });

            sourceRoute.syncTo(targetRoute);

            expect((targetRoute as any)._handle).toBe(
                (sourceRoute as any)._handle
            );
            expect((targetRoute as any)._handleResult).toEqual({
                success: true
            });
            expect((targetRoute as any)._handled).toBe(true);
        });
    });

    describe('🏗️ Layer Field Tests', () => {
        describe('Layer Field Initialization', () => {
            it('should initialize layer as null for non-pushLayer route types', () => {
                const options = createOptions();

                // Test different route types should all have null layer
                const routeTypes = [
                    RouteType.push,
                    RouteType.replace,
                    RouteType.back,
                    RouteType.forward,
                    RouteType.go,
                    RouteType.pushWindow,
                    RouteType.replaceWindow,
                    RouteType.restartApp,
                    RouteType.unknown
                ];

                routeTypes.forEach((routeType) => {
                    const route = new Route({
                        options,
                        toType: routeType,
                        toInput: {
                            path: '/test',
                            layer: { zIndex: 1000 }
                        }
                    });

                    expect(route.layer).toBeNull();
                });
            });

            it('should set layer value for pushLayer route type', () => {
                const options = createOptions();
                const layerConfig = {
                    zIndex: 1000,
                    params: { userId: 123, mode: 'edit' },
                    autoPush: false,
                    push: true
                };

                const route = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: {
                        path: '/user/123',
                        layer: layerConfig
                    }
                });

                expect(route.layer).toBe(layerConfig);
                expect(route.layer?.zIndex).toBe(1000);
                expect(route.layer?.autoPush).toBe(false);
            });

            it('should set layer as null for pushLayer without layer config', () => {
                const options = createOptions();

                const route = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: '/test'
                });

                expect(route.layer).toBeNull();
            });

            it('should set layer as null for pushLayer with string toInput', () => {
                const options = createOptions();

                const route = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: '/test'
                });

                expect(route.layer).toBeNull();
            });
        });

        describe('Layer Field Non-Enumerable Property', () => {
            it('should make layer property non-enumerable', () => {
                const options = createOptions();
                const layerConfig = { zIndex: 1000 };

                const route = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: {
                        path: '/test',
                        layer: layerConfig
                    }
                });

                const keys = Object.keys(route);
                const propertyNames = Object.getOwnPropertyNames(route);
                const descriptor = Object.getOwnPropertyDescriptor(
                    route,
                    'layer'
                );

                expect(keys).not.toContain('layer');
                expect(propertyNames).toContain('layer');
                expect(descriptor?.enumerable).toBe(false);
            });

            it('should be included in NON_ENUMERABLE_PROPERTIES list', () => {
                expect(NON_ENUMERABLE_PROPERTIES).toContain('layer');
            });
        });

        describe('Layer Field in Route Operations', () => {
            it('should preserve layer during route cloning', () => {
                const options = createOptions();
                const layerConfig = {
                    zIndex: 2000,
                    params: { modal: true }
                };

                const originalRoute = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: {
                        path: '/modal',
                        layer: layerConfig
                    }
                });

                const clonedRoute = originalRoute.clone();

                expect(clonedRoute.layer).toBe(layerConfig);
                expect(clonedRoute.layer).toBe(originalRoute.layer);
            });

            it('should preserve null layer during route cloning', () => {
                const options = createOptions();

                const originalRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/test'
                });

                const clonedRoute = originalRoute.clone();

                expect(clonedRoute.layer).toBeNull();
                expect(clonedRoute.layer).toBe(originalRoute.layer);
            });

            it('should synchronize layer field during syncTo operation', () => {
                const options = createOptions();
                const layerConfig = {
                    zIndex: 3000,
                    params: { popup: true }
                };

                const sourceRoute = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: {
                        path: '/popup',
                        layer: layerConfig
                    }
                });

                const targetRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/target'
                });

                sourceRoute.syncTo(targetRoute);

                expect(targetRoute.layer).toBe(layerConfig);
                expect(targetRoute.layer).toBe(sourceRoute.layer);
            });

            it('should handle complex layer configuration', () => {
                const options = createOptions();
                const complexLayerConfig = {
                    zIndex: 5000,
                    params: {
                        userId: 456,
                        permissions: ['read', 'write'],
                        metadata: {
                            title: 'User Settings',
                            description: 'Edit user profile'
                        }
                    },
                    shouldClose: () => true,
                    autoPush: true,
                    push: false,
                    routerOptions: {
                        mode: RouterMode.memory
                    }
                };

                const route = new Route({
                    options,
                    toType: RouteType.pushLayer,
                    toInput: {
                        path: '/settings',
                        layer: complexLayerConfig
                    }
                });

                expect(route.layer).toBe(complexLayerConfig);
                expect(typeof route.layer?.shouldClose).toBe('function');
                expect(route.layer?.routerOptions?.mode).toBe(
                    RouterMode.memory
                );
            });
        });
    });
    describe('🎯 Route parameter replacement bug fix tests', () => {
        it('should correctly update path and fullPath when params override route parameters', () => {
            const options = createOptions({
                routes: [
                    {
                        path: '/user/:id/detail',
                        meta: { title: 'User Detail' }
                    }
                ]
            });
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/user/0/detail',
                    params: { id: '1000' }
                }
            });

            expect(route.path).toBe('/user/1000/detail');
            expect(route.fullPath).toBe('/user/1000/detail');
            expect(route.params.id).toBe('1000');
            expect(route.url.pathname).toBe('/app/user/1000/detail');
        });
    });
});
