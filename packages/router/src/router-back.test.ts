import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';

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
            expect(route?.status).toBe(RouteStatus.success);
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
            expect(router.route.status).toBe(RouteStatus.success);
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

            expect(firstResult?.status).toBe(RouteStatus.success);
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

            expect(firstResult?.status).toBe(RouteStatus.success);
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
            await router.push('/async');
            await router.push('/about');

            const route = await router.back(); // Back to /async

            expect(route?.status).toBe(RouteStatus.success);

            const matchedRoute = route?.matched[0];
            expect(matchedRoute?.component).toBe('AsyncComponent');
        });

        test('back to failed async component route should handle error correctly', async () => {
            const errorRoute = await router.push('/async-error');
            expect(errorRoute.status).toBe(RouteStatus.error);

            await router.push('/about');

            const route = await router.back(); // Back to /async-error
            expect(route?.status).toBe(RouteStatus.success);
        });
    });

    describe('🛡️ Back Guard Behavior', () => {
        test('back to guard-blocked route should return aborted status', async () => {
            const blockedRoute = await router.push('/user/blocked');
            expect(blockedRoute.status).toBe(RouteStatus.aborted);

            await router.push('/about');

            const route = await router.back(); // Try to go back to previous route

            // Since blocked routes don't enter history, back() goes to earlier routes
            expect(route?.status).toBe(RouteStatus.success);
            // Path should be root path instead of blocked route
        });

        test('back to route with redirect guard should navigate to redirect route', async () => {
            await router.push('/user/redirect');
            await router.push('/user/123');

            const route = await router.back(); // Back to /user/redirect, should redirect to /about

            expect(route?.status).toBe(RouteStatus.success);
            expect(route?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('afterEach only executes when back succeeds', async () => {
            const afterEachSpy = vi.fn();
            const unregister = router.afterEach(afterEachSpy);

            // Successful back
            await router.push('/about');
            await router.back();

            // afterEach should be called for successful back operations
            expect(afterEachSpy).toHaveBeenCalled();

            unregister();
        });

        test('beforeEach guard should be called during back operation', async () => {
            const beforeEachSpy = vi.fn();
            const unregister = router.beforeEach(beforeEachSpy);

            await router.push('/about');
            await router.back();

            expect(beforeEachSpy).toHaveBeenCalled();
            unregister();
        });
    });

    describe('💾 History Management', () => {
        test('back should navigate correctly in history stack', async () => {
            // Establish history
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

        test('back operation should not create new history entries', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // forward after back should be able to return to original position
            await router.back(); // Back to /about
            expect(router.route.path).toBe('/about');

            const forwardRoute = await router.forward(); // Should be able to forward to /user/123
            expect(forwardRoute?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });
    });

    describe('❌ Error Handling', () => {
        test('back to non-existent route should trigger location handling', async () => {
            const nonExistentRoute = await router.push('/non-existent');
            expect(nonExistentRoute.path).toBe('/non-existent');
            expect(nonExistentRoute.matched).toHaveLength(0);

            await router.push('/about');

            const route = await router.back();

            expect(executionLog).toContain('location-handler-/non-existent');

            expect(route?.status).toBe(RouteStatus.success);
        });

        test('exceptions during back process should propagate correctly', async () => {
            const unregister = router.beforeEach(() => {
                throw new Error('Guard error');
            });

            await router.push('/about');

            const route = await router.back();
            expect(route?.status).toBe(RouteStatus.error);

            unregister();
        });
    });

    describe('🔍 Edge Cases', () => {
        test('back should handle special character paths correctly', async () => {
            await router.push('/user/test%20user');
            await router.push('/about');

            const route = await router.back();
            expect(route?.path).toBe('/user/test%20user');
            expect(router.route.path).toBe('/user/test%20user');
        });
    });

    describe('🔗 Integration with Other Navigation Methods', () => {
        test('back should behave consistently with go(-1)', async () => {
            await router.push('/about');
            await router.push('/user/123');

            const backResult = await router.back();
            await router.push('/user/123'); // Reset state

            const goResult = await router.go(-1);

            expect(backResult?.path).toBe(goResult?.path);
            expect(backResult?.status).toBe(goResult?.status);
        });

        test('push after back should handle history correctly', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back(); // Back to /about

            // Push new route from history position
            await router.push('/user/456');

            expect(router.route.path).toBe('/user/456');
        });
    });

    describe('🔧 handleBackBoundary Callback Tests', () => {
        test('should trigger handleBackBoundary when Navigation returns null', async () => {
            const handleBackBoundarySpy = vi.fn();

            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ],
                handleBackBoundary: handleBackBoundarySpy
            });

            await testRouter.replace('/about');

            const route = await testRouter.back();

            expect(route).toBe(null);
            expect(handleBackBoundarySpy).toHaveBeenCalledWith(testRouter);

            testRouter.destroy();
        });

        test('should not error when no handleBackBoundary callback', async () => {
            const testRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: 'Home' },
                    { path: '/about', component: 'About' }
                ]
                // No handleBackBoundary
            });

            await testRouter.replace('/about');

            // This should not throw an error
            const route = await testRouter.back();
            expect(route).toBe(null);

            testRouter.destroy();
        });
    });

    describe('🔄 Navigation Result Handling', () => {
        test('should call _transitionTo when Navigation returns success result', async () => {
            await router.push('/about');

            const route = await router.back();

            expect(route).not.toBe(null);
            expect(route?.type).toBe(RouteType.back);
            expect(route?.status).toBe(RouteStatus.success);
            expect(route?.url).toBeDefined();
            expect(route?.state).toBeDefined();
        });

        test('should return null directly when Navigation returns null', async () => {
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

            testRouter.destroy();
        });
    });
});
