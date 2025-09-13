import type { EntryNormalized, RspackOptionsNormalized } from '@rspack/core';
import { describe, expect, it } from 'vitest';
import { initEntry } from './entry';
import type { ParsedModuleLinkPluginOptions } from './types';

function createOptions(
    options: Partial<ParsedModuleLinkPluginOptions> = {}
): ParsedModuleLinkPluginOptions {
    return {
        name: 'test',
        ext: '.mjs',
        deps: [],
        exports: {},
        imports: {},
        scopes: {},
        injectChunkName: false,
        preEntries: [],
        ...options
    };
}

function createCompiler(
    entry: RspackOptionsNormalized['entry'] = {}
): RspackOptionsNormalized {
    return {
        entry
    } as RspackOptionsNormalized;
}

describe('initEntry', () => {
    it('should throw error when entry is a function', () => {
        const compiler = createCompiler();
        compiler.entry = (() =>
            Promise.resolve({})) as unknown as EntryNormalized;
        const opts = createOptions();

        expect(() => initEntry(compiler, opts)).toThrow(
            `'entry' option does not support functions`
        );
    });

    it('should reset entry when main entry is empty', () => {
        const compiler = createCompiler({ main: {} });
        const opts = createOptions();

        initEntry(compiler, opts);

        expect(compiler.entry).toEqual({});
    });

    it('should add single entry with preEntries', () => {
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts'],
            exports: {
                main: {
                    name: 'main',
                    pkg: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                }
            }
        });

        initEntry(compiler, opts);

        expect(compiler.entry).toEqual({
            main: {
                import: ['./src/hot-client.ts', './src/main.ts']
            }
        });
    });

    it('should add multiple entries with preEntries', () => {
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts', './src/polyfills.ts'],
            exports: {
                main: {
                    name: 'main',
                    pkg: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                },
                admin: {
                    name: 'admin',
                    pkg: false,
                    file: './src/admin.ts',
                    identifier: 'test/admin'
                }
            }
        });

        initEntry(compiler, opts);

        expect(compiler.entry).toEqual({
            main: {
                import: [
                    './src/hot-client.ts',
                    './src/polyfills.ts',
                    './src/main.ts'
                ]
            },
            admin: {
                import: [
                    './src/hot-client.ts',
                    './src/polyfills.ts',
                    './src/admin.ts'
                ]
            }
        });
    });

    it('should handle entries without preEntries', () => {
        const compiler = createCompiler();
        const opts = createOptions({
            exports: {
                main: {
                    name: 'main',
                    pkg: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                }
            }
        });

        initEntry(compiler, opts);

        expect(compiler.entry).toEqual({
            main: {
                import: ['./src/main.ts']
            }
        });
    });

    it('should handle empty exports', () => {
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts']
        });

        initEntry(compiler, opts);

        expect(compiler.entry).toEqual({});
    });
});
