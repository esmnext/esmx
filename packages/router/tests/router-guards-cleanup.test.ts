import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Route } from '../src/route';
import { Router } from '../src/router';
import { RouterMode } from '../src/types';
import { removeFromArray } from '../src/util';

describe('Router Guards Cleanup Tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.memory,
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

    describe('🔥 Guard Cleanup Effect Verification', () => {
        describe('beforeEach cleanup effects', () => {
            test('guard should not execute after cleanup', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                // Cleanup guard
                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1); // Still 1 time, no increase
            });

            test('guard should not execute after cleanup for multiple navigations', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                await router.push('/test2');
                await router.push('/test3');
                await router.push('/');
                expect(spy).toHaveBeenCalledTimes(1);
            });

            test('async guard should not execute after cleanup', async () => {
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

        describe('afterEach cleanup effects', () => {
            test('guard should not execute after cleanup', async () => {
                const spy = vi.fn();
                const unregister = router.afterEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1);
            });

            test('guard should not execute after cleanup for multiple navigations', async () => {
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

    describe('⚡ Multiple Guards Independent Cleanup', () => {
        describe('beforeEach multiple guards cleanup', () => {
            test('cleaning single guard should not affect other guards', async () => {
                const spy1 = vi.fn();
                const spy2 = vi.fn();
                const spy3 = vi.fn();

                const unregister1 = router.beforeEach(spy1);
                const unregister2 = router.beforeEach(spy2);
                const unregister3 = router.beforeEach(spy3);

                await router.push('/test1');
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);

                unregister2();

                await router.push('/test2');
                expect(spy1).toHaveBeenCalledTimes(2);
                expect(spy2).toHaveBeenCalledTimes(1); // No increase
                expect(spy3).toHaveBeenCalledTimes(2);

                // Cleanup remaining guards
                unregister1();
                unregister3();
            });

            test('cleaning multiple guards should work correctly', async () => {
                const spy1 = vi.fn();
                const spy2 = vi.fn();
                const spy3 = vi.fn();
                const spy4 = vi.fn();

                const unregister1 = router.beforeEach(spy1);
                const unregister2 = router.beforeEach(spy2);
                const unregister3 = router.beforeEach(spy3);
                const unregister4 = router.beforeEach(spy4);

                await router.push('/test1');
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);
                expect(spy4).toHaveBeenCalledTimes(1);

                // Cleanup 1st and 3rd guards
                unregister1();
                unregister3();

                spy1.mockClear();
                spy2.mockClear();
                spy3.mockClear();
                spy4.mockClear();

                await router.push('/test2');
                expect(spy1).not.toHaveBeenCalled();
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).not.toHaveBeenCalled();
                expect(spy4).toHaveBeenCalledTimes(1);

                // Cleanup remaining guards
                unregister2();
                unregister4();
            });

            test('guard execution order should remain correct after cleanup', async () => {
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
                unregister2(); // Cleanup middle guard

                await router.push('/test2');
                expect(executionOrder).toEqual(['guard1', 'guard3']);
            });
        });

        describe('afterEach multiple guards cleanup', () => {
            test('cleaning single afterEach guard should not affect other guards', async () => {
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

            test('afterEach guard execution order should remain correct after cleanup', async () => {
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

        describe('mixed guards cleanup', () => {
            test('beforeEach and afterEach guards should cleanup independently', async () => {
                const beforeSpy = vi.fn();
                const afterSpy = vi.fn();

                const unregisterBefore = router.beforeEach(beforeSpy);
                const unregisterAfter = router.afterEach(afterSpy);

                await router.push('/test1');
                expect(beforeSpy).toHaveBeenCalledTimes(1);
                expect(afterSpy).toHaveBeenCalledTimes(1);

                unregisterBefore();

                await router.push('/test2');
                expect(beforeSpy).toHaveBeenCalledTimes(1); // No increase
                expect(afterSpy).toHaveBeenCalledTimes(2); // Continue to increase

                // Cleanup afterEach
                unregisterAfter();

                await router.push('/test3');
                expect(beforeSpy).toHaveBeenCalledTimes(1);
                expect(afterSpy).toHaveBeenCalledTimes(2); // No increase
            });
        });
    });

    describe('🛡️ Edge Cases Testing', () => {
        describe('repeated cleanup safety', () => {
            test('repeated cleanup function calls should be safe', () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                expect(() => {
                    unregister();
                    unregister();
                    unregister();
                }).not.toThrow();
            });

            test('guard should still not execute after repeated cleanup', async () => {
                const spy = vi.fn();
                const unregister = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister();
                unregister();
                unregister();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe('cleanup and re-registration', () => {
            test('can re-register same guard after cleanup', async () => {
                const spy = vi.fn();

                const unregister1 = router.beforeEach(spy);
                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                unregister1();

                // Re-register same guard
                const unregister2 = router.beforeEach(spy);
                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(2);

                unregister2();
            });

            test('re-registration after cleanup should work normally', async () => {
                const spy = vi.fn();

                let unregister = router.beforeEach(spy);
                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(1);

                // Cleanup
                unregister();

                // Re-register and navigate
                unregister = router.beforeEach(spy);
                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(2);

                // Cleanup and re-register again
                unregister();
                unregister = router.beforeEach(spy);
                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(3);

                // Final cleanup
                unregister();
            });
        });

        describe('same guard multiple registrations', () => {
            test('same guard function registered multiple times should handle correctly', async () => {
                const spy = vi.fn();

                const unregister1 = router.beforeEach(spy);
                const unregister2 = router.beforeEach(spy); // Same function

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(2); // Should execute twice

                // Cleanup first registration
                unregister1();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(3); // Should execute once more

                unregister2();

                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(3); // No more execution
            });

            test('complex scenario with same guard multiple registrations and cleanups', async () => {
                const spy = vi.fn();

                // Register same guard 3 times
                const unregister1 = router.beforeEach(spy);
                const unregister2 = router.beforeEach(spy);
                const unregister3 = router.beforeEach(spy);

                await router.push('/test1');
                expect(spy).toHaveBeenCalledTimes(3);

                // Cleanup middle registration
                unregister2();

                await router.push('/test2');
                expect(spy).toHaveBeenCalledTimes(5); // 3 + 2

                // Cleanup remaining
                unregister1();
                unregister3();

                await router.push('/test3');
                expect(spy).toHaveBeenCalledTimes(5); // No increase
            });
        });

        describe('empty array and non-existent element handling', () => {
            test('removing element from empty array should be safe', () => {
                const emptyArray: unknown[] = [];
                const element = vi.fn();

                expect(() => {
                    removeFromArray(emptyArray, element);
                }).not.toThrow();

                expect(emptyArray).toEqual([]);
            });

            test('removing non-existent element should be safe', () => {
                const array = [vi.fn(), vi.fn(), vi.fn()];
                const nonExistentElement = vi.fn();
                const originalLength = array.length;

                expect(() => {
                    removeFromArray(array, nonExistentElement);
                }).not.toThrow();

                expect(array).toHaveLength(originalLength);
            });
        });

        describe('special value handling', () => {
            test('removeFromArray should handle NaN values correctly', () => {
                const arr = [1, Number.NaN, 3, Number.NaN, 5];
                removeFromArray(arr, Number.NaN);
                expect(arr).toEqual([1, 3, Number.NaN, 5]); // Only remove first NaN
            });

            test('removeFromArray should handle function references correctly', () => {
                const func1 = () => 'func1';
                const func2 = () => 'func2';
                const func3 = () => 'func3';
                const arr = [func1, func2, func3];

                removeFromArray(arr, func2);
                expect(arr).toEqual([func1, func3]);
            });

            test('removeFromArray should handle object references correctly', () => {
                const obj1 = { id: 1 };
                const obj2 = { id: 2 };
                const obj3 = { id: 3 };
                const arr = [obj1, obj2, obj3];

                removeFromArray(arr, obj2);
                expect(arr).toEqual([obj1, obj3]);
            });
        });

        describe('memory leak protection', () => {
            test('large number of guard registrations and cleanups should not cause memory leaks', () => {
                const unregisters: Array<() => void> = [];

                // Register many guards
                for (let i = 0; i < 100; i++) {
                    const guard = vi.fn();
                    const unregister = router.beforeEach(guard);
                    unregisters.push(unregister);
                }

                expect(router.transition.guards.beforeEach).toHaveLength(100);

                // Cleanup all guards
                unregisters.forEach((unregister) => unregister());

                expect(router.transition.guards.beforeEach).toHaveLength(0);
            });

            test('mixed registration and cleanup should not cause memory leaks', () => {
                const guards: Array<() => void> = [];
                const unregisters: Array<() => void> = [];

                // Mixed registration and cleanup
                for (let i = 0; i < 50; i++) {
                    const guard = vi.fn();
                    guards.push(guard);
                    const unregister = router.beforeEach(guard);
                    unregisters.push(unregister);

                    // Cleanup every 5th guard
                    if (i % 5 === 0 && i > 0) {
                        unregisters[i - 5]();
                    }
                }

                // Cleanup remaining guards
                unregisters.forEach((unregister) => unregister());

                expect(router.transition.guards.beforeEach).toHaveLength(0);
                expect(router.transition.guards.afterEach).toHaveLength(0);
            });
        });

        describe('concurrent cleanup safety', () => {
            test('cleaning guard during navigation should be safe', async () => {
                let unregister: (() => void) | null = null;
                let guardExecuted = false;

                const guard = async () => {
                    guardExecuted = true;
                    // Cleanup self during guard execution
                    unregister?.();
                    await new Promise((resolve) => setTimeout(resolve, 10));
                };

                unregister = router.beforeEach(guard);

                // Should not throw exception
                await expect(router.push('/test1')).resolves.toBeDefined();
                expect(guardExecuted).toBe(true);

                // Subsequent navigation guard should not execute
                guardExecuted = false;
                await router.push('/test2');
                expect(guardExecuted).toBe(false);
            });

            test('cleaning multiple guards simultaneously should be safe', async () => {
                const guards = Array.from({ length: 10 }, () => vi.fn());
                const unregisters = guards.map((guard) =>
                    router.beforeEach(guard)
                );

                await router.push('/test1');
                guards.forEach((guard) =>
                    expect(guard).toHaveBeenCalledTimes(1)
                );

                // Cleanup all guards simultaneously
                unregisters.forEach((unregister) => unregister());

                await router.push('/test2');
                guards.forEach((guard) =>
                    expect(guard).toHaveBeenCalledTimes(1)
                );
            });
        });
    });

    describe('🔧 Router destroy cleanup verification', () => {
        test('Router destroy should cleanup all guards', async () => {
            const beforeSpy = vi.fn();
            const afterSpy = vi.fn();

            router.beforeEach(beforeSpy);
            router.afterEach(afterSpy);

            await router.push('/test1');
            expect(beforeSpy).toHaveBeenCalledTimes(1);
            expect(afterSpy).toHaveBeenCalledTimes(1);

            // Destroy router
            router.destroy();

            const newRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: () => 'Home' },
                    { path: '/test', component: () => 'Test' }
                ]
            });

            await newRouter.replace('/');
            await newRouter.push('/test');

            // Original guards should not be executed
            expect(beforeSpy).toHaveBeenCalledTimes(1);
            expect(afterSpy).toHaveBeenCalledTimes(1);

            newRouter.destroy();
        });
    });
});
