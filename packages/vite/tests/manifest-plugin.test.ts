import type { Rollup } from 'vite';
import { describe, expect, test } from 'vitest';

import {
    chunkSourceKey,
    esmxManifestPlugin
} from '../src/vite/manifest-plugin';

function makeChunk(chunk: {
    name: string;
    facadeModuleId?: string | null;
    moduleIds?: string[];
}): Rollup.RenderedChunk {
    return {
        name: chunk.name,
        facadeModuleId: chunk.facadeModuleId ?? null,
        moduleIds: chunk.moduleIds ?? []
    } as unknown as Rollup.RenderedChunk;
}

describe('chunkSourceKey', () => {
    test('keys the entry chunk by its source path relative to root', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            makeChunk({
                name: 'src/entry.client',
                facadeModuleId: '/app/src/entry.client.ts'
            })
        );

        // Must equal core's hardcoded SSR seed `${name}@src/entry.client.ts`.
        expect(key).toBe('my-app@src/entry.client.ts');
    });

    test('keys a code-split chunk by its facade source path', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            makeChunk({
                name: 'routes',
                facadeModuleId: '/app/src/routes.ts'
            })
        );

        expect(key).toBe('my-app@src/routes.ts');
    });

    test('falls back to the output name for virtual (\\0) modules', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            makeChunk({
                name: 'react',
                facadeModuleId: '\0esmx-pkg-reexport:react'
            })
        );

        expect(key).toBe('my-app@react');
    });

    test('skips leading virtual modules and uses the first real source', () => {
        const key = chunkSourceKey(
            'my-app',
            '/app',
            makeChunk({
                name: 'chunk-x',
                facadeModuleId: null,
                moduleIds: ['\0virtual:helper', '/app/src/shared.ts']
            })
        );

        expect(key).toBe('my-app@src/shared.ts');
    });
});

describe('esmxManifestPlugin', () => {
    test('runs generateBundle in the post phase so SRI hashes the final code', () => {
        const plugin = esmxManifestPlugin({
            moduleName: 'my-app',
            exports: [],
            integrity: true,
            root: '/app',
            injectChunkName: false
        });

        // Must be order:'post' — Vite's build-import-analysis rewrites
        // dynamic-import preload markers in its own generateBundle, so SRI
        // computed earlier would not match the file the browser fetches.
        const hook = plugin.generateBundle as
            | { order?: string; handler?: unknown }
            | undefined;
        expect(typeof hook).toBe('object');
        expect(hook?.order).toBe('post');
        expect(typeof hook?.handler).toBe('function');
    });
});
