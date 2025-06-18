import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';
import type { Route } from './types';

describe('Router.push 测试', () => {
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

    describe('🎯 Push 核心行为', () => {
        test('应该返回 Promise<Route> 且标识为 push 类型', async () => {
            const promise = router.push('/about');
            expect(promise).toBeInstanceOf(Promise);

            const route = await promise;
            expect(route.type).toBe(RouteType.push);
            expect(route.isPush).toBe(true);
            expect(route.status).toBe(RouteStatus.success);
        });

        test('应该支持字符串和对象两种参数格式', async () => {
            // 字符串参数
            const route1 = await router.push('/about');
            expect(route1.path).toBe('/about');

            // 对象参数
            const route2 = await router.push({
                path: '/user/123',
                query: { tab: 'profile' }
            });
            expect(route2.path).toBe('/user/123');
            expect(route2.query.tab).toBe('profile');
        });

        test('应该正确更新路由器当前路由状态', async () => {
            expect(router.route.path).toBe('/');

            const newRoute = await router.push('/about');

            expect(router.route).toBe(newRoute);
            expect(router.route.path).toBe('/about');
            expect(router.route.type).toBe(RouteType.push);
        });
    });

    describe('🔄 URL 智能判断逻辑', () => {
        test('URL 变化时应该使用 push 操作', async () => {
            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.push('/about'); // 不同URL

            expect(pushSpy).toHaveBeenCalled();
            expect(replaceSpy).not.toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });

        test('URL 相同时应该使用 replace 操作', async () => {
            await router.push('/about');

            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            await router.push('/about'); // 相同URL

            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });

        test('查询参数变化应该被视为URL变化', async () => {
            await router.push('/about');

            const pushSpy = vi.spyOn(router.navigation, 'push');

            await router.push('/about?newParam=value'); // URL变化（查询参数）

            expect(pushSpy).toHaveBeenCalled();
            pushSpy.mockRestore();
        });

        test('hash 变化应该被视为URL变化', async () => {
            await router.push('/about');

            const pushSpy = vi.spyOn(router.navigation, 'push');

            await router.push('/about#section'); // URL变化（hash）

            expect(pushSpy).toHaveBeenCalled();
            pushSpy.mockRestore();
        });

        test('无论内部使用push还是replace，返回的Route类型都应该是push', async () => {
            // 第一次push到新URL - 内部使用push，返回push类型
            const route1 = await router.push('/about');
            expect(route1.type).toBe(RouteType.push);
            expect(route1.isPush).toBe(true);

            // 第二次push到相同URL - 内部使用replace，但返回类型仍然是push
            const route2 = await router.push('/about');
            expect(route2.type).toBe(RouteType.push);
            expect(route2.isPush).toBe(true);

            // 验证内部确实使用了不同的操作
            const pushSpy = vi.spyOn(router.navigation, 'push');
            const replaceSpy = vi.spyOn(router.navigation, 'replace');

            // URL变化 - 应该使用push，返回push类型
            const route3 = await router.push('/user/123');
            expect(route3.type).toBe(RouteType.push);
            expect(route3.isPush).toBe(true);
            expect(pushSpy).toHaveBeenCalled();
            expect(replaceSpy).not.toHaveBeenCalled();

            pushSpy.mockClear();
            replaceSpy.mockClear();

            // URL相同 - 应该使用replace，但返回push类型
            const route4 = await router.push('/user/123');
            expect(route4.type).toBe(RouteType.push);
            expect(route4.isPush).toBe(true);
            expect(pushSpy).not.toHaveBeenCalled();
            expect(replaceSpy).toHaveBeenCalled();

            pushSpy.mockRestore();
            replaceSpy.mockRestore();
        });
    });

    describe('🏃 并发控制与任务取消', () => {
        test('快速连续 push 应该取消前一个任务', async () => {
            const results = await Promise.all([
                router.push('/user/1'),
                router.push('/user/2'),
                router.push('/user/3')
            ]);

            // 只有最后一个导航应该成功，前面的应该被取消
            expect(results[0].status).toBe(RouteStatus.aborted);
            expect(results[1].status).toBe(RouteStatus.aborted);
            expect(results[2].status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/user/3');
        });

        test('任务取消时应该保持前一个路由状态', async () => {
            await router.push('/about');
            expect(router.route.path).toBe('/about');

            // 启动一个会被取消的导航
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

        test('被取消的任务不应该影响微应用状态', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await Promise.all([
                router.push('/user/1'), // 会被取消
                router.push('/user/2') // 成功
            ]);

            // _update 应该只被最后成功的任务调用
            expect(updateSpy).toHaveBeenLastCalledWith(router);
            updateSpy.mockRestore();
        });
    });

    describe('🎭 微应用集成', () => {
        test('push 应该触发微应用更新', async () => {
            const updateSpy = vi.spyOn(router.microApp, '_update');

            await router.push('/about');

            expect(updateSpy).toHaveBeenCalledWith(router);
            updateSpy.mockRestore();
        });

        test('微应用更新应该在路由状态更新之后', async () => {
            const callOrder: string[] = [];

            const updateSpy = vi
                .spyOn(router.microApp, '_update')
                .mockImplementation(() => {
                    callOrder.push('microApp._update');
                    // 此时路由应该已经更新
                    expect(router.route.path).toBe('/about');
                });

            await router.push('/about');

            expect(updateSpy).toHaveBeenCalled();
            expect(callOrder).toContain('microApp._update');
            updateSpy.mockRestore();
        });
    });

    describe('⚡ 异步组件与 Push', () => {
        test('push 应该等待异步组件加载完成', async () => {
            const startTime = Date.now();
            const route = await router.push('/async');
            const endTime = Date.now();

            expect(route.status).toBe(RouteStatus.success);
            expect(endTime - startTime).toBeGreaterThanOrEqual(10);

            const matchedRoute = route.matched[0];
            expect(matchedRoute.component).toBe('AsyncComponent');
        });

        test('异步组件加载失败时 push 应该返回错误状态', async () => {
            // 添加异步组件失败路由到配置中
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

    describe('🛡️ Push 特有守卫行为', () => {
        test('守卫阻止时 push 应该返回 aborted 状态', async () => {
            const route = await router.push('/user/blocked');

            expect(route.status).toBe(RouteStatus.aborted);
            expect(router.route.path).toBe('/'); // 应该保持原路由
        });

        test('守卫重定向时 push 应该导航到重定向路由', async () => {
            const route = await router.push('/user/redirect');

            expect(route.path).toBe('/about');
            expect(route.status).toBe(RouteStatus.success);
            expect(router.route.path).toBe('/about');
        });

        test('afterEach 只在 push 成功时执行', async () => {
            const afterEachSpy = vi.fn();
            const unregister = router.afterEach(afterEachSpy);

            // 成功的 push
            await router.push('/about');
            expect(afterEachSpy).toHaveBeenCalledTimes(1);

            // 被阻止的 push
            await router.push('/user/blocked');
            expect(afterEachSpy).toHaveBeenCalledTimes(1); // 不应该增加

            unregister();
        });
    });

    describe('💾 历史记录管理', () => {
        test('push 应该能够被 back/forward 导航', async () => {
            await router.push('/about');
            await router.push('/user/123');

            // 后退
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');

            // 前进
            const forwardRoute = await router.forward();
            expect(forwardRoute?.path).toBe('/user/123');
        });

        test('相同URL的重复 push 不应该创建新的历史记录', async () => {
            await router.push('/about');
            await router.push('/about'); // 相同URL，应该使用replace

            // 后退应该直接回到初始路由，而不是中间状态
            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/');
        });
    });

    describe('❌ 错误处理', () => {
        test('路由不存在时应该触发 location 处理', async () => {
            const route = await router.push('/non-existent');

            expect(route.path).toBe('/non-existent');
            expect(route.matched).toHaveLength(0);
            expect(executionLog).toContain('location-handler-/non-existent');
        });

        test('push 过程中的异常应该正确传播', async () => {
            const errorGuard = vi
                .fn()
                .mockRejectedValue(new Error('Guard error'));
            const unregister = router.beforeEach(errorGuard);

            const route = await router.push('/about');
            expect(route.status).toBe(RouteStatus.error);

            unregister();
        });
    });

    describe('🔍 边界情况', () => {
        test('push 到当前路由应该正常处理', async () => {
            await router.push('/about');
            const currentPath = router.route.path;

            const route = await router.push(currentPath);
            expect(route.status).toBe(RouteStatus.success);
            expect(route.path).toBe(currentPath);
        });

        test('空参数应该被正确处理', async () => {
            const route = await router.push('');
            expect(route).toBeDefined();
            expect(typeof route.path).toBe('string');
        });

        test('特殊字符路径应该被正确处理', async () => {
            const specialPath = '/user/测试用户';
            const route = await router.push(specialPath);

            expect(route.path).toBe(
                '/user/%E6%B5%8B%E8%AF%95%E7%94%A8%E6%88%B7'
            );
            expect(route.status).toBe(RouteStatus.success);
        });
    });
});
