import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from './router';
import { RouteType, RouterMode } from './types';
import type { Route, RouteLocationInput, RouterOptions } from './types';

describe('Router Window Navigation Tests', () => {
    let router: Router;
    let mockApps: Record<string, any>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockApps = {
            home: vi.fn(() => ({
                mount: vi.fn(),
                unmount: vi.fn(),
                renderToString: vi.fn().mockResolvedValue('<div>Home</div>')
            })),
            about: vi.fn(() => ({
                mount: vi.fn(),
                unmount: vi.fn(),
                renderToString: vi.fn().mockResolvedValue('<div>About</div>')
            })),
            user: vi.fn(() => ({
                mount: vi.fn(),
                unmount: vi.fn(),
                renderToString: vi.fn().mockResolvedValue('<div>User</div>')
            }))
        };

        router = new Router({
            routes: [
                { path: '/', app: 'home' },
                { path: '/about', app: 'about' },
                { path: '/user/:id', app: 'user' }
            ],
            apps: mockApps
        });
    });

    /**
     * Generic window navigation test function
     * @param methodName Method name ('pushWindow' or 'replaceWindow')
     * @param expectedIsPush Expected isPush value
     */
    function createWindowNavigationTests(
        methodName: 'pushWindow' | 'replaceWindow',
        expectedIsPush: boolean
    ) {
        describe(`🪟 ${methodName} Core Functionality Tests`, () => {
            it(`should support using current route path`, async () => {
                await router.push('/about');
                const result = await router[methodName]('/about');

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.path).toBe('/about');
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.handle).not.toBeNull();
            });

            it(`should support string path parameters`, async () => {
                const result = await router[methodName]('/user/123');

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.path).toBe('/user/123');
                expect(result.params.id).toBe('123');
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.handle).not.toBeNull();
            });

            it(`should support object parameters`, async () => {
                const result = await router[methodName]({
                    path: '/user/456',
                    query: { tab: 'profile' },
                    hash: 'section1'
                });

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.path).toBe('/user/456');
                expect(result.params.id).toBe('456');
                expect(result.query.tab).toBe('profile');
                expect(result.url.hash).toBe('#section1');
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.handle).not.toBeNull();
            });

            it(`should correctly handle complete URLs`, async () => {
                const result = await router[methodName](
                    'https://example.com/user/789?sort=name#top'
                );

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.url.href).toBe(
                    'https://example.com/user/789?sort=name#top'
                );
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.handle).not.toBeNull();
            });
        });

        describe(`🎯 ${methodName} Specific Behavior Tests`, () => {
            it(`should set correct isPush flag`, async () => {
                const result = await router[methodName]('/about');

                expect(result.isPush).toBe(expectedIsPush);
                expect(result.type).toBe(RouteType[methodName]);
            });

            it(`should call location handler`, async () => {
                let locationCalled = false;
                let receivedRoute: Route | null = null;

                const windowRouter = new Router({
                    routes: [{ path: '/', app: 'home' }],
                    apps: mockApps,
                    fallback: (to, from) => {
                        locationCalled = true;
                        receivedRoute = to;
                        return { windowNavigation: true };
                    }
                });

                await windowRouter.push('/');
                const result = await windowRouter[methodName]('/about');

                expect(locationCalled).toBe(true);
                expect(receivedRoute!.isPush).toBe(expectedIsPush);
                expect(result.handleResult).toEqual({ windowNavigation: true });
                windowRouter.destroy();
            });

            it(`should not update current route state`, async () => {
                await router.push('/about');
                const beforeRoute = router.route;

                await router[methodName]('/user/123');
                const afterRoute = router.route;

                expect(afterRoute.path).toBe(beforeRoute.path);
                expect(afterRoute.url.href).toBe(beforeRoute.url.href);
            });

            it(`should not trigger MicroApp update`, async () => {
                const updateSpy = vi.spyOn(router.microApp, '_update');

                await router[methodName]('/user/123');

                expect(updateSpy).not.toHaveBeenCalled();
            });
        });

        describe(`🛡️ ${methodName} Route Guards Tests`, () => {
            it(`should execute beforeEach guards`, async () => {
                let guardCalled = false;
                const unregister = router.beforeEach(async (to, from) => {
                    guardCalled = true;
                    expect(to.isPush).toBe(expectedIsPush);
                });

                await router[methodName]('/about');

                expect(guardCalled).toBe(true);
                unregister();
            });

            it(`should abort navigation when guard returns false`, async () => {
                const unregister = router.beforeEach((to, from) => {
                    return false;
                });

                await expect(router[methodName]('/about')).rejects.toThrow(
                    'Navigation was aborted'
                );
                unregister();
            });

            it(`should support guard redirects`, async () => {
                const unregister = router.beforeEach(async (to) => {
                    if (to.path === '/about') {
                        return '/user/redirect';
                    }
                });

                const result = await router[methodName]('/about');

                expect(result.path).toBe('/user/redirect');
                expect(result.params.id).toBe('redirect');
                unregister();
            });

            it(`should execute afterEach guards`, async () => {
                let guardCalled = false;
                const unregister = router.afterEach((to, from) => {
                    guardCalled = true;
                    expect(to.isPush).toBe(expectedIsPush);
                });

                await router[methodName]('/about');

                expect(guardCalled).toBe(true);
                unregister();
            });
        });

        describe(`🎭 ${methodName} Edge Cases Tests`, () => {
            it(`should handle non-existent routes`, async () => {
                const result = await router[methodName]('/nonexistent');

                expect(result.handle).not.toBeNull();
                expect(result.matched.length).toBe(0);
                expect(result.isPush).toBe(expectedIsPush);
            });

            it(`should handle empty string path`, async () => {
                const result = await router[methodName]('');

                expect(result.handle).not.toBeNull();
                expect(result.isPush).toBe(expectedIsPush);
            });

            it(`should handle special characters`, async () => {
                const result = await router[methodName](
                    '/user/测试用户?name=张三&age=25#个人信息'
                );

                expect(result.handle).not.toBeNull();
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.url.pathname).toContain(
                    '%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
                );
            });
        });

        describe(`⚡ ${methodName} Task Cancellation and Concurrency Control`, () => {
            it(`should support concurrent calls`, async () => {
                const promises = [
                    router[methodName]('/user/1').catch((err) => err),
                    router[methodName]('/user/2').catch((err) => err),
                    router[methodName]('/user/3').catch((err) => err)
                ];

                const results = await Promise.all(promises);

                const successResults = results.filter(
                    (r) => !(r instanceof Error) && r.handle !== null
                );
                const errorResults = results.filter((r) => r instanceof Error);

                // At least one should succeed, others may be cancelled
                expect(successResults.length).toBeGreaterThan(0);
                expect(successResults.length + errorResults.length).toBe(3);

                successResults.forEach((result) => {
                    expect(result.isPush).toBe(expectedIsPush);
                });
            });

            it(`should correctly handle rapid consecutive calls`, async () => {
                const results: Route[] = [];

                for (let i = 0; i < 5; i++) {
                    results.push(await router[methodName](`/user/${i}`));
                }

                results.forEach((result, index) => {
                    expect(result.handle).not.toBeNull();
                    expect(result.params.id).toBe(String(index));
                    expect(result.isPush).toBe(expectedIsPush);
                });
            });
        });

        describe(`❌ ${methodName} Error Handling`, () => {
            it(`should handle exceptions in guards`, async () => {
                const unregister = router.beforeEach(async () => {
                    throw new Error('Guard error');
                });

                await expect(router[methodName]('/about')).rejects.toThrow();
                unregister();
            });

            it(`should handle location handler exceptions`, async () => {
                const windowRouter = new Router({
                    routes: [{ path: '/', app: 'home' }],
                    apps: mockApps,
                    fallback: () => {
                        throw new Error('Location handler error');
                    }
                });

                await windowRouter.push('/');

                // Location handler exceptions will cause entire route handling to fail
                await expect(
                    windowRouter[methodName]('/about')
                ).rejects.toThrow();

                windowRouter.destroy();
            });
        });

        describe(`🧩 ${methodName} Async Component Handling`, () => {
            it(`should correctly handle async components`, async () => {
                const asyncRouter = new Router({
                    routes: [
                        {
                            path: '/async',
                            app: 'home',
                            asyncComponent: async () => {
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 10)
                                );
                                return () => 'AsyncComponent';
                            }
                        }
                    ],
                    apps: mockApps,
                    fallback: (to, from) => {
                        // For window navigation, fallback directly returns the result
                        return { windowNavigation: true };
                    }
                });

                const result = await asyncRouter[methodName]('/async');

                expect(result.handle).not.toBeNull();
                expect(result.isPush).toBe(expectedIsPush);
                // so the component remains undefined, only asyncComponent config exists
                expect(result.matched[0].component).toBeUndefined();
                expect(result.matched[0].asyncComponent).toBeDefined();
                expect(result.handleResult).toEqual({ windowNavigation: true });
                asyncRouter.destroy();
            });

            it(`should handle async component loading failures`, async () => {
                const asyncRouter = new Router({
                    routes: [
                        {
                            path: '/async-error',
                            app: 'home',
                            asyncComponent: async () => {
                                throw new Error('Component load failed');
                            }
                        }
                    ],
                    apps: mockApps,
                    fallback: (to, from) => {
                        return { fallbackHandled: true };
                    }
                });

                const result = await asyncRouter[methodName]('/async-error');

                expect(result.handle).not.toBeNull();
                // Component should remain undefined since asyncComponent task is not executed
                expect(result.matched[0].component).toBeUndefined();
                expect(result.matched[0].asyncComponent).toBeDefined();
                expect(result.handleResult).toEqual({ fallbackHandled: true });
                asyncRouter.destroy();
            });
        });

        describe(`🔧 ${methodName} Differences from Other Methods`, () => {
            it(`should behave differently from push/replace methods`, async () => {
                await router.push('/about');
                const pushResult = await router.push('/user/123');
                const windowResult = await router[methodName]('/user/456');

                // push will update current route
                expect(router.route.path).toBe('/user/123');

                expect(windowResult.isPush).toBe(expectedIsPush);
                expect(windowResult.type).toBe(RouteType[methodName]);

                // Types are different
                expect(pushResult.type).toBe(RouteType.push);
                expect(windowResult.type).toBe(RouteType[methodName]);
            });

            it(`should maintain consistency with resolve method in URL parsing`, async () => {
                const resolvedRoute = router.resolve('/user/789');
                const windowRoute = await router[methodName]('/user/789');

                expect(windowRoute.url.href).toBe(resolvedRoute.url.href);
                expect(windowRoute.params).toEqual(resolvedRoute.params);
                expect(windowRoute.matched).toEqual(resolvedRoute.matched);

                expect(windowRoute.type).toBe(RouteType[methodName]);
                expect(resolvedRoute.type).toBe(RouteType.push);
                expect(windowRoute.isPush).toBe(expectedIsPush);
                expect(resolvedRoute.isPush).toBe(true);
            });
        });
    }

    createWindowNavigationTests('pushWindow', true);

    createWindowNavigationTests('replaceWindow', false);

    describe('🔄 pushWindow and replaceWindow Comparison Tests', () => {
        it('the only difference between the two methods should be the isPush flag', async () => {
            const pushResult = await router.pushWindow('/user/123');
            const replaceResult = await router.replaceWindow('/user/123');

            expect(pushResult.url.href).toBe(replaceResult.url.href);
            expect(pushResult.params).toEqual(replaceResult.params);
            expect(pushResult.query).toEqual(replaceResult.query);
            expect(pushResult.url.hash).toBe(replaceResult.url.hash);
            expect(pushResult.matched).toEqual(replaceResult.matched);

            expect(pushResult.isPush).toBe(true);
            expect(replaceResult.isPush).toBe(false);
            expect(pushResult.type).toBe(RouteType.pushWindow);
            expect(replaceResult.type).toBe(RouteType.replaceWindow);
        });

        it('both methods should call the same location handler', async () => {
            const locationCalls: Array<{
                method: string;
                isPush: boolean;
                path: string;
            }> = [];

            const windowRouter = new Router({
                routes: [{ path: '/', app: 'home' }],
                apps: mockApps,
                fallback: (to, from) => {
                    locationCalls.push({
                        method: to.type,
                        isPush: to.isPush,
                        path: to.path
                    });
                    return { called: true };
                }
            });

            await windowRouter.push('/');
            await windowRouter.pushWindow('/test');
            await windowRouter.replaceWindow('/test');

            expect(locationCalls).toHaveLength(2);
            expect(locationCalls[0]).toEqual({
                method: 'pushWindow',
                isPush: true,
                path: '/test'
            });
            expect(locationCalls[1]).toEqual({
                method: 'replaceWindow',
                isPush: false,
                path: '/test'
            });

            windowRouter.destroy();
        });
    });
});
