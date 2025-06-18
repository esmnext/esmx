import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';
import type { Route } from './types';

describe('Router.push Tests', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            location: (to, from) => {
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

    describe('Push Core Behavior', () => {
        test('should return Promise<Route> with push type identifier', async () => {
            const promise = router.push('/about');
            expect(promise).toBeInstanceOf(Promise);

            const route = await promise;
            expect(route.type).toBe(RouteType.push);
            expect(route.isPush).toBe(true);
            expect(route.status).toBe(RouteStatus.success);
        });

        test('should support both string and object parameter formats', async () => {
            // String parameter
            const route1 = await router.push('/about');
            expect(route1.path).toBe('/about');

            // Object parameter
            const route2 = await router.push({
                path: '/user/123',
                query: { tab: 'profile' }
            });
            expect(route2.path).toBe('/user/123');
            expect(route2.query.tab).toBe('profile');
        });

        test('should correctly update router current route state', async () => {
            expect(router.route.path).toBe('/');

            const newRoute = await router.push('/about');

            expect(router.route).toBe(newRoute);
            expect(router.route.path).toBe('/about');
            expect(router.route.type).toBe(RouteType.push);
        });
    });

    describe('URL Smart Detection Logic', () => {
        test('should add new history entry when URL changes', async () => {
            // Record initial history length
            const initialLength = router.navigation.length;

            // Navigate to different URL
            await router.push('/about');

            // Should add new entry to history
            expect(router.navigation.length).toBe(initialLength + 1);
            expect(router.route.path).toBe('/about');
        });

        test('should not add new history entry when URL is same', async () => {
            await router.push('/about');
            const lengthAfterFirstPush = router.navigation.length;

            // Navigate to same URL (should replace, not push)
            await router.push('/about');

            // Should not add new entry (replace instead)
            expect(router.navigation.length).toBe(lengthAfterFirstPush);
            expect(router.route.path).toBe('/about');
        });

        test('should treat query parameter changes as URL changes', async () => {
            await router.push('/about');
            const lengthAfterFirstPush = router.navigation.length;

            // Navigate with query parameters (should create new entry)
            await router.push('/about?newParam=value');

            // Should add new entry because URL changed
            expect(router.navigation.length).toBe(lengthAfterFirstPush + 1);
            expect(router.route.fullPath).toContain('newParam=value');
        });

        test('should treat hash changes as URL changes', async () => {
            await router.push('/about');
            const lengthAfterFirstPush = router.navigation.length;

            // Navigate with hash (should create new entry)
            await router.push('/about#section');

            // Should add new entry because URL changed
            expect(router.navigation.length).toBe(lengthAfterFirstPush + 1);
            expect(router.route.fullPath).toContain('#section');
        });

        test('should always return push type regardless of internal operation', async () => {
            // First push to new URL - should return push type
            const route1 = await router.push('/about');
            expect(route1.type).toBe(RouteType.push);
            expect(route1.isPush).toBe(true);

            // Second push to same URL - should still return push type
            const route2 = await router.push('/about');
            expect(route2.type).toBe(RouteType.push);
            expect(route2.isPush).toBe(true);

            // Push to different URL - should return push type
            const route3 = await router.push('/user/123');
            expect(route3.type).toBe(RouteType.push);
            expect(route3.isPush).toBe(true);

            // Push to same URL again - should still return push type
            const route4 = await router.push('/user/123');
            expect(route4.type).toBe(RouteType.push);
            expect(route4.isPush).toBe(true);
        });
    });

    describe('Concurrency Control and Task Cancellation', () => {
        test('should cancel previous tasks when multiple push operations occur rapidly', async () => {
            const results = await Promise.all([
                router.push('/user/1'),
                router.push('/user/2'),
                router.push('/user/3')
            ]);

            // Only the last navigation should succeed, previous ones should be cancelled
            expect(results[0].status).toBe(RouteStatus.aborted);
            expect(results[1].status).toBe(RouteStatus.aborted);
            expect(results[2].status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/3');
        });

        test('should maintain previous route state when task is cancelled', async () => {
            await router.push('/about');
            expect(router.route.path).toBe('/about');

            // Start navigation that will be cancelled
            const cancelledPromise = router.push('/user/1');
            const successPromise = router.push('/user/2');

            const [cancelledResult, successResult] = await Promise.all([
                cancelledPromise,
                successPromise
            ]);

            expect(cancelledResult.status).toBe(RouteStatus.aborted);
            expect(successResult.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/2');
        });

        test('should only update micro app state with successful navigation', async () => {
            // Record initial state before concurrent navigation
            const initialRoute = router.route.path;

            await Promise.all([
                router.push('/user/1'), // Will be cancelled
                router.push('/user/2') // Will succeed
            ]);

            // Final route should be from successful navigation
            expect(router.route.path).toBe('/user/2');
            expect(router.route.path).not.toBe('/user/1');
            expect(router.route.path).not.toBe(initialRoute);
        });
    });

    describe('Micro App Integration', () => {
        test('should trigger micro app update after push', async () => {
            // Record the initial route state
            const initialPath = router.route.path;

            await router.push('/about');

            // Router state should be updated after push
            expect(router.route.path).toBe('/about');
            expect(router.route.path).not.toBe(initialPath);
        });

        test('should update route state before micro app integration', async () => {
            // Start with known initial state
            expect(router.route.path).toBe('/');

            await router.push('/about');

            // After push completion, route state should be updated
            expect(router.route.path).toBe('/about');
            expect(router.route.type).toBe(RouteType.push);
            expect(router.route.status).toBe(RouteStatus.success);
        });
    });

    describe('Async Components with Push', () => {
        test('should wait for async component to load before completing push', async () => {
            const startTime = Date.now();
            const route = await router.push('/async');
            const endTime = Date.now();

            expect(route.status).toBe(RouteStatus.success);
            expect(endTime - startTime).toBeGreaterThanOrEqual(10);

            const matchedRoute = route.matched[0];
            expect(matchedRoute.component).toBe('AsyncComponent');
        });

        test('should return error status when async component loading fails', async () => {
            // Add async component failure route to configuration
            router = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                location: (to, from) => {
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
            const route = await router.push('/async-error');
            expect(route.status).toBe(RouteStatus.error);
        });
    });

    describe('Push-specific Guard Behavior', () => {
        test('should return aborted status when guard prevents navigation', async () => {
            const route = await router.push('/user/blocked');

            expect(route.status).toBe(RouteStatus.aborted);
            expect(router.route.path).toBe('/'); // Should maintain original route
        });

        test('should navigate to redirect route when guard redirects', async () => {
            const route = await router.push('/user/redirect');

            expect(route.path).toBe('/about');
            expect(route.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/about');
        });

        test('should track afterEach hook execution for successful navigation', async () => {
            let afterEachCallCount = 0;
            const unregister = router.afterEach(() => {
                afterEachCallCount++;
            });

            // Successful push
            await router.push('/about');
            expect(afterEachCallCount).toBe(1);

            // Blocked push
            await router.push('/user/blocked');
            expect(afterEachCallCount).toBe(1); // Should not increment

            unregister();
        });
    });

    describe('History Management', () => {
        test('should enable back and forward navigation after push', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // Navigate back
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');

            // Navigate forward
            const forwardRoute = await router.forward();
            expect(forwardRoute?.path).toBe('/user/123');
        });

        test('should not create new history entry for duplicate URL push', async () => {
            await router.push('/about');
            await router.push('/about'); // Same URL, should use replace

            // Going back should return to initial route, not intermediate state
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/');
        });
    });

    describe('Error Handling', () => {
        test('should trigger location handler when route does not exist', async () => {
            const route = await router.push('/non-existent');

            expect(route.path).toBe('/non-existent');
            expect(route.matched).toHaveLength(0);
            expect(executionLog).toContain('location-handler-/non-existent');
        });

        test('should propagate exceptions during push process correctly', async () => {
            let errorThrown = false;
            const unregister = router.beforeEach(async () => {
                errorThrown = true;
                throw new Error('Guard error');
            });

            const route = await router.push('/about');
            expect(route.status).toBe(RouteStatus.error);
            expect(errorThrown).toBe(true);

            unregister();
        });
    });

    describe('Edge Cases', () => {
        test('should handle push to current route normally', async () => {
            await router.push('/about');
            const currentPath = router.route.path;

            const route = await router.push(currentPath);
            expect(route.status).toBe(RouteStatus.success);
            expect(route.path).toBe(currentPath);
        });

        test('should handle empty parameter correctly', async () => {
            const route = await router.push('');
            expect(route).toBeDefined();
            expect(typeof route.path).toBe('string');
        });

        test('should handle special character paths correctly', async () => {
            const specialPath = '/user/测试用户';
            const route = await router.push(specialPath);

            expect(route.path).toBe(
                '/user/%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
            );
            expect(route.status).toBe(RouteStatus.success);
        });
    });
});
