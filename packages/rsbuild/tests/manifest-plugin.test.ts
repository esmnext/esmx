import { describe, expect, test } from 'vitest';

import { chunkSourceKey } from '../src/rsbuild/manifest-plugin';

describe('chunkSourceKey', () => {
    test('keys the entry chunk by its source path relative to root', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            '/app/src/entry.client.ts'
        );

        // Must equal core's hardcoded SSR seed `${name}@src/entry.client.ts`.
        expect(key).toBe('my-app@src/entry.client.ts');
    });

    test('keys a code-split chunk by its source path', () => {
        const key = chunkSourceKey('my-app', '/app', '/app/src/routes.ts');

        expect(key).toBe('my-app@src/routes.ts');
    });

    test('keys a node_modules dependency by its relative path', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            '/app/node_modules/vue/dist/vue.runtime.esm-browser.prod.js'
        );

        expect(key).toBe(
            'my-app@node_modules/vue/dist/vue.runtime.esm-browser.prod.js'
        );
    });
});
