import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    addPackageExportsToScopes,
    createEntryExports,
    DEFAULT_MODULE_ENTRY,
    getEntryChunkId,
    getEnvironmentExports,
    getEnvironmentImports,
    getEnvironments,
    getLinks,
    type ModuleConfig,
    parsedExportValue,
    parseEntryConfig,
    parseModuleConfig,
    processExportArray,
    processObjectExport,
    processStringExport,
    resolveExportFile
} from './module-config';

describe('Module Config Parser', () => {
    describe('parseModuleConfig', () => {
        it('should parse basic module config with name and root', () => {
            const result = parseModuleConfig('test-module', '/test/root');
            expect(result.name).toBe('test-module');
            expect(result.root).toBe('/test/root');
            expect(result.links).toBeDefined();
            expect(result.environments).toBeDefined();
        });

        it('should handle empty config object', () => {
            const result = parseModuleConfig('test-module', '/test/root', {});
            expect(result.name).toBe('test-module');
            expect(result.root).toBe('/test/root');
        });

        it('should handle undefined config parameter', () => {
            const result = parseModuleConfig(
                'test-module',
                '/test/root',
                undefined
            );
            expect(result.name).toBe('test-module');
            expect(result.root).toBe('/test/root');
        });

        it('should process links configuration', () => {
            const config: ModuleConfig = {
                links: {
                    'custom-link': '/custom/path'
                }
            };
            const result = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );
            expect(result.links['custom-link']).toBeDefined();
        });

        it('should generate client and server environments', () => {
            const result = parseModuleConfig('test-module', '/test/root');
            expect(result.environments.client).toBeDefined();
            expect(result.environments.server).toBeDefined();
        });

        it('should handle absolute and relative paths in links', () => {
            const config: ModuleConfig = {
                links: {
                    absolute: '/absolute/path',
                    relative: 'relative/path'
                }
            };
            const result = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );
            expect(result.links.absolute.root).toBe('/absolute/path');
            expect(result.links.relative.root).toBe('relative/path');
        });

        it('should maintain type safety across transformations', () => {
            const result = parseModuleConfig('test-module', '/test/root');
            expect(typeof result.name).toBe('string');
            expect(typeof result.root).toBe('string');
            expect(typeof result.links).toBe('object');
            expect(typeof result.environments).toBe('object');
        });
    });

    describe('getLinks', () => {
        it('should create default link for module name', () => {
            const result = getLinks('test-module', '/test/root', {});
            expect(result['test-module']).toBeDefined();
            expect(result['test-module'].name).toBe('test-module');
        });

        it('should process custom links configuration', () => {
            const config: ModuleConfig = {
                links: {
                    'custom-link': '/custom/path'
                }
            };
            const result = getLinks('test-module', '/test/root', config);
            expect(result['custom-link']).toBeDefined();
            expect(result['custom-link'].name).toBe('custom-link');
        });

        it('should handle empty links object', () => {
            const result = getLinks('test-module', '/test/root', {});
            expect(Object.keys(result)).toHaveLength(1);
            expect(result['test-module']).toBeDefined();
        });

        it('should resolve absolute paths correctly', () => {
            const config: ModuleConfig = {
                links: {
                    absolute: '/absolute/path'
                }
            };
            const result = getLinks('test-module', '/test/root', config);
            expect(result.absolute.root).toBe('/absolute/path');
        });

        it('should resolve relative paths from root', () => {
            const config: ModuleConfig = {
                links: {
                    relative: 'relative/path'
                }
            };
            const result = getLinks('test-module', '/test/root', config);
            expect(result.relative.root).toBe('relative/path');
        });

        it('should generate client and server manifest paths', () => {
            const result = getLinks('test-module', '/test/root', {});
            const link = result['test-module'];
            const expectedRoot = path.resolve('/test/root', 'dist');
            expect(link.client).toBe(path.resolve(expectedRoot, 'client'));
            expect(link.clientManifestJson).toBe(
                path.resolve(expectedRoot, 'client/manifest.json')
            );
            expect(link.server).toBe(path.resolve(expectedRoot, 'server'));
            expect(link.serverManifestJson).toBe(
                path.resolve(expectedRoot, 'server/manifest.json')
            );
        });

        it('should handle Windows path separators', () => {
            const result = getLinks('test-module', 'C:\\test\\root', {});
            const link = result['test-module'];
            expect(link.client).toMatch(/[/\\]/);
            expect(link.server).toMatch(/[/\\]/);
        });

        it('should handle Unix path separators', () => {
            const result = getLinks('test-module', '/test/root', {});
            const link = result['test-module'];
            const expectedRoot = path.resolve('/test/root', 'dist');
            expect(link.client).toBe(path.resolve(expectedRoot, 'client'));
            expect(link.server).toBe(path.resolve(expectedRoot, 'server'));
        });

        it('should handle paths with special characters', () => {
            const result = getLinks('test-module', '/test/root@1.0.0', {});
            const link = result['test-module'];
            expect(link.root).toBe(path.resolve('/test/root@1.0.0', 'dist'));
        });

        it('should handle paths with spaces', () => {
            const result = getLinks(
                'test-module',
                '/test/root with spaces',
                {}
            );
            const link = result['test-module'];
            expect(link.root).toBe(
                path.resolve('/test/root with spaces', 'dist')
            );
        });
    });

    describe('Environment Import Functions', () => {
        describe('getEnvironmentImports', () => {
            it('should filter imports by environment', () => {
                const imports = {
                    react: 'react',
                    vue: {
                        client: 'vue',
                        server: 'vue/server'
                    }
                };
                const clientResult = getEnvironmentImports('client', imports);
                const serverResult = getEnvironmentImports('server', imports);

                expect(clientResult.react).toBe('react');
                expect(clientResult.vue).toBe('vue');
                expect(serverResult.vue).toBe('vue/server');
            });

            it('should handle string import values', () => {
                const imports = {
                    react: 'react'
                };
                const result = getEnvironmentImports('client', imports);
                expect(result.react).toBe('react');
            });

            it('should handle object import values with matching environment', () => {
                const imports = {
                    vue: {
                        client: 'vue',
                        server: 'vue/server'
                    }
                };
                const result = getEnvironmentImports('client', imports);
                expect(result.vue).toBe('vue');
            });

            it('should skip imports when environment value is undefined', () => {
                const imports = {
                    vue: {
                        client: 'vue',
                        server: 'vue/server'
                    }
                };
                const result = getEnvironmentImports('server', imports);
                expect(result.vue).toBe('vue/server');
            });

            it('should handle empty imports object', () => {
                const result = getEnvironmentImports('client', {});
                expect(Object.keys(result)).toHaveLength(0);
            });
        });

        describe('getEnvironments', () => {
            it('should combine imports and exports into the root scope', () => {
                const config: ModuleConfig = {
                    imports: {
                        react: 'react'
                    }
                };
                const result = getEnvironments(config, 'client', 'test-module');
                expect(result.imports.react).toBe('react');
                // The only scope is the derived root scope, carrying imports.
                expect(Object.keys(result.scopes)).toEqual(['']);
                expect(result.scopes[''].react).toBe('react');
                expect(result.exports).toBeDefined();
            });

            it('should preserve import mapping types', () => {
                const config: ModuleConfig = {
                    imports: {
                        react: 'react'
                    }
                };
                const result = getEnvironments(config, 'client', 'test-module');
                expect(typeof result.imports).toBe('object');
                expect(typeof result.exports).toBe('object');
                expect(typeof result.scopes).toBe('object');
            });

            it('should add pkg exports to scopes with empty string key', () => {
                const config: ModuleConfig = {
                    exports: ['pkg:lodash', 'pkg:react', './src/component']
                };
                const result = getEnvironments(config, 'client', 'test-module');
                const emptyScope = result.scopes[''];
                expect(emptyScope).toBeDefined();
                expect(emptyScope.lodash).toBe('test-module/lodash');
                expect(emptyScope.react).toBe('test-module/react');
                expect(emptyScope['./src/component']).toBeUndefined();
            });

            it('should merge imports and pkg exports into the single root scope', () => {
                const config: ModuleConfig = {
                    imports: {
                        react: 'react',
                        vue: 'vue'
                    },
                    exports: ['pkg:lodash']
                };
                const result = getEnvironments(config, 'client', 'test-module');

                // The derived root scope carries both supply imports and the
                // module's own pkg-exports — no user-authored scopes exist.
                expect(Object.keys(result.scopes)).toEqual(['']);
                expect(result.scopes[''].react).toBe('react');
                expect(result.scopes[''].vue).toBe('vue');
                expect(result.scopes[''].lodash).toBe('test-module/lodash');
                expect(result.imports.react).toBe('react');
                expect(result.imports.vue).toBe('vue');
            });
        });

        describe('addPackageExportsToScopes', () => {
            it('should create scopes for pkg exports', () => {
                const exports = {
                    lodash: { name: 'lodash', file: 'lodash', pkg: true },
                    react: { name: 'react', file: 'react', pkg: true },
                    './src/component': {
                        name: './src/component',
                        file: './src/component',
                        pkg: false
                    }
                };
                const scopes: Record<string, Record<string, string>> = {};
                const result = addPackageExportsToScopes(
                    exports,
                    scopes,
                    'test-module'
                );
                const emptyScope = result[''];
                expect(emptyScope).toBeDefined();
                expect(emptyScope.lodash).toBe('test-module/lodash');
                expect(emptyScope.react).toBe('test-module/react');
                expect(emptyScope['./src/component']).toBeUndefined();
            });

            it('should not override existing empty string scope', () => {
                const exports = {
                    lodash: { name: 'lodash', file: 'lodash', pkg: true }
                };
                const scopes = {
                    '': {
                        existing: 'existing-value'
                    }
                };
                const result = addPackageExportsToScopes(
                    exports,
                    scopes,
                    'test-module'
                );
                const emptyScope = result[''];
                expect(emptyScope.existing).toBe('existing-value');
                expect(emptyScope.lodash).toBe('test-module/lodash');
            });

            it('should handle empty exports', () => {
                const exports = {};
                const scopes: Record<string, Record<string, string>> = {};
                const result = addPackageExportsToScopes(
                    exports,
                    scopes,
                    'test-module'
                );
                expect(Object.keys(result)).toHaveLength(0);
            });
        });
    });

    describe('Export Processing Functions', () => {
        describe('processStringExport', () => {
            it('should parse simple string export', () => {
                const result = processStringExport('./src/component');
                expect(result['./src/component']).toBeDefined();
                expect(result['./src/component'].file).toBe('./src/component');
            });
        });

        describe('processObjectExport', () => {
            it('should handle environment-specific exports', () => {
                const exportObject = {
                    './src/component': {
                        client: './src/component.client',
                        server: './src/component.server'
                    }
                };
                const result = processObjectExport(exportObject, 'client');
                expect(result['./src/component'].file).toBe(
                    './src/component.client'
                );
            });

            it('should process mixed string and object exports', () => {
                const exportObject = {
                    './src/utils': './src/utils',
                    './src/component': {
                        client: './src/component.client',
                        server: './src/component.server'
                    }
                };
                const result = processObjectExport(exportObject, 'client');
                expect(result['./src/utils'].file).toBe('./src/utils');
                expect(result['./src/component'].file).toBe(
                    './src/component.client'
                );
            });

            it('should handle string config values in export object', () => {
                const exportObject = {
                    './src/utils': './src/utils'
                };
                const result = processObjectExport(exportObject, 'client');
                expect(result['./src/utils'].file).toBe('./src/utils');
            });

            it('should handle object config values in export object', () => {
                const exportObject = {
                    './src/component': {
                        client: './src/component.client',
                        server: './src/component.server'
                    }
                };
                const result = processObjectExport(exportObject, 'client');
                expect(result['./src/component'].file).toBe(
                    './src/component.client'
                );
            });

            it('should handle empty export object', () => {
                const result = processObjectExport({}, 'client');
                expect(Object.keys(result)).toHaveLength(0);
            });
        });

        describe('resolveExportFile', () => {
            it('should handle string config', () => {
                const result = resolveExportFile(
                    './src/component',
                    'client',
                    'component'
                );
                expect(result).toBe('./src/component');
            });

            it('should return string config directly', () => {
                const result = resolveExportFile(
                    './src/component',
                    'client',
                    'component'
                );
                expect(result).toBe('./src/component');
            });

            it('should resolve environment-specific paths', () => {
                const config = {
                    client: './src/component.client',
                    server: './src/component.server'
                };
                const result = resolveExportFile(config, 'client', 'component');
                expect(result).toBe('./src/component.client');
            });

            it('should return empty string when value is false', () => {
                const config = {
                    client: false as const,
                    server: './src/component.server'
                };
                const result = resolveExportFile(config, 'client', 'component');
                expect(result).toBe('');
            });

            it('should return name when value is empty string', () => {
                const config = {
                    client: '',
                    server: './src/component.server'
                };
                const result = resolveExportFile(config, 'client', 'component');
                expect(result).toBe('component');
            });

            it("should return environment value when it's a string", () => {
                const config = {
                    client: './src/component.client',
                    server: './src/component.server'
                };
                const result = resolveExportFile(config, 'client', 'component');
                expect(result).toBe('./src/component.client');
            });

            it('should return name when environment value is undefined', () => {
                const config = {
                    client: './src/component.client'
                } as any;
                const result = resolveExportFile(config, 'server', 'component');
                expect(result).toBe('component');
            });

            it('should handle invalid config types gracefully', () => {
                const result = resolveExportFile(
                    {} as any,
                    'client',
                    'component'
                );
                expect(result).toBe('component');
            });
        });

        describe('processExportArray', () => {
            it('should combine multiple export configurations', () => {
                const exportArray = ['./src/component1', './src/component2'];
                const result = processExportArray(exportArray, 'client');
                expect(result['./src/component1']).toBeDefined();
                expect(result['./src/component2']).toBeDefined();
            });

            it('should handle string items in export array', () => {
                const exportArray = ['./src/component'];
                const result = processExportArray(exportArray, 'client');
                expect(result['./src/component']).toBeDefined();
            });

            it('should handle object items in export array', () => {
                const exportArray = [
                    {
                        './src/component': './src/component'
                    }
                ];
                const result = processExportArray(exportArray, 'client');
                expect(result['./src/component']).toBeDefined();
            });

            it('should handle empty export array', () => {
                const result = processExportArray([], 'client');
                expect(Object.keys(result)).toHaveLength(0);
            });
        });

        describe('getEnvironmentExports', () => {
            it('should merge default and user exports', () => {
                const config: ModuleConfig = {
                    exports: ['./src/custom']
                };
                const result = getEnvironmentExports(config, 'client');
                expect(result['src/entry.client']).toBeDefined();
                expect(result['./src/custom']).toBeDefined();
            });

            it('should handle config without exports property', () => {
                const result = getEnvironmentExports({}, 'client');
                expect(result['src/entry.client']).toBeDefined();
            });

            it('should handle config with exports property', () => {
                const config: ModuleConfig = {
                    exports: ['./src/custom']
                };
                const result = getEnvironmentExports(config, 'client');
                expect(result['./src/custom']).toBeDefined();
            });
        });
    });

    describe('parsedExportValue', () => {
        it('should handle pkg: prefixed exports', () => {
            const result = parsedExportValue('pkg:lodash');
            expect(result.name).toBe('lodash');
            expect(result.pkg).toBe(true);
            expect(result.file).toBe('lodash');
        });

        it('should handle root: prefixed exports', () => {
            const result = parsedExportValue('root:src/component.tsx');
            expect(result.name).toBe('src/component');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./src/component.tsx');
        });

        it('should process regular file exports', () => {
            const result = parsedExportValue('./src/component');
            expect(result.name).toBe('./src/component');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./src/component');
        });

        it('should handle pkg: prefixed values correctly', () => {
            const result = parsedExportValue('pkg:@scope/package');
            expect(result.name).toBe('@scope/package');
            expect(result.pkg).toBe(true);
            expect(result.file).toBe('@scope/package');
        });

        it('should handle root: prefixed values with extension removal', () => {
            const result = parsedExportValue('root:src/component.tsx');
            expect(result.name).toBe('src/component');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./src/component.tsx');
        });

        it('should handle root: prefixed values without extensions', () => {
            const result = parsedExportValue('root:src/utils');
            expect(result.name).toBe('src/utils');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./src/utils');
        });

        it('should handle regular values without prefixes', () => {
            const result = parsedExportValue('./src/component.tsx');
            expect(result.name).toBe('./src/component.tsx');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./src/component.tsx');
        });

        it('should preserve file extensions for non-root exports', () => {
            const result = parsedExportValue('./src/component.tsx');
            expect(result.file).toBe('./src/component.tsx');
        });

        it('should handle malformed pkg: values', () => {
            const result = parsedExportValue('pkg:');
            expect(result.name).toBe('');
            expect(result.pkg).toBe(true);
            expect(result.file).toBe('');
        });

        it('should handle malformed root: values', () => {
            const result = parsedExportValue('root:');
            expect(result.name).toBe('');
            expect(result.pkg).toBe(false);
            expect(result.file).toBe('./');
        });

        it('should handle file extensions correctly in root: prefix', () => {
            const result = parsedExportValue('root:src/component.tsx');
            expect(result.name).toBe('src/component');
            expect(result.file).toBe('./src/component.tsx');
        });

        it('should handle nested paths in pkg: prefix', () => {
            const result = parsedExportValue('pkg:@scope/package/subpath');
            expect(result.name).toBe('@scope/package/subpath');
            expect(result.pkg).toBe(true);
            expect(result.file).toBe('@scope/package/subpath');
        });
    });

    describe('Integration Tests', () => {
        it('should work end-to-end with complex configuration', () => {
            const config: ModuleConfig = {
                links: {
                    shared: '/shared/modules'
                },
                imports: {
                    react: 'react',
                    vue: {
                        client: 'vue',
                        server: 'vue/server'
                    }
                },
                exports: [
                    './src/component',
                    {
                        './src/utils': {
                            client: './src/utils.client',
                            server: './src/utils.server'
                        }
                    }
                ]
            };
            const result = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );
            expect(result.name).toBe('test-module');
            expect(result.links.shared).toBeDefined();
            expect(result.environments.client.imports.react).toBe('react');
            expect(result.environments.client.imports.vue).toBe('vue');
            expect(result.environments.server.imports.vue).toBe('vue/server');
        });

        it('should correctly filter environment-specific exports', () => {
            const config: ModuleConfig = {
                exports: [
                    {
                        './src/component': {
                            client: './src/component.client',
                            server: './src/component.server'
                        }
                    }
                ]
            };
            const clientResult = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );
            const serverResult = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );

            expect(
                clientResult.environments.client.exports['./src/component'].file
            ).toBe('./src/component.client');
            expect(
                serverResult.environments.server.exports['./src/component'].file
            ).toBe('./src/component.server');
        });

        it('should maintain cross-environment consistency', () => {
            const result = parseModuleConfig('test-module', '/test/root');
            expect(
                result.environments.client.exports['src/entry.client'].file
            ).toBe('./src/entry.client');
            expect(
                result.environments.server.exports['src/entry.server'].file
            ).toBe('./src/entry.server');
        });

        it('should work with path resolution across different environments', () => {
            const config: ModuleConfig = {
                links: {
                    relative: 'relative/path'
                }
            };
            const result = parseModuleConfig(
                'test-module',
                '/test/root',
                config
            );
            expect(result.links.relative.root).toBe('relative/path');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid config types gracefully in resolveExportFile', () => {
            const result = resolveExportFile({} as any, 'client', 'component');
            expect(result).toBe('component');
        });

        it('should handle malformed pkg: values in parsedExportValue', () => {
            const result = parsedExportValue('pkg:');
            expect(result.name).toBe('');
            expect(result.pkg).toBe(true);
        });

        it('should handle malformed root: values in parsedExportValue', () => {
            const result = parsedExportValue('root:');
            expect(result.name).toBe('');
            expect(result.pkg).toBe(false);
        });
    });
});

