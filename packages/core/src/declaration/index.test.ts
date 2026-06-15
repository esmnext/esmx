import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ModuleConfig } from '../module-config';
import { resolveDeclaration, resolveModuleOptions } from './index';
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
    vi.restoreAllMocks();
    await Promise.all(fixtureRoots.splice(0).map(removeFixtureRoot));
});

describe('resolveDeclaration', () => {
    it('should return null when the package has no esmx field', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'legacy',
            packageJson: { name: 'legacy', version: '1.0.0' }
        });

        expect(resolveDeclaration(appDir)).toBeNull();
    });

    it('should compose reader, resolver and lowering', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'app/node_modules/shared',
            packageJson: {
                name: 'shared',
                version: '1.0.0',
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'app/node_modules/shared/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: {
                    entry: {
                        client: './src/entry.client.ts',
                        server: './src/entry.server.ts'
                    },
                    uses: ['shared']
                }
            }
        });

        const result = resolveDeclaration(appDir);

        expect(result).not.toBeNull();
        expect(result?.supply.vue).toEqual({
            groups: [{ major: 3, provider: 'shared', version: '3.4.21' }]
        });
        expect(result?.config).toEqual({
            links: {
                shared: path.join(appDir, 'node_modules/shared/dist')
            },
            imports: { vue: 'shared/vue' }
        });
        expect(
            result?.diagnostics.filter((d) => d.severity === 'error')
        ).toEqual([]);
    });
});

describe('resolveModuleOptions', () => {
    it('should keep the legacy path untouched when there is no esmx field', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'legacy',
            packageJson: { name: 'legacy', version: '1.0.0' }
        });
        const modules: ModuleConfig = {
            imports: { vue: 'shared/vue' },
            exports: ['pkg:vue']
        };

        const result = resolveModuleOptions(
            appDir,
            { name: 'legacy' },
            modules
        );

        expect(result).toBe(modules);
    });

    it('should throw E_PROTOCOL_IN_BEHAVIOR when esmx coexists with protocol fields in options.modules', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { provides: ['vue'] }
            }
        });

        expect(() =>
            resolveModuleOptions(
                appDir,
                { name: 'app', esmx: { provides: ['vue'] } },
                { imports: { vue: 'shared/vue' } }
            )
        ).toThrowError(/E_PROTOCOL_IN_BEHAVIOR/);
    });

    it('should allow links-only options.modules as environment overrides', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'shared',
            packageJson: {
                name: 'shared',
                version: '1.0.0',
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: {
                    entry: {
                        client: './src/entry.client.ts',
                        server: './src/entry.server.ts'
                    },
                    uses: ['shared']
                }
            }
        });

        const result = resolveModuleOptions(
            appDir,
            { name: 'app', esmx: {} },
            { links: { shared: '../shared/dist' } }
        );

        expect(result).toEqual({
            links: { shared: path.join(root, 'shared/dist') },
            imports: { vue: 'shared/vue' }
        });
    });

    it('should throw a clear error listing error diagnostics', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: {
                    entry: { client: './src/entry.client.ts' },
                    uses: ['ghost']
                }
            }
        });

        expect(() =>
            resolveModuleOptions(appDir, { name: 'app', esmx: {} })
        ).toThrowError(/E_NOT_LINKED[\s\S]*ghost/);
    });

    it('should print warnings instead of throwing', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'app/node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'app/node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: {
                    entry: { client: './src/entry.client.ts' },
                    uses: ['base']
                }
            }
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = resolveModuleOptions(appDir, { name: 'app', esmx: {} });

        expect(result?.imports).toEqual({ vue: 'base/vue' });
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('W_NO_RANGE')
        );
    });
});
