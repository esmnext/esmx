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

    it('should parse complete configuration with preEntries', () => {
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
            preEntries: ['./src/hot-client.ts']
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
            preEntries: ['./src/hot-client.ts']
        });
    });
});
