import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from './router';
import { RouteType, RouterMode } from './types';
import type { Route, RouteConfig } from './types';

const createTestRouter = (): Router => {
    return new Router({
        mode: RouterMode.memory,
        base: new URL('http://localhost:3000/'),
        routes: createTestRoutes()
    });
};

const createTestRoutes = (): RouteConfig[] => {
    return [
        {
            path: '/',
            component: () => 'Home',
            meta: { title: 'Home Page' }
        },
        {
            path: '/about',
            component: () => 'About',
            meta: { title: 'About Page', requiresAuth: false }
        },
        {
            path: '/user/:id',
            component: () => 'User',
            meta: { title: 'User Profile', requiresAuth: true },
            children: [
                {
                    path: '/profile',
                    component: () => 'UserProfile',
                    meta: { section: 'profile' }
                },
                {
                    path: '/settings',
                    component: () => 'UserSettings',
                    meta: { section: 'settings' }
                }
            ]
        },
        {
            path: '/admin',
            component: () => 'Admin',
            meta: { requiresAuth: true, role: 'admin' },
            children: [
                {
                    path: '/users',
                    component: () => 'AdminUsers',
                    meta: { section: 'users' }
                },
                {
                    path: '/settings',
                    component: () => 'AdminSettings',
                    meta: { section: 'settings' }
                }
            ]
        },
        {
            path: '/products/:category/:id',
            component: () => 'Product',
            meta: { title: 'Product Detail' }
        }
    ];
};

const createTestCases = () => {
    return {
        validPaths: [
            { path: '/', shouldMatch: true },
            { path: '/about', shouldMatch: true },
            { path: '/user/123', shouldMatch: true },
            { path: '/admin/users', shouldMatch: true }
        ],
        invalidPaths: [
            { path: '/invalid', shouldMatch: false },
            { path: '/user', shouldMatch: false } // Missing required parameter
        ]
    };
};

