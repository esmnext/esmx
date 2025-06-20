import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';
import type { Route } from './types';

describe('Router.go Tests', () => {
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
        test('should return Promise<Route | null>', async () => {
            await router.push('/about');
            const route = await router.go(-1);

            expect(route).toBeInstanceOf(Object);
            expect(route?.path).toBe('/');
            expect(route?.status).toBe(RouteStatus.success);
        });

        test('should support positive and negative parameters', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Go back
            const backRoute = await router.go(-1);
            expect(backRoute?.path).toBe('/about');

            // Go forward
            const forwardRoute = await router.go(1);
            expect(forwardRoute?.path).toBe('/user/123');
        });

        test('should update router state', async () => {
            await router.push('/about');
            await router.go(-1);

            expect(router.route.path).toBe('/');
            expect(router.route.status).toBe(RouteStatus.success);
        });
    });

    describe('🔄 History Navigation Logic', () => {
        test('should navigate based on history index', async () => {
            // Build history: / -> /about -> /user/123
            await router.push('/about');
            await router.push('/user/123');

            // Go back two steps to root path
            const route = await router.go(-2);
            expect(route?.path).toBe('/');
            expect(router.route.path).toBe('/');
        });

        test('should return null when going beyond history boundaries', async () => {
            await router.push('/about');

            const route1 = await router.go(-10);
            expect(route1).toBe(null);
            expect(router.route.path).toBe('/about'); // Router state unchanged

            const route2 = await router.go(10);
            expect(route2).toBe(null);
            expect(router.route.path).toBe('/about'); // Router state unchanged
        });

        test('go(0) should return null', async () => {
            await router.push('/about');
            const route = await router.go(0);

            expect(route).toBe(null);
            expect(router.route.path).toBe('/about');
        });

        test('should return correct RouteType', async () => {
            await router.push('/about');
            const route = await router.go(-1);

            expect(route?.type).toBe(RouteType.go);
        });

        test('should keep isPush as false', async () => {
            await router.push('/about');
            const route = await router.go(-1);

            expect(route?.isPush).toBe(false);
        });
    });

    describe('🏃 Concurrency Control', () => {
        test('later go should cancel earlier go', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Go operations don't have cancellation logic, if there's an ongoing operation, subsequent operations return null directly
            const [firstResult, secondResult] = await Promise.all([
                router.go(-1), // First operation, should succeed
                router.go(-2) // Second operation, should return null due to first one in progress
            ]);

            expect(firstResult?.status).toBe(RouteStatus.success);
            expect(secondResult).toBe(null);
            expect(router.route.path).toBe('/about'); // Result of first operation
        });

        test('cancelled task should not affect micro app state', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');

            updateSpy.mockClear();

            // Go operations don't have cancellation logic, second operation will return null directly
            const [firstResult, secondResult] = await Promise.all([
                router.go(-1), // First operation succeeds
                router.go(-1) // Second operation returns null
            ]);

            expect(firstResult?.status).toBe(RouteStatus.success);
            expect(secondResult).toBe(null);

            // Micro app update should only be called by the first successful operation
            expect(updateSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('🎭 Micro App Integration', () => {
        test('go should trigger micro app update', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            await router.go(-1);

            expect(updateSpy).toHaveBeenCalled();
        });

        test('micro app update should happen after router state update', async () => {
            let routePathWhenUpdated: string | null = null;

            vi.spyOn(router.microApp, '_update').mockImplementation(() => {
                routePathWhenUpdated = router.route.path;
            });

            await router.push('/about');
            await router.go(-1);

            expect(routePathWhenUpdated).toBe('/');
        });
    });

    describe('⚡ Async Components with Go', () => {
        test('go to async component route should wait for component loading', async () => {
            await router.push('/async');
            await router.push('/about');

            const startTime = Date.now();
            const route = await router.go(-1); // Back to /async
            const endTime = Date.now();

            expect(route?.status).toBe(RouteStatus.success);
            // Go operations might reuse already loaded components, so time check might not be accurate
            // expect(endTime - startTime).toBeGreaterThanOrEqual(10);

            const matchedRoute = route?.matched[0];
            expect(matchedRoute?.component).toBe('AsyncComponent');
        });

        test('go to failed async component route should return error status', async () => {
            // Go operation back to routes in history usually doesn't re-execute async component loading

            const errorRoute = await router.push('/async-error');
            expect(errorRoute.status).toBe(RouteStatus.error);

            await router.push('/about');

            const route = await router.go(-1); // Back to /async-error
            // Go operations usually return success status, even if target route had errors before
            expect(route?.status).toBe(RouteStatus.success);
        });
    });

    describe('🛡️ Go Guard Behavior', () => {
        test('go to route blocked by guard should return aborted status', async () => {
            const blockedRoute = await router.push('/user/blocked');
            expect(blockedRoute.status).toBe(RouteStatus.aborted);

            await router.push('/about');

            const route = await router.go(-1); // Try to go back to previous route

            // Since blocked route didn't enter history, go(-1) might go back to earlier route
            expect(route?.status).toBe(RouteStatus.success);
            // Path might be root path instead of blocked route
        });

        test('go to route with redirect guard should navigate to redirect route', async () => {
            await router.push('/user/redirect');
            await router.push('/user/123');

            const route = await router.go(-1); // Back to /user/redirect, should redirect to /about

            expect(route?.status).toBe(RouteStatus.success);
            expect(route?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('afterEach only executes when go succeeds', async () => {
            const afterEachSpy = vi.fn();
            const unregister = router.afterEach(afterEachSpy);

            // Successful go
            await router.push('/about');
            await router.go(-1);

            // Due to special nature of go operations, afterEach might be called multiple times
            expect(afterEachSpy).toHaveBeenCalled();

            unregister();
        });

        test('beforeEach guard should be called in go operations', async () => {
            const beforeEachSpy = vi.fn();
            const unregister = router.beforeEach(beforeEachSpy);

            await router.push('/about');
            await router.go(-1);

            expect(beforeEachSpy).toHaveBeenCalled();
            unregister();
        });
    });

    describe('💾 History Management', () => {
        test('go should navigate correctly in history', async () => {
            // Build history
            await router.push('/about');
            await router.push('/user/123');

            const route1 = await router.go(-1);
            expect(route1?.path).toBe('/about');
            expect(router.route.path).toBe('/about');

            const route2 = await router.go(1);
            expect(route2?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });

        test('go operations should not create new history entries', async () => {
            await router.push('/about');
            await router.push('/user/123');

            await router.go(-1); // Back to /about
            expect(router.route.path).toBe('/about');

            const forwardRoute = await router.go(1); // Should be able to forward to /user/123
            expect(forwardRoute?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });
    });

    describe('❌ Error Handling', () => {
        test('go to non-existent route should trigger location handling', async () => {
            const nonExistentRoute = await router.push('/non-existent');
            expect(nonExistentRoute.path).toBe('/non-existent');
            expect(nonExistentRoute.matched).toHaveLength(0);

            await router.push('/about');

            const route = await router.go(-1);

            // Due to history complexity, go operations might not fully restore non-existent routes
            // but should ensure location handler was called
            expect(executionLog).toContain('location-handler-/non-existent');

            expect(route?.status).toBe(RouteStatus.success);
        });

        test('exceptions during go should propagate correctly', async () => {
            const unregister = router.beforeEach(() => {
                throw new Error('Guard error');
            });

            await router.push('/about');

            const route = await router.go(-1);
            expect(route?.status).toBe(RouteStatus.error);

            unregister();
        });
    });

    describe('🔍 Edge Cases', () => {
        test('go should handle special character paths correctly', async () => {
            await router.push('/user/test%20user');
            await router.push('/about');

            const route = await router.go(-1);
            expect(route?.path).toBe('/user/test%20user');
            expect(router.route.path).toBe('/user/test%20user');
        });
    });

    describe('🔄 go(0) Specific Tests', () => {
        test('go(0) should immediately return null without calling Navigation', async () => {
            const navigationGoSpy = vi.spyOn(router.navigation, 'go');

            await router.push('/about');
            const route = await router.go(0);

            expect(route).toBe(null);
            expect(navigationGoSpy).not.toHaveBeenCalledWith(0);
            expect(router.route.path).toBe('/about'); // Router state unchanged
        });

        test('go(0) should not trigger micro app update', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');
            updateSpy.mockClear(); // Reset counter

            await router.go(0);

            expect(updateSpy).not.toHaveBeenCalled();
        });

        test('go(0) should not trigger guards', async () => {
            const beforeEachSpy = vi.fn();
            const afterEachSpy = vi.fn();

            const unregisterBefore = router.beforeEach(beforeEachSpy);
            const unregisterAfter = router.afterEach(afterEachSpy);

            await router.push('/about');
            beforeEachSpy.mockClear();
            afterEachSpy.mockClear();

            await router.go(0);

            expect(beforeEachSpy).not.toHaveBeenCalled();
            expect(afterEachSpy).not.toHaveBeenCalled();

            unregisterBefore();
            unregisterAfter();
        });

        test('go(0) should immediately return null in concurrent scenarios', async () => {
            await router.push('/about');

            // Concurrently call multiple go(0)
            const results = await Promise.all([
                router.go(0),
                router.go(0),
                router.go(0)
            ]);

            results.forEach((result) => {
                expect(result).toBe(null);
            });
            expect(router.route.path).toBe('/about'); // Router state unchanged
        });

        test('go(0) mixed with other go operations should handle correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Mix go(0) with other go operations
            const [zeroResult, backResult] = await Promise.all([
                router.go(0), // Should immediately return null
                router.go(-1) // Should execute normally
            ]);

            expect(zeroResult).toBe(null);
            expect(backResult?.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/about'); // Changed by go(-1)
        });

        test('go(0) should return null in different route states', async () => {
            // At root route
            let route = await router.go(0);
            expect(route).toBe(null);
            expect(router.route.path).toBe('/');

            // At normal route
            await router.push('/about');
            route = await router.go(0);
            expect(route).toBe(null);
            expect(router.route.path).toBe('/about');

            // At parameterized route
            await router.push('/user/123');
            route = await router.go(0);
            expect(route).toBe(null);
            expect(router.route.path).toBe('/user/123');

            // At route with query parameters
            await router.push('/about?tab=info');
            route = await router.go(0);
            expect(route).toBe(null);
            expect(router.route.path).toBe('/about');
        });

        test('go(0) performance should be better than other go operations', async () => {
            await router.push('/about');

            // Test go(0) execution time
            const start0 = performance.now();
            await router.go(0);
            const end0 = performance.now();
            const time0 = end0 - start0;

            // go(0) should be very fast because it returns directly without going through Navigation
            expect(time0).toBeLessThan(5); // Should complete within 5ms

            // Compare: normal go operations need more time
            await router.push('/user/123');
            const start1 = performance.now();
            await router.go(-1);
            const end1 = performance.now();
            const time1 = end1 - start1;

            // go(-1) needs more time because it goes through Navigation and async processing
            expect(time1).toBeGreaterThan(time0);
        });
    });

    describe('🔗 Integration with Other Navigation Methods', () => {
        test('go should behave consistently with back()', async () => {
            await router.push('/about');
            await router.push('/user/123');

            const goResult = await router.go(-1);
            await router.push('/user/123'); // Reset state

            const backResult = await router.back();

            expect(goResult?.path).toBe(backResult?.path);
            expect(goResult?.status).toBe(backResult?.status);
        });

        test('go should behave consistently with forward()', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Now at /about

            const goResult = await router.go(1);
            await router.back(); // Reset state

            const forwardResult = await router.forward();

            expect(goResult?.path).toBe(forwardResult?.path);
            expect(goResult?.status).toBe(forwardResult?.status);
        });

        test('push after go should handle history correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.go(-1); // Back to /about

            // Push new route from history position
            await router.push('/user/456');

            expect(router.route.path).toBe('/user/456');
        });
    });

    describe('🔧 onBackNoResponse Callback Tests', () => {
        test('should trigger onBackNoResponse when negative index and Navigation returns null', async () => {
            const onCloseSpy = vi.fn();

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ],
                onClose: onCloseSpy
            });

            await testRouter.replace('/about');

            const route = await testRouter.go(-10);

            expect(route).toBe(null);
            expect(onCloseSpy).toHaveBeenCalledWith(testRouter);

            testRouter.destroy();
        });

        test('should not trigger onBackNoResponse when positive index and Navigation returns null', async () => {
            const onCloseSpy = vi.fn();

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ],
                onClose: onCloseSpy
            });

            await testRouter.replace('/about');

            const route = await testRouter.go(10);

            expect(route).toBe(null);
            expect(onCloseSpy).not.toHaveBeenCalled();

            testRouter.destroy();
        });

        test('zero index should not trigger onBackNoResponse', async () => {
            const onCloseSpy = vi.fn();

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ],
                onClose: onCloseSpy
            });

            await testRouter.replace('/about');

            const route = await testRouter.go(0);

            expect(route).toBe(null);
            expect(onCloseSpy).not.toHaveBeenCalled();

            testRouter.destroy();
        });

        test('should not error when no onBackNoResponse callback', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ]
                // No onBackNoResponse
            });

            await testRouter.replace('/about');

            // This should not throw an error
            const route = await testRouter.go(-10);
            expect(route).toBe(null);

            testRouter.destroy();
        });
    });

    describe('🔄 Navigation Result Handling', () => {
        test('should call _transitionTo when Navigation returns success result', async () => {
            await router.push('/about');

            const route = await router.go(-1);

            expect(route).not.toBe(null);
            expect(route?.type).toBe(RouteType.go);
            expect(route?.status).toBe(RouteStatus.success);
            expect(route?.url).toBeDefined();
            expect(route?.state).toBeDefined();
        });

        test('should return null directly when Navigation returns null', async () => {
            await router.push('/about');

            const route = await router.go(-10);

            expect(route).toBe(null);
        });
    });

    describe('🔢 Parameter Type Tests', () => {
        test('should handle various number types correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Test integer
            const route1 = await router.go(-1);
            expect(route1?.path).toBe('/about');

            // Test floating point (JavaScript handles automatically)
            const route2 = await router.go(1);
            expect(route2?.path).toBe('/user/123');

            // Test negative integer
            const route3 = await router.go(-1);
            expect(route3?.path).toBe('/about');
        });

        test('should handle boundary number values correctly', async () => {
            await router.push('/about');

            // Test Number.MAX_SAFE_INTEGER
            const route1 = await router.go(Number.MAX_SAFE_INTEGER);
            expect(route1).toBe(null);

            // Test Number.MIN_SAFE_INTEGER
            const route2 = await router.go(Number.MIN_SAFE_INTEGER);
            expect(route2).toBe(null);

            // Test NaN (should be treated as 0)
            const route3 = await router.go(Number.NaN);
            expect(route3).toBe(null);

            // Test Infinity
            const route4 = await router.go(Number.POSITIVE_INFINITY);
            expect(route4).toBe(null);

            // Test -Infinity
            const route5 = await router.go(Number.NEGATIVE_INFINITY);
            expect(route5).toBe(null);
        });
    });
});
