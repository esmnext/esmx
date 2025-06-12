import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from './router';
import { RouteType } from './types';
import type { RouterMicroAppOptions, RouterOptions } from './types';

describe('Router 窗口级导航测试', () => {
    let router: Router;
    let mockMicroApp: RouterMicroAppOptions;
    let mountSpy: ReturnType<typeof vi.fn>;
    let unmountSpy: ReturnType<typeof vi.fn>;
    let windowOpenSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // 模拟浏览器环境
        windowOpenSpy = vi.fn();
        Object.defineProperty(global, 'window', {
            value: {
                location: { href: 'http://localhost:3000/' },
                history: {
                    pushState: vi.fn(),
                    replaceState: vi.fn(),
                    go: vi.fn()
                },
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                open: windowOpenSpy
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

        mockMicroApp = {
            mount: mountSpy,
            unmount: unmountSpy,
            renderToString: vi.fn().mockResolvedValue('<div>test app</div>')
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

    describe('🪟 pushWindow 测试', () => {
        it('应该支持无参数推送当前路由到新窗口', async () => {
            await router.push('/about');
            windowOpenSpy.mockReturnValue({}); // 模拟成功打开窗口

            const result = await router.pushWindow();

            expect(result).toBeDefined();
            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.pushWindow);
        });

        it('应该支持带参数推送指定路由到新窗口', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue({}); // 模拟成功打开窗口

            const result = await router.pushWindow('/user/123');

            expect(result.url.pathname).toBe('/user/123');
            expect(result.params.id).toBe('123');
            expect(result.type).toBe(RouteType.pushWindow);
        });

        it('应该在弹窗被阻止时回退到当前窗口导航', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue(null); // 模拟弹窗被阻止

            const result = await router.pushWindow('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.pushWindow);

            // 验证回退到当前窗口导航
            expect(router.route.url.pathname).toBe('/about');
        });

        it('应该在window.open抛出异常时回退到当前窗口导航', async () => {
            await router.push('/');
            windowOpenSpy.mockImplementation(() => {
                throw new Error('Popup blocked');
            });

            const result = await router.pushWindow('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.pushWindow);

            // 验证回退到当前窗口导航
            expect(router.route.url.pathname).toBe('/about');
        });
    });

    describe('🪟 replaceWindow 测试', () => {
        it('应该支持无参数替换当前路由到新窗口', async () => {
            await router.push('/about');
            windowOpenSpy.mockReturnValue({}); // 模拟成功打开窗口

            const result = await router.replaceWindow();

            expect(result).toBeDefined();
            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.replaceWindow);
        });

        it('应该支持带参数替换到指定路由的新窗口', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue({}); // 模拟成功打开窗口

            const result = await router.replaceWindow('/user/789');

            expect(result.url.pathname).toBe('/user/789');
            expect(result.params.id).toBe('789');
            expect(result.type).toBe(RouteType.replaceWindow);
        });

        it('应该在弹窗被阻止时回退到当前窗口替换', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue(null); // 模拟弹窗被阻止

            const result = await router.replaceWindow('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.replaceWindow);

            // 验证回退到当前窗口替换
            expect(router.route.url.pathname).toBe('/about');
        });

        it('应该使用replace模式更新浏览器历史', async () => {
            const replaceSpy = vi.spyOn(window.history, 'replaceState');

            await router.push('/');
            windowOpenSpy.mockReturnValue(null); // 强制回退
            replaceSpy.mockClear();

            await router.replaceWindow('/about');

            expect(replaceSpy).toHaveBeenCalledTimes(1);
            expect(replaceSpy).toHaveBeenCalledWith(
                expect.any(Object),
                '',
                expect.stringContaining('/about')
            );
        });
    });

    describe('🔄 并发控制', () => {
        it('应该取消前一个窗口导航任务', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue(null); // 强制回退到当前窗口

            // 同时发起多个窗口导航
            const push1 = router.pushWindow('/about');
            const push2 = router.pushWindow('/user/123');

            const results = await Promise.allSettled([push1, push2]);

            // 第一个应该被取消，第二个应该成功
            expect(results[0].status).toBe('rejected');
            expect(results[1].status).toBe('fulfilled');

            if (results[1].status === 'fulfilled') {
                expect(results[1].value.url.pathname).toBe('/user/123');
            }
        });
    });

    describe('🌐 环境兼容性', () => {
        it('应该在无window.open的环境中回退到当前窗口导航', async () => {
            delete (window as any).open;

            await router.push('/');
            const result = await router.pushWindow('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.pushWindow);
            expect(router.route.url.pathname).toBe('/about');
        });

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
            const result = await serverRouter.pushWindow('/about');

            expect(result.url.pathname).toBe('/about');
            expect(result.type).toBe(RouteType.pushWindow);

            serverRouter.destroy();
        });
    });

    describe('❌ 错误处理', () => {
        it('应该处理无效路由的窗口导航', async () => {
            await router.push('/');
            windowOpenSpy.mockReturnValue({}); // 成功打开窗口

            const result = await router.pushWindow('/nonexistent');

            // 应该创建路由对象，即使没有匹配
            expect(result.url.pathname).toBe('/nonexistent');
            expect(result.matched).toEqual([]);
        });

        it('应该处理window.open的各种异常', async () => {
            await router.push('/');

            // 测试不同的异常情况
            const errors = [
                new Error('Popup blocked'),
                new TypeError('Invalid arguments')
            ];

            for (const error of errors) {
                windowOpenSpy.mockImplementation(() => {
                    throw error;
                });

                const result = await router.pushWindow('/about');

                expect(result.url.pathname).toBe('/about');
                expect(result.type).toBe(RouteType.pushWindow);

                windowOpenSpy.mockClear();
            }
        });
    });
});
