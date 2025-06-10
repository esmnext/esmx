import { assert, describe, test } from 'vitest';
import { MemoryHistory } from './navigation';

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

describe('subscribeMemory', () => {
    // 保持原始功能测试 - 订阅后原始的功能应正常工作
    test('should preserve original go functionality after subscription', () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        void history.onPopState(() => {});

        // 验证原始功能仍然正常工作
        history.go(-1);
        assert.equal(history.url, '/page1');
        assert.deepEqual(history.state, { id: 1 });

        history.go(1);
        assert.equal(history.url, '/page2');
        assert.deepEqual(history.state, { id: 2 });
    });

    // 基本回调功能测试 - 在订阅后，回调应在导航时触发
    test('should trigger callback only on actual navigation (like popstate)', () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 导航到前一页 - 应该触发回调
        history.go(-1);

        assert.equal(callbacks.length, 1);
        assert.equal(callbacks[0].url, '/page1');
        assert.deepEqual(callbacks[0].state, { id: 1 });
    });

    // 多次导航测试 - 测试多次导航时回调是否都被正确触发
    test('should call callback multiple times for multiple navigation', () => {
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

        assert.equal(callbacks.length, 3);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // 测试 pushState 和 replaceState - 这些操作不应触发回调
    test('should NOT trigger callback on pushState/replaceState (like real popstate)', () => {
        const history = new MemoryHistory();

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // pushState 和 replaceState 不应该触发 popstate 事件
        history.pushState({ id: 1 }, '', '/page1');
        history.replaceState({ id: 2 }, '', '/page1-updated');

        assert.equal(callbacks.length, 0);
    });

    // 边界情况测试 - 测试 go(0) 和 go(undefined) - 这些操作不应触发回调
    test('should NOT trigger callback when go() with delta 0 (no actual navigation)', () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // go(0) 和 go(undefined) 不会改变历史状态，不应该触发回调
        history.go(0);
        history.go();

        assert.equal(callbacks.length, 0);
    });

    // 超出边界导航测试 - 测试超出历史记录边界的导航操作不应触发回调
    test('should NOT trigger callback when navigation is out of bounds', () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');

        const callbacks: Array<{ url: string; state: any }> = [];
        void history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 尝试超出边界的导航
        history.go(-10); // 超出下限
        history.go(10); // 超出上限

        assert.equal(callbacks.length, 0);
    });

    // 合法的导航回调测试 - 合法的 back/forward/go 导航都应该触发回调
    test('should trigger callback for valid back/forward navigation', () => {
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

        assert.equal(callbacks.length, 4);
        assert.deepEqual(callbacks, [
            { url: '/page2', state: { id: 2 } },
            { url: '/page1', state: { id: 1 } },
            { url: '/page2', state: { id: 2 } },
            { url: '/page3', state: { id: 3 } }
        ]);
    });

    // 测试回调中提供的状态和 URL - 确保回调中提供的状态和 URL 正确
    test('should provide correct state and url in callback (like popstate event)', () => {
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

        history.go(-1);

        assert.isNotNull(callbackData);
        assert.equal((callbackData as Data).url, '/user/123');
        assert.deepEqual((callbackData as Data).state, {
            userId: 123,
            page: 'profile'
        });
    });

    // 测试多个订阅者 - 确保多个订阅者都能接收到相同的回调
    test('should support multiple subscribers like multiple event listeners', () => {
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

        history.go(-1);

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
    test('cleanup function should stop triggering callbacks', () => {
        const history = new MemoryHistory();
        history.pushState({ id: 1 }, '', '/page1');
        history.pushState({ id: 2 }, '', '/page2');

        const callbacks: Array<{ url: string; state: any }> = [];
        const unsubscribe = history.onPopState((url, state) => {
            callbacks.push({ url, state });
        });

        // 导航一次，应该触发回调
        history.go(-1);
        assert.equal(callbacks.length, 1);

        // 清理订阅
        unsubscribe();

        // 再次导航，不应该触发回调
        history.go(1);

        assert.equal(callbacks.length, 1);
    });

    // 清理多个订阅者 - 确保清理函数只取消当前订阅
    test('should allow multiple subscriptions and cleanup only the current one', () => {
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
        history.go(-1);
        assert.equal(callbacks1.length, 1);
        assert.deepEqual(callbacks1, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks2.length, 1);
        assert.deepEqual(callbacks2, [{ url: '/page1', state: { id: 1 } }]);
        assert.equal(callbacks3.length, 1);
        assert.deepEqual(callbacks3, [{ url: '/page1', state: { id: 1 } }]);

        // 清理订阅者2
        unsubscribe2();

        // 再次导航，剩下的订阅者应该触发回调，被清理的订阅者不应该触发
        history.go(1);
        assert.equal(callbacks1.length, 2); // 订阅者1应被触发
        assert.equal(callbacks2.length, 1); // 订阅者2应不再被触发
        assert.equal(callbacks3.length, 2); // 订阅者3应被触发
    });

    // 相同的回调只订阅一次，且清理函数可以正确取消订阅
    test('should not subscribe the same callback multiple times', () => {
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
        history.go(-1);
        assert.equal(callbacks.length, 1);
        assert.deepEqual(callbacks[0], { url: '/page1', state: { id: 1 } });

        // 清理订阅
        unSub1();
        unSub2(); // 第二次订阅的清理函数不应该有任何效果

        // 再次导航，不应该触发回调
        history.go(1);
        assert.equal(callbacks.length, 1); // 回调仍然只有一次

        void history.onPopState(callback);
        unSub1(); // 可以重复执行解绑函数来解绑同一个监听器

        // 再次导航，仍然不应该触发回调
        history.go(-1);
        assert.equal(callbacks.length, 1); // 回调仍然只有一次
    });
});
