import fs from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type {
    ModuleConfig,
    ModuleConfigExportObjectValue
} from '../module-config';
import {
    buildDeclaration,
    compareParsedConfigs,
    migrateModule,
    spliceEsmxField
} from './migrate';
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

const BOTH_ENTRIES = { client: true, server: true };

function writeEntryFiles(dir: string): void {
    const srcDir = path.join(dir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'entry.client.ts'), 'export {};\n');
    fs.writeFileSync(path.join(srcDir, 'entry.server.ts'), 'export {};\n');
}

describe('buildDeclaration', () => {
    it('should map pkg: exports to provides', () => {
        const result = buildDeclaration(
            { exports: ['pkg:react', 'pkg:react-dom'] },
            BOTH_ENTRIES
        );

        expect(result.declaration.provides).toEqual(['react', 'react-dom']);
        expect(result.declaration.exports).toBeUndefined();
        expect(result.warnings).toEqual([]);
    });

    it('should map root: exports preserving the public name exactly', () => {
        const result = buildDeclaration(
            { exports: ['root:src/routes.ts'] },
            BOTH_ENTRIES
        );

        expect(result.declaration.exports).toEqual({
            './src/routes': './src/routes.ts'
        });
    });

    it('should map object exports with root: string values', () => {
        const result = buildDeclaration(
            { exports: [{ 'src/index': 'root:src/index.ts' }] },
            BOTH_ENTRIES
        );

        expect(result.declaration.exports).toEqual({
            './src/index': './src/index.ts'
        });
    });

    it('should map object exports with plain ./ string values', () => {
        const result = buildDeclaration(
            { exports: [{ widget: './src/widget.ts' }] },
            BOTH_ENTRIES
        );

        expect(result.declaration.exports).toEqual({
            './widget': './src/widget.ts'
        });
    });

    it('should map {client,server} forks including false sides', () => {
        const result = buildDeclaration(
            {
                exports: [
                    {
                        'src/storage': {
                            client: 'root:src/storage.client.ts',
                            server: 'root:src/storage.server.ts'
                        },
                        'src/client-only': {
                            client: 'root:src/client-only.ts',
                            server: false
                        }
                    }
                ]
            },
            BOTH_ENTRIES
        );

        expect(result.declaration.exports).toEqual({
            './src/storage': {
                client: './src/storage.client.ts',
                server: './src/storage.server.ts'
            },
            './src/client-only': {
                client: './src/client-only.ts',
                server: false
            }
        });
        expect(result.warnings).toEqual([]);
    });

    it('should warn on fork sides that are absent or true', () => {
        // A missing fork side is outside the legacy types but tolerated by
        // the legacy parser (falls back to the export name as the path).
        const partialFork = { client: 'root:src/a.ts' } as unknown;
        const result = buildDeclaration(
            {
                exports: [
                    {
                        'src/a': partialFork as ModuleConfigExportObjectValue,
                        'src/b': { client: true, server: false }
                    }
                ]
            },
            BOTH_ENTRIES
        );

        expect(
            result.warnings.some((w) => w.includes('exports["src/a"].server'))
        ).toBe(true);
        expect(
            result.warnings.some((w) => w.includes('exports["src/b"].client'))
        ).toBe(true);
    });

    it('should warn on exports without pkg:/root: prefix', () => {
        const result = buildDeclaration(
            { exports: ['src/loose'] },
            BOTH_ENTRIES
        );

        expect(result.declaration.exports).toBeUndefined();
        expect(result.warnings.some((w) => w.includes('"src/loose"'))).toBe(
            true
        );
    });

    it('should omit entry for lib modules', () => {
        const result = buildDeclaration({ lib: true }, BOTH_ENTRIES);

        expect(result.declaration.entry).toBeUndefined();
        expect(result.notes.some((n) => n.includes('lib: true'))).toBe(true);
    });

    it('should declare default entries for app modules', () => {
        const result = buildDeclaration({}, BOTH_ENTRIES);

        expect(result.declaration.entry).toEqual({
            client: './src/entry.client.ts',
            server: './src/entry.server.ts'
        });
    });

    it('should warn when a default entry file is missing', () => {
        const result = buildDeclaration({}, { client: true, server: false });

        expect(
            result.warnings.some((w) => w.includes('src/entry.server.ts'))
        ).toBe(true);
    });

    it('should put every links key into uses and drop derived imports', () => {
        const result = buildDeclaration(
            {
                links: { shared: '../shared/dist', base: '../base/dist' },
                imports: { '@esmx/router': 'shared/@esmx/router' }
            },
            BOTH_ENTRIES
        );

        expect(result.declaration.uses).toEqual(['shared', 'base']);
        expect(result.warnings).toEqual([]);
        expect(
            result.notes.some((n) => n.includes('imports["@esmx/router"]'))
        ).toBe(true);
    });

    it('should warn when an import maps to a provider not in links', () => {
        const result = buildDeclaration(
            { imports: { vue: 'unlinked/vue' } },
            BOTH_ENTRIES
        );

        expect(result.declaration.uses).toBeUndefined();
        expect(
            result.warnings.some(
                (w) =>
                    w.includes('imports["vue"]') && w.includes('not in links')
            )
        ).toBe(true);
    });

    it('should warn when an import target subpath differs from the specifier', () => {
        const result = buildDeclaration(
            {
                links: { shared: '../shared/dist' },
                imports: { vue: 'shared/vue2' }
            },
            BOTH_ENTRIES
        );

        expect(
            result.warnings.some(
                (w) => w.includes('imports["vue"]') && w.includes('shared/vue')
            )
        ).toBe(true);
    });

    it('should warn on per-environment import mappings', () => {
        const result = buildDeclaration(
            {
                links: { shared: '../shared/dist' },
                imports: {
                    vue: { client: 'shared/vue', server: 'shared/vue' }
                }
            },
            BOTH_ENTRIES
        );

        expect(result.warnings.some((w) => w.includes('per-environment'))).toBe(
            true
        );
    });

    it('should warn when scopes are present', () => {
        const result = buildDeclaration(
            { scopes: { 'vue2-app': { vue: 'vue2-app/vue' } } },
            BOTH_ENTRIES
        );

        expect(result.warnings.some((w) => w.includes('scopes'))).toBe(true);
    });
});

