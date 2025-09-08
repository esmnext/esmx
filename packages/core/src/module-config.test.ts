import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
    type ModuleConfig,
    type ParsedModuleConfig,
    type ParsedModuleConfigExport,
    getEnvironmentImports,
    parseModuleConfig,
    parsedExportValue
} from './module-config';

describe('module-config', () => {
    const testModuleName = 'test-module';
    const testRoot = '/test/root';

    describe('parseModuleConfig', () => {
        it('should parse empty configuration with defaults', () => {
            const config: ModuleConfig = {};

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.environments.client.imports).toEqual({});
            expect(result.environments.server.imports).toEqual({});
            expect(result.links).toHaveProperty(testModuleName);
            expect(result.environments.client.exports).toHaveProperty(
                'src/entry.client'
            );
            expect(result.environments.server.exports).toHaveProperty(
                'src/entry.server'
            );
        });

        it('should parse configuration without config parameter', () => {
            const result = parseModuleConfig(testModuleName, testRoot);

            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.environments.client.imports).toEqual({});
            expect(result.environments.server.imports).toEqual({});
        });

        it('should parse complete configuration', () => {
            const config: ModuleConfig = {
                links: {
                    'shared-lib': '../shared-lib/dist',
                    'api-utils': '/absolute/path/api-utils/dist'
                },
                imports: {
                    axios: 'shared-lib/axios',
                    lodash: 'shared-lib/lodash'
                },
                exports: [
                    {
                        axios: 'axios',
                        'src/utils/format': './src/utils/format.ts',
                        'custom-api': './src/api/custom.ts'
                    }
                ]
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.name).toBe(testModuleName);
            expect(result.root).toBe(testRoot);
            expect(result.environments.client.imports).toEqual(config.imports);
            expect(result.environments.server.imports).toEqual(config.imports);
            expect(result.links).toHaveProperty('shared-lib');
            expect(result.links).toHaveProperty('api-utils');
            expect(result.environments.client.exports).toHaveProperty('axios');
            expect(result.environments.client.exports).toHaveProperty(
                'src/utils/format'
            );
            expect(result.environments.client.exports).toHaveProperty(
                'custom-api'
            );
            expect(result.environments.server.exports).toHaveProperty('axios');
            expect(result.environments.server.exports).toHaveProperty(
                'src/utils/format'
            );
            expect(result.environments.server.exports).toHaveProperty(
                'custom-api'
            );
        });
    });

    describe('links processing', () => {
        it('should create self-link with default dist path', () => {
            const config: ModuleConfig = {};

            const result = parseModuleConfig(testModuleName, testRoot, config);

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
            const config: ModuleConfig = {
                links: {
                    'shared-lib': '../shared-lib/dist'
                }
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

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
            const absolutePath = '/absolute/path/api-utils/dist';
            const config: ModuleConfig = {
                links: {
                    'api-utils': absolutePath
                }
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

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
            const config: ModuleConfig = {
                links: {
                    lib1: '../lib1/dist',
                    lib2: '/absolute/lib2/dist',
                    lib3: './relative/lib3/dist'
                }
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(Object.keys(result.links)).toHaveLength(4);
            expect(result.links).toHaveProperty('lib1');
            expect(result.links).toHaveProperty('lib2');
            expect(result.links).toHaveProperty('lib3');
            expect(result.links).toHaveProperty(testModuleName);
        });
    });

    describe('exports processing', () => {
        describe('default exports', () => {
            it('should add default entry exports', () => {
                const config: ModuleConfig = {};

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(
                    result.environments.client.exports['src/entry.client']
                ).toEqual({
                    name: 'src/entry.client',
                    rewrite: true,
                    file: './src/entry.client'
                });

                expect(
                    result.environments.server.exports['src/entry.server']
                ).toEqual({
                    name: 'src/entry.server',
                    rewrite: true,
                    file: './src/entry.server'
                });
            });
        });

        describe('array format', () => {
            it('should process npm: prefix exports', () => {
                const config: ModuleConfig = {
                    exports: ['npm:axios', 'npm:lodash']
                };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.exports.axios).toEqual({
                    name: 'axios',
                    rewrite: false,
                    file: 'axios'
                });

                expect(result.environments.server.exports.axios).toEqual({
                    name: 'axios',
                    rewrite: false,
                    file: 'axios'
                });

                expect(result.environments.client.exports.lodash).toEqual({
                    name: 'lodash',
                    rewrite: false,
                    file: 'lodash'
                });

                expect(result.environments.server.exports.lodash).toEqual({
                    name: 'lodash',
                    rewrite: false,
                    file: 'lodash'
                });
            });

            it('should process root: prefix exports with file extensions', () => {
                const config: ModuleConfig = {
                    exports: [
                        'root:src/utils/format.ts',
                        'root:src/components/Button.jsx',
                        'root:src/api/client.js'
                    ]
                };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(
                    result.environments.client.exports['src/utils/format']
                ).toEqual({
                    name: 'src/utils/format',
                    rewrite: true,
                    file: './src/utils/format'
                });

                expect(
                    result.environments.server.exports['src/utils/format']
                ).toEqual({
                    name: 'src/utils/format',
                    rewrite: true,
                    file: './src/utils/format'
                });

                expect(
                    result.environments.client.exports['src/components/Button']
                ).toEqual({
                    name: 'src/components/Button',
                    rewrite: true,
                    file: './src/components/Button'
                });

                expect(
                    result.environments.server.exports['src/components/Button']
                ).toEqual({
                    name: 'src/components/Button',
                    rewrite: true,
                    file: './src/components/Button'
                });

                expect(
                    result.environments.client.exports['src/api/client']
                ).toEqual({
                    name: 'src/api/client',
                    rewrite: true,
                    file: './src/api/client'
                });

                expect(
                    result.environments.server.exports['src/api/client']
                ).toEqual({
                    name: 'src/api/client',
                    rewrite: true,
                    file: './src/api/client'
                });
            });

            it('should handle all supported file extensions', () => {
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

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                extensions.forEach((ext) => {
                    expect(
                        result.environments.client.exports['src/test']
                    ).toBeDefined();
                    expect(
                        result.environments.server.exports['src/test']
                    ).toBeDefined();
                });
            });

            it('should handle object exports in array', () => {
                const config: ModuleConfig = {
                    exports: [
                        'npm:axios',
                        {
                            'custom-api': './src/api/custom.ts',
                            utils: {
                                file: './src/utils/index.ts',
                                rewrite: true
                            }
                        }
                    ]
                };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(
                    result.environments.client.exports['custom-api']
                ).toEqual({
                    name: 'custom-api',
                    rewrite: true,
                    file: './src/api/custom.ts'
                });

                expect(
                    result.environments.server.exports['custom-api']
                ).toEqual({
                    name: 'custom-api',
                    rewrite: true,
                    file: './src/api/custom.ts'
                });

                expect(result.environments.client.exports.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    file: './src/utils/index.ts'
                });

                expect(result.environments.server.exports.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    file: './src/utils/index.ts'
                });
            });

            it('should handle invalid export strings', () => {
                const config: ModuleConfig = {
                    exports: ['invalid-export', 'another-invalid']
                };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(
                    result.environments.client.exports['invalid-export']
                ).toEqual({
                    name: 'invalid-export',
                    rewrite: true,
                    file: 'invalid-export'
                });
                expect(
                    result.environments.server.exports['another-invalid']
                ).toEqual({
                    name: 'another-invalid',
                    rewrite: true,
                    file: 'another-invalid'
                });
            });
        });

        describe('mixed configurations', () => {
            it('should handle complex mixed export configuration', () => {
                const config: ModuleConfig = {
                    exports: [
                        'npm:react',
                        'npm:lodash',
                        {
                            utils: 'root:src/utils/index.ts',
                            components: {
                                file: './src/components/index.ts',
                                rewrite: true
                            },
                            api: {
                                files: {
                                    client: './src/api/client.ts',
                                    server: './src/api/server.ts'
                                }
                            }
                        }
                    ]
                };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.exports).toHaveProperty(
                    'react'
                );
                expect(result.environments.client.exports).toHaveProperty(
                    'lodash'
                );
                expect(result.environments.client.exports).toHaveProperty(
                    'utils'
                );
                expect(result.environments.client.exports).toHaveProperty(
                    'components'
                );
                expect(result.environments.client.exports).toHaveProperty(
                    'api'
                );

                expect(result.environments.client.exports.react.rewrite).toBe(
                    false
                );
                expect(result.environments.client.exports.utils.rewrite).toBe(
                    true
                );
                expect(
                    result.environments.client.exports.components.rewrite
                ).toBe(true);
            });
        });
    });

    describe('imports processing', () => {
        it('should handle environment-specific import mappings correctly', () => {
            const config: ModuleConfig = {
                imports: {
                    storage: {
                        client: 'client-storage',
                        server: 'server-storage'
                    },
                    lodash: 'shared-lib/lodash'
                }
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.environments.client.imports.storage).toBe(
                'client-storage'
            );
            expect(result.environments.client.imports.lodash).toBe(
                'shared-lib/lodash'
            );
            expect(result.environments.server.imports.storage).toBe(
                'server-storage'
            );
            expect(result.environments.server.imports.lodash).toBe(
                'shared-lib/lodash'
            );
        });

        it('should pass through imports configuration unchanged', () => {
            const imports = {
                axios: 'shared-lib/axios',
                lodash: 'shared-lib/lodash',
                'custom-lib': 'api-utils/custom'
            };
            const config: ModuleConfig = { imports };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.environments.client.imports).toEqual(imports);
            expect(result.environments.server.imports).toEqual(imports);
        });

        it('should handle empty imports', () => {
            const config: ModuleConfig = {};

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.environments.client.imports).toEqual({});
            expect(result.environments.server.imports).toEqual({});
        });

        it('should handle undefined imports', () => {
            const config: ModuleConfig = {
                links: { test: './test' },
                exports: ['npm:axios']
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.environments.client.imports).toEqual({});
            expect(result.environments.server.imports).toEqual({});
        });

        describe('environment-specific imports', () => {
            it('should handle simple string imports for all environments', () => {
                const imports = {
                    axios: 'shared-lib/axios',
                    lodash: 'shared-lib/lodash'
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual(imports);
                expect(result.environments.server.imports).toEqual(imports);
            });

            it('should handle environment-specific imports', () => {
                const imports = {
                    axios: {
                        client: 'client-libs/axios',
                        server: 'server-libs/axios'
                    },
                    'client-only': {
                        client: 'client-specific/lib',
                        server: 'server-specific/lib'
                    },
                    'server-only': {
                        client: 'client-specific/lib',
                        server: 'server-specific/lib'
                    }
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual({
                    axios: 'client-libs/axios',
                    'client-only': 'client-specific/lib',
                    'server-only': 'client-specific/lib'
                });
                expect(result.environments.server.imports).toEqual({
                    axios: 'server-libs/axios',
                    'client-only': 'server-specific/lib',
                    'server-only': 'server-specific/lib'
                });
            });

            it('should handle mixed simple and environment-specific imports', () => {
                const imports = {
                    lodash: 'shared-lib/lodash',
                    axios: {
                        client: 'client-libs/axios',
                        server: 'server-libs/axios'
                    },
                    'client-specific': {
                        client: 'client-only/lib',
                        server: 'server-only/lib'
                    }
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual({
                    lodash: 'shared-lib/lodash',
                    axios: 'client-libs/axios',
                    'client-specific': 'client-only/lib'
                });
                expect(result.environments.server.imports).toEqual({
                    lodash: 'shared-lib/lodash',
                    axios: 'server-libs/axios',
                    'client-specific': 'server-only/lib'
                });
            });

            it('should handle imports with only some environments defined', () => {
                const imports = {
                    'partial-config': {
                        client: 'client/path',
                        server: 'server/path'
                    },
                    'another-partial': {
                        client: 'client/path',
                        server: 'server/path'
                    }
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual({
                    'partial-config': 'client/path',
                    'another-partial': 'client/path'
                });
                expect(result.environments.server.imports).toEqual({
                    'partial-config': 'server/path',
                    'another-partial': 'server/path'
                });
            });

            it('should handle imports with undefined values for specific environments', () => {
                const imports = {
                    'explicit-undefined': {
                        client: 'client/path',
                        server: 'server/path'
                    },
                    'implicit-undefined': {
                        client: 'client/path',
                        server: 'server/path'
                    }
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual({
                    'explicit-undefined': 'client/path',
                    'implicit-undefined': 'client/path'
                });
                expect(result.environments.server.imports).toEqual({
                    'explicit-undefined': 'server/path',
                    'implicit-undefined': 'server/path'
                });
            });

            it('should handle complex environment-specific import scenarios', () => {
                const imports = {
                    lodash: 'shared-lib/lodash',
                    storage: {
                        client: 'client-storage/index',
                        server: 'server-storage/index'
                    },
                    'dom-utils': {
                        client: 'client-utils/dom',
                        server: 'server-utils/dom'
                    },
                    'db-utils': {
                        client: 'client-utils/db',
                        server: 'server-utils/db'
                    },
                    'api-client': {
                        client: 'client/api/browser',
                        server: 'server/api/node'
                    }
                };
                const config: ModuleConfig = { imports };

                const result = parseModuleConfig(
                    testModuleName,
                    testRoot,
                    config
                );

                expect(result.environments.client.imports).toEqual({
                    lodash: 'shared-lib/lodash',
                    storage: 'client-storage/index',
                    'dom-utils': 'client-utils/dom',
                    'db-utils': 'client-utils/db',
                    'api-client': 'client/api/browser'
                });
                expect(result.environments.server.imports).toEqual({
                    lodash: 'shared-lib/lodash',
                    storage: 'server-storage/index',
                    'dom-utils': 'server-utils/dom',
                    'db-utils': 'server-utils/db',
                    'api-client': 'server/api/node'
                });
            });
        });
    });

    describe('getEnvironmentImports function', () => {
        it('should handle empty imports', () => {
            const result = getEnvironmentImports('client', {});
            expect(result).toEqual({});
        });

        it('should handle undefined imports', () => {
            const result = getEnvironmentImports('client');
            expect(result).toEqual({});
        });

        it('should handle simple string imports', () => {
            const imports = {
                axios: 'shared-lib/axios',
                lodash: 'shared-lib/lodash'
            };
            const result = getEnvironmentImports('client', imports);
            expect(result).toEqual(imports);
        });

        it('should handle environment-specific imports', () => {
            const imports = {
                axios: {
                    client: 'client-libs/axios',
                    server: 'server-libs/axios'
                }
            };
            const clientResult = getEnvironmentImports('client', imports);
            const serverResult = getEnvironmentImports('server', imports);

            expect(clientResult).toEqual({ axios: 'client-libs/axios' });
            expect(serverResult).toEqual({ axios: 'server-libs/axios' });
        });

        it('should handle mixed imports', () => {
            const imports = {
                lodash: 'shared-lib/lodash',
                axios: {
                    client: 'client-libs/axios',
                    server: 'server-libs/axios'
                }
            };
            const clientResult = getEnvironmentImports('client', imports);
            const serverResult = getEnvironmentImports('server', imports);

            expect(clientResult).toEqual({
                lodash: 'shared-lib/lodash',
                axios: 'client-libs/axios'
            });
            expect(serverResult).toEqual({
                lodash: 'shared-lib/lodash',
                axios: 'server-libs/axios'
            });
        });

        it('should handle imports with missing environment keys', () => {
            const imports = {
                'client-only': {
                    client: 'client/path',
                    server: 'server/path'
                },
                'server-only': {
                    client: 'client/path',
                    server: 'server/path'
                },
                both: {
                    client: 'client/path',
                    server: 'server/path'
                }
            };
            const clientResult = getEnvironmentImports('client', imports);
            const serverResult = getEnvironmentImports('server', imports);

            expect(clientResult).toEqual({
                'client-only': 'client/path',
                'server-only': 'client/path',
                both: 'client/path'
            });
            expect(serverResult).toEqual({
                'client-only': 'server/path',
                'server-only': 'server/path',
                both: 'server/path'
            });
        });

        it('should handle imports with undefined values', () => {
            const imports = {
                'explicit-undefined': {
                    client: 'client/path',
                    server: 'server/path'
                },
                'implicit-undefined': {
                    client: 'client/path',
                    server: 'server/path'
                }
            };
            const clientResult = getEnvironmentImports('client', imports);
            const serverResult = getEnvironmentImports('server', imports);

            expect(clientResult).toEqual({
                'explicit-undefined': 'client/path',
                'implicit-undefined': 'client/path'
            });
            expect(serverResult).toEqual({
                'explicit-undefined': 'server/path',
                'implicit-undefined': 'server/path'
            });
        });

        it('should handle imports with all undefined values', () => {
            const imports = {
                'all-undefined': {
                    client: 'client/path',
                    server: 'server/path'
                }
            };
            const clientResult = getEnvironmentImports('client', imports);
            const serverResult = getEnvironmentImports('server', imports);

            expect(clientResult).toEqual({
                'all-undefined': 'client/path'
            });
            expect(serverResult).toEqual({
                'all-undefined': 'server/path'
            });
        });
    });

    describe('edge cases', () => {
        it('should handle empty exports array', () => {
            const config: ModuleConfig = {
                exports: []
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.environments.client.exports).toHaveProperty(
                'src/entry.client'
            );
            expect(result.environments.server.exports).toHaveProperty(
                'src/entry.server'
            );
            expect(
                Object.keys(result.environments.client.exports)
            ).toHaveLength(1);
            expect(
                Object.keys(result.environments.server.exports)
            ).toHaveLength(1);
        });

        it('should handle null and undefined values gracefully', () => {
            const config: ModuleConfig = {
                links: undefined,
                imports: undefined,
                exports: undefined
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            expect(result.links).toHaveProperty(testModuleName);
            expect(result.environments.client.imports).toEqual({});
            expect(result.environments.server.imports).toEqual({});
            expect(result.environments.client.exports).toHaveProperty(
                'src/entry.client'
            );
            expect(result.environments.server.exports).toHaveProperty(
                'src/entry.server'
            );
        });
    });

    describe('real-world usage scenarios', () => {
        it('should handle complex project structure with mixed configurations', () => {
            const config: ModuleConfig = {
                links: {
                    'ui-components': '../../packages/ui-components/dist',
                    'api-client': '/external/api-client/dist'
                },
                imports: {
                    react: 'ui-components/react',
                    axios: {
                        client: 'ui-components/axios-browser',
                        server: 'api-client/axios-node'
                    }
                },
                exports: [
                    'npm:react',
                    'npm:react-dom',
                    {
                        components: 'root:src/components/index.ts',
                        hooks: {
                            file: './src/hooks/index.ts',
                            rewrite: true
                        },
                        api: {
                            files: {
                                client: './src/api/client.ts',
                                server: './src/api/server.ts'
                            }
                        }
                    }
                ]
            };

            const result = parseModuleConfig('my-app', '/path/to/app', config);

            expect(result.links).toHaveProperty('ui-components');
            expect(result.links).toHaveProperty('api-client');
            expect(result.links).toHaveProperty('my-app');

            expect(result.environments.client.imports.react).toBe(
                'ui-components/react'
            );
            expect(result.environments.client.imports.axios).toBe(
                'ui-components/axios-browser'
            );
            expect(result.environments.server.imports.axios).toBe(
                'api-client/axios-node'
            );

            expect(result.environments.client.exports).toHaveProperty('react');
            expect(result.environments.client.exports).toHaveProperty(
                'react-dom'
            );
            expect(result.environments.client.exports).toHaveProperty(
                'components'
            );
            expect(result.environments.client.exports).toHaveProperty('hooks');
            expect(result.environments.client.exports).toHaveProperty('api');

            expect(result.environments.client.exports.react.rewrite).toBe(
                false
            );
            expect(result.environments.client.exports.components.rewrite).toBe(
                true
            );
            expect(result.environments.client.exports.hooks.rewrite).toBe(true);

            expect(result.environments.client.exports.api.file).toBe(
                './src/api/client.ts'
            );
            expect(result.environments.server.exports.api.file).toBe(
                './src/api/server.ts'
            );
        });

        it('should handle library development with multiple entry points', () => {
            const config: ModuleConfig = {
                exports: [
                    'npm:lodash',
                    'npm:axios',
                    {
                        index: './src/index.ts',
                        utils: {
                            file: './src/utils/index.ts',
                            rewrite: false
                        },
                        types: {
                            file: './src/types/index.ts',
                            rewrite: false
                        },
                        constants: {
                            file: './src/constants.ts',
                            rewrite: true
                        }
                    }
                ]
            };

            const result = parseModuleConfig(
                'my-library',
                '/libs/my-lib',
                config
            );

            expect(result.environments.client.exports).toHaveProperty('lodash');
            expect(result.environments.client.exports).toHaveProperty('axios');
            expect(result.environments.client.exports).toHaveProperty('index');
            expect(result.environments.client.exports).toHaveProperty('utils');
            expect(result.environments.client.exports).toHaveProperty('types');
            expect(result.environments.client.exports).toHaveProperty(
                'constants'
            );

            expect(result.environments.client.exports.lodash.rewrite).toBe(
                false
            );
            expect(result.environments.client.exports.axios.rewrite).toBe(
                false
            );
            expect(result.environments.client.exports.index.rewrite).toBe(true);
            expect(result.environments.client.exports.utils.rewrite).toBe(
                false
            );
            expect(result.environments.client.exports.types.rewrite).toBe(
                false
            );
            expect(result.environments.client.exports.constants.rewrite).toBe(
                true
            );
        });
    });

    describe('type safety', () => {
        it('should maintain type safety for ParsedModuleConfig', () => {
            const config: ModuleConfig = {
                links: { test: './test' },
                imports: { axios: 'test/axios' },
                exports: ['npm:lodash']
            };

            const result: ParsedModuleConfig = parseModuleConfig(
                testModuleName,
                testRoot,
                config
            );

            expect(typeof result.name).toBe('string');
            expect(typeof result.root).toBe('string');
            expect(typeof result.links).toBe('object');
            expect(typeof result.environments.client.imports).toBe('object');
            expect(typeof result.environments.server.imports).toBe('object');
            expect(typeof result.environments.client.exports).toBe('object');
            expect(typeof result.environments.server.exports).toBe('object');
        });

        it('should maintain type safety for ParsedModuleConfigExport', () => {
            const config: ModuleConfig = {
                exports: ['npm:axios']
            };

            const result = parseModuleConfig(testModuleName, testRoot, config);

            const exportConfig: ParsedModuleConfigExport =
                result.environments.client.exports.axios;
            expect(typeof exportConfig.name).toBe('string');
            expect(typeof exportConfig.rewrite).toBe('boolean');
            expect(typeof exportConfig.file).toBe('string');
        });
    });

    describe('parsedExportValue function', () => {
        it('should parse npm: prefix exports', () => {
            const result = parsedExportValue('npm:axios');
            expect(result).toEqual({
                name: 'axios',
                rewrite: false,
                file: 'axios'
            });
        });

        it('should parse root: prefix exports with file extensions', () => {
            const result = parsedExportValue('root:src/utils/format.ts');
            expect(result).toEqual({
                name: 'src/utils/format',
                rewrite: true,
                file: './src/utils/format'
            });
        });

        it('should parse root: prefix exports with various extensions', () => {
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

            extensions.forEach((ext) => {
                const result = parsedExportValue(`root:src/test.${ext}`);
                expect(result).toEqual({
                    name: 'src/test',
                    rewrite: true,
                    file: './src/test'
                });
            });
        });

        it('should handle root: prefix exports without extensions', () => {
            const result = parsedExportValue('root:src/utils/format');
            expect(result).toEqual({
                name: 'src/utils/format',
                rewrite: true,
                file: './src/utils/format'
            });
        });

        it('should handle invalid export strings by returning file object', () => {
            const result = parsedExportValue('invalid-export');
            expect(result).toEqual({
                name: 'invalid-export',
                rewrite: true,
                file: 'invalid-export'
            });
        });

        it('should handle complex file paths with root: prefix', () => {
            const result = parsedExportValue(
                'root:src/components/nested/Button.tsx'
            );
            expect(result).toEqual({
                name: 'src/components/nested/Button',
                rewrite: true,
                file: './src/components/nested/Button'
            });
        });

        it('should handle npm packages with scopes', () => {
            const result = parsedExportValue('npm:@babel/core');
            expect(result).toEqual({
                name: '@babel/core',
                rewrite: false,
                file: '@babel/core'
            });
        });

        it('should handle npm packages with versions', () => {
            const result = parsedExportValue('npm:lodash@4.17.21');
            expect(result).toEqual({
                name: 'lodash@4.17.21',
                rewrite: false,
                file: 'lodash@4.17.21'
            });
        });
    });
});
