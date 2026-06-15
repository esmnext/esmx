import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { COMMAND, Esmx } from '../core';
import type { ManifestJson } from '../manifest-json';
import { MANIFEST_PROTOCOL_VERSION } from '../manifest-json';
import { createFixtureRoot, removeFixtureRoot } from './test-fixtures';

const fixtureRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
    const root = await createFixtureRoot();
    fixtureRoots.push(root);
    return root;
}

afterEach(async () => {
    await Promise.all(fixtureRoots.splice(0).map(removeFixtureRoot));
});

function writeModule(
    rootDir: string,
    dir: string,
    packageJson: Record<string, unknown>,
    manifest: Partial<ManifestJson>
): string {
    const moduleDir = path.join(rootDir, dir);
    fs.mkdirSync(moduleDir, { recursive: true });
    fs.writeFileSync(
        path.join(moduleDir, 'package.json'),
        JSON.stringify(packageJson, null, 4)
    );
    const full: ManifestJson = {
        protocol: MANIFEST_PROTOCOL_VERSION,
        name: String(packageJson.name),
        version: String(packageJson.version ?? '0.0.0'),
        provides: {},
        uses: [],
        scopes: {},
        exports: {},
        files: [],
        chunks: {},
        ...manifest
    };
    for (const env of ['client', 'server'] as const) {
        const envDir = path.join(moduleDir, 'dist', env);
        fs.mkdirSync(envDir, { recursive: true });
        fs.writeFileSync(
            path.join(envDir, 'manifest.json'),
            JSON.stringify(full, null, 4)
        );
    }
    return moduleDir;
}

/** App mounting `shared`, which exports a module-export `shared/ui`. */
function buildFixture(root: string, sharedExportFile: string): string {
    writeModule(
        root,
        'app/node_modules/shared',
        {
            name: 'shared',
            version: '1.0.0',
            esmx: { exports: { './ui': './src/ui.ts' } }
        },
        {
            exports: {
                ui: {
                    name: 'ui',
                    pkg: false,
                    file: sharedExportFile,
                    identifier: 'shared/ui'
                }
            }
        }
    );
    return writeModule(
        root,
        'app',
        {
            name: 'app',
            version: '1.0.0',
            esmx: { uses: ['shared'] }
        },
        {}
    );
}

/** Overwrites the shared module's client manifest export file (a new build). */
function rewriteSharedExport(appDir: string, file: string): void {
    const manifestPath = path.join(
        appDir,
        'node_modules/shared/dist/client/manifest.json'
    );
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.exports.ui.file = file;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
}

describe('Esmx.reinit generational relink (RFC 0001 §9)', () => {
    it('adopts a republished remote on a new generation', async () => {
        const root = await fixtureRoot();
        const appDir = buildFixture(root, 'ui.gen1.mjs');

        const esmx = new Esmx({ root: appDir, isProd: true });
        await esmx.init(COMMAND.preview);

        const before = await esmx.getImportMap('client');
        expect(before.imports?.['shared/ui']).toBe('/shared/ui.gen1.mjs');

        // The remote republishes with a new build output; the cached first
        // generation must NOT see it until a relink.
        rewriteSharedExport(appDir, 'ui.gen2.mjs');
        const stillCached = await esmx.getImportMap('client');
        expect(stillCached.imports?.['shared/ui']).toBe('/shared/ui.gen1.mjs');

        const ok = await esmx.reinit();

        expect(ok).toBe(true);
        const after = await esmx.getImportMap('client');
        expect(after.imports?.['shared/ui']).toBe('/shared/ui.gen2.mjs');
    });

    it('rolls back to the previous generation when the relink fails', async () => {
        const root = await fixtureRoot();
        const appDir = buildFixture(root, 'ui.gen1.mjs');

        const esmx = new Esmx({ root: appDir, isProd: true });
        await esmx.init(COMMAND.preview);
        const moduleConfigBefore = esmx.moduleConfig;

        // Corrupt the app's own package.json so the relink's re-read throws.
        fs.writeFileSync(path.join(appDir, 'package.json'), '{ not json');

        await expect(esmx.reinit()).rejects.toThrow();

        // The previous generation is intact and still serves.
        expect(esmx.moduleConfig).toBe(moduleConfigBefore);
        const after = await esmx.getImportMap('client');
        expect(after.imports?.['shared/ui']).toBe('/shared/ui.gen1.mjs');
    });

    it('throws when called before init', async () => {
        const esmx = new Esmx({ root: '/nonexistent' });

        await expect(esmx.reinit()).rejects.toThrow();
    });
});