describe('spliceEsmxField', () => {
    it('should insert esmx after version keeping order and indent', () => {
        const raw = `{
    "name": "app",
    "version": "1.0.0",
    "type": "module"
}
`;

        const next = spliceEsmxField(raw, { provides: ['react'] });

        const keys = Object.keys(JSON.parse(next));
        expect(keys).toEqual(['name', 'version', 'esmx', 'type']);
        expect(next).toContain('    "esmx": {');
        expect(next.endsWith('\n')).toBe(true);
    });

    it('should replace an existing esmx field in place', () => {
        const raw = JSON.stringify(
            { name: 'app', esmx: { provides: ['old'] }, version: '1.0.0' },
            null,
            4
        );

        const next = spliceEsmxField(raw, { provides: ['new'] });

        const parsed = JSON.parse(next);
        expect(parsed.esmx).toEqual({ provides: ['new'] });
        expect(Object.keys(parsed)).toEqual(['name', 'version', 'esmx']);
    });
});

interface ReactReplicaFixture {
    appDir: string;
    modules: ModuleConfig;
}

/** Replicates ssr-micro-react's exact legacy config against a migrated shared. */
async function createReactReplica(): Promise<ReactReplicaFixture> {
    const root = await fixtureRoot();
    writeFixturePackage(root, {
        dir: 'ssr-micro-shared',
        packageJson: {
            name: 'ssr-micro-shared',
            version: '1.0.0',
            type: 'module',
            esmx: {
                provides: ['@esmx/router', 'unhead'],
                exports: { './src/index': './src/index.ts' }
            }
        },
        built: true
    });
    const appDir = writeFixturePackage(root, {
        dir: 'ssr-micro-react',
        packageJson: {
            name: 'ssr-micro-react',
            version: '1.0.0',
            type: 'module'
        }
    });
    writeEntryFiles(appDir);
    const modules: ModuleConfig = {
        links: { 'ssr-micro-shared': '../ssr-micro-shared/dist' },
        imports: { '@esmx/router': 'ssr-micro-shared/@esmx/router' },
        exports: ['pkg:react', 'pkg:react-dom', 'root:src/routes.ts']
    };
    return { appDir, modules };
}