describe('Router.resolve method tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = createTestRouter();
        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('Core resolution functionality', () => {
        test('should return complete Route object with all required properties', () => {
            const route: Route = router.resolve('/about');

            expect(route).toBeInstanceOf(Object);
            expect(route.type).toBe('push');
            expect(route.path).toBe('/about');
            expect(route.fullPath).toBe('/about');
            expect(route.url).toBeInstanceOf(URL);
            expect(route.params).toBeInstanceOf(Object);
            expect(route.query).toBeInstanceOf(Object);
            expect(route.meta).toBeInstanceOf(Object);
            expect(route.matched).toBeInstanceOf(Array);
        });

        test('should not trigger actual navigation', () => {
            const originalPath: string = router.route.path;

            router.resolve('/about');
            router.resolve('/user/123');
            router.resolve('/admin/users');

            expect(router.route.path).toBe(originalPath);
        });

        test('should correctly resolve string path', () => {
            const route: Route = router.resolve('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');
            expect(route.matched.length).toBeGreaterThan(0);
            expect(route.config).not.toBeNull();
        });

        test('should correctly resolve object configuration', () => {
            const route: Route = router.resolve({
                path: '/user/456',
                query: { tab: 'profile', active: 'true' },
                hash: '#section1'
            });

            expect(route.path).toBe('/user/456');
            expect(route.params.id).toBe('456');
            expect(route.query.tab).toBe('profile');
            expect(route.query.active).toBe('true');
            expect(route.url.hash).toBe('#section1');
            expect(route.fullPath).toBe(
                '/user/456?tab=profile&active=true#section1'
            );
        });
    });

    describe('Path resolution and parameter extraction', () => {
        test('should correctly resolve single path parameter', () => {
            const route: Route = router.resolve('/user/123');

            expect(route.params.id).toBe('123');
            expect(route.path).toBe('/user/123');
            expect(route.matched.length).toBe(1);
        });

        test('should correctly resolve multiple path parameters', () => {
            const route: Route = router.resolve(
                '/products/electronics/laptop-123'
            );

            expect(route.params.category).toBe('electronics');
            expect(route.params.id).toBe('laptop-123');
            expect(route.path).toBe('/products/electronics/laptop-123');
        });

        test('should correctly resolve query parameters', () => {
            const route: Route = router.resolve(
                '/about?lang=en&theme=dark&debug=true'
            );

            expect(route.query.lang).toBe('en');
            expect(route.query.theme).toBe('dark');
            expect(route.query.debug).toBe('true');
            expect(route.queryArray.lang).toEqual(['en']);
            expect(route.queryArray.theme).toEqual(['dark']);
        });

        test('should correctly handle duplicate query parameters', () => {
            const route: Route = router.resolve(
                '/about?tags=vue&tags=router&tags=test'
            );

            expect(route.query.tags).toBe('vue'); // First value
            expect(route.queryArray.tags).toEqual(['vue', 'router', 'test']);
        });

        test('should correctly resolve hash fragment', () => {
            const route: Route = router.resolve('/about#introduction');

            expect(route.url.hash).toBe('#introduction');
            expect(route.fullPath).toBe('/about#introduction');
        });

        test('should correctly handle complex URL combination', () => {
            const route: Route = router.resolve(
                '/user/123?tab=profile&edit=true#personal-info'
            );

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(route.query.edit).toBe('true');
            expect(route.url.hash).toBe('#personal-info');
            expect(route.fullPath).toBe(
                '/user/123?tab=profile&edit=true#personal-info'
            );
        });
    });

    describe('Nested route resolution', () => {
        test('should correctly resolve nested routes', () => {
            const route: Route = router.resolve('/user/123/profile');

            expect(route.params.id).toBe('123');
            expect(route.path).toBe('/user/123/profile');
            expect(route.matched.length).toBe(2); // Parent route + child route
            expect(route.config?.meta?.section).toBe('profile');
        });

        test('should correctly resolve deeply nested routes', () => {
            const route: Route = router.resolve('/admin/users');

            expect(route.path).toBe('/admin/users');
            expect(route.matched.length).toBe(2);
            expect(route.config?.meta?.section).toBe('users');
        });

        test('should return last matched route configuration', () => {
            const route: Route = router.resolve('/user/123/settings');

            expect(route.config?.meta?.section).toBe('settings');
            expect(route.meta.section).toBe('settings');
            expect(route.meta.title).toBeUndefined();
        });
    });

    describe('Meta information handling', () => {
        test('should correctly return route meta information', () => {
            const route: Route = router.resolve('/about');

            expect(route.meta.title).toBe('About Page');
            expect(route.meta.requiresAuth).toBe(false);
        });

        test('should return last matched route meta in nested routes', () => {
            const route: Route = router.resolve('/user/123/profile');

            expect(route.meta.section).toBe('profile');
            expect(route.meta.title).toBeUndefined();
            expect(route.meta.requiresAuth).toBeUndefined();
        });

        test('should return empty object when no meta information exists', () => {
            const testRouter: Router = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/no-meta',
                        component: () => 'NoMeta'
                    }
                ]
            });

            const route: Route = testRouter.resolve('/no-meta');
            expect(route.meta).toEqual({});

            testRouter.destroy();
        });
    });

    describe('Error handling and edge cases', () => {
        test('should correctly handle non-existent routes', () => {
            const route: Route = router.resolve('/non-existent');

            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
            expect(route.meta).toEqual({});
            expect(route.params).toEqual({});
            expect(route.path).toBe('/non-existent');
        });

        test('should correctly handle root path', () => {
            const route: Route = router.resolve('/');

            expect(route.path).toBe('/');
            expect(route.matched.length).toBe(1);
            expect(route.meta.title).toBe('Home Page');
        });

        test('should correctly handle empty string path', () => {
            const route: Route = router.resolve('');

            expect(route.path).toBe('/');
            expect(route.matched.length).toBe(1);
        });

        test('should correctly handle relative path', () => {
            const route: Route = router.resolve('about');

            expect(route.path).toBe('/about');
            expect(route.matched.length).toBe(1);
        });

        test('should correctly handle paths with special characters', () => {
            const route: Route = router.resolve('/user/test%20user');

            expect(route.params.id).toBe('test%20user');
            expect(route.path).toBe('/user/test%20user');
        });

        test('should correctly handle URL encoded parameters', () => {
            const route: Route = router.resolve('/user/john%40example.com');

            expect(route.params.id).toBe('john%40example.com');
            expect(route.path).toBe('/user/john%40example.com');
        });
    });

    describe('Object parameter resolution', () => {
        test('should correctly handle object with params', () => {
            const route: Route = router.resolve({
                path: '/user/789'
            });

            expect(route.params.id).toBe('789');
            expect(route.path).toBe('/user/789');
        });

        test('should correctly handle object with query', () => {
            const route: Route = router.resolve({
                path: '/about',
                query: { lang: 'zh', version: '2.0' }
            });

            expect(route.query.lang).toBe('zh');
            expect(route.query.version).toBe('2.0');
            expect(route.fullPath).toBe('/about?lang=zh&version=2.0');
        });

        test('should correctly handle object with hash', () => {
            const route: Route = router.resolve({
                path: '/about',
                hash: '#features'
            });

            expect(route.url.hash).toBe('#features');
            expect(route.fullPath).toBe('/about#features');
        });

        test('should correctly handle object with state', () => {
            const customState: Record<string, unknown> = {
                from: 'navigation',
                timestamp: 1234567890
            };
            const route: Route = router.resolve({
                path: '/about',
                state: customState
            });

            expect(route.state).toEqual(customState);
        });

        test('should correctly handle keepScrollPosition option', () => {
            const route: Route = router.resolve({
                path: '/about',
                keepScrollPosition: true
            });

            expect(route.keepScrollPosition).toBe(true);
        });
    });

    describe('URL handling', () => {
        test('should correctly handle complete URL', () => {
            const route: Route = router.resolve('http://localhost:3000/about');

            expect(route.path).toBe('/about');
            expect(route.url.href).toBe('http://localhost:3000/about');
        });

        test('should correctly handle different domain URL', () => {
            const route: Route = router.resolve('https://example.com/external');

            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
        });

        test('should correctly handle URL with different port', () => {
            const route: Route = router.resolve('http://localhost:8080/about');

            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
        });
    });

    describe('Type and status validation', () => {
        test('resolved route should have correct type', () => {
            const route: Route = router.resolve('/about');

            expect(route.type).toBe('push');
            expect(route.isPush).toBe(true);
        });

        test('resolved route should have correct handle state', () => {
            const route: Route = router.resolve('/about');

            expect(route.handle).toBe(null);
        });

        test('resolved route should have correct URL object properties', () => {
            const route: Route = router.resolve('/about?lang=en#intro');

            expect(route.url).toBeInstanceOf(URL);
            expect(route.url.pathname).toBe('/about');
            expect(route.url.search).toBe('?lang=en');
            expect(route.url.hash).toBe('#intro');
        });

        test('resolved route should have frozen matched array', () => {
            const route: Route = router.resolve('/about');

            expect(Object.isFrozen(route.matched)).toBe(true);
        });
    });

    describe('Practical use case scenarios', () => {
        test('should support generating link URL without triggering navigation', () => {
            const route: Route = router.resolve('/user/123?tab=profile');
            const linkUrl: string = route.url.href;

            expect(linkUrl).toBe('http://localhost:3000/user/123?tab=profile');
            expect(router.route.path).toBe('/'); // Current route unchanged
        });

        test('should support pre-checking route matching status', () => {
            const validRoute: Route = router.resolve('/about');
            const invalidRoute: Route = router.resolve('/non-existent');

            expect(validRoute.matched.length).toBeGreaterThan(0);
            expect(invalidRoute.matched.length).toBe(0);
        });

        test('should support extracting route parameters and meta information', () => {
            const route: Route = router.resolve('/user/123/profile');

            expect(route.params.id).toBe('123');
            expect(route.meta.section).toBe('profile');
            expect(route.config?.path).toBe('/profile');
        });

        test('should support testing route configuration validity with valid paths', () => {
            const testCases = createTestCases().validPaths;

            testCases.forEach(({ path, shouldMatch }) => {
                const route: Route = router.resolve(path);
                if (shouldMatch) {
                    expect(route.matched.length).toBeGreaterThan(0);
                    expect(route.config).not.toBeNull();
                }
            });
        });

        test('should support testing route configuration validity with invalid paths', () => {
            const testCases = createTestCases().invalidPaths;

            testCases.forEach(({ path, shouldMatch }) => {
                const route: Route = router.resolve(path);
                if (!shouldMatch) {
                    expect(route.matched.length).toBe(0);
                    expect(route.config).toBeNull();
                }
            });
        });
    });
});
