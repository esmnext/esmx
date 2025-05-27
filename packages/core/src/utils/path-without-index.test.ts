import { assert, test } from 'vitest';
import { pathWithoutIndex } from './path-without-index';

test('should add non-index path when only index path exists', () => {
    const imports: Record<string, string> = {
        '/utils/index': '/utils/index'
    };
    pathWithoutIndex(imports);
    assert.deepEqual(imports, {
        '/utils/index': '/utils/index',
        '/utils': '/utils/index'
    });
});

test('should not override existing non-index path', () => {
    const imports: Record<string, string> = {
        '/utils/index': '/utils/index1',
        '/utils': '/utils/index2'
    };
    pathWithoutIndex(imports);
    assert.deepEqual(imports, {
        '/utils/index': '/utils/index1',
        '/utils': '/utils/index2'
    });
});