describe('migrateModule', () => {
    it('should migrate the ssr-micro-react config with exact parity', async () => {
        const { appDir, modules } = await createReactReplica();

        const outcome = migrateModule(appDir, modules, { dryRun: false });

        expect(outcome.parity).toBe('exact');
        expect(outcome.differences).toEqual([]);
        expect(outcome.written).toBe(true);
        expect(outcome.declaration).toEqual({
            entry: {
                client: './src/entry.client.ts',
                server: './src/entry.server.ts'
            },
            provides: ['react', 'react-dom'],
            exports: { './src/routes': './src/routes.ts' },
            uses: ['ssr-micro-shared']
        });

        const written = JSON.parse(
            fs.readFileSync(path.join(appDir, 'package.json'), 'utf-8')
        );
        expect(written.esmx).toEqual(outcome.declaration);
        expect(Object.keys(written)).toEqual([
            'name',
            'version',
            'esmx',
            'type'
        ]);
        expect(outcome.notes.some((n) => n.includes('imports.unhead'))).toBe(
            true
        );
    });

    it('should keep parity across object forks and false sides', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'forky',
            packageJson: { name: 'forky', version: '1.0.0' }
        });
        writeEntryFiles(appDir);
        const modules: ModuleConfig = {
            exports: [
                {
                    'src/storage': {
                        client: 'root:src/storage.client.ts',
                        server: 'root:src/storage.server.ts'
                    },
                    'src/client-only': {
                        client: 'root:src/client-only.ts',
                        server: false
                    }
                }
            ]
        };

        const outcome = migrateModule(appDir, modules, { dryRun: false });

        expect(outcome.parity).toBe('exact');
        expect(outcome.written).toBe(true);
    });

    it('should keep parity for lib modules', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'lib',
            packageJson: { name: 'lib', version: '1.0.0' }
        });
        const modules: ModuleConfig = {
            lib: true,
            exports: ['pkg:@esmx/router', 'root:src/index.ts']
        };

        const outcome = migrateModule(appDir, modules, { dryRun: false });

        expect(outcome.parity).toBe('exact');
        expect(outcome.declaration?.entry).toBeUndefined();
        const written = JSON.parse(
            fs.readFileSync(path.join(appDir, 'package.json'), 'utf-8')
        );
        expect(written.esmx).toEqual({
            provides: ['@esmx/router'],
            exports: { './src/index': './src/index.ts' }
        });
    });

    it('should not touch package.json on --dry-run', async () => {
        const { appDir, modules } = await createReactReplica();
        const packageJsonPath = path.join(appDir, 'package.json');
        const before = fs.readFileSync(packageJsonPath, 'utf-8');

        const outcome = migrateModule(appDir, modules, { dryRun: true });

        expect(outcome.parity).toBe('exact');
        expect(outcome.written).toBe(false);
        expect(fs.readFileSync(packageJsonPath, 'utf-8')).toBe(before);
    });

    it('should restore package.json when parity breaks', async () => {
        const root = await fixtureRoot();
        // shared has NO esmx declaration: the supply merge cannot derive the
        // legacy import, so parity must break and the write must roll back.
        writeFixturePackage(root, {
            dir: 'shared',
            packageJson: { name: 'shared', version: '1.0.0' },
            built: true
        });
        const appDir = writeFixturePackage(root, {
            dir: 'app',
            packageJson: { name: 'app', version: '1.0.0' }
        });
        writeEntryFiles(appDir);
        const packageJsonPath = path.join(appDir, 'package.json');
        const before = fs.readFileSync(packageJsonPath, 'utf-8');
        const modules: ModuleConfig = {
            links: { shared: '../shared/dist' },
            imports: { '@esmx/router': 'shared/@esmx/router' }
        };

        const outcome = migrateModule(appDir, modules, { dryRun: false });

        expect(outcome.parity).toBe('mismatch');
        expect(outcome.written).toBe(false);
        expect(
            outcome.differences.some((d) =>
                d.path.includes('imports.@esmx/router')
            )
        ).toBe(true);
        expect(fs.readFileSync(packageJsonPath, 'utf-8')).toBe(before);
    });

    it('should report mismatch and warn when scopes are present', async () => {
        const root = await fixtureRoot();
        const appDir = writeFixturePackage(root, {
            dir: 'scoped',
            packageJson: { name: 'scoped', version: '1.0.0' }
        });
        writeEntryFiles(appDir);
        const packageJsonPath = path.join(appDir, 'package.json');
        const before = fs.readFileSync(packageJsonPath, 'utf-8');
        const modules: ModuleConfig = {
            scopes: { 'vue2-app': { vue: 'vue2-app/vue' } }
        };

        const outcome = migrateModule(appDir, modules, { dryRun: false });

        expect(outcome.warnings.some((w) => w.includes('scopes'))).toBe(true);
        expect(outcome.parity).toBe('mismatch');
        expect(outcome.written).toBe(false);
        expect(fs.readFileSync(packageJsonPath, 'utf-8')).toBe(before);
    });

    it('should return an error for a directory without package.json', async () => {
        const root = await fixtureRoot();
        const emptyDir = path.join(root, 'empty');
        fs.mkdirSync(emptyDir, { recursive: true });

        const outcome = migrateModule(emptyDir, {}, { dryRun: true });

        expect(outcome.error).toContain('package.json');
        expect(outcome.written).toBe(false);
    });
});

describe('compareParsedConfigs', () => {
    it('should tolerate extra supply imports as notes, not differences', async () => {
        const { appDir, modules } = await createReactReplica();

        const outcome = migrateModule(appDir, modules, { dryRun: true });

        expect(outcome.parity).toBe('exact');
        expect(
            outcome.notes.filter((n) => n.includes('imports.unhead')).length
        ).toBeGreaterThan(0);
    });

    it('should flag export differences in both directions', async () => {
        const { parseModuleConfig } = await import('../module-config');
        const legacy = parseModuleConfig('m', '/tmp/m', {
            exports: ['root:src/a.ts']
        });
        const migrated = parseModuleConfig('m', '/tmp/m', {
            exports: ['root:src/b.ts']
        });

        const result = compareParsedConfigs(legacy, migrated);

        expect(
            result.differences.some((d) => d.path.includes('exports.src/a'))
        ).toBe(true);
        expect(
            result.differences.some((d) => d.path.includes('exports.src/b'))
        ).toBe(true);
    });
});
