import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ModuleConfig } from '../module-config';
import { parseModuleConfig } from '../module-config';
import { lowerDeclaration } from './lower';
import type { ReadDeclarationResult } from './reader';
import { readDeclaration } from './reader';
import { resolveMounts } from './resolver';
import {
    createFixtureRoot,
    removeFixtureRoot,
    writeFixturePackage
} from './test-fixtures';

const fixtureRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
    const root = await createFixtureRoot();
    fixtureRoots.push(root);
    return root;
}

afterEach(async () => {
    await Promise.all(fixtureRoots.splice(0).map(removeFixtureRoot));
});

function readRootDeclaration(appDir: string): ReadDeclarationResult {
    const pkg = readDeclaration(appDir);
    if (!pkg) {
        throw new Error(`fixture app at ${appDir} must declare esmx`);
    }
    return pkg;
}

describe('lowerDeclaration', () => {
    it('should lower the ssr-micro-react-equivalent declaration to parity with the legacy config', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'shared',
            packageJson: {
                name: 'ssr-micro-shared',
                version: '1.0.0',
                esmx: { provides: ['@esmx/router'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/@esmx/router',
            packageJson: { name: '@esmx/router', version: '1.2.3' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'ssr-micro-react',
                version: '1.0.0',
                devDependencies: {
                    '@esmx/router': '*',
                    react: '*',
                    'react-dom': '*'
                },
                esmx: {
                    entry: {
                        client: './src/entry.client.ts',
                        server: './src/entry.server.ts'
                    },
                    exports: { './src/routes': './src/routes.ts' },
                    provides: ['react', 'react-dom'],
                    uses: ['ssr-micro-shared']
                }
            }
        });
        const pkg = readRootDeclaration(appDir);
        const resolution = resolveMounts(appDir, pkg, {
            'ssr-micro-shared': '../shared/dist'
        });
        const legacy: ModuleConfig = {
            links: {
                'ssr-micro-shared': path.join(root, 'shared/dist')
            },
            imports: {
                '@esmx/router': 'ssr-micro-shared/@esmx/router'
            },
            exports: ['pkg:react', 'pkg:react-dom', 'root:src/routes.ts']
        };

        const lowered = lowerDeclaration(pkg, resolution);

        expect(lowered.imports).toEqual({
            '@esmx/router': 'ssr-micro-shared/@esmx/router'
        });
        expect(parseModuleConfig('ssr-micro-react', appDir, lowered)).toEqual(
            parseModuleConfig('ssr-micro-react', appDir, legacy)
        );
    });

    it('should set lib:true when no entry is declared', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'lib-module',
            packageJson: {
                name: 'lib-module',
                version: '1.0.0',
                esmx: { exports: { './widget': './src/widget.ts' } }
            }
        });
        const pkg = readRootDeclaration(appDir);
        const resolution = resolveMounts(appDir, pkg);

        const lowered = lowerDeclaration(pkg, resolution);

        expect(lowered.lib).toBe(true);
        expect(lowered.exports).toEqual([{ widget: 'root:src/widget.ts' }]);
        expect(lowered.links).toBeUndefined();
        expect(lowered.imports).toBeUndefined();
    });

    it('should lower custom entries through config.entry with path-derived names', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'custom-entry',
            packageJson: {
                name: 'custom-entry',
                version: '1.0.0',
                esmx: {
                    entry: {
                        client: './src/main.client.ts',
                        server: './src/entry.server.ts'
                    }
                }
            }
        });
        const pkg = readRootDeclaration(appDir);
        const resolution = resolveMounts(appDir, pkg);

        const lowered = lowerDeclaration(pkg, resolution);

        expect(lowered.lib).toBeUndefined();
        expect(lowered.entry).toEqual({ client: './src/main.client.ts' });
        expect(lowered.exports).toBeUndefined();
        const parsed = parseModuleConfig('custom-entry', appDir, lowered);
        expect(parsed.entry).toEqual({
            client: { name: 'src/main.client', file: './src/main.client.ts' },
            server: { name: 'src/entry.server', file: './src/entry.server' }
        });
        expect(parsed.environments.client.exports['src/main.client']).toEqual({
            name: 'src/main.client',
            file: './src/main.client.ts',
            pkg: false
        });
        expect(parsed.environments.server.exports['src/entry.server']).toEqual({
            name: 'src/entry.server',
            file: './src/entry.server',
            pkg: false
        });
    });

    it('should disable an undeclared entry side', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'client-only',
            packageJson: {
                name: 'client-only',
                version: '1.0.0',
                esmx: { entry: { client: './src/entry.client.ts' } }
            }
        });
        const pkg = readRootDeclaration(appDir);
        const resolution = resolveMounts(appDir, pkg);

        const lowered = lowerDeclaration(pkg, resolution);

        expect(lowered.entry).toEqual({ server: false });
        const parsed = parseModuleConfig('client-only', appDir, lowered);
        expect(parsed.entry.server).toBeNull();
        expect(
            parsed.environments.server.exports['src/entry.server']
        ).toBeUndefined();
        expect(
            parsed.environments.client.exports['src/entry.client'].file
        ).toBe('./src/entry.client');
    });

    it('should preserve env forks including false in exports', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'forked',
            packageJson: {
                name: 'forked',
                version: '1.0.0',
                esmx: {
                    exports: {
                        './store': {
                            client: './src/store.client.ts',
                            server: false
                        }
                    }
                }
            }
        });
        const pkg = readRootDeclaration(appDir);
        const resolution = resolveMounts(appDir, pkg);

        const lowered = lowerDeclaration(pkg, resolution);

        expect(lowered.exports).toEqual([
            {
                store: {
                    client: 'root:src/store.client.ts',
                    server: false
                }
            }
        ]);
        const parsed = parseModuleConfig('forked', appDir, lowered);
        expect(parsed.environments.client.exports.store.file).toBe(
            './src/store.client.ts'
        );
        expect(parsed.environments.server.exports.store.file).toBe('');
    });

    it('should wire a single-owner supply group into config.imports', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/shared',
            packageJson: {
                name: 'shared',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/shared/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['shared'] }
            }
        });

        const pkg = readRootDeclaration(appDir);
        const lowered = lowerDeclaration(pkg, resolveMounts(appDir, pkg));

        expect(lowered.imports).toEqual({ vue: 'shared/vue' });
    });

    describe('per-major group wiring', () => {
        async function multiMajorFixture(): Promise<string> {
            const root = await fixtureRoot();
            writeFixturePackage(root, {
                dir: 'node_modules/vue2-app',
                packageJson: {
                    name: 'vue2-app',
                    version: '1.0.0',
                    dependencies: { vue: '2.7.16' },
                    esmx: { provides: ['vue'] }
                },
                built: true
            });
            writeFixturePackage(root, {
                dir: 'node_modules/vue2-app/node_modules/vue',
                packageJson: { name: 'vue', version: '2.7.16' }
            });
            writeFixturePackage(root, {
                dir: 'node_modules/vue3-base',
                packageJson: {
                    name: 'vue3-base',
                    version: '1.0.0',
                    dependencies: { vue: '^3.5.0' },
                    esmx: { provides: ['vue'] }
                },
                built: true
            });
            writeFixturePackage(root, {
                dir: 'node_modules/vue3-base/node_modules/vue',
                packageJson: { name: 'vue', version: '3.5.13' }
            });
            return root;
        }

        function lowerApp(appDir: string) {
            const pkg = readRootDeclaration(appDir);
            const resolution = resolveMounts(appDir, pkg);
            return { resolution, lowered: lowerDeclaration(pkg, resolution) };
        }

        it('should wire a ^3 consumer to the vue3 group winner', async () => {
            const root = await multiMajorFixture();
            const appDir = writeFixturePackage(root, {
                dir: 'app',
                packageJson: {
                    name: 'app',
                    version: '1.0.0',
                    peerDependencies: { vue: '^3.5.0' },
                    esmx: { uses: ['vue2-app', 'vue3-base'] }
                }
            });

            const { lowered } = lowerApp(appDir);

            expect(lowered.imports?.vue).toBe('vue3-base/vue');
        });

        it('should wire a ^2 consumer to the vue2 group winner', async () => {
            const root = await multiMajorFixture();
            const appDir = writeFixturePackage(root, {
                dir: 'app',
                packageJson: {
                    name: 'app',
                    version: '1.0.0',
                    dependencies: { vue: '^2.7.0' },
                    esmx: { uses: ['vue2-app', 'vue3-base'] }
                }
            });

            const { lowered } = lowerApp(appDir);

            expect(lowered.imports?.vue).toBe('vue2-app/vue');
        });

        it('should wire a range-less consumer to the highest major with W_NO_RANGE', async () => {
            const root = await multiMajorFixture();
            const appDir = writeFixturePackage(root, {
                dir: 'app',
                packageJson: {
                    name: 'app',
                    version: '1.0.0',
                    esmx: { uses: ['vue2-app', 'vue3-base'] }
                }
            });

            const { resolution, lowered } = lowerApp(appDir);

            expect(lowered.imports?.vue).toBe('vue3-base/vue');
            expect(
                resolution.diagnostics.some(
                    (d) => d.code === 'W_NO_RANGE' && d.package === 'vue'
                )
            ).toBe(true);
        });

        it('should let a 2.x provider wire to its own copy despite a 3.x group existing', async () => {
            const root = await multiMajorFixture();
            const appDir = writeFixturePackage(root, {
                dir: 'app',
                packageJson: {
                    name: 'app',
                    version: '1.0.0',
                    dependencies: { vue: '2.7.16' },
                    esmx: { uses: ['vue3-base'], provides: ['vue'] }
                }
            });
            writeFixturePackage(root, {
                dir: 'app/node_modules/vue',
                packageJson: { name: 'vue', version: '2.7.16' }
            });

            const { resolution, lowered } = lowerApp(appDir);

            // Self-provided package: never imported from another module.
            expect(lowered.imports?.vue).toBeUndefined();
            expect(
                resolution.diagnostics.filter((d) => d.severity === 'error')
            ).toEqual([]);
        });
    });
});
