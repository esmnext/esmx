import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

describe('esmxManifestPlugin — RFC 0001 §5 protocol fields', () => {
    test('emits protocol, version, provides and uses into manifest.json', () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'esmx-vite-'));
        fs.writeFileSync(
            path.join(root, 'package.json'),
            JSON.stringify({
                name: 'my-app',
                version: '1.2.3',
                esmx: { provides: ['vue'], uses: ['shared'] }
            })
        );
        fs.mkdirSync(path.join(root, 'node_modules/vue'), { recursive: true });
        fs.writeFileSync(
            path.join(root, 'node_modules/vue/package.json'),
            JSON.stringify({ name: 'vue', version: '3.4.21' })
        );
        const bundle = {
            'vue.aaa.mjs': {
                type: 'chunk',
                fileName: 'vue.aaa.mjs',
                name: 'vue',
                isEntry: true,
                code: '',
                facadeModuleId: '\0esmx-pkg-reexport:vue',
                moduleIds: [],
                imports: ['shared.bbb.mjs'],
                dynamicImports: []
            },
            'shared.bbb.mjs': {
                type: 'chunk',
                fileName: 'shared.bbb.mjs',
                name: 'shared',
                isEntry: false,
                code: '',
                facadeModuleId: `${root}/src/shared.ts`,
                moduleIds: [],
                imports: [],
                dynamicImports: []
            },
            'src/entry.client.ccc.mjs': {
                type: 'chunk',
                fileName: 'src/entry.client.ccc.mjs',
                name: 'src/entry.client',
                isEntry: true,
                code: '',
                facadeModuleId: `${root}/src/entry.client.ts`,
                moduleIds: [],
                imports: [],
                dynamicImports: []
            }
        };
        const emitted: Array<{ fileName?: string; source?: string }> = [];
        const plugin = esmxManifestPlugin({
            moduleName: 'my-app',
            exports: [
                { name: 'vue', pkg: true },
                { name: 'src/entry.client', pkg: false }
            ],
            integrity: false,
            root,
            injectChunkName: false
        });
        const hook = plugin.generateBundle as {
            handler: (outputOptions: unknown, bundle: unknown) => void;
        };

        hook.handler.call(
            { emitFile: (file: never) => emitted.push(file) },
            {},
            bundle
        );

        fs.rmSync(root, { recursive: true, force: true });
        expect(emitted).toHaveLength(1);
        expect(emitted[0].fileName).toBe('manifest.json');
        const manifest = JSON.parse(emitted[0].source as string);
        expect(manifest.protocol).toBe(2);
        expect(manifest.version).toBe('1.2.3');
        expect(manifest.uses).toEqual(['shared']);
        expect(manifest.provides).toEqual({
            vue: { version: '3.4.21' }
        });
        expect(manifest.exports.vue.file).toBe('vue.aaa.mjs');
    });
});
