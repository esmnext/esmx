import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ModuleConfig, ModuleConfigExportObject } from './module-config';
import {
    createDefaultExports,
    getEnvironmentExports,
    getEnvironmentImports,
    getEnvironmentScopes,
    getEnvironments,
    getLinks,
    parseModuleConfig,
    parsedExportValue,
    processExportArray,
    processObjectExport,
    processStringExport,
    resolveExportFile
} from './module-config';

describe('Module Config Functions', () => {
    describe('Independent Functions', () => {
        describe('parsedExportValue', () => {
            describe('npm prefix handling', () => {
                it('should parse basic npm package', () => {
                    const result = parsedExportValue('npm:axios');
                    expect(result).toEqual({
                        name: 'axios',
                        rewrite: false,
                        file: 'axios'
                    });
                });

                it('should parse scoped npm package', () => {
                    const result = parsedExportValue('npm:@babel/core');
                    expect(result).toEqual({
                        name: '@babel/core',
                        rewrite: false,
                        file: '@babel/core'
                    });
                });

                it('should parse npm package with version', () => {
                    const result = parsedExportValue('npm:lodash@4.17.21');
                    expect(result).toEqual({
                        name: 'lodash@4.17.21',
                        rewrite: false,
                        file: 'lodash@4.17.21'
                    });
                });

                it('should handle npm package with special characters', () => {
                    const result = parsedExportValue(
                        'npm:package_name-123.test'
                    );
                    expect(result).toEqual({
                        name: 'package_name-123.test',
                        rewrite: false,
                        file: 'package_name-123.test'
                    });
                });
            });

            describe('root prefix handling', () => {
                it('should parse root file with TypeScript extension', () => {
                    const result = parsedExportValue(
                        'root:src/utils/format.ts'
                    );
                    expect(result).toEqual({
                        name: 'src/utils/format',
                        rewrite: true,
                        file: './src/utils/format'
                    });
                });

                it('should parse root file with JavaScript extension', () => {
                    const result = parsedExportValue(
                        'root:src/components/Button.jsx'
                    );
                    expect(result).toEqual({
                        name: 'src/components/Button',
                        rewrite: true,
                        file: './src/components/Button'
                    });
                });

                it('should parse deeply nested root file', () => {
                    const result = parsedExportValue(
                        'root:src/deep/nested/very/deep/file.ts'
                    );
                    expect(result).toEqual({
                        name: 'src/deep/nested/very/deep/file',
                        rewrite: true,
                        file: './src/deep/nested/very/deep/file'
                    });
                });

                it.each([
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
                ])('should handle %s extension correctly', (ext) => {
                    const result = parsedExportValue(`root:src/test.${ext}`);
                    expect(result.name).toBe('src/test');
                    expect(result.rewrite).toBe(true);
                    expect(result.file).toBe('./src/test');
                });
            });

            describe('fallback handling', () => {
                it('should handle plain relative path', () => {
                    const result = parsedExportValue('./src/custom.ts');
                    expect(result).toEqual({
                        name: './src/custom.ts',
                        rewrite: true,
                        file: './src/custom.ts'
                    });
                });

                it('should handle plain absolute path', () => {
                    const result = parsedExportValue('/absolute/path/file.js');
                    expect(result).toEqual({
                        name: '/absolute/path/file.js',
                        rewrite: true,
                        file: '/absolute/path/file.js'
                    });
                });

                it('should handle invalid prefix gracefully', () => {
                    const result = parsedExportValue('invalid:prefix:value');
                    expect(result).toEqual({
                        name: 'invalid:prefix:value',
                        rewrite: true,
                        file: 'invalid:prefix:value'
                    });
                });

                it('should handle empty string', () => {
                    const result = parsedExportValue('');
                    expect(result).toEqual({
                        name: '',
                        rewrite: true,
                        file: ''
                    });
                });
            });
        });

        describe('resolveExportFile', () => {
            describe('files configuration priority', () => {
                it('should use client file when specified', () => {
                    const config: ModuleConfigExportObject = {
                        files: {
                            client: './src/client.ts',
                            server: './src/server.ts'
                        }
                    };
                    const result = resolveExportFile(
                        config,
                        'client',
                        'fallback'
                    );
                    expect(result).toBe('./src/client.ts');
                });

                it('should use server file when specified', () => {
                    const config: ModuleConfigExportObject = {
                        files: {
                            client: './src/client.ts',
                            server: './src/server.ts'
                        }
                    };
                    const result = resolveExportFile(
                        config,
                        'server',
                        'fallback'
                    );
                    expect(result).toBe('./src/server.ts');
                });

                it('should return empty string when client file is false', () => {
                    const config: ModuleConfigExportObject = {
                        files: { client: false, server: './src/server.ts' }
                    };
                    const result = resolveExportFile(
                        config,
                        'client',
                        'fallback'
                    );
                    expect(result).toBe('');
                });

                it('should return empty string when server file is false', () => {
                    const config: ModuleConfigExportObject = {
                        files: { client: './src/client.ts', server: false }
                    };
                    const result = resolveExportFile(
                        config,
                        'server',
                        'fallback'
                    );
                    expect(result).toBe('');
                });
            });

            describe('file fallback priority', () => {
                it('should use file property when no files specified', () => {
                    const config: ModuleConfigExportObject = {
                        file: './src/index.ts'
                    };
                    const result = resolveExportFile(
                        config,
                        'client',
                        'fallback'
                    );
                    expect(result).toBe('./src/index.ts');
                });

                it('should use name as fallback when no file specified', () => {
                    const config: ModuleConfigExportObject = {};
                    const result = resolveExportFile(
                        config,
                        'client',
                        'my-export'
                    );
                    expect(result).toBe('my-export');
                });

                it('should prioritize files over file property', () => {
                    const config: ModuleConfigExportObject = {
                        file: './src/index.ts',
                        files: {
                            client: './src/client.ts',
                            server: './src/server.ts'
                        }
                    };
                    const result = resolveExportFile(
                        config,
                        'client',
                        'fallback'
                    );
                    expect(result).toBe('./src/client.ts');
                });
            });

            describe('edge cases', () => {
                it('should handle undefined files object', () => {
                    const config: ModuleConfigExportObject = {
                        file: './src/index.ts'
                    };
                    const result = resolveExportFile(
                        config,
                        'client',
                        'fallback'
                    );
                    expect(result).toBe('./src/index.ts');
                });

                it('should handle empty config object', () => {
                    const config: ModuleConfigExportObject = {};
                    const result = resolveExportFile(
                        config,
                        'client',
                        'my-export'
                    );
                    expect(result).toBe('my-export');
                });
            });
        });

        describe('createDefaultExports', () => {
            describe('client environment', () => {
                it('should create client default exports', () => {
                    const result = createDefaultExports('client');

                    expect(result).toHaveProperty('src/entry.client');
                    expect(result).toHaveProperty('src/entry.server');

                    expect(result['src/entry.client']).toEqual({
                        name: 'src/entry.client',
                        file: './src/entry.client',
                        rewrite: true
                    });

                    expect(result['src/entry.server']).toEqual({
                        name: 'src/entry.server',
                        file: '',
                        rewrite: true
                    });
                });
            });

            describe('server environment', () => {
                it('should create server default exports', () => {
                    const result = createDefaultExports('server');

                    expect(result).toHaveProperty('src/entry.client');
                    expect(result).toHaveProperty('src/entry.server');

                    expect(result['src/entry.client']).toEqual({
                        name: 'src/entry.client',
                        file: '',
                        rewrite: true
                    });

                    expect(result['src/entry.server']).toEqual({
                        name: 'src/entry.server',
                        file: './src/entry.server',
                        rewrite: true
                    });
                });
            });

            describe('consistency', () => {
                it('should return consistent results for same environment', () => {
                    const result1 = createDefaultExports('client');
                    const result2 = createDefaultExports('client');

                    expect(result1).toEqual(result2);
                });

                it('should return different results for different environments', () => {
                    const clientResult = createDefaultExports('client');
                    const serverResult = createDefaultExports('server');

                    expect(clientResult['src/entry.client'].file).toBe(
                        './src/entry.client'
                    );
                    expect(serverResult['src/entry.client'].file).toBe('');

                    expect(clientResult['src/entry.server'].file).toBe('');
                    expect(serverResult['src/entry.server'].file).toBe(
                        './src/entry.server'
                    );
                });
            });
        });

        describe('getEnvironmentImports', () => {
            describe('simple string imports', () => {
                it('should return simple string imports unchanged', () => {
                    const imports = {
                        axios: 'shared-lib/axios',
                        lodash: 'shared-lib/lodash'
                    };
                    const result = getEnvironmentImports('client', imports);
                    expect(result).toEqual(imports);
                });

                it('should handle empty imports object', () => {
                    const result = getEnvironmentImports('client', {});
                    expect(result).toEqual({});
                });

                it('should handle undefined imports', () => {
                    const result = getEnvironmentImports('client');
                    expect(result).toEqual({});
                });
            });

            describe('environment-specific imports', () => {
                it('should select client environment value', () => {
                    const imports = {
                        axios: {
                            client: 'client-libs/axios',
                            server: 'server-libs/axios'
                        }
                    };
                    const result = getEnvironmentImports('client', imports);
                    expect(result).toEqual({ axios: 'client-libs/axios' });
                });

                it('should select server environment value', () => {
                    const imports = {
                        axios: {
                            client: 'client-libs/axios',
                            server: 'server-libs/axios'
                        }
                    };
                    const result = getEnvironmentImports('server', imports);
                    expect(result).toEqual({ axios: 'server-libs/axios' });
                });

                it('should skip imports without current environment', () => {
                    const imports = {
                        axios: {
                            client: 'client-libs/axios',
                            server: 'server-libs/axios'
                        }
                    };
                    const result = getEnvironmentImports('server', imports);
                    expect(result).toEqual({ axios: 'server-libs/axios' });
                });
            });

            describe('mixed imports', () => {
                it('should handle mixed simple and environment-specific imports', () => {
                    const imports = {
                        lodash: 'shared-lib/lodash',
                        axios: {
                            client: 'client-libs/axios',
                            server: 'server-libs/axios'
                        }
                    };

                    const clientResult = getEnvironmentImports(
                        'client',
                        imports
                    );
                    const serverResult = getEnvironmentImports(
                        'server',
                        imports
                    );

                    expect(clientResult).toEqual({
                        lodash: 'shared-lib/lodash',
                        axios: 'client-libs/axios'
                    });

                    expect(serverResult).toEqual({
                        lodash: 'shared-lib/lodash',
                        axios: 'server-libs/axios'
                    });
                });
            });
        });

        describe('getLinks', () => {
            describe('self-link creation', () => {
                it('should create self-link with default dist path', () => {
                    const result = getLinks('my-app', '/app', {});

                    expect(result).toHaveProperty('my-app');
                    expect(result['my-app']).toEqual({
                        name: 'my-app',
                        root: path.resolve('/app', 'dist'),
                        client: path.resolve('/app', 'dist/client'),
                        server: path.resolve('/app', 'dist/server'),
                        clientManifestJson: path.resolve(
                            '/app',
                            'dist/client/manifest.json'
                        ),
                        serverManifestJson: path.resolve(
                            '/app',
                            'dist/server/manifest.json'
                        )
                    });
                });

                it('should handle empty module name', () => {
                    const result = getLinks('', '/app', {});
                    expect(result).toHaveProperty('');
                    expect(result[''].name).toBe('');
                });

                it('should handle empty root path', () => {
                    const result = getLinks('my-app', '', {});
                    expect(result['my-app'].root).toBe(
                        path.resolve('', 'dist')
                    );
                });
            });

            describe('relative path links', () => {
                it('should resolve relative path links', () => {
                    const result = getLinks('my-app', '/app', {
                        links: { shared: '../shared/dist' }
                    });

                    expect(result.shared.root).toBe('../shared/dist');
                    expect(result.shared.client).toBe(
                        path.resolve('/app', '../shared/dist/client')
                    );
                    expect(result.shared.server).toBe(
                        path.resolve('/app', '../shared/dist/server')
                    );
                });

                it('should handle current directory relative path', () => {
                    const result = getLinks('my-app', '/app', {
                        links: { local: './local/dist' }
                    });

                    expect(result.local.root).toBe('./local/dist');
                    expect(result.local.client).toBe(
                        path.resolve('/app', './local/dist/client')
                    );
                });
            });

            describe('absolute path links', () => {
                it('should preserve absolute path links', () => {
                    const result = getLinks('my-app', '/app', {
                        links: { external: '/external/dist' }
                    });

                    expect(result.external.root).toBe('/external/dist');
                    expect(result.external.client).toBe(
                        path.resolve('/external/dist', 'client')
                    );
                    expect(result.external.server).toBe(
                        path.resolve('/external/dist', 'server')
                    );
                });
            });

            describe('multiple links', () => {
                it('should handle multiple links with different path types', () => {
                    const result = getLinks('my-app', '/app', {
                        links: {
                            relative: '../shared/dist',
                            absolute: '/external/dist',
                            current: './local/dist'
                        }
                    });

                    expect(Object.keys(result)).toHaveLength(4);
                    expect(result).toHaveProperty('relative');
                    expect(result).toHaveProperty('absolute');
                    expect(result).toHaveProperty('current');
                    expect(result).toHaveProperty('my-app');
                });
            });
        });
    });

    describe('Light Dependency Functions', () => {
        describe('processStringExport', () => {
            it('should process npm package export', () => {
                const result = processStringExport('npm:axios');

                expect(result).toEqual({
                    axios: {
                        name: 'axios',
                        rewrite: false,
                        file: 'axios'
                    }
                });
            });

            it('should process root file export', () => {
                const result = processStringExport('root:src/utils/format.ts');

                expect(result).toEqual({
                    'src/utils/format': {
                        name: 'src/utils/format',
                        rewrite: true,
                        file: './src/utils/format'
                    }
                });
            });

            it('should handle empty string export', () => {
                const result = processStringExport('');

                expect(result).toEqual({
                    '': {
                        name: '',
                        rewrite: true,
                        file: ''
                    }
                });
            });
        });

        describe('processObjectExport', () => {
            describe('string value handling', () => {
                it('should process string export value', () => {
                    const exportObject = {
                        custom: './src/custom.ts'
                    };

                    const result = processObjectExport(exportObject, 'client');

                    expect(result.custom).toEqual({
                        name: 'custom',
                        rewrite: true,
                        file: './src/custom.ts'
                    });
                });
            });

            describe('object configuration handling', () => {
                it('should process object export configuration', () => {
                    const exportObject = {
                        api: {
                            file: './src/api/index.ts',
                            files: {
                                client: './src/api/client.ts',
                                server: './src/api/server.ts'
                            }
                        }
                    };

                    const result = processObjectExport(exportObject, 'client');

                    expect(result.api).toEqual({
                        name: 'api',
                        rewrite: true,
                        file: './src/api/client.ts'
                    });
                });

                it('should handle rewrite override', () => {
                    const exportObject = {
                        utils: {
                            file: './src/utils.ts',
                            rewrite: false
                        }
                    };

                    const result = processObjectExport(exportObject, 'client');

                    expect(result.utils.rewrite).toBe(false);
                });
            });
        });

        describe('processExportArray', () => {
            it('should process string exports', () => {
                const exportArray = ['npm:axios'];
                const result = processExportArray(exportArray, 'client');

                expect(result).toHaveProperty('axios');
                expect(result.axios).toEqual({
                    name: 'axios',
                    rewrite: false,
                    file: 'axios'
                });
            });

            it('should process object exports', () => {
                const exportArray = [
                    {
                        utils: './src/utils/index.ts'
                    }
                ];

                const result = processExportArray(exportArray, 'client');

                expect(result).toHaveProperty('utils');
                expect(result.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    file: './src/utils/index.ts'
                });
            });

            it('should merge multiple exports', () => {
                const exportArray = [
                    'npm:axios',
                    'npm:react',
                    { utils: './src/utils/index.ts' }
                ];

                const result = processExportArray(exportArray, 'client');

                expect(result).toHaveProperty('axios');
                expect(result).toHaveProperty('react');
                expect(result).toHaveProperty('utils');
            });

            it('should handle empty array', () => {
                const result = processExportArray([], 'client');
                expect(result).toEqual({});
            });
        });

        describe('getEnvironmentExports', () => {
            it('should combine default and user exports', () => {
                const config: ModuleConfig = {
                    exports: ['npm:axios', { utils: './src/utils/index.ts' }]
                };

                const result = getEnvironmentExports(config, 'client');

                expect(result).toHaveProperty('src/entry.client');
                expect(result).toHaveProperty('src/entry.server');
                expect(result).toHaveProperty('axios');
                expect(result).toHaveProperty('utils');

                expect(result.axios).toEqual({
                    name: 'axios',
                    rewrite: false,
                    file: 'axios'
                });

                expect(result.utils).toEqual({
                    name: 'utils',
                    rewrite: true,
                    file: './src/utils/index.ts'
                });
            });

            it('should handle config without exports', () => {
                const config: ModuleConfig = {};
                const result = getEnvironmentExports(config, 'client');

                expect(result).toHaveProperty('src/entry.client');
                expect(result).toHaveProperty('src/entry.server');
                expect(result).not.toHaveProperty('axios');
            });
        });

        describe('getEnvironmentScopes', () => {
            it('should process scope imports for environment', () => {
                const scopes = {
                    shared: {
                        axios: 'shared-lib/axios',
                        lodash: {
                            client: 'client-lib/lodash',
                            server: 'server-lib/lodash'
                        }
                    }
                };

                const result = getEnvironmentScopes('client', scopes);

                expect(result).toEqual({
                    shared: {
                        axios: 'shared-lib/axios',
                        lodash: 'client-lib/lodash'
                    }
                });
            });

            it('should handle multiple scopes', () => {
                const scopes = {
                    shared: { axios: 'shared-lib/axios' },
                    ui: { react: 'ui-lib/react' }
                };

                const result = getEnvironmentScopes('client', scopes);

                expect(result).toHaveProperty('shared');
                expect(result).toHaveProperty('ui');
                expect(result.shared).toEqual({ axios: 'shared-lib/axios' });
                expect(result.ui).toEqual({ react: 'ui-lib/react' });
            });

            it('should handle empty scopes', () => {
                const result = getEnvironmentScopes('client', {});
                expect(result).toEqual({});
            });
        });
    });

    describe('Composition Functions', () => {
        describe('getEnvironments', () => {
            it('should combine all environment configurations', () => {
                const config: ModuleConfig = {
                    imports: {
                        axios: 'shared-lib/axios',
                        storage: {
                            client: 'client-storage',
                            server: 'server-storage'
                        }
                    },
                    scopes: {
                        shared: { lodash: 'shared-lib/lodash' }
                    },
                    exports: ['npm:react', { utils: './src/utils/index.ts' }]
                };

                const clientResult = getEnvironments(config, 'client');
                const serverResult = getEnvironments(config, 'server');

                expect(clientResult.imports).toEqual({
                    axios: 'shared-lib/axios',
                    storage: 'client-storage'
                });

                expect(serverResult.imports).toEqual({
                    axios: 'shared-lib/axios',
                    storage: 'server-storage'
                });

                expect(clientResult.scopes).toEqual({
                    shared: { lodash: 'shared-lib/lodash' }
                });

                expect(clientResult.exports).toHaveProperty('src/entry.client');
                expect(clientResult.exports).toHaveProperty('src/entry.server');
                expect(clientResult.exports).toHaveProperty('react');
                expect(clientResult.exports).toHaveProperty('utils');
            });
        });

        describe('parseModuleConfig', () => {
            it('should parse complete module configuration', () => {
                const config: ModuleConfig = {
                    links: {
                        'shared-lib': '../shared-lib/dist',
                        'api-utils': '/external/api-utils/dist'
                    },
                    imports: {
                        axios: 'shared-lib/axios',
                        storage: {
                            client: 'client-storage',
                            server: 'server-storage'
                        }
                    },
                    exports: [
                        'npm:react',
                        'npm:lodash',
                        { utils: './src/utils/index.ts' }
                    ]
                };

                const result = parseModuleConfig('my-app', '/app', config);

                expect(result.name).toBe('my-app');
                expect(result.root).toBe('/app');

                expect(result.links).toHaveProperty('my-app');
                expect(result.links).toHaveProperty('shared-lib');
                expect(result.links).toHaveProperty('api-utils');

                expect(result.environments.client.imports).toEqual({
                    axios: 'shared-lib/axios',
                    storage: 'client-storage'
                });

                expect(result.environments.client.exports).toHaveProperty(
                    'src/entry.client'
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

                expect(result.environments.server.imports).toEqual({
                    axios: 'shared-lib/axios',
                    storage: 'server-storage'
                });

                expect(result.environments.server.exports).toHaveProperty(
                    'src/entry.server'
                );
                expect(result.environments.server.exports).toHaveProperty(
                    'react'
                );
                expect(result.environments.server.exports).toHaveProperty(
                    'lodash'
                );
                expect(result.environments.server.exports).toHaveProperty(
                    'utils'
                );
            });

            it('should handle minimal configuration', () => {
                const result = parseModuleConfig('my-app', '/app');

                expect(result.name).toBe('my-app');
                expect(result.root).toBe('/app');
                expect(result.links).toHaveProperty('my-app');

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
    });
});