describe('Framework entry threading (RFC 0001 Phase 2)', () => {
    describe('parseEntryConfig', () => {
        it('should default to legacy entries for an empty config', () => {
            const entry = parseEntryConfig({});

            expect(entry).toEqual({
                client: {
                    name: 'src/entry.client',
                    file: './src/entry.client'
                },
                server: {
                    name: 'src/entry.server',
                    file: './src/entry.server'
                }
            });
        });

        it('should resolve both entries to null for lib modules', () => {
            const entry = parseEntryConfig({ lib: true });

            expect(entry).toEqual({ client: null, server: null });
        });

        it('should derive the export name from a custom entry file path', () => {
            const entry = parseEntryConfig({
                entry: { client: './custom/main.ts' }
            });

            expect(entry.client).toEqual({
                name: 'custom/main',
                file: './custom/main.ts'
            });
            expect(entry.server).toEqual(DEFAULT_MODULE_ENTRY.server);
        });

        it('should keep the path-derived default name for a standard declaration path', () => {
            const entry = parseEntryConfig({
                entry: { client: './src/entry.client.ts' }
            });

            expect(entry.client).toEqual({
                name: 'src/entry.client',
                file: './src/entry.client.ts'
            });
        });

        it('should disable a side declared as false', () => {
            const entry = parseEntryConfig({ entry: { server: false } });

            expect(entry.server).toBeNull();
            expect(entry.client).toEqual(DEFAULT_MODULE_ENTRY.client);
        });
    });

    describe('parseModuleConfig entry population', () => {
        it('should populate entry for legacy configs', () => {
            const result = parseModuleConfig('test-module', '/test/root');

            expect(result.entry.client).toEqual(DEFAULT_MODULE_ENTRY.client);
            expect(result.entry.server).toEqual(DEFAULT_MODULE_ENTRY.server);
        });

        it('should populate null entries for lib configs and omit entry exports', () => {
            const result = parseModuleConfig('test-module', '/test/root', {
                lib: true
            });

            expect(result.entry).toEqual({ client: null, server: null });
            expect(result.environments.client.exports).toEqual({});
            expect(result.environments.server.exports).toEqual({});
        });

        it('should thread a custom entry into the environment exports', () => {
            const result = parseModuleConfig('test-module', '/test/root', {
                entry: { client: './custom/main.ts' }
            });

            expect(result.environments.client.exports['custom/main']).toEqual({
                name: 'custom/main',
                file: './custom/main.ts',
                pkg: false
            });
            expect(result.environments.server.exports['custom/main']).toEqual({
                name: 'custom/main',
                file: '',
                pkg: false
            });
            expect(
                result.environments.server.exports['src/entry.server']
            ).toEqual({
                name: 'src/entry.server',
                file: './src/entry.server',
                pkg: false
            });
            expect(
                result.environments.client.exports['src/entry.client']
            ).toBeUndefined();
        });
    });

    describe('default entry exports single source of truth', () => {
        it('should derive byte-identical defaults from DEFAULT_MODULE_ENTRY', () => {
            const entry = parseEntryConfig({});

            expect(createEntryExports(entry, 'client')).toEqual({
                'src/entry.client': {
                    name: 'src/entry.client',
                    file: './src/entry.client',
                    pkg: false
                },
                'src/entry.server': {
                    name: 'src/entry.server',
                    file: '',
                    pkg: false
                }
            });
            expect(createEntryExports(entry, 'server')).toEqual({
                'src/entry.client': {
                    name: 'src/entry.client',
                    file: '',
                    pkg: false
                },
                'src/entry.server': {
                    name: 'src/entry.server',
                    file: './src/entry.server',
                    pkg: false
                }
            });
        });
    });

    describe('getEntryChunkId', () => {
        it('should append .ts to the legacy extensionless default', () => {
            const id = getEntryChunkId(
                'test-module',
                DEFAULT_MODULE_ENTRY.client
            );

            expect(id).toBe('test-module@src/entry.client.ts');
        });

        it('should preserve an explicit extension on custom entries', () => {
            expect(
                getEntryChunkId('m', {
                    name: 'custom/main',
                    file: './custom/main.tsx'
                })
            ).toBe('m@custom/main.tsx');
            expect(
                getEntryChunkId('m', {
                    name: 'src/entry.client',
                    file: './src/entry.client.ts'
                })
            ).toBe('m@src/entry.client.ts');
        });
    });

    describe('fleet invariant: built example manifests', () => {
        const repoRoot = path.resolve(import.meta.dirname, '../../..');
        const examplesDir = path.join(repoRoot, 'examples');

        const findClientManifests = (dir: string): string[] => {
            if (!fs.existsSync(dir)) {
                return [];
            }
            const found: string[] = [];
            for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
                if (!item.isDirectory() || item.name === 'node_modules') {
                    continue;
                }
                const child = path.join(dir, item.name);
                const manifest = path.join(child, 'dist/client/manifest.json');
                if (fs.existsSync(manifest)) {
                    found.push(manifest);
                }
                found.push(...findClientManifests(child));
            }
            return found;
        };

        const manifests = findClientManifests(examplesDir);

        it.skipIf(manifests.length === 0)(
            'should compute the exact historical chunk seed for every built example',
            () => {
                expect(manifests.length).toBeGreaterThan(0);
                for (const manifestPath of manifests) {
                    const manifest = JSON.parse(
                        fs.readFileSync(manifestPath, 'utf-8')
                    ) as {
                        name: string;
                        chunks: Record<string, unknown>;
                        exports: Record<string, unknown>;
                    };
                    const parsed = parseModuleConfig(
                        manifest.name,
                        path.resolve(manifestPath, '../../..')
                    );
                    if (!parsed.entry.client) {
                        continue;
                    }

                    const seed = getEntryChunkId(
                        manifest.name,
                        parsed.entry.client
                    );

                    expect(seed).toBe(`${manifest.name}@src/entry.client.ts`);
                    if (manifest.exports['src/entry.client']) {
                        expect(Object.keys(manifest.chunks)).toContain(seed);
                    }
                }
            }
        );

        it.skipIf(
            !fs.existsSync(
                path.join(
                    examplesDir,
                    'micro-app/ssr-micro-shared/dist/client/manifest.json'
                )
            )
        )(
            'should match the ssr-micro-shared manifest chunk key exactly',
            () => {
                const manifestPath = path.join(
                    examplesDir,
                    'micro-app/ssr-micro-shared/dist/client/manifest.json'
                );
                const manifest = JSON.parse(
                    fs.readFileSync(manifestPath, 'utf-8')
                ) as { name: string; chunks: Record<string, unknown> };
                const parsed = parseModuleConfig(
                    manifest.name,
                    path.resolve(manifestPath, '../../..')
                );

                const seed = getEntryChunkId(
                    manifest.name,
                    parsed.entry.client!
                );

                expect(seed).toBe('ssr-micro-shared@src/entry.client.ts');
                expect(Object.keys(manifest.chunks)).toContain(seed);
            }
        );
    });
});
