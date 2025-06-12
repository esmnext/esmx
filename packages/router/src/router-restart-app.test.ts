import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from './router';
import { RouteType } from './types';
import type { RouterMicroAppOptions, RouterOptions } from './types';

describe('Router.restartApp 测试', () => {
    let router: Router;
    let mockMicroApp: RouterMicroAppOptions;
    let mountSpy: ReturnType<typeof vi.fn>;
    let unmountSpy: ReturnType<typeof vi.fn>;
    let renderToStringSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // 模拟浏览器环境
        Object.defineProperty(global, 'window', {
            value: {
                location: { href: 'http://localhost:3000/' },
                history: {
                    pushState: vi.fn(),
                    replaceState: vi.fn(),
                    go: vi.fn()
                },
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            },
            writable: true
        });

        Object.defineProperty(global, 'document', {
            value: {
                getElementById: vi.fn().mockReturnValue(null),
                createElement: vi.fn().mockReturnValue({
                    id: '',
                    style: {},
                    parentNode: null,
                    remove: vi.fn()
                }),
                body: {
                    appendChild: vi.fn()
                }
            },
            writable: true
        });

        // 创建模拟微应用
        mountSpy = vi.fn();
        unmountSpy = vi.fn();
        renderToStringSpy = vi.fn().mockResolvedValue('<div>test app</div>');

        mockMicroApp = {
            mount: mountSpy,
            unmount: unmountSpy,
            renderToString: renderToStringSpy
        };

        const options: RouterOptions = {
            id: 'test-router',
            routes: [
                {
                    path: '/',
                    app: 'home'
                },
                {
                    path: '/about',
                    app: 'about'
                },
                {
                    path: '/user/:id',
                    app: 'user'
                }
            ],
            apps: {
                home: () => mockMicroApp,
                about: () => mockMicroApp,
                user: () => mockMicroApp
            }
        };

        router = new Router(options);
    });

    afterEach(() => {
        router.destroy();
        vi.clearAllMocks();
    });

    describe('🔄 基础重启功能', () => {
        it('应该支持无参数重启到当前路由', async () => {
            // 先导航到一个路由
            await router.push('/about');

            // 重置 spy
            mountSpy.mockClear();
            unmountSpy.mockClear();

            // 重启应用
            const result = await router.restartApp();

            expect(result).toBeDefined();
            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.restartApp);

            // 验证微应用重新挂载
            expect(unmountSpy).toHaveBeenCalledTimes(1);
            expect(mountSpy).toHaveBeenCalledTimes(1);
        });

        it('应该支持带参数重启到指定路由', async () => {
            // 先导航到一个路由
            await router.push('/');

            // 重置 spy
            mountSpy.mockClear();
            unmountSpy.mockClear();

            // 重启到指定路由
            const result = await router.restartApp('/user/123');

            expect(result).toBeDefined();
            expect(result.url.pathname).toBe('/user/123');
            expect(result.params.id).toBe('123');
            expect(result.type).toBe(RouteType.restartApp);

            // 验证微应用重新挂载
            expect(unmountSpy).toHaveBeenCalledTimes(1);
            expect(mountSpy).toHaveBeenCalledTimes(1);
        });

        it('应该支持对象形式的路由参数', async () => {
            await router.push('/');

            mountSpy.mockClear();
            unmountSpy.mockClear();

            const result = await router.restartApp({
                path: '/user/456',
                query: { tab: 'profile' }
            });

            expect(result.url.pathname).toBe('/user/456');
            expect(result.url.searchParams.get('tab')).toBe('profile');
            expect(result.params.id).toBe('456');
            expect(result.type).toBe(RouteType.restartApp);
        });
    });

    describe('🔄 微应用重启机制', () => {
        it('应该强制重新挂载微应用', async () => {
            await router.push('/');

            // 验证初始挂载
            expect(mountSpy).toHaveBeenCalledTimes(1);
            expect(unmountSpy).toHaveBeenCalledTimes(0);

            mountSpy.mockClear();
            unmountSpy.mockClear();

            // 重启应用
            await router.restartApp();

            // 验证重新挂载流程：先卸载，再挂载
            expect(unmountSpy).toHaveBeenCalledTimes(1);
            expect(mountSpy).toHaveBeenCalledTimes(1);

            // 验证调用顺序：卸载应该在挂载之前
            const unmountCall = unmountSpy.mock.invocationCallOrder[0];
            const mountCall = mountSpy.mock.invocationCallOrder[0];
            expect(unmountCall).toBeLessThan(mountCall);
        });

        it('应该在不同应用间重启时正确切换', async () => {
            await router.push('/');

            const homeMountSpy = vi.fn();
            const homeUnmountSpy = vi.fn();
            const aboutMountSpy = vi.fn();
            const aboutUnmountSpy = vi.fn();

            // 重新配置不同的微应用
            router.options.apps = {
                home: () => ({
                    mount: homeMountSpy,
                    unmount: homeUnmountSpy,
                    renderToString: vi.fn().mockResolvedValue('<div>home</div>')
                }),
                about: () => ({
                    mount: aboutMountSpy,
                    unmount: aboutUnmountSpy,
                    renderToString: vi
                        .fn()
                        .mockResolvedValue('<div>about</div>')
                })
            };

            // 重启到不同的应用
            await router.restartApp('/about');

            expect(homeUnmountSpy).toHaveBeenCalledTimes(1);
            expect(aboutMountSpy).toHaveBeenCalledTimes(1);
        });

        it('应该在重启时保持路由器实例不变', async () => {
            const originalRouter = router;
            await router.push('/');

            await router.restartApp('/about');

            expect(router).toBe(originalRouter);
            expect(router.id).toBe('test-router');
        });
    });

    describe('🔄 路由状态管理', () => {
        it('应该正确更新路由状态', async () => {
            await router.push('/');
            const beforeRoute = router.route;

            const result = await router.restartApp('/user/789');

            expect(result).not.toBe(beforeRoute);
            expect(router.route).toBe(result);
            expect(router.route.url.pathname).toBe('/user/789');
            expect(router.route.params.id).toBe('789');
        });

        it('应该使用replace模式更新浏览器历史', async () => {
            const replaceSpy = vi.spyOn(window.history, 'replaceState');

            await router.push('/');
            replaceSpy.mockClear();

            await router.restartApp('/about');

            expect(replaceSpy).toHaveBeenCalledTimes(1);
            expect(replaceSpy).toHaveBeenCalledWith(
                expect.any(Object),
                '',
                expect.stringContaining('/about')
            );
        });

        it('应该保持查询参数和哈希', async () => {
            await router.push('/?initial=true#section1');

            const result = await router.restartApp(
                '/user/123?tab=settings#profile'
            );

            expect(result.url.searchParams.get('tab')).toBe('settings');
            expect(result.url.hash).toBe('#profile');
        });
    });

    describe('🛡️ 路由守卫执行', () => {
        it('应该执行完整的路由守卫流程', async () => {
            const beforeEachSpy = vi.fn();
            const afterEachSpy = vi.fn();
            const beforeLeaveSpy = vi.fn();
            const beforeEnterSpy = vi.fn();

            router.beforeEach(beforeEachSpy);
            router.afterEach(afterEachSpy);

            // 添加路由级守卫
            router.options.routes = [
                {
                    path: '/',
                    app: 'home',
                    beforeLeave: beforeLeaveSpy
                },
                {
                    path: '/about',
                    app: 'about',
                    beforeEnter: beforeEnterSpy
                }
            ];

            await router.push('/');

            // 清除初始导航的调用
            beforeEachSpy.mockClear();
            afterEachSpy.mockClear();

            await router.restartApp('/about');

            expect(beforeLeaveSpy).toHaveBeenCalledTimes(1);
            expect(beforeEachSpy).toHaveBeenCalledTimes(1);
            expect(beforeEnterSpy).toHaveBeenCalledTimes(1);
            expect(afterEachSpy).toHaveBeenCalledTimes(1);
        });

        it('应该支持守卫中断重启', async () => {
            const beforeEachSpy = vi.fn().mockReturnValue(false);
            router.beforeEach(beforeEachSpy);

            await router.push('/');

            // 重启应该被守卫中断
            const result = await router.restartApp('/about');

            // 应该返回原路由，不进行重启
            expect(result.url.pathname).toBe('/');
            expect(beforeEachSpy).toHaveBeenCalledTimes(1);
        });

        it('应该支持守卫重定向', async () => {
            const beforeEachSpy = vi.fn().mockReturnValue('/user/redirect');
            router.beforeEach(beforeEachSpy);

            await router.push('/');

            const result = await router.restartApp('/about');

            expect(result.url.pathname).toBe('/user/redirect');
            expect(result.params.id).toBe('redirect');
        });
    });

    describe('⚡ 异步组件处理', () => {
        it('应该等待异步组件加载完成', async () => {
            const asyncAppFactory = vi.fn().mockResolvedValue(mockMicroApp);

            router.options.routes = [
                {
                    path: '/async',
                    app: asyncAppFactory
                }
            ];

            await router.push('/');

            const result = await router.restartApp('/async');

            expect(result.url.pathname).toBe('/async');
            expect(asyncAppFactory).toHaveBeenCalledWith(router);
            expect(mountSpy).toHaveBeenCalledTimes(1);
        });

        it('应该处理异步组件加载失败', async () => {
            const asyncAppFactory = vi
                .fn()
                .mockRejectedValue(new Error('Load failed'));

            router.options.routes = [
                {
                    path: '/async-fail',
                    app: asyncAppFactory
                }
            ];

            await router.push('/');

            await expect(router.restartApp('/async-fail')).rejects.toThrow(
                'Load failed'
            );
        });
    });

    describe('🔄 并发控制', () => {
        it('应该取消前一个重启任务', async () => {
            await router.push('/');

            // 同时发起多个重启
            const restart1 = router.restartApp('/about');
            const restart2 = router.restartApp('/user/123');

            const results = await Promise.allSettled([restart1, restart2]);

            // 第一个应该被取消，第二个应该成功
            expect(results[0].status).toBe('rejected');
            expect(results[1].status).toBe('fulfilled');

            if (results[1].status === 'fulfilled') {
                expect(results[1].value.url.pathname).toBe('/user/123');
            }
        });

        it('应该正确处理快速连续重启', async () => {
            await router.push('/');

            // 快速连续重启
            const restarts = [
                router.restartApp('/about'),
                router.restartApp('/user/1'),
                router.restartApp('/user/2'),
                router.restartApp('/user/3')
            ];

            const results = await Promise.allSettled(restarts);

            // 只有最后一个应该成功
            expect(
                results.slice(0, -1).every((r) => r.status === 'rejected')
            ).toBe(true);
            expect(results[results.length - 1].status).toBe('fulfilled');
        });
    });

    describe('🌐 环境兼容性', () => {
        it('应该在服务端环境正确工作', async () => {
            // 模拟服务端环境
            delete (global as any).window;
            delete (global as any).document;

            const serverRouter = new Router({
                id: 'server-router',
                routes: [
                    { path: '/', app: 'home' },
                    { path: '/about', app: 'about' }
                ],
                apps: {
                    home: () => mockMicroApp,
                    about: () => mockMicroApp
                }
            });

            await serverRouter.push('/');
            const result = await serverRouter.restartApp('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.restartApp);

            serverRouter.destroy();
        });

        it('应该在无微应用配置时正常工作', async () => {
            const noAppRouter = new Router({
                id: 'no-app-router',
                routes: [
                    { path: '/', app: 'none' },
                    { path: '/about', app: 'none' }
                ]
                // 没有 apps 配置
            });

            await noAppRouter.push('/');
            const result = await noAppRouter.restartApp('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.restartApp);

            noAppRouter.destroy();
        });
    });

    describe('❌ 错误处理', () => {
        it('应该处理无效路由重启', async () => {
            await router.push('/');

            const result = await router.restartApp('/nonexistent');

            // 应该创建路由对象，即使没有匹配
            expect(result.url.pathname).toBe('/nonexistent');
            expect(result.matched).toEqual([]);
        });

        it('应该处理微应用挂载错误', async () => {
            const errorApp = {
                mount: vi.fn().mockImplementation(() => {
                    throw new Error('Mount failed');
                }),
                unmount: vi.fn(),
                renderToString: vi.fn().mockResolvedValue('<div>error</div>')
            };

            router.options.apps = {
                error: () => errorApp
            };

            router.options.routes = [{ path: '/error', app: 'error' }];

            await router.push('/');

            // 重启时微应用挂载失败不应该影响路由状态
            const result = await router.restartApp('/error');

            expect(result.url.pathname).toBe('/error');
            expect(errorApp.mount).toHaveBeenCalledTimes(1);
        });

        it('应该处理重启过程中的异常', async () => {
            const beforeEachSpy = vi.fn().mockImplementation(() => {
                throw new Error('Guard error');
            });

            router.beforeEach(beforeEachSpy);
            await router.push('/');

            await expect(router.restartApp('/about')).rejects.toThrow(
                'Guard error'
            );
        });
    });

    describe('🔧 方法重载支持', () => {
        it('应该支持无参数重载', async () => {
            await router.push('/user/original');

            const result = await router.restartApp();

            expect(result.url.pathname).toBe('/user/original');
            expect(result.params.id).toBe('original');
            expect(result.type).toBe(RouteType.restartApp);
        });

        it('应该支持字符串参数重载', async () => {
            await router.push('/');

            const result = await router.restartApp('/user/string');

            expect(result.url.pathname).toBe('/user/string');
            expect(result.params.id).toBe('string');
        });

        it('应该支持对象参数重载', async () => {
            await router.push('/');

            const result = await router.restartApp({
                path: '/user/object',
                query: { type: 'test' }
            });

            expect(result.url.pathname).toBe('/user/object');
            expect(result.params.id).toBe('object');
            expect(result.url.searchParams.get('type')).toBe('test');
        });
    });

    describe('📊 性能测试', () => {
        it('应该在合理时间内完成重启', async () => {
            await router.push('/');

            const startTime = Date.now();
            await router.restartApp('/about');
            const endTime = Date.now();

            // 重启应该在100ms内完成
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('应该正确清理资源', async () => {
            await router.push('/');

            const initialMountCalls = mountSpy.mock.calls.length;
            const initialUnmountCalls = unmountSpy.mock.calls.length;

            await router.restartApp('/about');

            // 验证资源清理
            expect(unmountSpy.mock.calls.length).toBe(initialUnmountCalls + 1);
            expect(mountSpy.mock.calls.length).toBe(initialMountCalls + 1);
        });
    });
});
