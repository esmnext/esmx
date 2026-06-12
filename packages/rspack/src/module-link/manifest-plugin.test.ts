import type { StatsCompilation } from '@rspack/core';
import { describe, expect, it } from 'vitest';
import { generateIdentifier, getChunks, getExports } from './manifest-plugin';
import type { ParsedModuleLinkPluginOptions } from './types';

const baseOpts: ParsedModuleLinkPluginOptions = {
    name: 'remote',
    exports: {},
    imports: {},
    scopes: {},
    ext: '.mjs',
    deps: [],
    preEntries: [],
    wrapperFiles: [],
    injectChunkName: false
};

const ROOT = '/abs/project';

function mkChunk(o: {
    files?: string[];
    modules?: Array<{
        nameForCondition?: string;
        moduleType?: string;
        index?: number;
    }>;
    auxiliaryFiles?: string[];
}): NonNullable<StatsCompilation['chunks']>[number] {
    return {
        files: o.files ?? [],
        auxiliaryFiles: o.auxiliaryFiles ?? [],
        modules: (o.modules ?? []).map((m, i) => ({
            id: i,
            index: m.index ?? i,
            nameForCondition: m.nameForCondition,
            moduleType: m.moduleType ?? 'javascript/auto'
        }))
    } as never;
}

describe('getChunks — CSS extraction', () => {
    it('populates css[] when a chunk emitted .css files', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: [
                        'src/entry.client.95f6085b.final.mjs',
                        'src/entry.client.a73d6772.final.css'
                    ],
                    modules: [
                        {
                            nameForCondition: `${ROOT}/src/entry.client.ts`,
                            moduleType: 'javascript/auto'
                        }
                    ]
                })
            ]
        };

        const chunks = getChunks(baseOpts, stats, ROOT);
        const entry = chunks['remote@src/entry.client.ts'];
        expect(entry).toBeDefined();
        expect(entry.js).toBe('src/entry.client.95f6085b.final.mjs');
        expect(entry.css).toEqual(['src/entry.client.a73d6772.final.css']);
    });

    it('returns empty css[] when chunk has no stylesheet', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: ['vue.b8a9c2d3.final.mjs'],
                    modules: [
                        {
                            nameForCondition: `${ROOT}/node_modules/vue/index.mjs`,
                            moduleType: 'javascript/esm'
                        }
                    ]
                })
            ]
        };

        const entry = getChunks(baseOpts, stats, ROOT)[
            'remote@node_modules/vue/index.mjs'
        ];
        expect(entry).toBeDefined();
        expect(entry.css).toEqual([]);
    });

    it('extracts multiple CSS chunks per JS chunk (split stylesheets)', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: [
                        'chunks/widget.111.final.mjs',
                        'chunks/widget.111.final.css',
                        'chunks/widget.111.theme.css'
                    ],
                    modules: [
                        {
                            nameForCondition: `${ROOT}/src/widget.ts`,
                            moduleType: 'javascript/esm'
                        }
                    ]
                })
            ]
        };

        const entry = getChunks(baseOpts, stats, ROOT)['remote@src/widget.ts'];
        expect(entry.css).toEqual([
            'chunks/widget.111.final.css',
            'chunks/widget.111.theme.css'
        ]);
    });

    it('ignores chunks without a JS module (CSS-only / asset-only)', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: ['orphan.111.final.css'],
                    modules: []
                })
            ]
        };

        expect(getChunks(baseOpts, stats, ROOT)).toEqual({});
    });

    it('respects opts.ext for the JS file lookup (.cjs / .js / .mjs)', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: ['src/x.111.js', 'src/x.111.css'],
                    modules: [
                        {
                            nameForCondition: `${ROOT}/src/x.ts`,
                            moduleType: 'javascript/auto'
                        }
                    ]
                })
            ]
        };

        const chunks = getChunks({ ...baseOpts, ext: '.js' }, stats, ROOT);
        expect(chunks['remote@src/x.ts'].js).toBe('src/x.111.js');
        expect(chunks['remote@src/x.ts'].css).toEqual(['src/x.111.css']);
    });

    it('writes auxiliaryFiles (sourcemaps, images) into resources[]', () => {
        const stats: StatsCompilation = {
            chunks: [
                mkChunk({
                    files: ['src/a.111.mjs'],
                    auxiliaryFiles: ['src/a.111.mjs.map', 'assets/logo.svg'],
                    modules: [
                        {
                            nameForCondition: `${ROOT}/src/a.ts`,
                            moduleType: 'javascript/esm'
                        }
                    ]
                })
            ]
        };

        const entry = getChunks(baseOpts, stats, ROOT)['remote@src/a.ts'];
        expect(entry.resources).toEqual([
            'src/a.111.mjs.map',
            'assets/logo.svg'
        ]);
    });

    it('returns {} when stats has no chunks at all', () => {
        expect(getChunks(baseOpts, {}, ROOT)).toEqual({});
    });
});

describe('generateIdentifier', () => {
    it('normalises absolute path to root-relative POSIX form', () => {
        expect(
            generateIdentifier({
                root: '/abs/project',
                name: 'remote',
                filePath: '/abs/project/src/entry.client.ts'
            })
        ).toBe('remote@src/entry.client.ts');
    });

    it('falls back to absolute path when no root provided', () => {
        expect(
            generateIdentifier({
                root: '',
                name: 'remote',
                filePath: '/abs/project/src/x.ts'
            })
        ).toBe('remote@/abs/project/src/x.ts');
    });
});

describe('getExports', () => {
    it('binds export entries to their hashed asset filenames', () => {
        const opts: ParsedModuleLinkPluginOptions = {
            ...baseOpts,
            exports: {
                'src/entry.client': {
                    name: 'src/entry.client',
                    file: './src/entry.client',
                    pkg: false,
                    identifier: 'remote/src/entry.client'
                }
            }
        };
        const stats: StatsCompilation = {
            entrypoints: {
                'src/entry.client': {
                    chunks: [],
                    assets: [
                        { name: 'src/entry.client.95f6085b.final.mjs' } as never
                    ]
                } as never
            }
        };

        const out = getExports(opts, stats);
        expect(out['src/entry.client'].file).toBe(
            'src/entry.client.95f6085b.final.mjs'
        );
    });
});
