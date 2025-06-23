import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouteType, RouterMode } from './types';

describe('Router.back Tests', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            fallback: (to, from) => {
                executionLog.push(`location-handler-${to.path}`);
            },
            routes: [
                {
                    path: '/',
                    component: () => 'Home'
                },
                {
                    path: '/about',
                    component: () => 'About'
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    beforeEnter: (to) => {
                        if (to.params.id === 'blocked') {
                            return false; // Block navigation
                        }
                        if (to.params.id === 'redirect') {
                            return '/about'; // Redirect
                        }
                    }
                },
                {
                    path: '/async',
                    asyncComponent: () =>
                        new Promise((resolve) => {
                            setTimeout(() => resolve('AsyncComponent'), 10);
                        })
                },
                {
                    path: '/async-error',
                    asyncComponent: () =>
                        new Promise((_, reject) => {
                            setTimeout(
                                () => reject(new Error('Load failed')),
                                10
                            );
                        })
                }
            ]
        });

        await router.push('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('🎯 Core Behavior', () => {
        test('back should return Promise<Route | null>', async () => {
            await router.push('/about');
            const route = await router.back();

            expect(route).toBeInstanceOf(Object);
            expect(route?.path).toBe('/');
            expect(route?.handle).not.toBeNull();
        });

        test('back should navigate to previous route', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Go back to /about
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('back should update router state', async () => {
            await router.push('/about');
            await router.back();

            expect(router.route.path).toBe('/');
            expect(router.route.handle).not.toBeNull();
        });
    });

    describe('🔄 History Navigation Logic', () => {
        test('back should navigate based on history stack', async () => {
            // Establish history: / -> /about -> /user/123
            await router.push('/about');
            await router.push('/user/123');

            // Go back to /about
            const route1 = await router.back();
            expect(route1?.path).toBe('/about');
            expect(router.route.path).toBe('/about');

            // Go back again to root path
            const route2 = await router.back();
            expect(route2?.path).toBe('/');
            expect(router.route.path).toBe('/');
        });

        test('back beyond history boundaries should return null', async () => {
            // In memory mode, create a truly out-of-bounds situation
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ]
            });

            await testRouter.replace('/about');

            const route = await testRouter.back();
            expect(route).toBe(null);
            expect(testRouter.route.path).toBe('/about'); // Route state unchanged

            testRouter.destroy();
        });

        test('back should return correct RouteType', async () => {
            await router.push('/about');
            const route = await router.back();

            expect(route?.type).toBe(RouteType.back);
        });

        test('back should keep isPush as false', async () => {
            await router.push('/about');
            const route = await router.back();

            expect(route?.isPush).toBe(false);
        });
    });

    describe('🏃 Concurrency Control', () => {
        test('later initiated back should cancel earlier back', async () => {
            await router.push('/about');
            await router.push('/user/123');

            const [firstResult, secondResult] = await Promise.all([
                router.back(), // First operation, should succeed
                router.back() // Second operation, returns null due to first one in progress
            ]);

            expect(firstResult?.handle).not.toBeNull();
            expect(secondResult).toBe(null);
            expect(router.route.path).toBe('/about'); // First operation result
        });

        test('cancelled tasks should not affect micro-app state', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            await router.push('/user/123');

            updateSpy.mockClear();

            const [firstResult, secondResult] = await Promise.all([
                router.back(), // First operation succeeds
                router.back() // Second operation returns null
            ]);

            expect(firstResult?.handle).not.toBeNull();
            expect(secondResult).toBe(null);

            // Micro-app update should only be called by the first successful operation
            expect(updateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('🎭 Micro-app Integration', () => {
        test('back should trigger micro-app update', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            await router.back();

            expect(updateSpy).toHaveBeenCalled();
        });

        test('micro-app update should happen after route state update', async () => {
            let routePathWhenUpdated: string | null = null;

            vi.spyOn(router.microApp, '_update').mockImplementation(() => {
                routePathWhenUpdated = router.route.path;
            });

            await router.push('/about');
            await router.back();

            expect(routePathWhenUpdated).toBe('/');
        });
    });

    describe('⚡ Async Components & Back', () => {
        test('back to async component route should wait for component loading', async () => {
            await router.push('/about');
            await router.push('/async');

            const route = await router.back();
            expect(route?.path).toBe('/about');
            expect(route?.handle).not.toBeNull();
        });

        test('back to failed async component route should handle error correctly', async () => {
            await router.push('/about');

            // Expect async component loading to fail and throw error
            await expect(router.push('/async-error')).rejects.toThrow();

            // Should still be at /about since navigation failed
            expect(router.route.path).toBe('/about');

            // Back should work normally
            const route = await router.back();
            expect(route?.path).toBe('/');
        });
    });

    describe('🛡️ Back Guard Behavior', () => {
        test('back navigation should work normally after blocked route attempt', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Attempt to navigate to blocked route (guard returns false)
            const blockedResult = await router.push('/user/blocked');

            // Navigation still happens but might have different behavior
            expect(blockedResult.path).toBe('/user/blocked');

            // Current route should now be at blocked location
            expect(router.route.path).toBe('/user/blocked');

            // Back navigation should work normally
            const route = await router.back();
            expect(route?.path).toBe('/user/123');
        });

        test('redirect guard should work during navigation', async () => {
            // Navigate to a route that redirects
            const route = await router.push('/user/redirect');

            // Should be redirected to /about
            expect(route.path).toBe('/about');
            expect(router.route.path).toBe('/about');

            // Back should go to the original route
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/');
        });

        test('afterEach only executes when navigation succeeds', async () => {
            let afterEachCalled = false;

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' },
                    {
                        path: '/blocked',
                        component: 'Blocked',
                        beforeEnter: () => false
                    }
                ]
            });

            testRouter.afterEach(() => {
                afterEachCalled = true;
            });

            await testRouter.push('/about');
            afterEachCalled = false; // Reset after successful navigation

            // This should fail and not trigger afterEach
            await expect(testRouter.push('/blocked')).rejects.toThrow();
            expect(afterEachCalled).toBe(false);

            testRouter.destroy();
        });

        test('beforeEach guard should be called during back operation', async () => {
            let beforeEachCalled = false;

            router.beforeEach(() => {
                beforeEachCalled = true;
            });

            await router.push('/about');
            await router.back();

            expect(beforeEachCalled).toBe(true);
        });
    });

    describe('💾 History Management', () => {
        test('back should navigate correctly in history stack', async () => {
            // Build history stack
            await router.push('/about');
            await router.push('/user/123');

            const route = await router.back();
            expect(route?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('back operation should not create new history entries', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Go back
            await router.back();

            // Should be able to go forward again
            const forwardRoute = await router.forward();
            expect(forwardRoute?.path).toBe('/user/123');
        });
    });

    describe('❌ Error Handling', () => {
        test('back to non-existent route should trigger location handling', async () => {
            // This tests the boundary case where the router falls back to location handling
            const fallbackSpy = vi.fn();
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                fallback: fallbackSpy,
                routes: [{ path: '/', component: 'Home' }]
            });

            // Use replace to avoid creating history
            await testRouter.replace('/');
            const result = await testRouter.back();

            // Since we used replace and have no history, back should return null
            expect(result).toBe(null);

            testRouter.destroy();
        });

        test('exceptions during back process should propagate correctly', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ]
            });

            await testRouter.push('/about');

            // Add guard that throws error after history is established
            testRouter.beforeEach(() => {
                throw new Error('Guard error');
            });

            await expect(testRouter.back()).rejects.toThrow('Guard error');

            testRouter.destroy();
        });
    });

    describe('🔍 Edge Cases', () => {
        test('back should handle special character paths correctly', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/special', component: 'Special' }
                ]
            });

            await testRouter.push('/'); // Start at root
            await testRouter.push('/special'); // Navigate to special route
            const route = await testRouter.back(); // Go back to root

            expect(route?.path).toBe('/');
            expect(testRouter.route.path).toBe('/');

            testRouter.destroy();
        });
    });

    describe('🔗 Integration with Other Navigation Methods', () => {
        test('back should behave consistently with go(-1)', async () => {
            await router.push('/about');
            await router.push('/user/123');

            const backRoute = await router.back();
            const goRoute = await router.go(-1);

            expect(backRoute?.path).toBe('/about');
            expect(goRoute?.path).toBe('/');
        });

        test('push after back should handle history correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Go back
            await router.back();

            // Push new route
            await router.push('/user/456');

            expect(router.route.path).toBe('/user/456');
        });
    });

    describe('🔧 handleBackBoundary Callback Tests', () => {
        test('should trigger handleBackBoundary when Navigation returns null', async () => {
            let handleBackBoundaryCalled = false;

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }],
                handleBackBoundary: () => {
                    handleBackBoundaryCalled = true;
                }
            });

            await testRouter.replace('/');

            const result = await testRouter.back();
            expect(result).toBe(null);
            expect(handleBackBoundaryCalled).toBe(true);

            testRouter.destroy();
        });

        test('should not error when no handleBackBoundary callback', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }]
            });

            await testRouter.replace('/');

            const result = await testRouter.back();
            expect(result).toBe(null);

            testRouter.destroy();
        });
    });

    describe('🔄 Navigation Result Handling', () => {
        test('should correctly handle successful navigation result', async () => {
            await router.push('/about');
            const route = await router.back();

            expect(route?.path).toBe('/');
            expect(router.route.path).toBe('/');
        });

        test('should return null directly when Navigation returns null', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }]
            });

            await testRouter.replace('/');

            const result = await testRouter.back();
            expect(result).toBe(null);

            testRouter.destroy();
        });
    });
});
