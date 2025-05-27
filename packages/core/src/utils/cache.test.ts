import { assert, test } from 'vitest';
import { createCache } from './cache';

test('When cache is enabled, same name should only fetch once', async () => {
    const cache = createCache(true);
    let callCount = 0;
    const fetch = async () => {
        callCount++;
        return 'data';
    };

    const result1 = await cache('key', fetch);
    const result2 = await cache('key', fetch);

    assert.equal(result1, 'data');
    assert.equal(result2, 'data');
    assert.equal(callCount, 1);
});

test('When cache is enabled, different names should fetch separately', async () => {
    const cache = createCache(true);
    let callCount1 = 0;
    let callCount2 = 0;
    const fetch1 = async () => {
        callCount1++;
        return 'data1';
    };
    const fetch2 = async () => {
        callCount2++;
        return 'data2';
    };

    const result1 = await cache('key1', fetch1);
    const result2 = await cache('key2', fetch2);

    assert.equal(result1, 'data1');
    assert.equal(result2, 'data2');
    assert.equal(callCount1, 1);
    assert.equal(callCount2, 1);
});

test('When cache is disabled, fetch should execute every time', async () => {
    const cache = createCache(false);
    let callCount = 0;
    const fetch = async () => {
        callCount++;
        return 'data';
    };

    const result1 = await cache('key', fetch);
    const result2 = await cache('key', fetch);

    assert.equal(result1, 'data');
    assert.equal(result2, 'data');
    assert.equal(callCount, 2);
});
