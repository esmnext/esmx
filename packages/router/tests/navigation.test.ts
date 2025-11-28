import {
    afterEach,
    assert,
    beforeEach,
    describe,
    expect,
    it,
    test,
    vi
} from 'vitest';
import { MemoryHistory, Navigation } from '../src/navigation';
import { parsedOptions } from '../src/options';
import { Route } from '../src/route';
import type { RouterOptions } from '../src/types';
import { RouterMode, RouteType } from '../src/types';

const sleep = (ms?: number) => new Promise((s) => setTimeout(s, ms));
const awaitGo = (history: MemoryHistory, delta: number) => {
    const p = Promise.withResolvers<void>();
    const un = history.onPopState(() => {
        un();
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
            history.go(-2); // Try to go below lower bound
            assert.deepEqual(history.state, originalState);

            history.go(2); // Try to go above upper bound
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
    // Keep original functionality test - original features should work after subscription
    test('should preserve original go functionality after subscription', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        void history.onPopState(() => {});

        history.go(-1);
        await sleep(); // Wait for callback execution
        assert.equal(history.url, '/page1');
        assert.deepEqual(history.state, { id: 1 });

        history.go(1);
        await sleep(); // Wait for callback execution
        assert.equal(history.url, '/page2');
        assert.deepEqual(history.state, { id: 2 });
    });

    // Basic callback functionality test - callback should trigger on navigation
    test('should trigger callback only on actual navigation (like popstate)', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // Navigate to the previous page - should trigger callback
        await awaitGo(history, -1);

        assert.equal(callbacks.length, 1);
        assert.equal(callbacks[0].url, '/page1');
        assert.deepEqual(callbacks[0].state, { id: 1 });
    });

    test('should call callback multiple times for multiple navigation', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');
        history.pushState({ id: 3 }, '', '/page3');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        history.go(-1); // to page2
        history.go(-1); // to page1
        history.go(2); // to page3
        await sleep(); // Wait for callback execution

        assert.equal(callbacks.length, 3);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // Test pushState and replaceState - these operations should not trigger callbacks
    test('should NOT trigger callback on pushState/replaceState (like real popstate)', async () => {
        const history = new MemoryHistory();

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // pushState and replaceState should not trigger popstate events
        history.pushState({ id: 1 }, '', '/page1');
        history.replaceState({ id: 2 }, '', '/page1-updated');
        await sleep(); // Wait for callback execution

        assert.equal(callbacks.length, 0);
    });

    // Edge case test - test go(0) and go(undefined) - these should not trigger callbacks
    test('should NOT trigger callback when go() with delta 0 (no actual navigation)', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // go(0) and go(undefined) do not change history state and should not trigger callbacks
        history.go(0);
        history.go();
        await sleep(); // Wait for callback execution

        assert.equal(callbacks.length, 0);
    });

    // Out-of-bounds navigation test - navigation beyond history bounds should not trigger callbacks
    test('should NOT trigger callback when navigation is out of bounds', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // Attempting out-of-bounds navigation
        history.go(-10); // Below lower bound
        await sleep(); // Wait for callback execution
        history.go(10); // Above upper bound
        await sleep(); // Wait for callback execution

        assert.equal(callbacks.length, 0);
    });

    // Legal navigation callback test - valid back/forward/go navigations should all trigger callbacks
    test('should trigger callback for valid back/forward navigation', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');
        history.pushState({ id: 3 }, '', '/page3');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // These should all trigger callbacks as they change the history state
        history.back(); // to page2
        history.back(); // to page1
        history.forward(); // to page2
        history.go(1); // to page3
        await sleep(); // Wait for callback execution

        assert.equal(callbacks.length, 4);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page2', state: { id: 2 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // Test state and URL provided in callback - ensure they are correct
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

    test('should support multiple subscribers like multiple event listeners', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks1: Array<{ url: string; state: any }> = [];
        const callbacks2: Array<{ url: string; state: any }> = [];

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

    // Test returning cleanup function - check if it returns a function to unsubscribe
    test('should return cleanup function to unsubscribe', () => {
        const history = new MemoryHistory();
        const unsubscribe = history.onPopState(() => {});

        assert.equal(typeof unsubscribe, 'function');
    });

    // Test cleanup functionality - ensure subscription can be cancelled correctly
    test('cleanup function should stop triggering callbacks', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        const unsubscribe = history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // Navigate once, should trigger callback
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1);

        // Cleanup subscription
        unsubscribe();

        // Navigate again, should not trigger callback
        await awaitGo(history, 1);

        assert.equal(callbacks.length, 1);
    });

    // Cleanup multiple subscribers - ensure cleanup function only cancels the current subscription
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

        // Navigate once, all subscribers should be triggered
        await awaitGo(history, -1);
        assert.equal(callbacks1.length, 1);
        assert.deepEqual(callbacks1, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks2.length, 1);
        assert.deepEqual(callbacks2, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks3.length, 1);
        assert.deepEqual(callbacks3, [{ url: '/page1', state: { id: 1 } }]);

        // Cleanup subscriber 2
        unsubscribe2();

        // Navigate again, remaining subscribers should be triggered, but the cleaned one should not
        await awaitGo(history, 1);
        assert.equal(callbacks1.length, 2); // Subscriber 1 should be triggered
        assert.equal(callbacks2.length, 1); // Subscriber 2 should NOT be triggered
        assert.equal(callbacks3.length, 2); // Subscriber 3 should be triggered
    });

    test('should not subscribe the same callback multiple times', async () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        const callback = (url: string, state: any) => {
            callbacks.push({ url, state });
        };

        const unSub1 = history.onPopState(callback);
        const unSub2 = history.onPopState(callback);

        // Navigate once, should trigger callback only once
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1);
        assert.deepEqual(callbacks[0], { url: '/page1', state: { id: 1 } });

        // Cleanup subscription
        unSub1();
        unSub2(); // Cleanup for the second subscription should have no effect

        // Navigate again, should not trigger callback
        await awaitGo(history, 1);
        assert.equal(callbacks.length, 1); // Callback count is still one

        void history.onPopState(callback);
        unSub1(); // It should be possible to call the unsubscribe function multiple times for the same listener

        // Navigate again, still should not trigger callback
        await awaitGo(history, -1);
        assert.equal(callbacks.length, 1); // Callback count is still one
    });
});

