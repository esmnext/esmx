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

    it('should lower custom entries to named object exports per side', async () => {
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
        expect(lowered.exports).toEqual([
            {
                'src/entry.client': {
                    client: 'root:src/main.client.ts',
                    server: false
                }
            }
        ]);
        const parsed = parseModuleConfig('custom-entry', appDir, lowered);
        expect(parsed.environments.client.exports['src/entry.client']).toEqual({
            name: 'src/entry.client',
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

        const parsed = parseModuleConfig('client-only', appDir, lowered);
        expect(
            parsed.environments.server.exports['src/entry.server'].file
        ).toBe('');
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
});
