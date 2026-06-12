import type { Rollup } from 'vite';
import { describe, expect, test } from 'vitest';

import {
    chunkSourceKey,
    collectChunksFromBundle,
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

describe('collectChunksFromBundle — CSS extraction', () => {
    const ROOT = '/app';

    test('reads viteMetadata.importedCss into chunks[].css[]', () => {
        const out = collectChunksFromBundle(
            {
                'src/entry.client.aaa.mjs': {
                    type: 'chunk',
                    name: 'src/entry.client',
                    facadeModuleId: `${ROOT}/src/entry.client.ts`,
                    moduleIds: [],
                    viteMetadata: {
                        importedCss: new Set(['assets/entry.client.bbb.css'])
                    }
                }
            },
            'my-app',
            ROOT
        );

        expect(out).toEqual([
            {
                key: 'my-app@src/entry.client.ts',
                js: 'src/entry.client.aaa.mjs',
                css: ['assets/entry.client.bbb.css']
            }
        ]);
    });

    test('returns empty css[] when chunk has no importedCss metadata', () => {
        const out = collectChunksFromBundle(
            {
                'vue.111.mjs': {
                    type: 'chunk',
                    name: 'vue',
                    facadeModuleId: `${ROOT}/node_modules/vue/index.mjs`,
                    moduleIds: []
                }
            },
            'my-app',
            ROOT
        );

        expect(out[0].css).toEqual([]);
    });

    test('preserves all CSS files from a chunk with multiple imports', () => {
        const out = collectChunksFromBundle(
            {
                'chunks/widget.111.mjs': {
                    type: 'chunk',
                    name: 'widget',
                    facadeModuleId: `${ROOT}/src/widget.ts`,
                    moduleIds: [],
                    viteMetadata: {
                        importedCss: new Set([
                            'assets/widget.aaa.css',
                            'assets/widget.theme.bbb.css'
                        ])
                    }
                }
            },
            'my-app',
            ROOT
        );

        expect(out[0].css.sort()).toEqual([
            'assets/widget.aaa.css',
            'assets/widget.theme.bbb.css'
        ]);
    });

    test('skips non-chunk assets in the bundle (CSS-only, JSON, etc.)', () => {
        const out = collectChunksFromBundle(
            {
                'orphan.css': {
                    type: 'asset',
                    fileName: 'orphan.css'
                },
                'data.json': { type: 'asset', fileName: 'data.json' }
            },
            'my-app',
            ROOT
        );

        expect(out).toEqual([]);
    });

    test('returns [] for an empty bundle', () => {
        expect(collectChunksFromBundle({}, 'my-app', ROOT)).toEqual([]);
    });

    test('falls back to chunk name for virtual modules (no source path)', () => {
        const out = collectChunksFromBundle(
            {
                'react.111.mjs': {
                    type: 'chunk',
                    name: 'react',
                    facadeModuleId: '\0esmx-pkg-reexport:react',
                    moduleIds: ['\0esmx-pkg-reexport:react'],
                    viteMetadata: { importedCss: new Set() }
                }
            },
            'my-app',
            ROOT
        );

        expect(out[0].key).toBe('my-app@react');
        expect(out[0].css).toEqual([]);
    });
});
