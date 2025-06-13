import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Route } from './route';
import { Router } from './router';
import { RouterMode } from './types';
import { removeFromArray } from './util';

describe('Router Guards Cleanup Tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/',
                    component: () => 'Home'
                },
                {
                    path: '/test1',
                    component: () => 'Test1'
                },
                {
                    path: '/test2',
                    component: () => 'Test2'
                },
                {
                    path: '/test3',
                    component: () => 'Test3'
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('🔥 守卫清理效果验证', () => {
        describe('beforeEach 清理效果', () => {
            test('清理后守卫应该不再执行', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                // 第一次导航，守卫应该执行
                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                // 清理守卫
                unregister();

                // 第二次导航，守卫应该不再执行
                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1); // 仍然是1次，没有增加
            });

            test('清理后多次导航守卫都不应该执行', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                // 多次导航，守卫都不应该执行
                await router.push('/test2');
                await router.push('/test3');
                await router.push('/');
                expect(spy).toHaveBeenCalledTimes(1);
            });

            test('清理异步守卫后应该不再执行', async () => {
                const spy = vi.fn();
                const asyncGuard = async (to: Route, from: Route | null) => {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    spy(to, from);
                };

                const unregister = router.beforeEach(asyncGuard);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe('afterEach 清理效果', () => {
            test('清理后守卫应该不再执行', async () => {
                const spy = vi.fn();
                const unregister = router.afterEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1);
            });

            test('清理后多次导航守卫都不应该执行', async () => {
                const spy = vi.fn();
                const unregister = router.afterEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                await router.push('/test2');
                await router.push('/test3');
                await router.push('/');
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('⚡ 多守卫独立清理', () => {
        describe('beforeEach 多守卫清理', () => {
            test('清理单个守卫不应该影响其他守卫', async () => {
                const spy1 = vi.fn();
                const spy2 = vi.fn();
                const spy3 = vi.fn();

                const unregister1 = router.beforeEach(spy1);
                const unregister2 = router.beforeEach(spy2);
                const unregister3 = router.beforeEach(spy3);

                // 第一次导航，所有守卫都应该执行
                await router.push('/test1');
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);

                // 只清理第二个守卫
                unregister2();

                // 第二次导航，只有第二个守卫不执行
                await router.push('/test2');
                expect(spy1).toHaveBeenCalledTimes(2);
                expect(spy2).toHaveBeenCalledTimes(1); // 不再增加
                expect(spy3).toHaveBeenCalledTimes(2);

                // 清理剩余守卫
                unregister1();
                unregister3();
            });

            test('清理多个守卫应该正确', async () => {
                const spy1 = vi.fn();
                const spy2 = vi.fn();
                const spy3 = vi.fn();
                const spy4 = vi.fn();

                const unregister1 = router.beforeEach(spy1);
                const unregister2 = router.beforeEach(spy2);
                const unregister3 = router.beforeEach(spy3);
                const unregister4 = router.beforeEach(spy4);

                await router.push('/test1');
                expect([spy1, spy2, spy3, spy4]).toEqual([
                    expect.objectContaining({
                        mock: expect.objectContaining({
                            calls: expect.arrayContaining([expect.any(Array)])
                        })
                    }),
                    expect.objectContaining({
                        mock: expect.objectContaining({
                            calls: expect.arrayContaining([expect.any(Array)])
                        })
                    }),
                    expect.objectContaining({
                        mock: expect.objectContaining({
                            calls: expect.arrayContaining([expect.any(Array)])
                        })
                    }),
                    expect.objectContaining({
                        mock: expect.objectContaining({
                            calls: expect.arrayContaining([expect.any(Array)])
                        })
                    })
                ]);

                // 清理第1和第3个守卫
                unregister1();
                unregister3();

                // 重置计数器
                spy1.mockClear();
                spy2.mockClear();
                spy3.mockClear();
                spy4.mockClear();

                await router.push('/test2');
                expect(spy1).not.toHaveBeenCalled();
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).not.toHaveBeenCalled();
                expect(spy4).toHaveBeenCalledTimes(1);

                // 清理剩余守卫
                unregister2();
                unregister4();
            });

            test('守卫执行顺序在清理后应该保持正确', async () => {
                const executionOrder: string[] = [];

                const guard1 = () => {
                    executionOrder.push('guard1');
                };
                const guard2 = () => {
                    executionOrder.push('guard2');
                };
                const guard3 = () => {
                    executionOrder.push('guard3');
                };

                router.beforeEach(guard1);
                const unregister2 = router.beforeEach(guard2);
                router.beforeEach(guard3);

                await router.push('/test1');
                expect(executionOrder).toEqual(['guard1', 'guard2', 'guard3']);

                executionOrder.length = 0;
                unregister2(); // 清理中间守卫

                await router.push('/test2');
                expect(executionOrder).toEqual(['guard1', 'guard3']);
            });
        });

        describe('afterEach 多守卫清理', () => {
            test('清理单个 afterEach 守卫不应该影响其他守卫', async () => {
                const spy1 = vi.fn();
                const spy2 = vi.fn();
                const spy3 = vi.fn();

                const unregister1 = router.afterEach(spy1);
                const unregister2 = router.afterEach(spy2);
                const unregister3 = router.afterEach(spy3);

                await router.push('/test1');
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);

                unregister2();

                await router.push('/test2');
                expect(spy1).toHaveBeenCalledTimes(2);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(2);

                unregister1();
                unregister3();
            });

            test('afterEach 守卫执行顺序在清理后应该保持正确', async () => {
                const executionOrder: string[] = [];

                const guard1 = () => {
                    executionOrder.push('after1');
                };
                const guard2 = () => {
                    executionOrder.push('after2');
                };
                const guard3 = () => {
                    executionOrder.push('after3');
                };

                router.afterEach(guard1);
                const unregister2 = router.afterEach(guard2);
                router.afterEach(guard3);

                await router.push('/test1');
                expect(executionOrder).toEqual(['after1', 'after2', 'after3']);

                executionOrder.length = 0;
                unregister2();

                await router.push('/test2');
                expect(executionOrder).toEqual(['after1', 'after3']);
            });
        });

        describe('混合守卫清理', () => {
            test('beforeEach 和 afterEach 守卫应该独立清理', async () => {
                const beforeSpy = vi.fn();
                const afterSpy = vi.fn();

                const unregisterBefore = router.beforeEach(beforeSpy);
                const unregisterAfter = router.afterEach(afterSpy);

                await router.push('/test1');
                expect(beforeSpy).toHaveBeenCalledTimes(1);
                expect(afterSpy).toHaveBeenCalledTimes(1);

                // 只清理 beforeEach
                unregisterBefore();

                await router.push('/test2');
                expect(beforeSpy).toHaveBeenCalledTimes(1); // 不再增加
                expect(afterSpy).toHaveBeenCalledTimes(2); // 继续增加

                // 清理 afterEach
                unregisterAfter();

                await router.push('/test3');
                expect(beforeSpy).toHaveBeenCalledTimes(1);
                expect(afterSpy).toHaveBeenCalledTimes(2); // 不再增加
            });
        });
    });

    describe('🛡️ 边界情况测试', () => {
        describe('重复清理安全性', () => {
            test('重复调用清理函数应该安全', () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                // 多次调用清理函数不应该抛出异常
                expect(() => {
                    unregister();
                    unregister();
                    unregister();
                }).not.toThrow();
            });

            test('重复清理后守卫仍然不执行', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                // 多次清理
                unregister();
                unregister();
                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe('清理后重新注册', () => {
            test('清理后可以重新注册同一个守卫', async () => {
                const spy = vi.fn();

                const unregister1 = router.beforeEach(spy);
                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister1();

                // 重新注册同一个守卫
                const unregister2 = router.beforeEach(spy);
                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(2);

                unregister2();
            });

            test('清理后重新注册应该正常工作', async () => {
                const spy = vi.fn();

                // 第一次注册和导航
                let unregister = router.beforeEach(spy);
                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                // 清理
                unregister();

                // 重新注册并导航
                unregister = router.beforeEach(spy);
                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(2);

                // 再次清理和重新注册
                unregister();
                unregister = router.beforeEach(spy);
                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(3);

                // 最后清理
                unregister();
            });
        });

        describe('同一守卫多次注册', () => {
            test('同一个守卫函数多次注册应该正确处理', async () => {
                const spy = vi.fn();

                const unregister1 = router.beforeEach(spy);
                const unregister2 = router.beforeEach(spy); // 同一个函数

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(2); // 应该执行两次

                // 清理第一个注册
                unregister1();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(3); // 应该只执行一次

                unregister2();

                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(3); // 不再执行
            });

            test('同一守卫多次注册和清理的复杂场景', async () => {
                const spy = vi.fn();

                // 注册同一个守卫3次
                const unregister1 = router.beforeEach(spy);
                const unregister2 = router.beforeEach(spy);
                const unregister3 = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(3);

                // 清理中间的注册
                unregister2();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(5); // 3 + 2

                // 清理剩余的
                unregister1();
                unregister3();

                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(5); // 不再增加
            });
        });

        describe('空数组和不存在元素处理', () => {
            test('从空数组中移除元素应该安全', () => {
                const emptyArray: unknown[] = [];
                const element = vi.fn();

                expect(() => {
                    removeFromArray(emptyArray, element);
                }).not.toThrow();

                expect(emptyArray).toEqual([]);
            });

            test('移除不存在的元素应该安全', () => {
                const array = [vi.fn(), vi.fn(), vi.fn()];
                const nonExistentElement = vi.fn();
                const originalLength = array.length;

                expect(() => {
                    removeFromArray(array, nonExistentElement);
                }).not.toThrow();

                expect(array).toHaveLength(originalLength);
            });
        });

        describe('特殊值处理', () => {
            test('removeFromArray 应该正确处理 NaN 值', () => {
                const arr = [1, Number.NaN, 3, Number.NaN, 5];
                removeFromArray(arr, Number.NaN);
                expect(arr).toEqual([1, 3, Number.NaN, 5]); // 只移除第一个 NaN
            });

            test('removeFromArray 应该正确处理函数引用', () => {
                const func1 = () => 'func1';
                const func2 = () => 'func2';
                const func3 = () => 'func3';
                const arr = [func1, func2, func3];

                removeFromArray(arr, func2);
                expect(arr).toEqual([func1, func3]);
            });

            test('removeFromArray 应该正确处理对象引用', () => {
                const obj1 = { id: 1 };
                const obj2 = { id: 2 };
                const obj3 = { id: 3 };
                const arr = [obj1, obj2, obj3];

                removeFromArray(arr, obj2);
                expect(arr).toEqual([obj1, obj3]);
            });
        });

        describe('内存泄漏防护', () => {
            test('大量守卫注册和清理不应该造成内存泄漏', () => {
                const unregisters: Array<() => void> = [];

                // 注册大量守卫
                for (let i = 0; i < 100; i++) {
                    const guard = vi.fn();
                    const unregister = router.beforeEach(guard);
                    unregisters.push(unregister);
                }

                // 验证守卫数组长度
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((router as any)._guards.beforeEach).toHaveLength(100);

                // 清理所有守卫
                unregisters.forEach((unregister) => unregister());

                // 验证内部数组被清空
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((router as any)._guards.beforeEach).toHaveLength(0);
            });

            test('混合注册和清理不应该造成内存泄漏', () => {
                const guards: Array<() => void> = [];
                const unregisters: Array<() => void> = [];

                // 混合注册和清理
                for (let i = 0; i < 50; i++) {
                    const guard = vi.fn();
                    guards.push(guard);
                    const unregister = router.beforeEach(guard);
                    unregisters.push(unregister);

                    // 每隔几个就清理一个
                    if (i % 5 === 0 && i > 0) {
                        unregisters[i - 5]();
                    }
                }

                // 清理剩余的守卫
                unregisters.forEach((unregister) => unregister());

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((router as any)._guards.beforeEach).toHaveLength(0);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect((router as any)._guards.afterEach).toHaveLength(0);
            });
        });

        describe('并发清理安全性', () => {
            test('导航过程中清理守卫应该安全', async () => {
                let unregister: (() => void) | null = null;
                let guardExecuted = false;

                const guard = async () => {
                    guardExecuted = true;
                    // 在守卫执行过程中清理自己
                    unregister?.();
                    await new Promise((resolve) => setTimeout(resolve, 10));
                };

                unregister = router.beforeEach(guard);

                // 不应该抛出异常
                await expect(router.push('/test1')).resolves.toBeDefined();
                expect(guardExecuted).toBe(true);

                // 后续导航守卫不应该再执行
                guardExecuted = false;
                await router.push('/test2');
                expect(guardExecuted).toBe(false);
            });

            test('多个守卫同时清理应该安全', async () => {
                const guards = Array.from({ length: 10 }, () => vi.fn());
                const unregisters = guards.map((guard) =>
                    router.beforeEach(guard)
                );

                await router.push('/test1');
                guards.forEach((guard) =>
                    expect(guard).toHaveBeenCalledTimes(1)
                );

                // 同时清理所有守卫
                unregisters.forEach((unregister) => unregister());

                await router.push('/test2');
                guards.forEach((guard) =>
                    expect(guard).toHaveBeenCalledTimes(1)
                );
            });
        });
    });

    describe('🔧 Router destroy 清理验证', () => {
        test('Router destroy 应该清理所有守卫', async () => {
            const beforeSpy = vi.fn();
            const afterSpy = vi.fn();

            router.beforeEach(beforeSpy);
            router.afterEach(afterSpy);

            await router.push('/test1');
            expect(beforeSpy).toHaveBeenCalledTimes(1);
            expect(afterSpy).toHaveBeenCalledTimes(1);

            // 销毁 router
            router.destroy();

            // 创建新的 router 来测试
            const newRouter = new Router({
                mode: RouterMode.abstract,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: () => 'Home' },
                    { path: '/test', component: () => 'Test' }
                ]
            });

            await newRouter.replace('/');
            await newRouter.push('/test');

            // 原来的守卫不应该被执行
            expect(beforeSpy).toHaveBeenCalledTimes(1);
            expect(afterSpy).toHaveBeenCalledTimes(1);

            newRouter.destroy();
        });
    });
});