describe('Navigation', () => {
    const createTestOptions = () => {
        const baseOptions: RouterOptions = {
            context: {},
            routes: [],
            mode: RouterMode.memory,
            base: new URL('http://test.com'),
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            fallback: () => {},
            rootStyle: false,
            handleBackBoundary: () => {},
            handleLayerClose: () => {}
        };
        return parsedOptions(baseOptions);
    };

    test('should provide access to history length', () => {
        const nav = new Navigation({ mode: RouterMode.memory } as any);

        // Initial length should be 1 (root entry)
        assert.equal(nav.length, 1);

        // Push operations should increase length
        const route1 = new Route({
            options: createTestOptions(),
            toType: RouteType.push,
            toInput: { path: '/foo', state: { a: 1 } }
        });
        nav.push(route1);
        assert.equal(nav.length, 2);

        const route2 = new Route({
            options: createTestOptions(),
            toType: RouteType.push,
            toInput: { path: '/bar', state: { b: 2 } }
        });
        nav.push(route2);
        assert.equal(nav.length, 3);

        // Replace operation should not change length
        const route3 = new Route({
            options: createTestOptions(),
            toType: RouteType.push,
            toInput: { path: '/baz', state: { c: 3 } }
        });
        nav.replace(route3);
        assert.equal(nav.length, 3);

        nav.destroy();
    });

    test('should push and replace state correctly', () => {
        const nav = new Navigation({ mode: RouterMode.memory } as any);
        const state1 = nav.push({ state: { a: 1 } }, '/foo');
        assert.deepEqual((state1 as any).state.a, 1);
        const state2 = nav.replace({ state: { b: 2 } }, '/bar');
        assert.deepEqual((state2 as any).state.b, 2);
        nav.destroy();
    });

    test('should resolve go/back/forward with correct url and state', async () => {
        const nav = new Navigation({ mode: RouterMode.memory } as any);
        nav.push({ state: { a: 1 } }, '/a');
        nav.push({ state: { b: 2 } }, '/b');
        nav.push({ state: { c: 3 } }, '/c');

        // go(-2) 回到 /a
        const res1 = await nav.go(-2);
        assert.equal(res1?.url, '/a');
        assert.deepEqual((res1?.state as any).state.a, 1);
        // forward 到 /b
        const res2 = await nav.forward();
        assert.equal(res2?.url, '/b');
        assert.deepEqual((res2?.state as any).state.b, 2);
        // back 到 /a
        const res3 = await nav.back();
        assert.equal(res3?.url, '/a');
        assert.deepEqual((res3?.state as any).state.a, 1);
        nav.destroy();
    });

    test('should call onUpdated callback on navigation', async () => {
        const updates: Array<{ url: string; state: any }> = [];
        const nav = new Navigation(
            { mode: RouterMode.memory } as any,
            (url, state) => updates.push({ url, state })
        );
        nav.push({ state: { a: 1 } }, '/a');
        nav.push({ state: { b: 2 } }, '/b');

        ((nav as any)._history as MemoryHistory).back();
        await sleep(100); // Wait for callback execution
        assert.ok(updates.length > 0);
        assert.equal(updates[0].url, '/a');
        nav.destroy();
    });

    test('should resolve null if go is called while pending', async () => {
        const nav = new Navigation({ mode: RouterMode.memory } as any);
        nav.push(
            new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/a', state: { a: 1 } }
            })
        );
        nav.push(
            new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/b', state: { b: 2 } }
            })
        );

        const p1 = nav.go(-1);
        const p2 = nav.go(1); // Second `go` should resolve with null immediately
        const r2 = await p2;
        assert.equal(r2, null);
        await p1;
        nav.destroy();
    });

    test('should cleanup listeners on destroy', async () => {
        const updates: Array<{ url: string; state: any }> = [];
        const nav = new Navigation(
            { mode: RouterMode.memory } as any,
            (url, state) => updates.push({ url, state })
        );
        nav.push(
            new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/a', state: { a: 1 } }
            })
        );
        nav.push(
            new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/b', state: { b: 2 } }
            })
        );
        nav.destroy();
        // `go` after destroy should not throw an error
        nav.go(-1);
        const res = await nav.go(1);
        assert.equal(res, null);
        assert.equal(updates.length, 0);
    });

    describe('in history mode', () => {
        let mockHistory: any;
        let popstateHandler: any;

        beforeEach(() => {
            // Mock window.history
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
            // Mock location
            const mockLocation = {
                get href() {
                    return mockHistory.url;
                }
            };
            // Mock window.addEventListener
            const mockAddEventListener = vi.fn((type, handler) => {
                if (type === 'popstate') popstateHandler = handler;
            });
            const mockRemoveEventListener = vi.fn((type, handler) => {
                if (type === 'popstate' && popstateHandler === handler) {
                    popstateHandler = null;
                }
            });
            vi.stubGlobal('window', {
                get history() {
                    return mockHistory;
                },
                get location() {
                    return mockLocation;
                },
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener
            });
            vi.stubGlobal('location', mockLocation);
            vi.stubGlobal('history', mockHistory);
        });
        afterEach(() => {
            vi.unstubAllGlobals();
            popstateHandler = null;
            mockHistory = null;
        });

        it('should call pushState/replaceState and handle go/back/forward', async () => {
            const nav = new Navigation({ mode: RouterMode.history } as any);
            // push
            const state1 = nav.push({ state: { a: 1 } }, '/foo');
            expect(mockHistory.pushState).toHaveBeenCalledWith(
                expect.objectContaining({ state: { a: 1 } }),
                '',
                '/foo'
            );
            // replace
            const state2 = nav.replace({ state: { b: 2 } }, '/bar');
            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                expect.objectContaining({ state: { b: 2 } }),
                '',
                '/bar'
            );
            // go/back/forward
            const res = await nav.go(-1);
            expect(res).toEqual({
                type: 'success',
                url: '/startPoint',
                state: { startPoint: true }
            });
            nav.destroy();
        });
    });

    // New test cases to cover untested branches
    describe('Uncovered branches tests', () => {
        test('should handle null/undefined route.state in push method (line 43)', () => {
            const nav = new Navigation({ mode: RouterMode.memory } as any);

            const routeWithNullState = new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/test', state: null as any }
            });
            const state1 = nav.push(routeWithNullState);
            assert.ok(state1);
            assert.ok('__pageId__' in state1);

            const routeWithUndefinedState = new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/test2', state: undefined }
            });
            const state2 = nav.push(routeWithUndefinedState);
            assert.ok(state2);
            assert.ok('__pageId__' in state2);

            nav.destroy();
        });

        test('should handle null/undefined route.state in replace method (line 53)', () => {
            const nav = new Navigation({ mode: RouterMode.memory } as any);
            nav.push(
                new Route({
                    options: createTestOptions(),
                    toType: RouteType.push,
                    toInput: '/initial'
                })
            );

            const routeWithNullState = new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/test', state: null as any }
            });
            const state1 = nav.replace(routeWithNullState);
            assert.ok(state1);
            assert.ok('__pageId__' in state1);

            const routeWithUndefinedState = new Route({
                options: createTestOptions(),
                toType: RouteType.push,
                toInput: { path: '/test2', state: undefined }
            });
            const state2 = nav.replace(routeWithUndefinedState);
            assert.ok(state2);
            assert.ok('__pageId__' in state2);

            nav.destroy();
        });

        test('should call _promiseResolve when destroying with pending promise (line 82)', async () => {
            const nav = new Navigation({ mode: RouterMode.memory } as any);
            nav.push(
                new Route({
                    options: createTestOptions(),
                    toType: RouteType.push,
                    toInput: '/test1'
                })
            );
            nav.push(
                new Route({
                    options: createTestOptions(),
                    toType: RouteType.push,
                    toInput: '/test2'
                })
            );

            // Start a 'go' operation without awaiting it
            const goPromise = nav.go(-1);

            // Destroy immediately, which should call _promiseResolve?.()
            nav.destroy();

            const result = await goPromise;
            assert.equal(result, null);
        });

        test('should return null when _curEntry index is out of bounds (line 92)', () => {
            const history = new MemoryHistory();

            (history as any)._index = -1;
            assert.equal((history as any)._curEntry, null);

            (history as any)._index = 999; // Exceeds length
            assert.equal((history as any)._curEntry, null);
        });

        test('should return empty string when _curEntry.url is null/undefined (line 101)', () => {
            const history = new MemoryHistory();

            const mockEntry = { state: {}, url: undefined };
            (history as any)._entries = [mockEntry];
            (history as any)._index = 0;

            assert.equal(history.url, '');
        });

        test('should use this.url when pushState url parameter is null/undefined (line 108)', () => {
            const history = new MemoryHistory();
            const currentUrl = history.url; // Get current URL

            history.pushState({ test: 1 }, '', null);
            assert.equal(history.url, currentUrl);

            history.pushState({ test: 2 }, '', undefined);
            assert.equal(history.url, currentUrl);
        });

        test('should return early when curEntry is null in replaceState (line 128)', () => {
            const history = new MemoryHistory();

            (history as any)._index = -1; // Set to an invalid index

            // Calling replaceState should return early without doing anything
            const originalEntries = [...(history as any)._entries];
            history.replaceState({ test: 1 }, '', '/test');

            // entries should remain unchanged
            assert.deepEqual((history as any)._entries, originalEntries);
        });

        test('should return empty function when cb is not a function in onPopState (line 152)', () => {
            const history = new MemoryHistory();

            const unsubscribe1 = history.onPopState(null as any);
            const unsubscribe2 = history.onPopState(undefined as any);
            const unsubscribe3 = history.onPopState('not a function' as any);
            const unsubscribe4 = history.onPopState(123 as any);

            assert.equal(typeof unsubscribe1, 'function');
            assert.equal(typeof unsubscribe2, 'function');
            assert.equal(typeof unsubscribe3, 'function');
            assert.equal(typeof unsubscribe4, 'function');

            // These should be empty functions that don't throw when called
            assert.doesNotThrow(() => {
                unsubscribe1();
                unsubscribe2();
                unsubscribe3();
                unsubscribe4();
            });
        });

        test('should handle null history.state in subscribeHtmlHistory (line 159)', () => {
            const mockHistory = {
                state: null // Simulate history.state being null
            };
            const mockLocation = {
                href: 'http://test.com/page'
            };

            const mockWindow = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            };

            let capturedCallback: any = null;
            mockWindow.addEventListener.mockImplementation(
                (event, callback) => {
                    if (event === 'popstate') {
                        capturedCallback = callback;
                    }
                }
            );

            vi.stubGlobal('window', mockWindow);
            vi.stubGlobal('history', mockHistory);
            vi.stubGlobal('location', mockLocation);

            const callbackData: Array<{ url: string; state: any }> = [];

            const nav = new Navigation(
                { mode: RouterMode.history } as any,
                (url: string, state: any) => {
                    callbackData.push({ url, state });
                }
            );

            expect(mockWindow.addEventListener).toHaveBeenCalledWith(
                'popstate',
                expect.any(Function)
            );

            if (capturedCallback) {
                capturedCallback(); // This will trigger line 160: history.state || {}
            }

            expect(callbackData.length).toBe(1);
            expect(callbackData[0].url).toBe('http://test.com/page');
            expect(callbackData[0].state).toEqual({}); // Should be {} when history.state is null

            nav.destroy();
            vi.unstubAllGlobals();
        });
    });
});
