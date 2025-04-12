import { assert, test } from 'vitest';
import { parseExport } from './parse-export';

test('parseExport', () => {
    assert.deepEqual(parseExport('vue'), {
        name: 'vue',
        file: 'vue',
        npm: false,
        client: true,
        server: true
    });
    assert.deepEqual(parseExport('npm:vue'), {
        name: 'vue',
        file: 'vue',
        npm: true,
        client: true,
        server: true
    });
    assert.deepEqual(parseExport('npm.client:vue'), {
        name: 'vue',
        file: 'vue',
        npm: true,
        client: true,
        server: false
    });
    assert.deepEqual(parseExport('npm.server:vue'), {
        name: 'vue',
        file: 'vue',
        npm: true,
        client: false,
        server: true
    });
    assert.deepEqual(parseExport('npm.client.server:vue'), {
        name: 'vue',
        file: 'vue',
        npm: true,
        client: true,
        server: true
    });
    assert.deepEqual(parseExport('./src/index.ts'), {
        name: 'src/index',
        file: './src/index.ts',
        npm: false,
        client: true,
        server: true
    });
    assert.deepEqual(parseExport('client:./src/index.ts'), {
        name: 'src/index',
        file: './src/index.ts',
        npm: false,
        client: true,
        server: false
    });
});
