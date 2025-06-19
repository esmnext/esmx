import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';
import type { Route } from './types';

describe('Router.replace Tests', () => {
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
                    beforeEnter: async (to, from) => {
                        if (to.params.id === 'blocked') return false;
                        if (to.params.id === 'redirect') return '/about';
                    }
                },
                {
                    path: '/async',
                    asyncComponent: async () => {
                        await new Promise((resolve) => setTimeout(resolve, 10));
                        return 'AsyncComponent';
                    }
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('🎯 Replace Core Behavior', () => {
        test('should return Promise<Route> and mark as replace type', async () => {
            const promise = router.replace('/about');
            expect(promise).toBeInstanceOf(Promise);

            const route = await promise;
            expect(route.type).toBe(RouteType.replace);
            expect(route.isPush).toBe(false);
            expect(route.status).toBe(RouteStatus.success);
        });

        test('should support both string and object parameter formats', async () => {
            // String parameter
            const route1 = await router.replace('/about');
            expect(route1.path).toBe('/about');

            // Object parameter
            const route2 = await router.replace({
                path: '/user/123',
                query: { tab: 'profile' }
            });
            expect(route2.path).toBe('/user/123');
            expect(route2.query.tab).toBe('profile');
        });

        test('should correctly update router current route state', async () => {
            expect(router.route.path).toBe('/');

            const newRoute = await router.replace('/about');

            expect(router.route).toBe(newRoute);
            expect(router.route.path).toBe('/about');
            expect(router.route.type).toBe(RouteType.replace);
        });
    });

    describe('🔄 URL Smart Decision Logic', () => {
        test('should use replace operation when URL changes', async () => {
            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.replace('/about'); // Different URL

            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });

        test('should use replace operation when URL is same', async () => {
            await router.replace('/about');

            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.replace('/about'); // Same URL

            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });

        test('query parameter changes should be treated as URL changes', async () => {
            await router.replace('/about');

            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.replace('/about?newParam=value'); // URL change (query parameters)

            expect(replaceSpy).toHaveBeenCalled();
            replaceSpy.mockRestore();
        });

        test('hash changes should be treated as URL changes', async () => {
            await router.replace('/about');

            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.replace('/about#section'); // URL change (hash)

            expect(replaceSpy).toHaveBeenCalled();
            replaceSpy.mockRestore();
        });

        test('returned Route type should always be replace regardless of URL similarity', async () => {
            // First replace to new URL - should return replace type
            const route1 = await router.replace('/about');
            expect(route1.type).toBe(RouteType.replace);
            expect(route1.isPush).toBe(false);

            // Second replace to same URL - type should still be replace
            const route2 = await router.replace('/about');
            expect(route2.type).toBe(RouteType.replace);
            expect(route2.isPush).toBe(false);

            // Verify internal operation actually used replace
            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            // URL change - should use replace, return replace type
            const route3 = await router.replace('/user/123');
            expect(route3.type).toBe(RouteType.replace);
            expect(route3.isPush).toBe(false);
            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockClear();
            replaceSpy.mockClear();

            // Same URL - should use replace, return replace type
            const route4 = await router.replace('/user/123');
            expect(route4.type).toBe(RouteType.replace);
            expect(route4.isPush).toBe(false);
            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });
    });

    describe('🏃 Concurrency Control and Task Cancellation', () => {
        test('rapid consecutive replaces should cancel previous tasks', async () => {
            const results = await Promise.all([
                router.replace('/user/1'),
                router.replace('/user/2'),
                router.replace('/user/3')
            ]);

            // Only the last navigation should succeed, previous ones should be cancelled
            expect(results[0].status).toBe(RouteStatus.aborted);
            expect(results[1].status).toBe(RouteStatus.aborted);
            expect(results[2].status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/3');
        });

        test('should maintain previous route state when task is cancelled', async () => {
            await router.replace('/about');
            expect(router.route.path).toBe('/about');

            // Start a navigation that will be cancelled
            const cancelledPromise = router.replace('/user/1');
            const successPromise = router.replace('/user/2');

            const [cancelledResult, successResult] = await Promise.all([
                cancelledPromise,
                successPromise
            ]);

            expect(cancelledResult.status).toBe(RouteStatus.aborted);
            expect(successResult.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/2');
        });

        test('cancelled tasks should not affect micro app state', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await Promise.all([
                router.replace('/user/1'), // Will be cancelled
                router.replace('/user/2') // Success
            ]);

            // _update should only be called by the last successful task
            expect(updateSpy).toHaveBeenLastCalledWith(router);
            updateSpy.mockRestore();
        });
    });

    describe('🎭 Micro App Integration', () => {
        test('replace should trigger micro app update', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.replace('/about');

            expect(updateSpy).toHaveBeenCalledWith(router);
            updateSpy.mockRestore();
        });

        test('micro app update should happen after route state update', async () => {
            const callOrder: string[] = [];

            const updateSpy = vi
                .spyOn(router.microApp, '_update')
                .mockImplementation(() => {
                    callOrder.push('microApp._update');
                    // Route should be updated at this point
                    expect(router.route.path).toBe('/about');
                });

            await router.replace('/about');

            expect(updateSpy).toHaveBeenCalled();
            expect(callOrder).toContain('microApp._update');
            updateSpy.mockRestore();
        });
    });

    describe('⚡ Async Components with Replace', () => {
        test('replace should wait for async component loading completion', async () => {
            const startTime = Date.now();
            const route = await router.replace('/async');
            const endTime = Date.now();

            expect(route.status).toBe(RouteStatus.success);
            expect(endTime - startTime).toBeGreaterThanOrEqual(10);

            const matchedRoute = route.matched[0];
            expect(matchedRoute.component).toBe('AsyncComponent');
        });

        test('replace should return error status when async component loading fails', async () => {
            // Add failing async component route to configuration
            router = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                fallback: (to, from) => {
                    executionLog.push(`location-handler-${to.path}`);
                },
                routes: [
                    ...(router.options.routes || []),
                    {
                        path: '/async-error',
                        asyncComponent: async () => {
                            throw new Error('Async component failed');
                        }
                    }
                ]
            });

            await router.replace('/');
            const route = await router.replace('/async-error');
            expect(route.status).toBe(RouteStatus.error);
        });
    });

    describe('🛡️ Replace-specific Guard Behavior', () => {
        test('replace should return aborted status when blocked by guard', async () => {
            const route = await router.replace('/user/blocked');

            expect(route.status).toBe(RouteStatus.aborted);
            expect(router.route.path).toBe('/'); // Should maintain original route
        });

        test('replace should navigate to redirect route when guard redirects', async () => {
            const route = await router.replace('/user/redirect');

            expect(route.path).toBe('/about');
            expect(route.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/about');
        });

        test('afterEach should only execute when replace succeeds', async () => {
            const afterEachSpy = vi.fn();
            const unregister = router.afterEach(afterEachSpy);

            // Successful replace
            await router.replace('/about');
            expect(afterEachSpy).toHaveBeenCalledTimes(1);

            // Blocked replace
            await router.replace('/user/blocked');
            expect(afterEachSpy).toHaveBeenCalledTimes(1); // Should not increase

            unregister();
        });
    });

    describe('💾 History Management', () => {
        test('replace should be navigable with back/forward', async () => {
            // First create history with push
            await router.push('/about');
            await router.push('/user/123');

            // Then replace current record with replace
            await router.replace('/user/456');
            expect(router.route.path).toBe('/user/456');

            // Back should return to /about (because /user/123 was replaced)
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');

            // Forward should return to the replaced route
            const forwardRoute = await router.forward();
            expect(forwardRoute?.path).toBe('/user/456');
        });

        test('repeated replace to same URL should not create new history entries', async () => {
            // First create some history with push
            await router.push('/about');
            await router.push('/user/123');

            // Then replace to same URL
            await router.replace('/user/123');
            await router.replace('/user/123'); // Same URL, still use replace

            // Back should return to /about, not intermediate states
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');
        });
    });

    describe('❌ Error Handling', () => {
        test('should trigger location handling when route does not exist', async () => {
            const route = await router.replace('/non-existent');

            expect(route.path).toBe('/non-existent');
            expect(route.matched).toHaveLength(0);
            expect(executionLog).toContain('location-handler-/non-existent');
        });

        test('exceptions during replace process should propagate correctly', async () => {
            const errorGuard = vi
                .fn()
                .mockRejectedValue(new Error('Guard error'));
            const unregister = router.beforeEach(errorGuard);

            const route = await router.replace('/about');
            expect(route.status).toBe(RouteStatus.error);

            unregister();
        });
    });

    describe('🔍 Edge Cases', () => {
        test('replace to current route should be handled normally', async () => {
            await router.replace('/about');
            const currentPath = router.route.path;

            const route = await router.replace(currentPath);

            expect(route.status).toBe(RouteStatus.success);
            expect(route.path).toBe(currentPath);
        });

        test('empty parameters should be handled correctly', async () => {
            const route = await router.replace('');
            expect(route).toBeDefined();
            expect(typeof route.path).toBe('string');
        });

        test('special character paths should be handled correctly', async () => {
            const specialPath = '/user/测试用户';
            const route = await router.replace(specialPath);

            expect(route.path).toBe(
                '/user/%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
            );
            expect(route.status).toBe(RouteStatus.success);
        });
    });
});
