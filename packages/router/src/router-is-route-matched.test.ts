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

            // Create another user route
            const targetRoute = router.resolve('/user/456');

            // Should match because they use the same route configuration
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(true);
        });

        test('should not match routes with different route configuration', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Create about page route
            const targetRoute = router.resolve('/about');

            // Should not match because they use different route configurations
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });

        test('should match nested routes with same configuration', async () => {
            // Navigate to user profile page
            await router.push('/user/123/profile');

            // Create another user profile route
            const targetRoute = router.resolve('/user/456/profile');

            // Should match because they use the same child route configuration
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(true);
        });

        test('should not match nested routes with different configuration', async () => {
            // Navigate to user profile page
            await router.push('/user/123/profile');

            // Create user settings route
            const targetRoute = router.resolve('/user/123/settings');

            // Should not match because child route configurations are different
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });

        test('should correctly handle parent-child route matching', async () => {
            // Navigate to user page (parent route)
            await router.push('/user/123');

            // Create user profile route (child route)
            const targetRoute = router.resolve('/user/123/profile');

            // Should not match because one is parent route and one is child route
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
        });
    });

    describe('exact matching mode', () => {
        test('should match exactly same paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Create same path route
            const targetRoute = router.resolve('/user/123');

            // Should match because paths are exactly the same
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match different paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Create different path route
            const targetRoute = router.resolve('/user/456');

            // Should not match because paths are different
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should match exactly same paths with query parameters', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            // Create route with same path and query parameters
            const targetRoute = router.resolve('/about?lang=en&theme=dark');

            // Should match because full paths are the same
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match paths with different query parameters', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            // Create route with different query parameters
            const targetRoute = router.resolve('/about?lang=zh&theme=light');

            // Should not match because query parameters are different
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should not match paths with different query parameter order', async () => {
            // Navigate to page with query parameters
            await router.push('/about?lang=en&theme=dark');

            // Create route with different query parameter order
            const targetRoute = router.resolve('/about?theme=dark&lang=en');

            // Should not match because fullPath strings are different
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should match exactly same paths with hash', async () => {
            // Navigate to page with hash
            await router.push('/about#introduction');

            // Create route with same hash
            const targetRoute = router.resolve('/about#introduction');

            // Should match because full paths are the same
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });

        test('should not match paths with different hash', async () => {
            // Navigate to page with hash
            await router.push('/about#introduction');

            // Create route with different hash
            const targetRoute = router.resolve('/about#features');

            // Should not match because hashes are different
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
        });

        test('should correctly handle complex full path matching', async () => {
            // Navigate to complex path
            await router.push('/user/123?tab=profile&edit=true#personal-info');

            // Create exactly same complex path
            const targetRoute = router.resolve(
                '/user/123?tab=profile&edit=true#personal-info'
            );

            // Should match
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(true);
        });
    });

    describe('include matching mode', () => {
        test('should match when target path starts with current path', async () => {
            // Navigate to parent path
            await router.push('/user/123');

            // Create child path
            const targetRoute = router.resolve('/user/123/profile');

            // Should match because target path starts with current path
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should match exactly same paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Create same path
            const targetRoute = router.resolve('/user/123');

            // Should match because paths are the same
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should not match when target path does not start with current path', async () => {
            // Navigate to deep path
            await router.push('/user/123/profile');

            // Create parent path
            const targetRoute = router.resolve('/user/123');

            // Should not match because target path does not start with current path
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should not match completely unrelated paths', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Create unrelated path
            const targetRoute = router.resolve('/about');

            // Should not match
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should correctly handle root path include matching', async () => {
            // Navigate to root path
            await router.push('/');

            // Create any page path
            const targetRoute = router.resolve('/about');

            // Should match because all paths start with root path
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should correctly handle query parameters in include matching', async () => {
            // Navigate to base path
            await router.push('/user/123');

            // Create path with query parameters
            const targetRoute = router.resolve('/user/123?tab=profile');

            // Should match because target path starts with current path
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(true);
        });

        test('should correctly handle multi-level nested include matching', async () => {
            // Navigate to parent path
            await router.push('/admin');

            // Test different levels of inclusion relationships
            const usersRoute = router.resolve('/admin/users');
            const settingsRoute = router.resolve('/admin/settings');

            expect(router.isRouteMatched(usersRoute, 'include')).toBe(true);
            expect(router.isRouteMatched(settingsRoute, 'include')).toBe(true);
        });
    });

    describe('error handling and edge cases', () => {
        test('should return false when current route is null', () => {
            // Create a new router without initial navigation
            const newRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/test', component: () => 'Test' }]
            });

            const targetRoute = newRouter.resolve('/test');

            // Should return false because current route is null
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

            // Create non-existent route
            const targetRoute = router.resolve('/non-existent');

            // All matching modes should return false
            expect(router.isRouteMatched(targetRoute, 'route')).toBe(false);
            expect(router.isRouteMatched(targetRoute, 'exact')).toBe(false);
            expect(router.isRouteMatched(targetRoute, 'include')).toBe(false);
        });

        test('should correctly handle matching when navigating to non-existent route', async () => {
            // Navigate to a non-existent route
            await router.push('/completely/different/path');

            // Create target routes
            const existingRoute = router.resolve('/about');
            const sameNonExistentRoute = router.resolve(
                '/completely/different/path'
            );
            const anotherNonExistentRoute =
                router.resolve('/also-non-existent');

            // When navigating to non-existent route, router falls back to root path
            // So route and exact modes should return false for existing routes
            expect(router.isRouteMatched(existingRoute, 'route')).toBe(false);
            expect(router.isRouteMatched(existingRoute, 'exact')).toBe(false);

            // But include mode will return true because /about starts with / (root path)
            expect(router.isRouteMatched(existingRoute, 'include')).toBe(true);

            // Should not match different non-existent routes in exact mode
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

            // Check activation status of different menu items
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

            // Check activation status of each breadcrumb level
            const rootRoute = router.resolve('/');
            const adminRoute = router.resolve('/admin');
            const usersRoute = router.resolve('/admin/users');

            // Use include mode to check breadcrumb activation status (target path starts with current path)
            expect(router.isRouteMatched(rootRoute, 'include')).toBe(false); // / does not start with /admin/users
            expect(router.isRouteMatched(adminRoute, 'include')).toBe(false); // /admin does not start with /admin/users
            expect(router.isRouteMatched(usersRoute, 'exact')).toBe(true);
        });

        test('should support route permission checking', async () => {
            // Navigate to user page
            await router.push('/user/123');

            // Check if it matches route types that require permissions
            const userRoute = router.resolve('/user/456'); // Same type of route
            const adminRoute = router.resolve('/admin/users'); // Different type of route

            // Use route mode to check route type matching
            expect(router.isRouteMatched(userRoute, 'route')).toBe(true);
            expect(router.isRouteMatched(adminRoute, 'route')).toBe(false);
        });

        test('should support tab active state detection', async () => {
            // Navigate to user settings page
            await router.push('/user/123/settings');

            // Check activation status of different tabs
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

            // Test all valid matching types
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
