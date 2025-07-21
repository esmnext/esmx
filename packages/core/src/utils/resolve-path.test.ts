import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assert, describe, test } from 'vitest';
import { resolveImportPath, resolvePath } from './resolve-path';

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

describe('resolveImportPath', () => {
    test('should handle multiple path segments', () => {
        const result = resolveImportPath('base', 'path', 'file.ts');
        assert.typeOf(result, 'string');
        const expectedPath = pathToFileURL(
            path.resolve('base', 'path', 'file.ts')
        ).href;
        assert.equal(result, expectedPath);
    });

    test('should resolve from cwd when using relative paths', () => {
        const result = resolveImportPath('./relative/file.ts');
        const expected = pathToFileURL(path.resolve('./relative/file.ts')).href;
        assert.equal(result, expected);
    });

    test('should handle absolute paths', () => {
        const absolutePath = path.resolve('/absolute/path/file.ts');
        const result = resolveImportPath(absolutePath);
        const expected = pathToFileURL(absolutePath).href;
        assert.equal(result, expected);
    });

    test('should work with process.cwd()', () => {
        const result = resolveImportPath(process.cwd(), 'src', 'file.ts');
        const expected = pathToFileURL(
            path.resolve(process.cwd(), 'src', 'file.ts')
        ).href;
        assert.equal(result, expected);
    });
});
