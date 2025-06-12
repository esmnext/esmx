import {
    assert,
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    test,
    vi
} from 'vitest';
import { MemoryHistory, Navigation } from './navigation';
import type { Route } from './types';
import { RouteStatus, RouteType, RouterMode } from './types';

const sleep = (ms?: number) => new Promise((s) => setTimeout(s, ms));
const awaitGo = (history: MemoryHistory, delta: number) => {
    const p = Promise.withResolvers<void>();
    const un = history.onPopState(() => {
        un(); // 清理订阅
        p.resolve();
    });
    history.go(delta);
    return p.promise;
};

describe('MemoryHistory', () => {
    test('should initialize with root path', () => {
        const history = new MemoryHistory();
        assert.equal(history.length, 1);
        assert.equal(history.state, null);
    });

    describe('pushState', () => {
        test('should add new entry', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');

            assert.equal(history.length, 2);
            assert.deepEqual(history.state, { id: 1 });
        });

        test('should clear forward history when pushing new state', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');
            history.pushState({ id: 2 }, '', '/page2');
            history.back();
            history.pushState({ id: 3 }, '', '/page3');

            assert.equal(history.length, 3);
            assert.deepEqual(history.state, { id: 3 });
        });
    });

    describe('replaceState', () => {
        test('should replace current entry', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');
            history.replaceState({ id: 2 }, '', '/page1-updated');

            assert.equal(history.length, 2);
            assert.deepEqual(history.state, { id: 2 });
        });
    });

    describe('navigation', () => {
        test('back() should navigate to previous entry', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');
            history.pushState({ id: 2 }, '', '/page2');

            history.back();
            assert.deepEqual(history.state, { id: 1 });
        });

        test('forward() should navigate to next entry', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');
            history.pushState({ id: 2 }, '', '/page2');

            history.back();
            history.forward();
            assert.deepEqual(history.state, { id: 2 });
        });

        test('go() should navigate to specific delta', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');
            history.pushState({ id: 2 }, '', '/page2');
            history.pushState({ id: 3 }, '', '/page3');

            history.go(-2);
            assert.deepEqual(history.state, { id: 1 });

            history.go(2);
            assert.deepEqual(history.state, { id: 3 });
        });

        test('go() should not navigate beyond bounds', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');

            const originalState = history.state;
            history.go(-2); // 尝试超出下限
            assert.deepEqual(history.state, originalState);

            history.go(2); // 尝试超出上限
            assert.deepEqual(history.state, originalState);
        });

        test('go() should do nothing when delta is 0 or undefined', () => {
            const history = new MemoryHistory();
            history.pushState({ id: 1 }, '', '/page1');

            const originalState = history.state;
            history.go(0);
            assert.deepEqual(history.state, originalState);

            history.go();
            assert.deepEqual(history.state, originalState);
        });
    });
});

