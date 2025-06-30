import { describe, expect, it } from 'vitest';
import { parseOptions } from './parse';
import type { ModuleLinkPluginOptions } from './types';

describe('parseOptions', () => {
    it('should parse preEntries with default empty array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test'
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.preEntries).toEqual([]);
    });

    it('should parse deps with default empty array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test'
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.deps).toEqual([]);
    });

    it('should filter out self-reference in deps', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'ssr-main',
            deps: ['ssr-main', 'ssr-utils', 'ssr-core']
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.deps).toEqual(['ssr-utils', 'ssr-core']);
    });

    it('should handle deps with no self-reference', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'ssr-main',
            deps: ['ssr-utils', 'ssr-core']
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.deps).toEqual(['ssr-utils', 'ssr-core']);
    });

    it('should handle empty deps array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'ssr-main',
            deps: []
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.deps).toEqual([]);
    });

    it('should parse deps with provided array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test',
            deps: ['ssr-main', 'ssr-utils']
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.deps).toEqual(['ssr-main', 'ssr-utils']);
    });

    it('should parse preEntries with provided array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test',
            preEntries: ['./src/hot-client.ts', './src/polyfills.ts']
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.preEntries).toEqual([
            './src/hot-client.ts',
            './src/polyfills.ts'
        ]);
    });

    it('should parse preEntries with empty array', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test',
            preEntries: []
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result.preEntries).toEqual([]);
    });

    it('should parse complete configuration with all options', () => {
        // Arrange
        const options: ModuleLinkPluginOptions = {
            name: 'test-module',
            ext: 'js',
            imports: {
                react: 'https://esm.sh/react'
            },
            exports: {
                main: {
                    file: './src/main.ts',
                    rewrite: true
                }
            },
            injectChunkName: true,
            preEntries: ['./src/hot-client.ts'],
            deps: ['ssr-main', 'test-module', 'ssr-utils']
        };

        // Act
        const result = parseOptions(options);

        // Assert
        expect(result).toEqual({
            name: 'test-module',
            ext: '.js',
            imports: {
                react: 'https://esm.sh/react'
            },
            exports: {
                main: {
                    name: 'main',
                    rewrite: true,
                    file: './src/main.ts',
                    identifier: 'test-module/main'
                }
            },
            injectChunkName: true,
            preEntries: ['./src/hot-client.ts'],
            deps: ['ssr-main', 'ssr-utils'] // test-module is filtered out
        });
    });
});
