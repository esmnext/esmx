import { describe, expect, test } from 'vitest';

import {
    chunkSourceKey,
    collectChunksFromStats
} from '../src/rsbuild/manifest-plugin';

const ROOT = '/app';

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

describe('collectChunksFromStats — CSS extraction', () => {
    test('populates css[] when a chunk emitted .css alongside .mjs', () => {
        const out = collectChunksFromStats(
            {
                chunks: [
                    {
                        files: [
                            'src/entry.client.aaa.mjs',
                            'src/entry.client.bbb.css'
                        ],
                        modules: [
                            {
                                index: 0,
                                moduleType: 'javascript/auto',
                                nameForCondition: `${ROOT}/src/entry.client.ts`
                            }
                        ]
                    }
                ]
            },
            'my-app',
            ROOT
        );

        expect(out).toEqual([
            {
                key: 'my-app@src/entry.client.ts',
                js: 'src/entry.client.aaa.mjs',
                css: ['src/entry.client.bbb.css']
            }
        ]);
    });

    test('returns empty css[] when chunk has no stylesheet', () => {
        const out = collectChunksFromStats(
            {
                chunks: [
                    {
                        files: ['vue.111.mjs'],
                        modules: [
                            {
                                index: 0,
                                moduleType: 'javascript/esm',
                                nameForCondition: `${ROOT}/node_modules/vue/index.mjs`
                            }
                        ]
                    }
                ]
            },
            'my-app',
            ROOT
        );

        expect(out[0].css).toEqual([]);
    });

    test('extracts multiple CSS files per chunk', () => {
        const out = collectChunksFromStats(
            {
                chunks: [
                    {
                        files: [
                            'chunks/w.111.mjs',
                            'chunks/w.111.css',
                            'chunks/w.111.theme.css'
                        ],
                        modules: [
                            {
                                index: 0,
                                moduleType: 'javascript/esm',
                                nameForCondition: `${ROOT}/src/widget.ts`
                            }
                        ]
                    }
                ]
            },
            'my-app',
            ROOT
        );

        expect(out[0].css).toEqual([
            'chunks/w.111.css',
            'chunks/w.111.theme.css'
        ]);
    });

    test('skips chunks without a JS module (CSS-only / asset-only)', () => {
        const out = collectChunksFromStats(
            {
                chunks: [{ files: ['orphan.111.css'], modules: [] }]
            },
            'my-app',
            ROOT
        );

        expect(out).toEqual([]);
    });

    test('skips chunks whose JS module has no nameForCondition', () => {
        const out = collectChunksFromStats(
            {
                chunks: [
                    {
                        files: ['inline.111.mjs', 'inline.111.css'],
                        modules: [{ moduleType: 'javascript/auto' }]
                    }
                ]
            },
            'my-app',
            ROOT
        );

        expect(out).toEqual([]);
    });

    test('returns [] when stats has no chunks at all', () => {
        expect(collectChunksFromStats({}, 'my-app', ROOT)).toEqual([]);
    });
});