describe.concurrent('subscribeMemory', () => {
    // 保持原始功能测试 - 订阅后原始的功能应正常工作
    test('should preserve original go functionality after subscription', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        void history.onPopState(() => {});

        // 验证原始功能仍然正常工作
        history.go(-1);
        await sleep(); // 等待回调执行
        assert.equal(history.url, '/page1');
        assert.deepEqual(history.state, { id: 1 });

        history.go(1);
        await sleep(); // 等待回调执行
        assert.equal(history.url, '/page2');
        assert.deepEqual(history.state, { id: 2 });
    });

    // 基本回调功能测试 - 在订阅后，回调应在导航时触发
    test('should trigger callback only on actual navigation (like popstate)', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 导航到前一页 - 应该触发回调
        await awaitGo(history, -1);

        assert.equal(callbacks.length, 1);
        assert.equal(callbacks[0].url, '/page1');
        assert.deepEqual(callbacks[0].state, { id: 1 });
    });

    // 多次导航测试 - 测试多次导航时回调是否都被正确触发
    test('should call callback multiple times for multiple navigation', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');
        history.pushState({ id: 3 }, '', '/page3');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 多次导航
        history.go(-1); // 到 page2
        history.go(-1); // 到 page1
        history.go(2); // 到 page3
        await sleep(); // 等待回调执行

        assert.equal(callbacks.length, 3);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // 测试 pushState 和 replaceState - 这些操作不应触发回调
    test('should NOT trigger callback on pushState/replaceState (like real popstate)', async () => {
        const history = new MemoryHistory();

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // pushState 和 replaceState 不应该触发 popstate 事件
        history.pushState({ id: 1 }, '', '/page1');
        history.replaceState({ id: 2 }, '', '/page1-updated');
        await sleep(); // 等待回调执行

        assert.equal(callbacks.length, 0);
    });

    // 边界情况测试 - 测试 go(0) 和 go(undefined) - 这些操作不应触发回调
    test('should NOT trigger callback when go() with delta 0 (no actual navigation)', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // go(0) 和 go(undefined) 不会改变历史状态，不应该触发回调
        history.go(0);
        history.go();
        await sleep(); // 等待回调执行

        assert.equal(callbacks.length, 0);
    });

    // 超出边界导航测试 - 测试超出历史记录边界的导航操作不应触发回调
    test('should NOT trigger callback when navigation is out of bounds', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 尝试超出边界的导航
        history.go(-10); // 超出下限
        await sleep(); // 等待回调执行
        history.go(10); // 超出上限
        await sleep(); // 等待回调执行

        assert.equal(callbacks.length, 0);
    });

    // 合法的导航回调测试 - 合法的 back/forward/go 导航都应该触发回调
    test('should trigger callback for valid back/forward navigation', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');
        history.pushState({ id: 3 }, '', '/page3');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 这些都应该触发回调，因为会改变历史状态
        history.back(); // 到 page2
        history.back(); // 到 page1
        history.forward(); // 到 page2
        history.go(1); // 到 page3
        await sleep(); // 等待回调执行

        assert.equal(callbacks.length, 4);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page2', state: { id: 2 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // 测试回调中提供的状态和 URL - 确保回调中提供的状态和 URL 正确
    test('should provide correct state and url in callback (like popstate event)', async () => {
        const history = new MemoryHistory();
        history.pushState({ userId: 123, page: 'profile' }, '', '/user/123');
        history.pushState(
            { userId: 456, page: 'settings' },
            '',
            '/user/456/settings'
        );

        type Data = { url: string; state: any };
        let callbackData: Data | null = null;
        void history.onPopState((url, state) => {
            callbackData = { url, state };
        });

        await awaitGo(history, -1);

        assert.isNotNull(callbackData);
        assert.equal((callbackData as Data).url, '/user/123');
        assert.deepEqual((callbackData as Data).state, {
            userId: 123,
            page: 'profile'
        });
    });

    // 测试多个订阅者 - 确保多个订阅者都能接收到相同的回调
    test('should support multiple subscribers like multiple event listeners', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks1: Array<{ url: string; state: any }> = [];
        const callbacks2: Array<{ url: string; state: any }> = [];

        // 模拟多个组件都监听 popstate 事件
        void history.onPopState((url, state) => {
            callbacks1.push({ url, state });
        });
        void history.onPopState((url, state) => {
            callbacks2.push({ url, state });
        });

        await awaitGo(history, -1);

        assert.equal(callbacks1.length, 1);
        assert.deepEqual(callbacks1, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks2.length, 1);
        assert.deepEqual(callbacks2, [{ url: '/page1', state: { id: 1 } }]);
    });

    // 返回清理函数测试 - 测试是否返回清理函数
    test('should return cleanup function to unsubscribe', () => {
        const history = new MemoryHistory();
        const unsubscribe = history.onPopState(() => {});

        assert.equal(typeof unsubscribe, 'function');
    });

    // 测试清理功能 - 确保可以正确取消订阅
    test('cleanup function should stop triggering callbacks', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        const unsubscribe = history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 导航一次，应该触发回调
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1);

        // 清理订阅
        unsubscribe();

        // 再次导航，不应该触发回调
        await awaitGo(history, 1);

        assert.equal(callbacks.length, 1);
    });

    // 清理多个订阅者 - 确保清理函数只取消当前订阅
    test('should allow multiple subscriptions and cleanup only the current one', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks1: Array<{ url: string; state: any }> = [];
        const callbacks2: Array<{ url: string; state: any }> = [];
        const callbacks3: Array<{ url: string; state: any }> = [];

        void history.onPopState((url, state) => {
            callbacks1.push({ url, state });
        });
        const unsubscribe2 = history.onPopState((url, state) => {
            callbacks2.push({ url, state });
        });
        void history.onPopState((url, state) => {
            callbacks3.push({ url, state });
        });

        // 导航一次，所有订阅者都应该触发回调
        await awaitGo(history, -1);
        assert.equal(callbacks1.length, 1);
        assert.deepEqual(callbacks1, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks2.length, 1);
        assert.deepEqual(callbacks2, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks3.length, 1);
        assert.deepEqual(callbacks3, [{ url: '/page1', state: { id: 1 } }]);

        // 清理订阅者2
        unsubscribe2();

        // 再次导航，剩下的订阅者应该触发回调，被清理的订阅者不应该触发
        await awaitGo(history, 1);
        assert.equal(callbacks1.length, 2); // 订阅者1应被触发
        assert.equal(callbacks2.length, 1); // 订阅者2应不再被触发
        assert.equal(callbacks3.length, 2); // 订阅者3应被触发
    });

    // 相同的回调只订阅一次，且清理函数可以正确取消订阅
    test('should not subscribe the same callback multiple times', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        const callback = (url: string, state: any) => {
            callbacks.push({ url, state });
        };

        // 第一次订阅
        const unSub1 = history.onPopState(callback);
        // 第二次订阅同一个回调
        const unSub2 = history.onPopState(callback);

        // 导航一次，应该只触发一次回调
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1);
        assert.deepEqual(callbacks[0], { url: '/page1', state: { id: 1 } });

        // 清理订阅
        unSub1();
        unSub2(); // 第二次订阅的清理函数不应该有任何效果

        // 再次导航，不应该触发回调
        await awaitGo(history, 1);
        assert.equal(callbacks.length, 1); // 回调仍然只有一次

        void history.onPopState(callback);
        unSub1(); // 可以重复执行解绑函数来解绑同一个监听器

        // 再次导航，仍然不应该触发回调
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1); // 回调仍然只有一次
    });
});

