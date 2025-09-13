import { describe, expect, it, vi } from 'vitest';
import { createExternals } from './external';
import type { ParsedModuleLinkPluginOptions } from './types';

function createOptions(
    options: Partial<ParsedModuleLinkPluginOptions> = {}
): ParsedModuleLinkPluginOptions {
    return {
        name: 'test-module',
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

describe('createExternals', () => {
    describe('basic functionality', () => {
        it('should return init and match functions', () => {
            const opts = createOptions();

            const result = createExternals(opts);

            expect(result).toHaveProperty('init');
            expect(result).toHaveProperty('match');
            expect(typeof result.init).toBe('function');
            expect(typeof result.match).toBe('function');
        });
    });

    describe('init function', () => {
        it('should initialize only once even when called multiple times', async () => {
            const opts = createOptions({
                exports: {
                    main: {
                        name: 'main',
                        pkg: true,
                        file: './src/main.ts',
                        identifier: 'test-module/main'
                    }
                }
            });

            const mockResolvePath = vi
                .fn()
                .mockResolvedValue('/resolved/path/main.ts');
            const { init } = createExternals(opts);

            const promise1 = init(mockResolvePath);
            const promise2 = init(mockResolvePath);

            await Promise.all([promise1, promise2]);

            expect(mockResolvePath).toHaveBeenCalledTimes(1);
            expect(mockResolvePath).toHaveBeenCalledWith('./src/main.ts');
        });

        it('should process exported module paths', async () => {
            const opts = createOptions({
                exports: {
                    main: {
                        name: 'main',
                        pkg: true,
                        file: './src/main.ts',
                        identifier: 'test-module/main'
                    },
                    utils: {
                        name: 'utils',
                        pkg: false,
                        file: './src/utils.ts',
                        identifier: 'test-module/utils'
                    }
                }
            });

            const mockResolvePath = vi.fn().mockImplementation((path) => {
                if (path === './src/main.ts')
                    return Promise.resolve('/resolved/path/main.ts');
                if (path === './src/utils.ts')
                    return Promise.resolve('/resolved/path/utils.ts');
                return Promise.resolve(null);
            });

            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            const mainResult = await match('main', '/some/context');
            const mainResolvedResult = await match(
                '/resolved/path/main.ts',
                '/some/context'
            );
            const utilsResult = await match(
                'test-module/utils',
                '/some/context'
            );
            const utilsResolvedResult = await match(
                '/resolved/path/utils.ts',
                '/some/context'
            );

            expect(mockResolvePath).toHaveBeenCalledTimes(2);
            expect(mainResult).toBe('main');
            expect(mainResolvedResult).toBe('main');
            expect(utilsResult).toBe('test-module/utils');
            expect(utilsResolvedResult).toBe('test-module/utils');
        });

        it('should process import mappings', async () => {
            const opts = createOptions({
                imports: {
                    react: 'https://esm.sh/react',
                    vue: 'https://esm.sh/vue'
                }
            });

            const mockResolvePath = vi.fn().mockResolvedValue(null);
            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            const reactResult = await match('react', '/some/context');
            const vueResult = await match('vue', '/some/context');

            expect(reactResult).toBe('react');
            expect(vueResult).toBe('vue');
        });

        it('should handle failed path resolution correctly', async () => {
            const opts = createOptions({
                exports: {
                    main: {
                        name: 'main',
                        pkg: true,
                        file: './src/main.ts',
                        identifier: 'test-module/main'
                    }
                }
            });

            const mockResolvePath = vi.fn().mockResolvedValue(null);
            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            mockResolvePath.mockClear();

            const mainResult = await match('main', '/some/context');
            const notFoundResult = await match(
                '/resolved/path/main.ts',
                '/some/context'
            );

            expect(mockResolvePath).toHaveBeenCalledTimes(1);
            expect(mainResult).toBe('main');
            expect(notFoundResult).toBeNull();
        });
    });

    describe('match function', () => {
        it('should throw error when match is called before initialization', async () => {
            const opts = createOptions();
            const { match } = createExternals(opts);

            await expect(
                match('some-request', '/some/context')
            ).rejects.toThrow(
                'External handler not initialized. Call init() first.'
            );
        });

        it('should return null when request is empty', async () => {
            const opts = createOptions();
            const mockResolvePath = vi.fn().mockResolvedValue(null);
            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            const result = await match('', '/some/context');

            expect(result).toBeNull();
        });

        it('should match dependency modules', async () => {
            const opts = createOptions({
                deps: ['dependency-a', 'dependency-b']
            });

            const mockResolvePath = vi.fn().mockResolvedValue(null);
            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            const exactMatchResult = await match(
                'dependency-a',
                '/some/context'
            );
            const prefixMatchResult = await match(
                'dependency-b/sub/module',
                '/some/context'
            );
            const noMatchResult = await match(
                'other-dependency',
                '/some/context'
            );

            expect(exactMatchResult).toBe('dependency-a');
            expect(prefixMatchResult).toBe('dependency-b/sub/module');
            expect(noMatchResult).toBeNull();
        });

        it('should resolve path matches during initialization', async () => {
            const opts = createOptions({
                exports: {
                    main: {
                        name: 'main',
                        pkg: true,
                        file: './src/main.ts',
                        identifier: 'test-module/main'
                    }
                }
            });

            const mockResolvePath = vi
                .fn()
                .mockImplementation(async (request) => {
                    if (request === './src/main.ts') {
                        return '/resolved/path/main.ts';
                    }
                    return null;
                });

            const { init, match } = createExternals(opts);

            await init(mockResolvePath);

            expect(mockResolvePath).toHaveBeenCalledWith('./src/main.ts');

            const resolvedResult = await match(
                '/resolved/path/main.ts',
                '/some/context'
            );
            expect(resolvedResult).toBe('main');
        });

        it('should prioritize direct identifier match over path resolution', async () => {
            const opts = createOptions({
                imports: {
                    'direct-match': 'direct-match'
                },
                exports: {
                    main: {
                        name: 'main',
                        pkg: true,
                        file: './src/main.ts',
                        identifier: 'test-module/main'
                    }
                }
            });

            const mockResolvePath = vi
                .fn()
                .mockImplementation(async (request) => {
                    if (request === './src/main.ts')
                        return '/resolved/path/main.ts';
                    if (request === 'direct-match')
                        return '/should/not/reach/here';
                    return null;
                });

            const { init, match } = createExternals(opts);

            await init(mockResolvePath);
            mockResolvePath.mockClear();

            const directResult = await match('direct-match', '/some/context');

            expect(directResult).toBe('direct-match');
            expect(mockResolvePath).not.toHaveBeenCalled();
        });
    });

    describe('complex scenarios', () => {
        it('should handle all types of module references', async () => {
            const opts = createOptions({
                deps: ['external-dep'],
                imports: {
                    'import-lib': 'import-lib'
                },
                exports: {
                    'export-lib': {
                        name: 'export-lib',
                        pkg: false,
                        file: './src/export-lib.ts',
                        identifier: 'test-module/export-lib'
                    }
                }
            });

            const mockResolvePath = vi
                .fn()
                .mockImplementation(async (request) => {
                    if (request === './src/export-lib.ts')
                        return '/resolved/path/export-lib.ts';
                    if (request === 'relative/path')
                        return '/resolved/path/export-lib.ts';
                    return null;
                });

            const { init, match } = createExternals(opts);

            await init(mockResolvePath);

            const depResult = await match('external-dep', '/context');
            const depSubResult = await match('external-dep/sub', '/context');
            const importResult = await match('import-lib', '/context');
            const exportResult = await match(
                'test-module/export-lib',
                '/context'
            );
            const resolvedResult = await match('relative/path', '/context');
            const notFoundResult = await match('unknown-module', '/context');

            expect(depResult).toBe('external-dep');
            expect(depSubResult).toBe('external-dep/sub');
            expect(importResult).toBe('import-lib');
            expect(exportResult).toBe('test-module/export-lib');
            expect(resolvedResult).toBe('test-module/export-lib');
            expect(notFoundResult).toBeNull();
        });
    });
});
