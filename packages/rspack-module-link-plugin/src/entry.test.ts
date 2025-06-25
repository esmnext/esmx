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
        exports: {},
        imports: {},
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
        // Arrange
        const compiler = createCompiler();
        // Using type assertion to test the error case
        compiler.entry = (() =>
            Promise.resolve({})) as unknown as EntryNormalized;
        const opts = createOptions();

        // Act & Assert
        expect(() => initEntry(compiler, opts)).toThrow(
            `'entry' option does not support functions`
        );
    });

    it('should reset entry when main entry is empty', () => {
        // Arrange
        const compiler = createCompiler({ main: {} });
        const opts = createOptions();

        // Act
        initEntry(compiler, opts);

        // Assert
        expect(compiler.entry).toEqual({});
    });

    it('should add single entry with preEntries', () => {
        // Arrange
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts'],
            exports: {
                main: {
                    name: 'main',
                    rewrite: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                }
            }
        });

        // Act
        initEntry(compiler, opts);

        // Assert
        expect(compiler.entry).toEqual({
            main: {
                import: ['./src/hot-client.ts', './src/main.ts']
            }
        });
    });

    it('should add multiple entries with preEntries', () => {
        // Arrange
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts', './src/polyfills.ts'],
            exports: {
                main: {
                    name: 'main',
                    rewrite: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                },
                admin: {
                    name: 'admin',
                    rewrite: false,
                    file: './src/admin.ts',
                    identifier: 'test/admin'
                }
            }
        });

        // Act
        initEntry(compiler, opts);

        // Assert
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
        // Arrange
        const compiler = createCompiler();
        const opts = createOptions({
            exports: {
                main: {
                    name: 'main',
                    rewrite: false,
                    file: './src/main.ts',
                    identifier: 'test/main'
                }
            }
        });

        // Act
        initEntry(compiler, opts);

        // Assert
        expect(compiler.entry).toEqual({
            main: {
                import: ['./src/main.ts']
            }
        });
    });

    it('should handle empty exports', () => {
        // Arrange
        const compiler = createCompiler();
        const opts = createOptions({
            preEntries: ['./src/hot-client.ts']
        });

        // Act
        initEntry(compiler, opts);

        // Assert
        expect(compiler.entry).toEqual({});
    });
});