describe('Navigation', () => {
    // 构造一个最小 Route 对象，满足类型要求
    const createRoute = (path: string, state?: any): Route => ({
        type: RouteType.push,
        isPush: true,
        req: null,
        res: null,
        context: {},
        url: new URL('http://test.com' + path),
        path,
        fullPath: path,
        params: {},
        query: {},
        queryArray: {},
        meta: {},
        matched: [],
        config: null,
        state: state ?? {},
        status: RouteStatus.success,
        keepScrollPosition: false,
        handle: null,
        handleResult: null
    });

    test('should push and replace state correctly', () => {
        const nav = new Navigation({ mode: RouterMode.abstract } as any);
        const state1 = nav.push(createRoute('/foo', { a: 1 }));
        assert.deepEqual(state1.a, 1);
        const state2 = nav.replace(createRoute('/bar', { b: 2 }));
        assert.deepEqual(state2.b, 2);
        nav.destroy();
    });

    test('should resolve go/back/forward with correct url and state', async () => {
        const nav = new Navigation({ mode: RouterMode.abstract } as any);
        nav.push(createRoute('/a', { a: 1 }));
        nav.push(createRoute('/b', { b: 2 }));
        nav.push(createRoute('/c', { c: 3 }));
        // go(-2) 回到 /a
        const res1 = await nav.go(-2);
        assert.equal(res1?.url, '/a');
        assert.deepEqual(res1?.state.a, 1);
        // forward 到 /b
        const res2 = await nav.forward();
        assert.equal(res2?.url, '/b');
        assert.deepEqual(res2?.state.b, 2);
        // back 到 /a
        const res3 = await nav.back();
        assert.equal(res3?.url, '/a');
        assert.deepEqual(res3?.state.a, 1);
        nav.destroy();
    });

    test('should call onUpdated callback on navigation', async () => {
        const updates: Array<{ url: string; state: any }> = [];
        const nav = new Navigation(
            { mode: RouterMode.abstract } as any,
            (url, state) => updates.push({ url, state })
        );
        nav.push(createRoute('/a', { a: 1 }));
        nav.push(createRoute('/b', { b: 2 }));
        // await nav.go(-1);
        // 模拟浏览器的后退操作
        ((nav as any)._history as MemoryHistory).back();
        await sleep(100); // 等待回调执行
        assert.ok(updates.length > 0);
        assert.equal(updates[0].url, '/a');
        nav.destroy();
    });

    test('should resolve null if go is called while pending', async () => {
        const nav = new Navigation({ mode: RouterMode.abstract } as any);
        nav.push(createRoute('/a'));
        nav.push(createRoute('/b'));

        const p1 = nav.go(-1);
        const p2 = nav.go(1); // 第二次 go 应直接返回 null
        const r2 = await p2;
        assert.equal(r2, null);
        await p1;
        nav.destroy();
    });

    test('should cleanup listeners on destroy', async () => {
        const updates: Array<{ url: string; state: any }> = [];
        const nav = new Navigation(
            { mode: RouterMode.abstract } as any,
            (url, state) => updates.push({ url, state })
        );
        nav.push(createRoute('/a'));
        nav.push(createRoute('/b'));
        nav.destroy();
        // destroy 后再次 go 不应抛错
        nav.go(-1);
        // 也不应该有任何回调被触发
        const res = await nav.go(1);
        assert.equal(res, null);
        assert.equal(updates.length, 0);
    });

    // history 模式下的 Navigation 测试
    describe('in history mode', () => {
        let originalHistory: any;
        let mockHistory: any;
        let originalAddEventListener: any;
        let originalRemoveEventListener: any;
        let popstateHandler: any;

        beforeEach(() => {
            // 模拟的 window.history
            mockHistory = new MemoryHistory();
            mockHistory.replaceState({ startPoint: true }, '', '/startPoint');
            mockHistory.pushState = vi.fn(
                mockHistory.pushState.bind(mockHistory)
            );
            mockHistory.replaceState = vi.fn(
                mockHistory.replaceState.bind(mockHistory)
            );
            mockHistory.go = vi.fn(mockHistory.go.bind(mockHistory));
            mockHistory.onPopState(() => popstateHandler?.());
            // 模拟 location
            const mockLocation = {
                get href() {
                    return mockHistory.url;
                }
            };
            // 模拟 window.addEventListener
            const mockAddEventListener = vi.fn((type, handler) => {
                if (type === 'popstate') popstateHandler = handler;
            });
            const mockRemoveEventListener = vi.fn((type, handler) => {
                if (type === 'popstate' && popstateHandler === handler) {
                    popstateHandler = null;
                }
            });
            if (typeof globalThis === 'object') {
                (globalThis.window as any) = {
                    get history() {
                        return mockHistory;
                    },
                    get location() {
                        return mockLocation;
                    },
                    addEventListener: mockAddEventListener,
                    removeEventListener: mockRemoveEventListener
                };
                Object.defineProperty(globalThis, 'location', {
                    configurable: true,
                    get: () => mockLocation
                });
                Object.defineProperty(globalThis, 'history', {
                    configurable: true,
                    get: () => mockHistory
                });
            } else if (typeof window === 'object') {
                originalHistory = window.history;
                originalAddEventListener = window.addEventListener;
                originalRemoveEventListener = window.removeEventListener;
                window.history = mockHistory;
                window.addEventListener = mockAddEventListener;
                window.removeEventListener = mockRemoveEventListener;
            }
        });
        afterEach(() => {
            if (typeof globalThis === 'object') {
                // @ts-ignore
                // biome-ignore lint/performance/noDelete:
                delete globalThis.window;
                // @ts-ignore
                // biome-ignore lint/performance/noDelete:
                delete globalThis.location;
                // @ts-ignore
                // biome-ignore lint/performance/noDelete:
                delete globalThis.history;
            } else if (typeof window === 'object') {
                window.history = originalHistory;
                window.addEventListener = originalAddEventListener;
                window.removeEventListener = originalRemoveEventListener;
            }
            popstateHandler = null;
            mockHistory = null;
        });

        it('should call pushState/replaceState and handle go/back/forward', async () => {
            const nav = new Navigation({ mode: RouterMode.history } as any);
            // console.log('new', (nav as any)._history._entries, (nav as any)._history._index);
            // push
            const state1 = nav.push(createRoute('/foo', { a: 1 }));
            // console.log('push /foo', (nav as any)._history._entries, (nav as any)._history._index);
            expect(mockHistory.pushState).toHaveBeenCalledWith(
                expect.objectContaining({ a: 1 }),
                '',
                '/foo'
            );
            // replace
            const state2 = nav.replace(createRoute('/bar', { b: 2 }));
            // console.log('replace /bar', (nav as any)._history._entries, (nav as any)._history._index);
            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                expect.objectContaining({ b: 2 }),
                '',
                '/bar'
            );
            // go/back/forward
            const res = await nav.go(-1);
            // console.log('go -1', (nav as any)._history._entries, (nav as any)._history._index);
            expect(res).toEqual({
                type: 'success',
                url: '/startPoint',
                state: { startPoint: true }
            });
            nav.destroy();
        });
    });

    // 新增测试用例来覆盖未测试的分支
    describe('未覆盖分支测试', () => {
        test('should handle null/undefined route.state in push method (line 43)', () => {
            const nav = new Navigation({ mode: RouterMode.abstract } as any);

            // 测试 route.state 为 null 的情况
            const routeWithNullState = createRoute('/test');
            routeWithNullState.state = null as any;
            const state1 = nav.push(routeWithNullState);
            assert.ok(state1);
            assert.ok('__pageId__' in state1);

            // 测试 route.state 为 undefined 的情况
            const routeWithUndefinedState = createRoute('/test2');
            routeWithUndefinedState.state = undefined as any;
            const state2 = nav.push(routeWithUndefinedState);
            assert.ok(state2);
            assert.ok('__pageId__' in state2);

            nav.destroy();
        });

        test('should handle null/undefined route.state in replace method (line 53)', () => {
            const nav = new Navigation({ mode: RouterMode.abstract } as any);
            nav.push(createRoute('/initial'));

            // 测试 route.state 为 null 的情况
            const routeWithNullState = createRoute('/test');
            routeWithNullState.state = null as any;
            const state1 = nav.replace(routeWithNullState);
            assert.ok(state1);
            assert.ok('__pageId__' in state1);

            // 测试 route.state 为 undefined 的情况
            const routeWithUndefinedState = createRoute('/test2');
            routeWithUndefinedState.state = undefined as any;
            const state2 = nav.replace(routeWithUndefinedState);
            assert.ok(state2);
            assert.ok('__pageId__' in state2);

            nav.destroy();
        });

        test('should call _promiseResolve when destroying with pending promise (line 82)', async () => {
            const nav = new Navigation({ mode: RouterMode.abstract } as any);
            nav.push(createRoute('/test1'));
            nav.push(createRoute('/test2'));

            // 启动一个 go 操作但不等待它完成
            const goPromise = nav.go(-1);

            // 立即销毁，应该调用 _promiseResolve?.()
            nav.destroy();

            // go 操作应该返回 null
            const result = await goPromise;
            assert.equal(result, null);
        });

        test('should return null when _curEntry index is out of bounds (line 92)', () => {
            const history = new MemoryHistory();

            // 通过直接修改内部状态来模拟索引越界
            (history as any)._index = -1;
            assert.equal((history as any)._curEntry, null);

            (history as any)._index = 999; // 超出长度
            assert.equal((history as any)._curEntry, null);
        });

        test('should return empty string when _curEntry.url is null/undefined (line 101)', () => {
            const history = new MemoryHistory();

            // 模拟 _curEntry.url 为 undefined 的情况
            const mockEntry = { state: {}, url: undefined };
            (history as any)._entries = [mockEntry];
            (history as any)._index = 0;

            assert.equal(history.url, '');
        });

        test('should use this.url when pushState url parameter is null/undefined (line 108)', () => {
            const history = new MemoryHistory();
            const currentUrl = history.url; // 获取当前 URL

            // 测试 url 为 null
            history.pushState({ test: 1 }, '', null);
            assert.equal(history.url, currentUrl);

            // 测试 url 为 undefined
            history.pushState({ test: 2 }, '', undefined);
            assert.equal(history.url, currentUrl);
        });

        test('should return early when curEntry is null in replaceState (line 128)', () => {
            const history = new MemoryHistory();

            // 模拟 _curEntry 为 null 的情况
            (history as any)._index = -1; // 设置为无效索引

            // 调用 replaceState 应该直接返回而不执行任何操作
            const originalEntries = [...(history as any)._entries];
            history.replaceState({ test: 1 }, '', '/test');

            // entries 应该没有变化
            assert.deepEqual((history as any)._entries, originalEntries);
        });

        test('should return empty function when cb is not a function in onPopState (line 152)', () => {
            const history = new MemoryHistory();

            // 测试传入非函数类型
            const unsubscribe1 = history.onPopState(null as any);
            const unsubscribe2 = history.onPopState(undefined as any);
            const unsubscribe3 = history.onPopState('not a function' as any);
            const unsubscribe4 = history.onPopState(123 as any);

            assert.equal(typeof unsubscribe1, 'function');
            assert.equal(typeof unsubscribe2, 'function');
            assert.equal(typeof unsubscribe3, 'function');
            assert.equal(typeof unsubscribe4, 'function');

            // 这些函数应该是空函数，调用时不会出错
            assert.doesNotThrow(() => {
                unsubscribe1();
                unsubscribe2();
                unsubscribe3();
                unsubscribe4();
            });
        });

        test('should handle null history.state in subscribeHtmlHistory (line 159)', () => {
            // 模拟浏览器环境
            const mockHistory = {
                state: null // 模拟 history.state 为 null
            };
            const mockLocation = {
                href: 'http://test.com/page'
            };

            const mockWindow = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            };

            // 保存原始值
            const originalWindow = globalThis.window;
            const originalHistory = globalThis.history;
            const originalLocation = globalThis.location;

            try {
                // 设置模拟对象
                (globalThis as any).window = mockWindow;
                (globalThis as any).history = mockHistory;
                (globalThis as any).location = mockLocation;

                let capturedCallback: any = null;
                mockWindow.addEventListener.mockImplementation(
                    (event, callback) => {
                        if (event === 'popstate') {
                            capturedCallback = callback;
                        }
                    }
                );

                const callbackData: Array<{ url: string; state: any }> = [];

                // 创建一个新的 Navigation 实例来测试 history 模式
                const nav = new Navigation(
                    { mode: RouterMode.history } as any,
                    (url: string, state: any) => {
                        callbackData.push({ url, state });
                    }
                );

                // 验证 addEventListener 被调用
                expect(mockWindow.addEventListener).toHaveBeenCalledWith(
                    'popstate',
                    expect.any(Function)
                );

                // 模拟 popstate 事件触发
                if (capturedCallback) {
                    capturedCallback(); // 这里会触发 line 160: history.state || {}
                }

                // 验证回调被正确调用，且 null state 被转换为 {}
                expect(callbackData.length).toBe(1);
                expect(callbackData[0].url).toBe('http://test.com/page');
                expect(callbackData[0].state).toEqual({}); // history.state 为 null 时应该使用 {}

                nav.destroy();
            } finally {
                // 恢复原始值
                (globalThis as any).window = originalWindow;
                (globalThis as any).history = originalHistory;
                (globalThis as any).location = originalLocation;
            }
        });
    });
});
