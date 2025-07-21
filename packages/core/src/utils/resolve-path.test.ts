import path from 'upath';
import { assert, test } from 'vitest';
import { resolvePath } from './resolve-path';

const TEST_ROOT = '/test/root';

test('basic path resolution', () => {
    const result = resolvePath(TEST_ROOT, './');
    assert.equal(result, path.resolve(TEST_ROOT, './'));
});

test('dist directory paths', () => {
    assert.equal(
        resolvePath(TEST_ROOT, 'dist'),
        path.resolve(TEST_ROOT, 'dist')
    );
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/index.mjs'),
        path.resolve(TEST_ROOT, 'dist/index.mjs')
    );
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/package.json'),
        path.resolve(TEST_ROOT, 'dist/package.json')
    );
});

test('client directory paths', () => {
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/client'),
        path.resolve(TEST_ROOT, 'dist/client')
    );
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/client/manifest.json'),
        path.resolve(TEST_ROOT, 'dist/client/manifest.json')
    );
});

test('server directory paths', () => {
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/server'),
        path.resolve(TEST_ROOT, 'dist/server')
    );
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/server/manifest.json'),
        path.resolve(TEST_ROOT, 'dist/server/manifest.json')
    );
});

test('with additional arguments', () => {
    assert.equal(
        resolvePath(TEST_ROOT, 'dist/client/js', 'main.js'),
        path.resolve(TEST_ROOT, 'dist/client/js', 'main.js')
    );
    assert.equal(
        resolvePath(TEST_ROOT, 'src', 'entry.client.ts'),
        path.resolve(TEST_ROOT, 'src', 'entry.client.ts')
    );
});
