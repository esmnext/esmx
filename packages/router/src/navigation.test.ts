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
