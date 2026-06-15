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
    it('should report E_DUP_PROVIDER when a layer self-provides over a used provider of the same (package, major)', async () => {
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

        // Two DISTINCT providers of vue@3 (base via uses, vue-base via self):
        // a single-owner conflict, not an election.
        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].severity).toBe('error');
        expect(dupes[0].module).toBe('vue-base');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('base, vue-base');
        expect(Object.keys(result.mounts).sort()).toEqual(['base', 'vue-base']);
    });

    it('should report E_DUP_PROVIDER when two distinct providers reach a consumer via separate subtrees', async () => {
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

        // x (via b1) and y (via b2) are DISTINCT owners of vue@3 in app's
        // closure — a single-owner conflict surfaces at app.
        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].module).toBe('app');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('x, y');
    });

    it('should report E_DUP_PROVIDER when a self-provider collides with a used provider of the same (package, major)', async () => {
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

        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].module).toBe('app');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('base, app');
    });

    it('should report E_TARGET_MISSING when a declared entry/exports target file is absent', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: {
                    entry: { client: './src/entry.client.ts' },
                    exports: { './widget': './src/widget.ts' }
                }
            },
            noSources: true
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const missing = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_TARGET_MISSING
        );
        expect(missing).toHaveLength(2);
        expect(missing.every((d) => d.severity === 'error')).toBe(true);
        expect(missing.map((d) => d.found).sort()).toEqual([
            './src/entry.client.ts',
            './src/widget.ts'
        ]);
    });

    it('should not report E_TARGET_MISSING when declared targets exist', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { entry: { client: './src/entry.client.ts' } }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.E_TARGET_MISSING
            )
        ).toHaveLength(0);
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
            groups: [{ major: 3, provider: 'raw', version: '3.4.0' }]
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

    it('should report E_PROTOCOL for a mounted manifest with a higher protocol', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/future',
            packageJson: {
                name: 'future',
                version: '1.0.0',
                esmx: {}
            },
            manifest: { protocol: 3, name: 'future' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { uses: ['future'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const protocol = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_PROTOCOL
        );
        expect(protocol).toHaveLength(1);
        expect(protocol[0].package).toBe('future');
        expect(protocol[0].found).toBe('3');
    });

    it('should accept protocol 2 and protocol-less (pre-v2) manifests without E_PROTOCOL', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/modern',
            packageJson: { name: 'modern', version: '1.0.0', esmx: {} },
            manifest: { protocol: 2, name: 'modern' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/legacy',
            packageJson: { name: 'legacy', version: '1.0.0', esmx: {} },
            manifest: { name: 'legacy' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                esmx: { uses: ['modern', 'legacy'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const protocol = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_PROTOCOL
        );
        expect(protocol).toEqual([]);
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
            groups: [{ major: 3, provider: 'shared', version: '3.4.21' }]
        });
    });

    it('should keep coexisting majors as isolated groups with W_MULTI_MAJOR and no E_VERSION', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/vue2-app',
            packageJson: {
                name: 'vue2-app',
                version: '1.0.0',
                dependencies: { vue: '2.7.16' },
                esmx: { provides: ['vue'] }
            },
            manifest: { provides: { vue: '2.7.16' } }
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
            manifest: { provides: { vue: '3.5.13' } }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue3-base/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.13' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                peerDependencies: { vue: '^3.5.0' },
                esmx: { uses: ['vue2-app', 'vue3-base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(result.supply.vue).toEqual({
            groups: [
                { major: 3, provider: 'vue3-base', version: '3.5.13' },
                { major: 2, provider: 'vue2-app', version: '2.7.16' }
            ]
        });
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        expect(errors).toEqual([]);
        const multiMajor = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.W_MULTI_MAJOR
        );
        expect(multiMajor).toHaveLength(1);
        expect(multiMajor[0].package).toBe('vue');
        expect(multiMajor[0].found).toContain('vue3-base');
        expect(multiMajor[0].found).toContain('vue2-app');
    });

    it('should let different majors coexist across a uses chain with no E_DUP_PROVIDER', async () => {
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

        // base owns vue@2, vue-base owns vue@3 — distinct (package, major)
        // groups, so single-owner is satisfied per major: no conflict.
        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
            )
        ).toEqual([]);
        expect(
            result.diagnostics.filter((d) => d.severity === 'error')
        ).toEqual([]);
        expect(result.supply.vue.groups).toHaveLength(2);
        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.W_MULTI_MAJOR
            )
        ).toHaveLength(1);
    });

    it('should validate intent against the group a layer wires to, not an unrelated major', async () => {
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
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^2.7.0' },
                esmx: { uses: ['vue3-base', 'vue2-app'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        // app's ^2.7.0 range wires it to the major-2 group; the 3.x group
        // existing must not produce an intent violation.
        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.E_VERSION
            )
        ).toEqual([]);
    });

    it('should report E_VERSION (intent) when no major group satisfies the range', async () => {
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
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^4.0.0' },
                esmx: { uses: ['vue2-app', 'vue3-base'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const versionErrors = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_VERSION
        );
        expect(versionErrors).toHaveLength(1);
        expect(versionErrors[0].check).toBe('intent');
        expect(versionErrors[0].module).toBe('app');
        expect(versionErrors[0].required).toBe('^4.0.0');
    });

    it('should resolve the hub-shaped topology (vue2 + multiple vue3 providers) with warnings only', async () => {
        const root = await fixtureRoot();
        writeFixturePackage(root, {
            dir: 'node_modules/shared',
            packageJson: {
                name: 'shared',
                version: '1.0.0',
                dependencies: { unhead: '^3.1.3' },
                esmx: { provides: ['unhead'] }
            },
            manifest: { provides: { unhead: '3.1.3' } }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/shared/node_modules/unhead',
            packageJson: { name: 'unhead', version: '3.1.3' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue2-app',
            packageJson: {
                name: 'vue2-app',
                version: '1.0.0',
                dependencies: { vue: '2.7.16' },
                esmx: { uses: ['shared'], provides: ['vue'] }
            },
            manifest: { provides: { vue: '2.7.16' } }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue2-app/node_modules/vue',
            packageJson: { name: 'vue', version: '2.7.16' }
        });
        const vue3Providers = ['vue3-app', 'vite-vue-app', 'rsbuild-vue-app'];
        for (const name of vue3Providers) {
            writeFixturePackage(root, {
                dir: `node_modules/${name}`,
                packageJson: {
                    name,
                    version: '1.0.0',
                    dependencies: { vue: '^3.5.0' },
                    esmx: { uses: ['shared'], provides: ['vue'] }
                },
                manifest: { provides: { vue: '3.5.40' } }
            });
            writeFixturePackage(root, {
                dir: `node_modules/${name}/node_modules/vue`,
                packageJson: { name: 'vue', version: '3.5.40' }
            });
        }
        const passiveApps: string[] = [];
        for (let i = 0; i < 11; i++) {
            const name = `app-${i}`;
            passiveApps.push(name);
            writeFixturePackage(root, {
                dir: `node_modules/${name}`,
                packageJson: {
                    name,
                    version: '1.0.0',
                    peerDependencies: { unhead: '^3.1.3' },
                    esmx: { uses: ['shared'] }
                },
                built: true
            });
        }
        const appDir = writeFixturePackage(root, {
            dir: 'hub',
            packageJson: {
                name: 'hub',
                version: '1.0.0',
                peerDependencies: { unhead: '^3.1.3', vue: '^3.5.34' },
                esmx: {
                    uses: [
                        'shared',
                        ...passiveApps,
                        'vue2-app',
                        ...vue3Providers
                    ]
                }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        // Three distinct providers of vue@3 (vue3-app, vite-vue-app,
        // rsbuild-vue-app) violate single-owner: E_DUP_PROVIDER fires once
        // (de-duped per (package, major)). vue2-app alone owns vue@2 cleanly.
        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].module).toBe('hub');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('vue3-app, vite-vue-app');
        const codes = result.diagnostics.map((d) => d.code);
        expect(codes).toContain(DiagnosticCode.W_MULTI_MAJOR);
    });

    it('should report a single de-duped E_DUP_PROVIDER for a 3-provider same-major collision', async () => {
        const root = await fixtureRoot();
        for (const name of ['pa', 'pb', 'pc'] as const) {
            writeFixturePackage(root, {
                dir: `node_modules/${name}`,
                packageJson: {
                    name,
                    version: '1.0.0',
                    esmx: { provides: ['vue'] }
                },
                built: true
            });
            writeFixturePackage(root, {
                dir: `node_modules/${name}/node_modules/vue`,
                packageJson: { name: 'vue', version: '3.5.0' }
            });
        }
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.5.0' },
                esmx: { uses: ['pa', 'pb', 'pc'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        // pa, pb, pc all own vue@3 — a single (package, major) conflict,
        // reported once at the consumer naming the first two colliders.
        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].module).toBe('app');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('pa, pb');
    });

    it('should withhold supply when a uses cycle also provides', async () => {
        const root = await fixtureRoot();
        // a ↔ b cycle, both provide vue. The merge result during a cyclic walk
        // depends on traversal-entry order, so RFC P3 hard-stops: E_CYCLE fires
        // and supply is withheld rather than wired on a coin-flip.
        writeFixturePackage(root, {
            dir: 'node_modules/a',
            packageJson: {
                name: 'a',
                version: '1.0.0',
                esmx: { uses: ['b'], provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/a/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/b',
            packageJson: {
                name: 'b',
                version: '1.0.0',
                esmx: { uses: ['a'], provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/b/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.0' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['a'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(
            result.diagnostics.some((d) => d.code === DiagnosticCode.E_CYCLE)
        ).toBe(true);
        // Supply is withheld entirely (not an arbitrary order-dependent winner):
        // the E_CYCLE error fails the build instead of emitting coin-flip wiring.
        expect(result.supply).toEqual({});
    });

    it('should report E_DUP_PROVIDER when base and a sibling both provide vue@3 in the same closure', async () => {
        const root = await fixtureRoot();
        // base provides vue@3; sibling (used after base) also provides vue@3.
        // Both reach the app's closure — single-owner per (package, major) is
        // violated, so it is a hard error, not an election.
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
            dir: 'node_modules/sibling',
            packageJson: {
                name: 'sibling',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { provides: ['vue'] }
            },
            built: true
        });
        writeFixturePackage(root, {
            dir: 'node_modules/sibling/node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['base', 'sibling'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        const dupes = result.diagnostics.filter(
            (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
        );
        expect(dupes).toHaveLength(1);
        expect(dupes[0].severity).toBe('error');
        expect(dupes[0].module).toBe('app');
        expect(dupes[0].package).toBe('vue');
        expect(dupes[0].found).toBe('base, sibling');
    });

    it('should not report E_DUP_PROVIDER when the SAME provider reaches via two diamond paths', async () => {
        const root = await fixtureRoot();
        // base owns vue@3. Two intermediaries (left, right) both use base, and
        // the app uses both — base reaches via two routes but is a single
        // owner, so the diamond resolves cleanly with no conflict.
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
        for (const name of ['left', 'right'] as const) {
            writeFixturePackage(root, {
                dir: `node_modules/${name}`,
                packageJson: {
                    name,
                    version: '1.0.0',
                    esmx: { uses: ['base'] }
                },
                built: true
            });
        }
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: {
                name: 'app',
                version: '1.0.0',
                dependencies: { vue: '^3.4.0' },
                esmx: { uses: ['left', 'right'] }
            }
        });

        const result = resolveMounts(appDir, readRootDeclaration(appDir));

        expect(
            result.diagnostics.filter(
                (d) => d.code === DiagnosticCode.E_DUP_PROVIDER
            )
        ).toEqual([]);
        expect(
            result.diagnostics.filter((d) => d.severity === 'error')
        ).toEqual([]);
        expect(result.supply.vue).toEqual({
            groups: [{ major: 3, provider: 'base', version: '3.5.2' }]
        });
    });
});
