import { assert, test } from 'vitest';
import { Esmx } from './core';
import { parsePackConfig } from './pack-config';

const esmx = new Esmx();

test('should return default config when empty', () => {
    const result = parsePackConfig({});
    assert.equal(result.enable, false);
    assert.deepEqual(result.outputs, ['dist/client/versions/latest.tgz']);
});

test('should handle string outputs', () => {
    const result = parsePackConfig({ outputs: 'custom/path.tgz' });
    assert.deepEqual(result.outputs, ['custom/path.tgz']);
});

test('should handle array outputs', () => {
    const result = parsePackConfig({ outputs: ['path1.tgz', 'path2.tgz'] });
    assert.deepEqual(result.outputs, ['path1.tgz', 'path2.tgz']);
});

test('should handle enable flag', () => {
    const result = parsePackConfig({ enable: true });
    assert.equal(result.enable, true);
});

test('should handle packageJson callback', async () => {
    const mockPkg = { name: 'test' };
    const result = parsePackConfig({
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        }
    });
    const processedPkg = await result.packageJson(esmx, mockPkg);
    assert.equal(processedPkg.version, '1.0.0');
});

test('should handle onBefore callback', async () => {
    let called = false;
    const result = parsePackConfig({
        onBefore: async () => {
            called = true;
        }
    });
    await result.onBefore(esmx, {});
    assert.equal(called, true);
});

test('should handle onAfter callback', async () => {
    let called = false;
    const result = parsePackConfig({
        onAfter: async () => {
            called = true;
        }
    });
    await result.onAfter(esmx, {}, Buffer.from(''));
    assert.equal(called, true);
});

test('should use default callbacks when not provided', async () => {
    const mockPkg = { name: 'test' };
    const result = parsePackConfig({});

    // Test packageJson keeps original
    const processedPkg = await result.packageJson(esmx, mockPkg);
    assert.deepEqual(processedPkg, mockPkg);

    // Test onBefore doesn't throw
    await result.onBefore(esmx, {});

    // Test onAfter doesn't throw
    await result.onAfter(esmx, {}, Buffer.from(''));
});
