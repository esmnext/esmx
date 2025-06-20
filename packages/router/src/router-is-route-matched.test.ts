import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from './router';
import { RouterMode } from './types';

describe('Router.isRouteMatched Tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/',
                    component: () => 'Home',
                    meta: { title: 'Home Page' }
                },
                {
                    path: '/about',
                    component: () => 'About',
                    meta: { title: 'About Page' }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    meta: { title: 'User Profile' },
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
                    meta: { requiresAuth: true },
                    children: [
                        {
                            path: '/users',
                            component: () => 'AdminUsers'
                        },
                        {
                            path: '/settings',
                            component: () => 'AdminSettings'
                        }
                    ]
                },
                {
                    path: '/products/:category/:id',
                    component: () => 'Product'
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('route matching mode', () => {
        test('should match routes with same route configuration', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/456');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(true);
        });

        test('should not match routes with different route configuration', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/about');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });

        test('should match nested routes with same configuration', async () => {
            // Navigate to user profile page
            await router.push('/user/123/profile');

            const targetRoute = router.resolve('/user/456/profile');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(true);
        });

        test('should not match nested routes with different configuration', async () => {
            // Navigate to user profile page
            await router.push('/user/123/profile');

            const targetRoute = router.resolve('/user/123/settings');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });

        test('should correctly handle parent-child route matching', async () => {
            // Navigate to user page (parent route)
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/123/profile');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });
    });

    describe('exact matching mode', () => {
        test('should match exactly same paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/123');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match different paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/456');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should match exactly same paths with query parameters', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            const targetRoute = router.resolve('/about?lang=en&theme=dark');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match paths with different query parameters', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            const targetRoute = router.resolve('/about?lang=zh&theme=light');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should not match paths with different query parameter order', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            const targetRoute = router.resolve('/about?theme=dark&lang=en');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should match exactly same paths with hash', async () => {
            // Navigate to page with hash
            await router.push('/about#introduction');

            const targetRoute = router.resolve('/about#introduction');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match paths with different hash', async () => {
            // Navigate to page with hash
            await router.push('/about#introduction');

            const targetRoute = router.resolve('/about#features');

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should correctly handle complex full path matching', async () => {
            // Navigate to complex path
            await router.push('/user/123?tab=profile&edit=true#personal-info');

            const targetRoute = router.resolve(
                '/user/123?tab=profile&edit=true#personal-info'
            );

            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });
    });

    describe('include matching mode', () => {
        test('should match when target path starts with current path', async () => {
            // Navigate to parent path
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/123/profile');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should match exactly same paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/123');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should not match when target path does not start with current path', async () => {
            // Navigate to deep path
            await router.push('/user/123/profile');

            const targetRoute = router.resolve('/user/123');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should not match completely unrelated paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const targetRoute = router.resolve('/about');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should correctly handle root path include matching', async () => {
            // Navigate to root path
            await router.push('/');

            const targetRoute = router.resolve('/about');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should correctly handle query parameters in include matching', async () => {
            // Navigate to base path
            await router.push('/user/123');

            const targetRoute = router.resolve('/user/123?tab=profile');

            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should correctly handle multi-level nested include matching', async () => {
            // Navigate to parent path
            await router.push('/admin');

            const usersRoute = router.resolve('/admin/users');
            const settingsRoute = router.resolve('/admin/settings');

            expect(router.isRouteMatched(usersRoute, 'include')).toBe(true);
            expect(router.isRouteMatched(settingsRoute, 'include')).toBe(true);
        });
    });

    describe('error handling and edge cases', () => {
        test('should return false when current route is null', () => {
            const newRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/test', component: () => 'Test' }]
            });

            const targetRoute = newRouter.resolve('/test');

            expect(newRouter.isRouteMatched(targetRoute, 'route')).toBe(false);
            expect(newRouter.isRouteMatched(targetRoute, 'exact')).toBe(false);
            expect(newRouter.isRouteMatched(targetRoute, 'include')).toBe(
                false
            );

            newRouter.destroy();
        });

        test('should correctly handle non-existent route matching', async () => {
            // Navigate to existing route
            await router.push('/about');

            const targetRoute = router.resolve('/non-existent');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should correctly handle matching when navigating to non-existent route', async () => {
            // Navigate to a non-existent route
            await router.push('/completely/different/path');

            const existingRoute = router.resolve('/about');
            const sameNonExistentRoute = router.resolve(
                '/completely/different/path'
            );
            const anotherNonExistentRoute =
                router.resolve('/also-non-existent');

            // So route and exact modes should return false for existing routes
            expect(router.isRouteMatched(existingRoute, 'route')).toBe(false);
            expect(router.isRouteMatched(existingRoute, 'exact')).toBe(false);

            expect(router.isRouteMatched(existingRoute, 'include')).toBe(true);

            expect(
                router.isRouteMatched(anotherNonExistentRoute, 'exact')
            ).toBe(false);
        });

        test('should correctly handle root path special cases', async () => {
            // Navigate to root path
            await router.push('/');

            // Test matching with root path
            const rootRoute = router.resolve('/');
            const aboutRoute = router.resolve('/about');

            expect(router.isRouteMatched(rootRoute, 'route')).toBe(true);
            expect(router.isRouteMatched(rootRoute, 'exact')).toBe(true);
            expect(router.isRouteMatched(rootRoute, 'include')).toBe(true);

            expect(router.isRouteMatched(aboutRoute, 'route')).toBe(false);
            expect(router.isRouteMatched(aboutRoute, 'exact')).toBe(false);
            expect(router.isRouteMatched(aboutRoute, 'include')).toBe(true); // about starts with /
        });
    });

    describe('practical usage scenarios', () => {
        test('should support navigation menu active state detection', async () => {
            // Navigate to user profile page
            await router.push('/user/123/profile');

            const userMenuRoute = router.resolve('/user/123');
            const profileMenuRoute = router.resolve('/user/123/profile');
            const settingsMenuRoute = router.resolve('/user/123/settings');
            const aboutMenuRoute = router.resolve('/about');

            // User menu should not be active in include mode (because /user/123 does not start with /user/123/profile)
            expect(router.isRouteMatched(userMenuRoute, 'include')).toBe(false);
            expect(router.isRouteMatched(userMenuRoute, 'exact')).toBe(false);

            // Profile menu should be active in exact mode
            expect(router.isRouteMatched(profileMenuRoute, 'exact')).toBe(true);
            expect(router.isRouteMatched(profileMenuRoute, 'route')).toBe(true);

            // Settings menu should not be active
            expect(router.isRouteMatched(settingsMenuRoute, 'exact')).toBe(
                false
            );
            expect(router.isRouteMatched(settingsMenuRoute, 'route')).toBe(
                false
            );

            // About menu should not be active
            expect(router.isRouteMatched(aboutMenuRoute, 'exact')).toBe(false);
            expect(router.isRouteMatched(aboutMenuRoute, 'include')).toBe(
                false
            );
        });

        test('should support breadcrumb navigation active detection', async () => {
            // Navigate to deep page
            await router.push('/admin/users');

            const rootRoute = router.resolve('/');
            const adminRoute = router.resolve('/admin');
            const usersRoute = router.resolve('/admin/users');

            expect(router.isRouteMatched(rootRoute, 'include')).toBe(false); // / does not start with /admin/users
            expect(router.isRouteMatched(adminRoute, 'include')).toBe(false); // /admin does not start with /admin/users
            expect(router.isRouteMatched(usersRoute, 'exact')).toBe(true);
        });

        test('should support route permission checking', async () => {
            // Navigate to user page
            await router.push('/user/123');

            const userRoute = router.resolve('/user/456'); // Same type of route
            const adminRoute = router.resolve('/admin/users'); // Different type of route

            expect(router.isRouteMatched(userRoute, 'route')).toBe(true);
            expect(router.isRouteMatched(adminRoute, 'route')).toBe(false);
        });

        test('should support tab active state detection', async () => {
            // Navigate to user settings page
            await router.push('/user/123/settings');

            const profileTabRoute = router.resolve('/user/123/profile');
            const settingsTabRoute = router.resolve('/user/123/settings');

            // Settings tab should be active
            expect(router.isRouteMatched(settingsTabRoute, 'exact')).toBe(true);
            expect(router.isRouteMatched(settingsTabRoute, 'route')).toBe(true);

            // Profile tab should not be active
            expect(router.isRouteMatched(profileTabRoute, 'exact')).toBe(false);
            expect(router.isRouteMatched(profileTabRoute, 'route')).toBe(false);
        });
    });

    describe('type safety tests', () => {
        test('should correctly handle all matching types', async () => {
            await router.push('/user/123');
            const targetRoute = router.resolve('/user/123');

            expect(router.isRouteMatched(targetRoute, 'route')).toBe(true);
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should return boolean values', async () => {
            await router.push('/about');
            const targetRoute = router.resolve('/about');

            const routeResult = router.isRouteMatched(targetRoute, 'route');
            const exactResult = router.isRouteMatched(targetRoute, 'exact');
            const includeResult = router.isRouteMatched(targetRoute, 'include');

            expect(typeof routeResult).toBe('boolean');
            expect(typeof exactResult).toBe('boolean');
            expect(typeof includeResult).toBe('boolean');
        });
    });
});
