import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ReadDeclarationResult } from './reader';
import { readDeclaration } from './reader';
import { resolveMounts } from './resolver';
import {
    createFixtureRoot,
    removeFixtureRoot,
    writeFixturePackage
} from './test-fixtures';
import { DiagnosticCode } from './types';

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

describe('resolveMounts', () => {
    it('should elect the later layer in a layered merge (RFC Gate 2)', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base',
            packageJson: {
                name: 'vue-base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'], provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['vue-base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(result.supply.vue).toEqual({
            provider: 'vue-base',
            version: '3.5.2'
        });
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        expect(errors).toEqual([]);
        const multi = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_MULTI_CANDIDATE
        );
        expect(multi).toHaveLength(1);
        expect(multi[0].required).toBe('vue-base');
        expect(multi[0].found).toBe('base');
        expect(Object.keys(result.mounts).sort()).toEqual(['base', 'vue-base']);
    });

    it('should resolve diamonds by subtree order: later uses entry wins', async () => {
        const root = await fixtureRoot();
        for (const [name, provides] of [
            ['x', true],
            ['y', true],
            ['b1', false],
            ['b2', false]
        ] as const) {
            writeFixturePackage(root, {
                dir: `node_modules/${name}`,
                packageJson: {
                    name,
                    version: '1.0.0',
                    esmx: provides
                        ? { provides: ['vue'] }
                        : { uses: [name === 'b1' ? 'x' : 'y'] }
                },
                built: true
            });
        }
        writeFixturePackage(root, {
            dir: 'node_modules/x/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/y/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.0' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['b1', 'b2'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(result.supply.vue).toEqual({ provider: 'y', version: '3.5.0' });
        const multi = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_MULTI_CANDIDATE
        );
        expect(multi).toHaveLength(1);
        expect(multi[0].required).toBe('y');
        expect(multi[0].found).toBe('x');
    });

    it('should let self provides win over the uses chain', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'], provides: ['vue'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(result.supply.vue).toEqual({
            provider: 'app',
            version: '3.5.2'
        });
        const multi = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_MULTI_CANDIDATE
        );
        expect(multi).toHaveLength(1);
        expect(multi[0].required).toBe('app');
        expect(multi[0].found).toBe('base');
    });

    it('should report E_CYCLE when the uses chain revisits a module', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/b',
            packageJson: {
                name: 'b',
                version: '1.0.0',
                esmx: { uses: ['a'] }
            },
            built: true
        });
        const appDir = writeFixturePackage(root, {
            dir: 'a',
            packageJson: {
                name: 'a',
                version: '1.0.0',
                esmx: { uses: ['b'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const cycles = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_CYCLE
        );
        expect(cycles).toHaveLength(1);
        expect(cycles[0].severity).toBe('error');
        expect(cycles[0].module).toBe('a');
    });

    it('should report E_NOT_LINKED for a uses entry with no mount', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { uses: ['ghost'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const notLinked = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_NOT_LINKED
        );
        expect(notLinked).toHaveLength(1);
        expect(notLinked[0].module).toBe('app');
        expect(notLinked[0].package).toBe('ghost');
        expect(result.mounts).toEqual({});
    });

    it('should report E_NOT_BUILT but keep declaration wiring', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/raw',
            packageJson: {
                name: 'raw',
                version: '1.0.0',
                esmx: { provides: ['vue'] }
            }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/raw/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['raw'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const notBuilt = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_NOT_BUILT
        );
        expect(notBuilt).toHaveLength(1);
        expect(notBuilt[0].package).toBe('raw');
        expect(result.mounts.raw.built).toBe(false);
        expect(result.supply.vue).toEqual({
            provider: 'raw',
            version: '3.4.0'
        });
    });

    it('should report E_VERSION (intent) when the winner violates a layer range', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^3.0.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.0.5' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const versionErrors = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_VERSION
        );
        expect(versionErrors).toHaveLength(1);
        expect(versionErrors[0].check).toBe('intent');
        expect(versionErrors[0].module).toBe('app');
        expect(versionErrors[0].package).toBe('vue');
        expect(versionErrors[0].found).toBe('3.0.5');
        expect(versionErrors[0].required).toBe('^3.4.0');
    });

    it('should report E_VERSION (intent) for used-module version vs range', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/shared',
            packageJson: {
                name: 'shared',
                version: '2.0.0',
                esmx: {}
            },
            built: true
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { shared: '^1.0.0' },
                esmx: { uses: ['shared'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const versionErrors = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_VERSION
        );
        expect(versionErrors).toHaveLength(1);
        expect(versionErrors[0].check).toBe('intent');
        expect(versionErrors[0].package).toBe('shared');
        expect(versionErrors[0].found).toBe('2.0.0');
    });

    it('should skip the used-module version gate for workspace ranges', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/shared',
            packageJson: {
                name: 'shared',
                version: '2.0.0',
                esmx: {}
            },
            built: true
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { shared: 'workspace:^1.0.0' },
                esmx: { uses: ['shared'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.E_VERSION
            )
        ).toEqual([]);
    });

    it('should warn W_NO_RANGE when a layer receives a package without any range', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { uses: ['base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const noRange = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_NO_RANGE
        );
        expect(noRange).toHaveLength(1);
        expect(noRange[0].severity).toBe('warning');
        expect(noRange[0].module).toBe('app');
        expect(noRange[0].package).toBe('vue');
    });

    it('should warn W_TYPE_DRIFT when the local devDependencies copy diverges from the winner', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                devDependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'] }
            }
        });
        writeFixturePackage(root, {
            dir: 'app/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const drift = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_TYPE_DRIFT
        );
        expect(drift).toHaveLength(1);
        expect(drift[0].module).toBe('app');
        expect(drift[0].package).toBe('vue');
        expect(drift[0].found).toBe('3.4.0');
        expect(drift[0].required).toBe('3.5.2');
    });

    it('should report substitution-safety E_VERSION only from built-against manifest versions', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^2.6.0' },
                esmx: { provides: ['vue'] }
            },
            manifest: { provides: { vue: '2.6.14' } }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '2.6.14' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base',
            packageJson: {
                name: 'vue-base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'], provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['vue-base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const safety = result.diagnostics.filter(
            (d) =>
                d.code === DiagnosticCode.E_VERSION &&
                d.check === 'substitution-safety'
        );
        expect(safety).toHaveLength(1);
        expect(safety[0].module).toBe('base');
        expect(safety[0].package).toBe('vue');
        expect(safety[0].found).toBe('3.5.2');
    });

    it('should skip substitution-safety silently when the loser manifest has no provides versions', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/base',
            packageJson: {
                name: 'base',
                version: '1.0.0',
                dependencies: { vue: '^2.6.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/base/node_modules/vue',
            packageJson: { name: 'vue', version: '2.6.14' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base',
            packageJson: {
                name: 'vue-base',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base'], provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue-base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['vue-base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const safety = result.diagnostics.filter(
            (d) => d.check === 'substitution-safety'
        );
        expect(safety).toEqual([]);
    });

    it('should honor envLinks overrides resolved relative to rootDir', async () => {
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
                esmx: { uses: ['shared'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir), {
            shared: '../shared/dist'
        });

        expect(result.mounts.shared).toEqual({
            name: 'shared',
            root: path.join(root, 'shared'),
            artifactDir: path.join(root, 'shared/dist'),
            built: true
        });
        expect(result.supply.vue).toEqual({
            provider: 'shared',
            version: '3.4.21'
        });
    });
});
