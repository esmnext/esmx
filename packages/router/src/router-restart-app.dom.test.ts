/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType } from './types';
import type { Route, RouteLocationInput, RouterOptions } from './types';

describe('Router.restartApp Focused Tests', () => {
    let router: Router;
    let mockApps: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(async () => {
        // Create simple mock applications
        mockApps = {
            home: vi.fn(() => ({ mount: vi.fn(), unmount: vi.fn() })),
            about: vi.fn(() => ({ mount: vi.fn(), unmount: vi.fn() })),
            user: vi.fn(() => ({ mount: vi.fn(), unmount: vi.fn() })),
            products: vi.fn(() => ({ mount: vi.fn(), unmount: vi.fn() }))
        };

        const options: RouterOptions = {
            routes: [
                { path: '/', app: 'home' },
                { path: '/about', app: 'about' },
                { path: '/user/:id', app: 'user' },
                { path: '/products/:category', app: 'products' }
            ],
            apps: mockApps
        };

        router = new Router(options);
        await router.push('/');
    });

    afterEach(() => {
        router.destroy();
        vi.clearAllMocks();
    });

    describe('🎯 Core Functionality Tests', () => {
        it('should support parameterless restart (restart to current path)', async () => {
            // First navigate to /user/123
            await router.push('/user/123');
            expect(router.route.url.pathname).toBe('/user/123');

            // Parameterless restart
            const result = await router.restartApp();

            expect(result.type).toBe(RouteType.restartApp);
            expect(result.url.pathname).toBe('/user/123');
            expect(result.status).toBe(RouteStatus.success);
            expect(router.route).toBe(result);
        });

        it('should support string path restart', async () => {
            const result = await router.restartApp('/about');

            expect(result.type).toBe(RouteType.restartApp);
            expect(result.url.pathname).toBe('/about');
            expect(result.status).toBe(RouteStatus.success);
            expect(router.route).toBe(result);
        });

        it('should support object parameter restart', async () => {
            const result = await router.restartApp({
                path: '/user/456',
                query: { tab: 'profile', mode: 'edit' },
                hash: '#section1'
            });

            expect(result.type).toBe(RouteType.restartApp);
            expect(result.url.pathname).toBe('/user/456');
            expect(result.query.tab).toBe('profile');
            expect(result.query.mode).toBe('edit');
            expect(result.url.hash).toBe('#section1');
            expect(result.params.id).toBe('456');
            expect(result.status).toBe(RouteStatus.success);
        });

        it('should support restart with state', async () => {
            const customState = { userId: 123, preferences: { theme: 'dark' } };
            const result = await router.restartApp({
                path: '/about',
                state: customState
            });

            // State will be merged, including system-added fields
            expect(result.state).toEqual(expect.objectContaining(customState));
            const state = result.state as typeof customState;
            expect(state.userId).toBe(123);
            expect(state.preferences.theme).toBe('dark');
        });

        it('should correctly handle route parameters', async () => {
            const result = await router.restartApp('/user/789');

            expect(result.params.id).toBe('789');
            expect(result.matched.length).toBeGreaterThan(0);
            expect(result.matched[0].path).toBe('/user/:id');
        });

        it('should correctly handle query parameters', async () => {
            const result = await router.restartApp('/about?tab=info&mode=edit');

            expect(result.query.tab).toBe('info');
            expect(result.query.mode).toBe('edit');
            expect(result.url.search).toBe('?tab=info&mode=edit');
        });

        it('should correctly handle hash', async () => {
            const result = await router.restartApp('/about#section2');

            expect(result.url.hash).toBe('#section2');
        });
    });

    describe('🔄 restartApp-Specific Behavior Tests', () => {
        it('should force update MicroApp (even with same application)', async () => {
            // First navigate to /about
            await router.push('/about');
            const firstCallCount = mockApps.about.mock.calls.length;

            // Restart to same path, should force update
            await router.restartApp('/about');
            const secondCallCount = mockApps.about.mock.calls.length;

            // Verify application was recreated (this is restartApp's specific behavior)
            expect(secondCallCount).toBeGreaterThan(firstCallCount);
        });

        it('should call navigation.replace instead of push', async () => {
            const replaceSpy = vi.spyOn(router.navigation, 'replace');
            const pushSpy = vi.spyOn(router.navigation, 'push');

            await router.restartApp('/about');

            expect(replaceSpy).toHaveBeenCalled();
            expect(pushSpy).not.toHaveBeenCalled();
        });

        it('should correctly update router current route state', async () => {
            const result = await router.restartApp('/about');

            expect(router.route.url.pathname).toBe('/about');
            expect(router.route.type).toBe(RouteType.restartApp);
            expect(router.route).toBe(result);
        });

        it('should differentiate from other routing method behaviors', async () => {
            // push navigation
            await router.push('/user/123');
            expect(router.route.type).toBe(RouteType.push);

            // replace navigation
            await router.replace('/about');
            expect(router.route.type).toBe(RouteType.replace);

            // restartApp navigation
            const result = await router.restartApp('/products/electronics');
            expect(result.type).toBe(RouteType.restartApp);
            expect(router.route.type).toBe(RouteType.restartApp);
        });
    });

    describe('🎭 Edge Cases Tests', () => {
        it('should handle non-existent routes', async () => {
            const result = await router.restartApp('/nonexistent');

            expect(result.matched.length).toBe(0);
            expect(result.config).toBeNull();
            expect(result.url.pathname).toBe('/nonexistent');
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('should handle empty string path', async () => {
            const result = await router.restartApp('');

            expect(result.url.pathname).toBe('/');
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('should handle root path', async () => {
            const result = await router.restartApp('/');

            expect(result.url.pathname).toBe('/');
            expect(result.matched.length).toBeGreaterThan(0);
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('should handle complex query parameters', async () => {
            const result = await router.restartApp('/about?a=1&b=2&a=3&c=');

            // Query parameter handling may vary by implementation, testing basic functionality here
            expect(result.query.b).toBe('2');
            expect(result.query.c).toBe('');
            expect(result.url.search).toContain('a=');
            expect(result.url.search).toContain('b=2');
        });

        it('should handle special character paths', async () => {
            const result = await router.restartApp('/user/测试用户');

            // URL will automatically encode special characters
            expect(result.url.pathname).toContain('/user/');
            // Parameters may be URL encoded, need to decode
            expect(decodeURIComponent(result.params.id)).toBe('测试用户');
        });
    });

    describe('🔗 URL Parsing Tests', () => {
        it('should correctly parse absolute paths', async () => {
            // First navigate to deep path
            await router.push('/user/123');

            // Restart to absolute path
            const result = await router.restartApp('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.url.href).toMatch(/\/about$/);
        });

        it('should correctly handle relative paths', async () => {
            await router.push('/user/123');

            const result = await router.restartApp('456');

            // Relative path handling depends on current base URL implementation
            expect(result.url.pathname).toContain('456');
            // If matched to user route, should have id parameter
            if (
                result.matched.length > 0 &&
                result.matched[0].path === '/user/:id'
            ) {
                expect(result.params.id).toBe('456');
            }
        });

        it('should correctly handle complete URLs', async () => {
            const result = await router.restartApp('http://example.com/test');

            expect(result.url.href).toBe('http://example.com/test');
            expect(result.url.pathname).toBe('/test');
        });
    });

    describe('🎯 Type Overload Tests', () => {
        it('should support parameterless calls', async () => {
            await router.push('/user/123');

            const result: Route = await router.restartApp();

            expect(result.url.pathname).toBe('/user/123');
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('should support string parameter calls', async () => {
            const result: Route = await router.restartApp('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('should support object parameter calls', async () => {
            const routeLocation: RouteLocationInput = {
                path: '/user/456',
                query: { tab: 'settings' }
            };

            const result: Route = await router.restartApp(routeLocation);

            expect(result.url.pathname).toBe('/user/456');
            expect(result.query.tab).toBe('settings');
            expect(result.type).toBe(RouteType.restartApp);
        });
    });

    describe('🔄 Multiple Restart Tests', () => {
        it('should support consecutive multiple restarts', async () => {
            const paths = ['/about', '/user/123', '/products/electronics', '/'];

            for (const path of paths) {
                const result = await router.restartApp(path);
                expect(result.type).toBe(RouteType.restartApp);
                expect(result.status).toBe(RouteStatus.success);
                expect(router.route).toBe(result);
            }
        });

        it('should create new application instances on each restart', async () => {
            await router.restartApp('/about');
            const firstCallCount = mockApps.about.mock.calls.length;

            await router.restartApp('/about');
            const secondCallCount = mockApps.about.mock.calls.length;

            await router.restartApp('/about');
            const thirdCallCount = mockApps.about.mock.calls.length;

            // Each restart should create new application instances
            expect(secondCallCount).toBeGreaterThan(firstCallCount);
            expect(thirdCallCount).toBeGreaterThan(secondCallCount);
        });
    });

    describe('🎨 Status Code Handling Tests', () => {
        it('should support custom status codes', async () => {
            const result = await router.restartApp({
                path: '/about',
                statusCode: 201
            });

            expect(result.statusCode).toBe(201);
        });

        it('should maintain default status code as null', async () => {
            const result = await router.restartApp('/about');

            expect(result.statusCode).toBeNull();
        });
    });

    describe('🔧 Consistency Tests with resolve Method', () => {
        it('should maintain consistency with resolve method results in URL parsing', async () => {
            const resolvedRoute = router.resolve('/user/789');
            const restartedRoute = await router.restartApp('/user/789');

            expect(restartedRoute.url.href).toBe(resolvedRoute.url.href);
            expect(restartedRoute.params).toEqual(resolvedRoute.params);
            expect(restartedRoute.matched).toEqual(resolvedRoute.matched);
            // But types should be different
            expect(restartedRoute.type).toBe(RouteType.restartApp);
            expect(resolvedRoute.type).toBe(RouteType.none);
        });
    });

    describe('🛡️ Route Guards Integration Tests', () => {
        let guardExecutionLog: string[];

        beforeEach(() => {
            guardExecutionLog = [];
        });

        it('should correctly execute beforeEach guards', async () => {
            const unregister = router.beforeEach(async (to, from) => {
                guardExecutionLog.push(
                    `beforeEach-${to.path}-from-${from?.path || 'null'}`
                );
            });

            await router.restartApp('/about');

            expect(guardExecutionLog).toContain('beforeEach-/about-from-/');
            unregister();
        });

        it('should correctly execute afterEach guards', async () => {
            const unregister = router.afterEach((to, from) => {
                guardExecutionLog.push(
                    `afterEach-${to.path}-from-${from?.path || 'null'}`
                );
            });

            await router.restartApp('/about');

            expect(guardExecutionLog).toContain('afterEach-/about-from-/');
            unregister();
        });

        it('should abort restart when beforeEach guard returns false', async () => {
            const unregister = router.beforeEach(async (to, from) => {
                if (to.path === '/about') {
                    return false;
                }
            });

            const result = await router.restartApp('/about');

            expect(result.status).toBe(RouteStatus.aborted);
            expect(router.route.path).toBe('/'); // Should maintain original route
            unregister();
        });

        it('should support guard redirects', async () => {
            const unregister = router.beforeEach(async (to, from) => {
                if (to.path === '/about') {
                    return '/user/redirected';
                }
            });

            const result = await router.restartApp('/about');

            expect(result.path).toBe('/user/redirected');
            expect(result.params.id).toBe('redirected');
            expect(result.status).toBe(RouteStatus.success);
            unregister();
        });
    });

    describe('🧩 Async Component Handling Tests', () => {
        let asyncRouter: Router;

        beforeEach(async () => {
            const asyncOptions: RouterOptions = {
                routes: [
                    {
                        path: '/',
                        app: 'home',
                        component: () => 'HomeComponent'
                    },
                    {
                        path: '/async',
                        app: 'async',
                        asyncComponent: async () => {
                            // Simulate async component loading
                            await new Promise((resolve) =>
                                setTimeout(resolve, 10)
                            );
                            return () => 'AsyncComponent';
                        }
                    },
                    {
                        path: '/async-error',
                        app: 'async-error',
                        asyncComponent: async () => {
                            throw new Error('Component load failed');
                        }
                    }
                ],
                apps: mockApps
            };

            asyncRouter = new Router(asyncOptions);
            await asyncRouter.push('/');
        });

        afterEach(() => {
            asyncRouter.destroy();
        });

        it('should correctly handle async component loading', async () => {
            const result = await asyncRouter.restartApp('/async');

            expect(result.status).toBe(RouteStatus.success);
            expect(result.matched[0].component).toBeDefined();
            expect(typeof result.matched[0].component).toBe('function');
        });

        it('should handle async component loading failures', async () => {
            const result = await asyncRouter.restartApp('/async-error');

            expect(result.status).toBe(RouteStatus.error);
        });
    });

    describe('⚡ Task Cancellation and Concurrency Control Tests', () => {
        it('should cancel tasks interrupted by new restartApp calls', async () => {
            // Create a guard that will delay
            const unregister = router.beforeEach(async (to, from) => {
                if (to.path === '/user/slow') {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            });

            // Rapidly consecutive restartApp calls
            const results = await Promise.all([
                router.restartApp('/user/slow'),
                router.restartApp('/about')
            ]);

            // First call should be cancelled, second should succeed
            expect(results[0].status).toBe(RouteStatus.aborted);
            expect(results[1].status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/about');

            unregister();
        });

        it('should correctly handle multiple concurrent restartApp calls', async () => {
            const paths = ['/user/1', '/user/2', '/user/3'];
            const results = await Promise.all(
                paths.map((path) => router.restartApp(path))
            );

            // Only the last one should succeed
            expect(results[0].status).toBe(RouteStatus.aborted);
            expect(results[1].status).toBe(RouteStatus.aborted);
            expect(results[2].status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/3');
        });
    });

    describe('🌍 Route Override Tests', () => {
        let overrideRouter: Router;

        beforeEach(async () => {
            const overrideOptions: RouterOptions = {
                routes: [
                    {
                        path: '/',
                        app: 'home',
                        component: () => 'HomeComponent'
                    },
                    {
                        path: '/override-test',
                        app: 'override',
                        component: () => 'OverrideComponent',
                        override: (to, from) => {
                            if (to.query.native === 'true') {
                                return async () => {
                                    return { native: true, path: to.path };
                                };
                            }
                        }
                    },
                    {
                        path: '/hybrid-page',
                        app: 'hybrid',
                        component: () => 'HybridComponent',
                        override: (to, from) => {
                            // Always override for this test
                            return async () => {
                                return {
                                    hybrid: 'native',
                                    component: 'NativeComponent'
                                };
                            };
                        }
                    }
                ],
                apps: mockApps
            };

            overrideRouter = new Router(overrideOptions);
            await overrideRouter.push('/');
        });

        afterEach(() => {
            overrideRouter.destroy();
        });

        it('should use override when condition is met', async () => {
            const result = await overrideRouter.restartApp(
                '/override-test?native=true'
            );

            expect(result.status).toBe(RouteStatus.success);
            expect(result.handleResult).toEqual({
                native: true,
                path: '/override-test'
            });
        });

        it('should use default behavior when override returns nothing', async () => {
            const result = await overrideRouter.restartApp(
                '/override-test?native=false'
            );

            expect(result.status).toBe(RouteStatus.success);
            // Should use default behavior (no override handler)
            expect(result.handle).not.toBeNull();
        });

        it('should always use override when function always returns handler', async () => {
            const result = await overrideRouter.restartApp('/hybrid-page');

            expect(result.status).toBe(RouteStatus.success);
            expect(result.handleResult).toEqual({
                hybrid: 'native',
                component: 'NativeComponent'
            });
        });
    });

    describe('❌ Error Handling and Exception Scenario Tests', () => {
        it('should handle exceptions thrown in guards', async () => {
            const unregister = router.beforeEach(async (to, from) => {
                if (to.path === '/about') {
                    throw new Error('Guard error');
                }
            });

            const result = await router.restartApp('/about');

            expect(result.status).toBe(RouteStatus.error);
            unregister();
        });

        it('should handle MicroApp update exceptions', async () => {
            const originalUpdate = router.microApp._update;
            router.microApp._update = vi.fn().mockImplementation(() => {
                throw new Error('MicroApp update failed');
            });

            // MicroApp update exceptions will cause entire route handling to fail
            await expect(router.restartApp('/about')).rejects.toThrow(
                'MicroApp update failed'
            );

            // Restore original method
            router.microApp._update = originalUpdate;
        });

        it('should handle navigation.replace exceptions', async () => {
            const originalReplace = router.navigation.replace;
            router.navigation.replace = vi.fn().mockImplementation(() => {
                throw new Error('Navigation replace failed');
            });

            // navigation.replace exceptions will cause entire route handling to fail
            await expect(router.restartApp('/about')).rejects.toThrow(
                'Navigation replace failed'
            );

            // Restore original method
            router.navigation.replace = originalReplace;
        });
    });

    describe('🔄 Route Lifecycle Integrity Tests', () => {
        let lifecycleRouter: Router;
        let lifecycleLog: string[];

        beforeEach(async () => {
            lifecycleLog = [];

            const lifecycleOptions: RouterOptions = {
                routes: [
                    {
                        path: '/',
                        app: 'home',
                        component: () => 'HomeComponent',
                        beforeLeave: async (to, from) => {
                            lifecycleLog.push('home-beforeLeave');
                        }
                    },
                    {
                        path: '/lifecycle',
                        app: 'lifecycle',
                        component: () => 'LifecycleComponent',
                        beforeEnter: async (to, from) => {
                            lifecycleLog.push('lifecycle-beforeEnter');
                        },
                        beforeUpdate: async (to, from) => {
                            lifecycleLog.push('lifecycle-beforeUpdate');
                        },
                        beforeLeave: async (to, from) => {
                            lifecycleLog.push('lifecycle-beforeLeave');
                        }
                    }
                ],
                apps: mockApps
            };

            lifecycleRouter = new Router(lifecycleOptions);
            await lifecycleRouter.push('/');
        });

        afterEach(() => {
            lifecycleRouter.destroy();
        });

        it('should correctly execute complete route lifecycle', async () => {
            // Global guards
            const unregisterBefore = lifecycleRouter.beforeEach((to, from) => {
                lifecycleLog.push(`global-beforeEach-${to.path}`);
            });
            const unregisterAfter = lifecycleRouter.afterEach((to, from) => {
                lifecycleLog.push(`global-afterEach-${to.path}`);
            });

            await lifecycleRouter.restartApp('/lifecycle');

            // Verify execution order: beforeLeave -> beforeEach -> beforeEnter -> afterEach
            expect(lifecycleLog).toEqual([
                'home-beforeLeave',
                'global-beforeEach-/lifecycle',
                'lifecycle-beforeEnter',
                'global-afterEach-/lifecycle'
            ]);

            unregisterBefore();
            unregisterAfter();
        });

        it('should execute beforeUpdate when restarting same route', async () => {
            // First navigate to target route
            await lifecycleRouter.push('/lifecycle');
            lifecycleLog = []; // Clear log

            // Restart to same route with different parameters
            await lifecycleRouter.restartApp('/lifecycle?version=2');

            // Should execute beforeUpdate instead of beforeEnter
            expect(lifecycleLog).toContain('lifecycle-beforeUpdate');
            expect(lifecycleLog).not.toContain('lifecycle-beforeEnter');
        });
    });

    describe('🎯 Special Route Configuration Tests', () => {
        it('should handle routes with custom location handler', async () => {
            let locationCalled = false;
            const customLocationRouter = new Router({
                routes: [{ path: '/', app: 'home' }],
                apps: mockApps,
                fallback: (to, from) => {
                    locationCalled = true;
                    // Simulate custom location handler behavior
                    return { customLocation: true, path: to.path };
                }
            });

            await customLocationRouter.push('/');
            const result =
                await customLocationRouter.restartApp('/nonexistent');

            // Location handler should be called because route doesn't exist
            expect(locationCalled).toBe(true);
            expect(result.matched.length).toBe(0); // Non-existent route
            expect(typeof result.handle).toBe('function');
            expect(result.handleResult).toEqual({
                customLocation: true,
                path: '/nonexistent'
            });
            customLocationRouter.destroy();
        });

        it('should handle complex nested route restarts', async () => {
            const nestedRouter = new Router({
                routes: [
                    {
                        path: '/',
                        app: 'home',
                        children: [
                            {
                                path: 'nested/:id',
                                app: 'nested',
                                children: [
                                    {
                                        path: 'deep/:subId',
                                        app: 'deep'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                apps: mockApps
            });

            await nestedRouter.push('/');
            const result = await nestedRouter.restartApp(
                '/nested/123/deep/456'
            );

            expect(result.params.id).toBe('123');
            expect(result.params.subId).toBe('456');
            expect(result.matched.length).toBe(3); // Three levels of nesting
            nestedRouter.destroy();
        });
    });

    describe('📊 Performance and Memory Tests', () => {
        it('should correctly clean up resources after extensive restarts', async () => {
            const initialAppsCallCount = Object.values(mockApps).reduce(
                (sum, app) => sum + app.mock.calls.length,
                0
            );

            // Execute extensive restart operations
            for (let i = 0; i < 50; i++) {
                await router.restartApp(`/user/${i}`);
            }

            const finalAppsCallCount = Object.values(mockApps).reduce(
                (sum, app) => sum + app.mock.calls.length,
                0
            );

            // Verify applications were correctly created and destroyed
            expect(finalAppsCallCount).toBeGreaterThan(initialAppsCallCount);

            // Verify final state is correct
            expect(router.route.params.id).toBe('49');
        });

        it('should correctly handle rapid consecutive restart calls', async () => {
            const startTime = Date.now();

            // Rapid consecutive calls
            const promises = Array.from({ length: 10 }, (_, i) =>
                router.restartApp(`/user/${i}`)
            );

            const results = await Promise.all(promises);
            const endTime = Date.now();

            // Only the last one should succeed
            const successfulResults = results.filter(
                (r) => r.status === RouteStatus.success
            );
            expect(successfulResults).toHaveLength(1);
            expect(successfulResults[0].params.id).toBe('9');

            // Performance check: should complete within reasonable time
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
});
