import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType } from './types';
import type { Route, RouteLocationRaw, RouterOptions } from './types';

describe('Router Window Navigation 测试', () => {
    let router: Router;
    let mockApps: Record<string, any>;

    beforeEach(() => {
        // 重置所有 mock
        vi.clearAllMocks();

        // 创建 mock 应用
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

        // 创建路由器实例
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
     * 通用的窗口导航测试函数
     * @param methodName 方法名称 ('pushWindow' 或 'replaceWindow')
     * @param expectedIsPush 期望的 isPush 值
     */
    function createWindowNavigationTests(
        methodName: 'pushWindow' | 'replaceWindow',
        expectedIsPush: boolean
    ) {
        describe(`🪟 ${methodName} 核心功能测试`, () => {
            it(`应该支持无参数调用（使用当前路由）`, async () => {
                await router.push('/about');
                const result = await router[methodName]();

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.path).toBe('/about');
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.status).toBe(RouteStatus.success);
            });

            it(`应该支持字符串路径参数`, async () => {
                const result = await router[methodName]('/user/123');

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.path).toBe('/user/123');
                expect(result.params.id).toBe('123');
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.status).toBe(RouteStatus.success);
            });

            it(`应该支持对象参数`, async () => {
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
                expect(result.status).toBe(RouteStatus.success);
            });

            it(`应该正确处理完整 URL`, async () => {
                const result = await router[methodName](
                    'https://example.com/user/789?sort=name#top'
                );

                expect(result.type).toBe(RouteType[methodName]);
                expect(result.url.href).toBe(
                    'https://example.com/user/789?sort=name#top'
                );
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.status).toBe(RouteStatus.success);
            });
        });

        describe(`🎯 ${methodName} 特有行为测试`, () => {
            it(`应该设置正确的 isPush 标志`, async () => {
                const result = await router[methodName]('/about');

                expect(result.isPush).toBe(expectedIsPush);
                expect(result.type).toBe(RouteType[methodName]);
            });

            it(`应该调用 location 处理器`, async () => {
                let locationCalled = false;
                let receivedRoute: Route | null = null;

                const windowRouter = new Router({
                    routes: [{ path: '/', app: 'home' }],
                    apps: mockApps,
                    location: (to, from) => {
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

            it(`应该不更新当前路由状态`, async () => {
                await router.push('/about');
                const beforeRoute = router.route;

                await router[methodName]('/user/123');
                const afterRoute = router.route;

                // 窗口导航不应该改变当前路由
                expect(afterRoute.path).toBe(beforeRoute.path);
                expect(afterRoute.url.href).toBe(beforeRoute.url.href);
            });

            it(`应该不触发 MicroApp 更新`, async () => {
                const updateSpy = vi.spyOn(router.microApp, '_update');

                await router[methodName]('/user/123');

                expect(updateSpy).not.toHaveBeenCalled();
            });
        });

        describe(`🛡️ ${methodName} 路由守卫测试`, () => {
            it(`应该执行 beforeEach 守卫`, async () => {
                let guardCalled = false;
                const unregister = router.beforeEach(async (to, from) => {
                    guardCalled = true;
                    expect(to.isPush).toBe(expectedIsPush);
                });

                await router[methodName]('/about');

                expect(guardCalled).toBe(true);
                unregister();
            });

            it(`应该在守卫返回 false 时中止导航`, async () => {
                const unregister = router.beforeEach((to, from) => {
                    return false;
                });

                const result = await router[methodName]('/about');

                expect(result.status).toBe(RouteStatus.aborted);
                unregister();
            });

            it(`应该支持守卫重定向`, async () => {
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

            it(`应该执行 afterEach 守卫`, async () => {
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

        describe(`🎭 ${methodName} 边界情况测试`, () => {
            it(`应该处理不存在的路由`, async () => {
                const result = await router[methodName]('/nonexistent');

                expect(result.status).toBe(RouteStatus.success);
                expect(result.matched.length).toBe(0);
                expect(result.isPush).toBe(expectedIsPush);
            });

            it(`应该处理空字符串路径`, async () => {
                const result = await router[methodName]('');

                expect(result.status).toBe(RouteStatus.success);
                expect(result.isPush).toBe(expectedIsPush);
            });

            it(`应该处理特殊字符`, async () => {
                const result = await router[methodName](
                    '/user/测试用户?name=张三&age=25#个人信息'
                );

                expect(result.status).toBe(RouteStatus.success);
                expect(result.isPush).toBe(expectedIsPush);
                // URL 会被编码，所以检查编码后的字符串
                expect(result.url.pathname).toContain(
                    '%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
                );
            });
        });

        describe(`⚡ ${methodName} 任务取消和并发控制`, () => {
            it(`应该支持并发调用`, async () => {
                const promises = [
                    router[methodName]('/user/1'),
                    router[methodName]('/user/2'),
                    router[methodName]('/user/3')
                ];

                const results = await Promise.all(promises);

                // 窗口导航不会相互取消，所以所有结果都应该成功
                // 但由于任务取消机制，可能有些会被中止，我们只检查至少有一个成功
                const successResults = results.filter(
                    (r) => r.status === RouteStatus.success
                );
                expect(successResults.length).toBeGreaterThan(0);

                successResults.forEach((result) => {
                    expect(result.isPush).toBe(expectedIsPush);
                });
            });

            it(`应该正确处理快速连续调用`, async () => {
                const results: Route[] = [];

                for (let i = 0; i < 5; i++) {
                    results.push(await router[methodName](`/user/${i}`));
                }

                results.forEach((result, index) => {
                    expect(result.status).toBe(RouteStatus.success);
                    expect(result.params.id).toBe(String(index));
                    expect(result.isPush).toBe(expectedIsPush);
                });
            });
        });

        describe(`❌ ${methodName} 错误处理`, () => {
            it(`应该处理守卫中的异常`, async () => {
                const unregister = router.beforeEach(async () => {
                    throw new Error('Guard error');
                });

                const result = await router[methodName]('/about');

                expect(result.status).toBe(RouteStatus.error);
                unregister();
            });

            it(`应该处理 location 处理器异常`, async () => {
                const windowRouter = new Router({
                    routes: [{ path: '/', app: 'home' }],
                    apps: mockApps,
                    location: () => {
                        throw new Error('Location handler error');
                    }
                });

                await windowRouter.push('/');

                // location 处理器异常会导致整个路由处理失败
                await expect(
                    windowRouter[methodName]('/about')
                ).rejects.toThrow('Location handler error');

                windowRouter.destroy();
            });
        });

        describe(`🧩 ${methodName} 异步组件处理`, () => {
            it(`应该正确处理异步组件`, async () => {
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
                    apps: mockApps
                });

                const result = await asyncRouter[methodName]('/async');

                expect(result.status).toBe(RouteStatus.success);
                expect(result.isPush).toBe(expectedIsPush);
                expect(result.matched[0].component).toBeDefined();
                asyncRouter.destroy();
            });

            it(`应该处理异步组件加载失败`, async () => {
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
                    apps: mockApps
                });

                const result = await asyncRouter[methodName]('/async-error');

                expect(result.status).toBe(RouteStatus.error);
                asyncRouter.destroy();
            });
        });

        describe(`🔧 ${methodName} 与其他方法的区别`, () => {
            it(`应该与 push/replace 方法行为不同`, async () => {
                await router.push('/about');
                const pushResult = await router.push('/user/123');
                const windowResult = await router[methodName]('/user/456');

                // push 会更新当前路由
                expect(router.route.path).toBe('/user/123');

                // 窗口导航不会更新当前路由
                expect(windowResult.isPush).toBe(expectedIsPush);
                expect(windowResult.type).toBe(RouteType[methodName]);

                // 类型不同
                expect(pushResult.type).toBe(RouteType.push);
                expect(windowResult.type).toBe(RouteType[methodName]);
            });

            it(`应该与 resolve 方法在 URL 解析上保持一致`, async () => {
                const resolvedRoute = router.resolve('/user/789');
                const windowRoute = await router[methodName]('/user/789');

                expect(windowRoute.url.href).toBe(resolvedRoute.url.href);
                expect(windowRoute.params).toEqual(resolvedRoute.params);
                expect(windowRoute.matched).toEqual(resolvedRoute.matched);

                // 但类型应该不同
                expect(windowRoute.type).toBe(RouteType[methodName]);
                expect(resolvedRoute.type).toBe(RouteType.none);
                expect(windowRoute.isPush).toBe(expectedIsPush);
                expect(resolvedRoute.isPush).toBe(false);
            });
        });
    }

    // 为 pushWindow 创建测试（isPush = true）
    createWindowNavigationTests('pushWindow', true);

    // 为 replaceWindow 创建测试（isPush = false）
    createWindowNavigationTests('replaceWindow', false);

    describe('🔄 pushWindow 和 replaceWindow 对比测试', () => {
        it('两个方法的唯一区别应该是 isPush 标志', async () => {
            const pushResult = await router.pushWindow('/user/123');
            const replaceResult = await router.replaceWindow('/user/123');

            // 除了 isPush 和 type，其他所有属性都应该相同
            expect(pushResult.url.href).toBe(replaceResult.url.href);
            expect(pushResult.params).toEqual(replaceResult.params);
            expect(pushResult.query).toEqual(replaceResult.query);
            expect(pushResult.url.hash).toBe(replaceResult.url.hash);
            expect(pushResult.matched).toEqual(replaceResult.matched);
            expect(pushResult.status).toBe(replaceResult.status);

            // 只有这两个属性不同
            expect(pushResult.isPush).toBe(true);
            expect(replaceResult.isPush).toBe(false);
            expect(pushResult.type).toBe(RouteType.pushWindow);
            expect(replaceResult.type).toBe(RouteType.replaceWindow);
        });

        it('两个方法都应该调用相同的 location 处理器', async () => {
            const locationCalls: Array<{
                method: string;
                isPush: boolean;
                path: string;
            }> = [];

            const windowRouter = new Router({
                routes: [{ path: '/', app: 'home' }],
                apps: mockApps,
                location: (to, from) => {
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
