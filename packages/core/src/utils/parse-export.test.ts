import { assert, test } from 'vitest';
import { type ParsedExport, parseExport } from './parse-export';

test('parseExport', () => {
    assert.deepEqual(parseExport('vue'), {
        name: 'vue',
        file: 'vue',
        pkg: false,
        client: true,
        server: true
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('pkg:vue'), {
        name: 'vue',
        file: 'vue',
        pkg: true,
        client: true,
        server: true
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('pkg.client:vue'), {
        name: 'vue',
        file: 'vue',
        pkg: true,
        client: true,
        server: false
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('pkg.server:vue'), {
        name: 'vue',
        file: 'vue',
        pkg: true,
        client: false,
        server: true
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('pkg.client.server:vue'), {
        name: 'vue',
        file: 'vue',
        pkg: true,
        client: true,
        server: true
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('./src/index.ts'), {
        name: 'src/index',
        file: './src/index.ts',
        pkg: false,
        client: true,
        server: true
    } satisfies ParsedExport);
    assert.deepEqual(parseExport('client:./src/index.ts'), {
        name: 'src/index',
        file: './src/index.ts',
        pkg: false,
        client: true,
        server: false
    } satisfies ParsedExport);
});
