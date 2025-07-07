import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    type ModuleConfig,
    type ModuleConfigExportExports,
    type ModuleConfigExportObject,
    type ParsedModuleConfig,
    type ParsedModuleConfigExport,
    parseModuleConfig
} from './module-config';

describe('module-config', () => {
    const testModuleName = 'test-module';
    const testRoot = '/test/root';

    describe('parseModuleConfig', () => {
        it('should parse empty configuration with defaults', () => {
            // Arrange
            const config: ModuleConfig = {};

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.imports).toEqual({});
            expect(result.links).toHaveProperty(testModuleName);
            expect(result.exports).toHaveProperty('src/entry.client');
            expect(result.exports).toHaveProperty('src/entry.server');
        });

        it('should parse configuration without config parameter', () => {
            // Arrange & Act
            const result = parseModuleConfig(testModuleName, testRoot);

            // Assert
            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.imports).toEqual({});
        });

        it('should parse complete configuration', () => {
            // Arrange
            const config: ModuleConfig = {
                links: {
                    'shared-lib': '../shared-lib/dist',
                    'api-utils': '/absolute/path/api-utils/dist'
                },
                imports: {
                    axios: 'shared-lib/axios',
                    lodash: 'shared-lib/lodash'
                },
                exports: {
                    axios: 'axios',
                    'src/utils/format': './src/utils/format.ts',
                    'custom-api': './src/api/custom.ts'
                }
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.imports).toEqual(config.imports);
            expect(result.links).toHaveProperty('shared-lib');
            expect(result.links).toHaveProperty('api-utils');
            expect(result.exports).toHaveProperty('axios');
            expect(result.exports).toHaveProperty('src/utils/format');
            expect(result.exports).toHaveProperty('custom-api');
        });
    });

    describe('links processing', () => {
        it('should create self-link with default dist path', () => {
            // Arrange
            const config: ModuleConfig = {};

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            const selfLink = result.links[testModuleName];
            expect(selfLink).toBeDefined();
            expect(selfLink.name).toBe(testModuleName);
            expect(selfLink.root).toBe(path.resolve(testRoot, 'dist'));
            expect(selfLink.client).toBe(path.resolve(testRoot, 'dist/client'));
            expect(selfLink.server).toBe(path.resolve(testRoot, 'dist/server'));
            expect(selfLink.clientManifestJson).toBe(
                path.resolve(testRoot, 'dist/client/manifest.json')
            );
            expect(selfLink.serverManifestJson).toBe(
                path.resolve(testRoot, 'dist/server/manifest.json')
            );
        });

        it('should process relative path links', () => {
            // Arrange
            const config: ModuleConfig = {
                links: {
                    'shared-lib': '../shared-lib/dist'
                }
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            const sharedLibLink = result.links['shared-lib'];
            expect(sharedLibLink.name).toBe('shared-lib');
            expect(sharedLibLink.root).toBe('../shared-lib/dist');
            expect(sharedLibLink.client).toBe(
                path.resolve(testRoot, '../shared-lib/dist/client')
            );
            expect(sharedLibLink.server).toBe(
                path.resolve(testRoot, '../shared-lib/dist/server')
            );
        });

        it('should process absolute path links', () => {
            // Arrange
            const absolutePath = '/absolute/path/api-utils/dist';
            const config: ModuleConfig = {
                links: {
                    'api-utils': absolutePath
                }
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            const apiUtilsLink = result.links['api-utils'];
            expect(apiUtilsLink.name).toBe('api-utils');
            expect(apiUtilsLink.root).toBe(absolutePath);
            expect(apiUtilsLink.client).toBe(
                path.resolve(absolutePath, 'client')
            );
            expect(apiUtilsLink.server).toBe(
                path.resolve(absolutePath, 'server')
            );
        });

        it('should handle multiple links', () => {
            // Arrange
            const config: ModuleConfig = {
                links: {
                    lib1: '../lib1/dist',
                    lib2: '/absolute/lib2/dist',
                    lib3: './relative/lib3/dist'
                }
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(Object.keys(result.links)).toHaveLength(4); // 3 + self-link
            expect(result.links).toHaveProperty('lib1');
            expect(result.links).toHaveProperty('lib2');
            expect(result.links).toHaveProperty('lib3');
            expect(result.links).toHaveProperty(testModuleName);
        });
    });

    describe('exports processing', () => {
        describe('default exports', () => {
            it('should add default entry exports', () => {
                // Arrange
                const config: ModuleConfig = {};

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['src/entry.client']).toEqual({
                    name: 'src/entry.client',
                    rewrite: true,
                    inputTarget: {
                        client: './src/entry.client',
                        server: false
                    }
                });

                expect(result.exports['src/entry.server']).toEqual({
                    name: 'src/entry.server',
                    rewrite: true,
                    inputTarget: {
                        client: false,
                        server: './src/entry.server'
                    }
                });
            });
        });

        describe('array format', () => {
            it('should process npm: prefix exports', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: ['npm:axios', 'npm:lodash']
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports.axios).toEqual({
                    name: 'axios',
                    rewrite: false,
                    inputTarget: {
                        client: 'axios',
                        server: 'axios'
                    }
                });

                expect(result.exports.lodash).toEqual({
                    name: 'lodash',
                    rewrite: false,
                    inputTarget: {
                        client: 'lodash',
                        server: 'lodash'
                    }
                });
            });

            it('should process root: prefix exports with file extensions', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: [
                        'root:src/utils/format.ts',
                        'root:src/components/Button.jsx',
                        'root:src/api/client.js'
                    ]
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['src/utils/format']).toEqual({
                    name: 'src/utils/format',
                    rewrite: true,
                    inputTarget: {
                        client: './src/utils/format',
                        server: './src/utils/format'
                    }
                });

                expect(result.exports['src/components/Button']).toEqual({
                    name: 'src/components/Button',
                    rewrite: true,
                    inputTarget: {
                        client: './src/components/Button',
                        server: './src/components/Button'
                    }
                });

                expect(result.exports['src/api/client']).toEqual({
                    name: 'src/api/client',
                    rewrite: true,
                    inputTarget: {
                        client: './src/api/client',
                        server: './src/api/client'
                    }
                });
            });

            it('should handle all supported file extensions', () => {
                // Arrange
                const extensions = [
                    'js',
                    'mjs',
                    'cjs',
                    'jsx',
                    'mjsx',
                    'cjsx',
                    'ts',
                    'mts',
                    'cts',
                    'tsx',
                    'mtsx',
                    'ctsx'
                ];
                const config: ModuleConfig = {
                    exports: extensions.map((ext) => `root:src/test.${ext}`)
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                extensions.forEach((ext) => {
                    expect(result.exports['src/test']).toBeDefined();
                });
            });

            it('should handle object exports in array', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: [
                        'npm:axios',
                        {
                            'custom-api': './src/api/custom.ts',
                            utils: {
                                input: './src/utils/index.ts',
                                rewrite: true
                            }
                        }
                    ]
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['custom-api']).toEqual({
                    name: 'custom-api',
                    rewrite: true,
                    inputTarget: {
                        client: './src/api/custom.ts',
                        server: './src/api/custom.ts'
                    }
                });

                expect(result.exports.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    inputTarget: {
                        client: './src/utils/index.ts',
                        server: './src/utils/index.ts'
                    }
                });
            });

            it('should handle invalid export strings', () => {
                // Arrange
                const consoleSpy = vi
                    .spyOn(console, 'error')
                    .mockImplementation(() => {});
                const config: ModuleConfig = {
                    exports: ['invalid-export', 'another-invalid']
                };

                // Act
                parseModuleConfig(testModuleName, testRoot, config);

                // Assert
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Invalid module export: invalid-export'
                );
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Invalid module export: another-invalid'
                );

                consoleSpy.mockRestore();
            });
        });

        describe('object format', () => {
            it('should process simple string mappings', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        axios: 'axios',
                        utils: './src/utils/index.ts'
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports.axios).toEqual({
                    name: 'axios',
                    rewrite: true,
                    inputTarget: {
                        client: 'axios',
                        server: 'axios'
                    }
                });

                expect(result.exports.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    inputTarget: {
                        client: './src/utils/index.ts',
                        server: './src/utils/index.ts'
                    }
                });
            });

            it('should process complete export objects', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        storage: {
                            inputTarget: {
                                client: './src/storage/indexedDB.ts',
                                server: './src/storage/filesystem.ts'
                            },
                            rewrite: true
                        },
                        'npm-package': {
                            input: 'some-package',
                            rewrite: false
                        }
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports.storage).toEqual({
                    name: 'storage',
                    rewrite: true,
                    inputTarget: {
                        client: './src/storage/indexedDB.ts',
                        server: './src/storage/filesystem.ts'
                    }
                });

                expect(result.exports['npm-package']).toEqual({
                    name: 'npm-package',
                    rewrite: false,
                    inputTarget: {
                        client: 'some-package',
                        server: 'some-package'
                    }
                });
            });

            it('should handle inputTarget with false values', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        'client-only': {
                            inputTarget: {
                                client: './src/client-feature.ts',
                                server: false
                            }
                        },
                        'server-only': {
                            inputTarget: {
                                client: false,
                                server: './src/server-feature.ts'
                            }
                        }
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['client-only']).toEqual({
                    name: 'client-only',
                    rewrite: true,
                    inputTarget: {
                        client: './src/client-feature.ts',
                        server: false
                    }
                });

                expect(result.exports['server-only']).toEqual({
                    name: 'server-only',
                    rewrite: true,
                    inputTarget: {
                        client: false,
                        server: './src/server-feature.ts'
                    }
                });
            });
        });

        describe('mixed configurations', () => {
            it('should handle complex mixed export configuration', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        // Simple string mapping
                        simple: './src/simple.ts',

                        // Complete object with inputTarget
                        complex: {
                            inputTarget: {
                                client: './src/complex.client.ts',
                                server: './src/complex.server.ts'
                            },
                            rewrite: false
                        },

                        // Object with just input
                        'with-input': {
                            input: './src/with-input.ts'
                        },

                        // Object with just rewrite
                        'with-rewrite': {
                            rewrite: false
                        }
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports.simple).toEqual({
                    name: 'simple',
                    rewrite: true,
                    inputTarget: {
                        client: './src/simple.ts',
                        server: './src/simple.ts'
                    }
                });

                expect(result.exports.complex).toEqual({
                    name: 'complex',
                    rewrite: false,
                    inputTarget: {
                        client: './src/complex.client.ts',
                        server: './src/complex.server.ts'
                    }
                });

                expect(result.exports['with-input']).toEqual({
                    name: 'with-input',
                    rewrite: true,
                    inputTarget: {
                        client: './src/with-input.ts',
                        server: './src/with-input.ts'
                    }
                });

                expect(result.exports['with-rewrite']).toEqual({
                    name: 'with-rewrite',
                    rewrite: false,
                    inputTarget: {
                        client: 'with-rewrite',
                        server: 'with-rewrite'
                    }
                });
            });
        });

        describe('default value handling', () => {
            it('should use default rewrite value of true', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        'test-export': {
                            input: './src/test.ts'
                            // rewrite not specified, should default to true
                        }
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['test-export'].rewrite).toBe(true);
            });

            it('should use export name as fallback for input paths', () => {
                // Arrange
                const config: ModuleConfig = {
                    exports: {
                        'fallback-test': {
                            // No input or inputTarget specified
                            rewrite: false
                        }
                    }
                };

                // Act
                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                // Assert
                expect(result.exports['fallback-test'].inputTarget).toEqual({
                    client: 'fallback-test',
                    server: 'fallback-test'
                });
            });
        });
    });

    describe('imports processing', () => {
        it('should pass through imports configuration unchanged', () => {
            // Arrange
            const imports = {
                axios: 'shared-lib/axios',
                lodash: 'shared-lib/lodash',
                'custom-lib': 'api-utils/custom'
            };
            const config: ModuleConfig = { imports };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.imports).toEqual(imports);
        });

        it('should handle empty imports', () => {
            // Arrange
            const config: ModuleConfig = {};

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.imports).toEqual({});
        });

        it('should handle undefined imports', () => {
            // Arrange
            const config: ModuleConfig = {
                links: { test: './test' },
                exports: ['npm:axios']
                // imports intentionally omitted
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.imports).toEqual({});
        });
    });

    describe('edge cases', () => {
        it('should handle empty exports array', () => {
            // Arrange
            const config: ModuleConfig = {
                exports: []
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            // Should still have default exports
            expect(result.exports).toHaveProperty('src/entry.client');
            expect(result.exports).toHaveProperty('src/entry.server');
            expect(Object.keys(result.exports)).toHaveLength(2);
        });

        it('should handle empty exports object', () => {
            // Arrange
            const config: ModuleConfig = {
                exports: {}
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            // Should still have default exports
            expect(result.exports).toHaveProperty('src/entry.client');
            expect(result.exports).toHaveProperty('src/entry.server');
            expect(Object.keys(result.exports)).toHaveLength(2);
        });

        it('should handle null and undefined values gracefully', () => {
            // Arrange
            const config: ModuleConfig = {
                links: undefined,
                imports: undefined,
                exports: undefined
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            expect(result.links).toHaveProperty(testModuleName);
            expect(result.imports).toEqual({});
            expect(result.exports).toHaveProperty('src/entry.client');
            expect(result.exports).toHaveProperty('src/entry.server');
        });

        it('should handle special characters in module names and paths', () => {
            // Arrange
            const specialModuleName = 'test-module_with.special@chars';
            const config: ModuleConfig = {
                links: {
                    'special-lib@1.0.0': '../special-lib/dist'
                },
                exports: {
                    'special_export-name': './src/special.ts'
                }
            };

            // Act
            const result = parseModuleConfig(
                specialModuleName,
                testRoot,
                config
            );

            // Assert
            expect(result.name).toBe(specialModuleName);
            expect(result.links).toHaveProperty('special-lib@1.0.0');
            expect(result.exports).toHaveProperty('special_export-name');
        });
    });

    describe('type safety', () => {
        it('should maintain type safety for ParsedModuleConfig', () => {
            // Arrange
            const config: ModuleConfig = {
                links: { test: './test' },
                imports: { axios: 'test/axios' },
                exports: ['npm:lodash']
            };

            // Act
            const result: ParsedModuleConfig = parseModuleConfig(
                testModuleName,
                testRoot,
                config
            );

            // Assert
            expect(typeof result.name).toBe('string');
            expect(typeof result.root).toBe('string');
            expect(typeof result.links).toBe('object');
            expect(typeof result.imports).toBe('object');
            expect(typeof result.exports).toBe('object');
        });

        it('should maintain type safety for ParsedModuleConfigExport', () => {
            // Arrange
            const config: ModuleConfig = {
                exports: ['npm:axios']
            };

            // Act
            const result = parseModuleConfig(testModuleName, testRoot, config);

            // Assert
            const exportConfig: ParsedModuleConfigExport = result.exports.axios;
            expect(typeof exportConfig.name).toBe('string');
            expect(typeof exportConfig.rewrite).toBe('boolean');
            expect(typeof exportConfig.inputTarget).toBe('object');
            expect(typeof exportConfig.inputTarget.client).toBe('string');
            expect(typeof exportConfig.inputTarget.server).toBe('string');
        });
    });
});
