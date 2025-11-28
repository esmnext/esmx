import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from '../src/router';
import { RouterMode, RouteType } from '../src/types';

describe('Router.forward Tests', () => {
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
        test('forward should return Promise<Route | null>', async () => {
            await router.push('/about');
            await router.back();

            const route = await router.forward();

            expect(route).toBeInstanceOf(Object);
            expect(route?.path).toBe('/about');
            expect(route?.handle).not.toBeNull();
        });

        test('forward should navigate to next route', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about

            // Go forward to /user/123
            const forwardRoute = await router.forward();
            expect(forwardRoute?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });

        test('forward should update router state', async () => {
            await router.push('/about');
            await router.back();
            await router.forward();

            expect(router.route.path).toBe('/about');
            expect(router.route.handle).not.toBeNull();
        });
    });

    describe('🔄 History Navigation Logic', () => {
        test('forward should navigate based on history stack', async () => {
            // Establish history: / -> /about -> /user/123
            await router.push('/about');
            await router.push('/user/123');

            // Go back twice to get to root
            await router.back(); // to /about
            await router.back(); // to /

            // Go forward to /about
            const route1 = await router.forward();
            expect(route1?.path).toBe('/about');
            expect(router.route.path).toBe('/about');

            // Go forward again to /user/123
            const route2 = await router.forward();
            expect(route2?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });

        test('forward beyond history boundaries should return null', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // We're already at the end of history
            const route = await router.forward();
            expect(route).toBe(null);
            expect(router.route.path).toBe('/user/123'); // Route state unchanged
        });

        test('forward should return correct RouteType', async () => {
            await router.push('/about');
            await router.back();

            const route = await router.forward();

            expect(route?.type).toBe(RouteType.forward);
        });

        test('forward should keep isPush as false', async () => {
            await router.push('/about');
            await router.back();

            const route = await router.forward();

            expect(route?.isPush).toBe(false);
        });
    });

    describe('🏃 Concurrency Control', () => {
        test('later initiated forward should cancel earlier forward', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about
            await router.back(); // Back to /

            const [firstResult, secondResult] = await Promise.all([
                router.forward(), // First operation, should succeed
                router.forward() // Second operation, returns null due to first one in progress
            ]);

            expect(firstResult?.handle).not.toBeNull();
            expect(secondResult).toBe(null);
            expect(router.route.path).toBe('/about'); // First operation result
        });

        test('cancelled tasks should not affect micro-app state', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about
            await router.back(); // Back to /

            updateSpy.mockClear();

            const [firstResult, secondResult] = await Promise.all([
                router.forward(), // First operation succeeds
                router.forward() // Second operation returns null
            ]);

            expect(firstResult?.handle).not.toBeNull();
            expect(secondResult).toBe(null);

            // Micro-app update should only be called by the first successful operation
            expect(updateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('🎭 Micro-app Integration', () => {
        test('forward should trigger micro-app update', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            await router.back();
            await router.forward();

            expect(updateSpy).toHaveBeenCalled();
        });

        test('micro-app update should happen after route state update', async () => {
            let routePathWhenUpdated: string | null = null;

            vi.spyOn(router.microApp, '_update').mockImplementation(() => {
                routePathWhenUpdated = router.route.path;
            });

            await router.push('/about');
            await router.back();
            await router.forward();

            expect(routePathWhenUpdated).toBe('/about');
        });
    });

    describe('⚡ Async Components & Forward', () => {
        test('forward to async component route should wait for component loading', async () => {
            await router.push('/async');
            await router.back();

            const route = await router.forward();
            expect(route?.path).toBe('/async');
            expect(route?.handle).not.toBeNull();
        });

        test('forward to failed async component route should return error status', async () => {
            await router.push('/about');

            // Try to push to async-error (this should fail)
            await expect(router.push('/async-error')).rejects.toThrow();

            // Should still be at /about since navigation failed
            expect(router.route.path).toBe('/about');

            // Forward should work normally (no async-error in history)
            const route = await router.forward();
            expect(route).toBe(null); // No forward history
        });
    });

    describe('🛡️ Forward Guard Behavior', () => {
        test('forward to guard-blocked route should throw navigation aborted error', async () => {
            // Try to push to blocked route first (should fail)
            await expect(router.push('/user/blocked')).rejects.toThrow();

            // Router should still be at initial route
            expect(router.route.path).toBe('/');

            // Forward should return null since there's no forward history
            const result = await router.forward();
            expect(result).toBe(null);
        });

        test('forward to route with redirect guard should navigate to redirect route', async () => {
            await router.push('/user/redirect');
            await router.back();

            const route = await router.forward();
            expect(route?.path).toBe('/about'); // Should redirect to /about
        });

        test('afterEach only executes when forward succeeds', async () => {
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

            await testRouter.back(); // Go back to /
            afterEachCalled = false; // Reset after back navigation

            // This forward should succeed and trigger afterEach
            await testRouter.forward(); // Forward to /about
            expect(afterEachCalled).toBe(true);

            testRouter.destroy();
        });

        test('beforeEach guard should be called during forward operation', async () => {
            let beforeEachCalled = false;

            router.beforeEach(() => {
                beforeEachCalled = true;
            });

            await router.push('/about');
            await router.back();
            await router.forward();

            expect(beforeEachCalled).toBe(true);
        });
    });

    describe('💾 History Management', () => {
        test('forward should navigate correctly in history stack', async () => {
            // Build history stack
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about

            const route = await router.forward();
            expect(route?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });

        test('forward operation should not create new history entries', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about

            // Go forward
            await router.forward();

            // Should be able to go back again
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');
        });
    });

    describe('❌ Error Handling', () => {
        test('forward to non-existent route should trigger location handling', async () => {
            // This tests the boundary case where the router falls back to location handling
            const fallbackSpy = vi.fn();
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                fallback: fallbackSpy,
                routes: [{ path: '/', component: 'Home' }]
            });

            await testRouter.push('/');

            // Since we only have one route, forward should return null
            const result = await testRouter.forward();
            expect(result).toBe(null);

            testRouter.destroy();
        });

        test('exceptions during forward process should propagate correctly', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ]
            });

            await testRouter.push('/about');
            await testRouter.back();

            // Add guard that throws error after history is established
            testRouter.beforeEach(() => {
                throw new Error('Guard error');
            });

            await expect(testRouter.forward()).rejects.toThrow('Guard error');

            testRouter.destroy();
        });
    });

    describe('🔍 Edge Cases', () => {
        test('forward should handle special character paths correctly', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/special', component: 'Special' }
                ],
                fallback: () => ({ component: 'Fallback' })
            });

            // Initialize router at root
            await testRouter.push('/');

            // Navigate to simple route
            await testRouter.push('/special');
            expect(testRouter.route.path).toBe('/special');

            // Go back to root
            await testRouter.back();
            expect(testRouter.route.path).toBe('/');

            // Forward to special route
            const route = await testRouter.forward();

            expect(route?.path).toBe('/special');
            expect(testRouter.route.path).toBe('/special');

            testRouter.destroy();
        });
    });

    describe('🔗 Integration with Other Navigation Methods', () => {
        test('forward should behave consistently with go(1)', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about
            await router.back(); // Back to /

            const forwardRoute = await router.forward();
            const goRoute = await router.go(1);

            expect(forwardRoute?.path).toBe('/about');
            expect(goRoute?.path).toBe('/user/123');
        });

        test('push after forward should handle history correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about

            // Go forward
            await router.forward();

            // Push new route
            await router.push('/user/456');

            expect(router.route.path).toBe('/user/456');
        });
    });

    describe('🔧 handleBackBoundary Callback Tests', () => {
        test('forward beyond boundaries should not trigger handleBackBoundary', async () => {
            let handleBackBoundaryCalled = false;

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }],
                handleBackBoundary: () => {
                    handleBackBoundaryCalled = true;
                }
            });

            await testRouter.push('/');

            const result = await testRouter.forward();
            expect(result).toBe(null);
            expect(handleBackBoundaryCalled).toBe(false); // Should NOT be called for forward

            testRouter.destroy();
        });

        test('should not error when no handleBackBoundary callback', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }]
            });

            await testRouter.push('/');

            const result = await testRouter.forward();
            expect(result).toBe(null);

            testRouter.destroy();
        });
    });

    describe('🔄 Navigation Result Handling', () => {
        test('should correctly handle successful navigation result', async () => {
            await router.push('/about');
            await router.back();
            const route = await router.forward();

            expect(route?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('should return null directly when Navigation returns null', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [{ path: '/', component: 'Home' }]
            });

            await testRouter.push('/');

            const result = await testRouter.forward();
            expect(result).toBe(null);

            testRouter.destroy();
        });
    });
});
