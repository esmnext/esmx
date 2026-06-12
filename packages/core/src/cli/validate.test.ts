import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import util from 'node:util';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    createFixtureRoot,
    removeFixtureRoot,
    writeFixturePackage
} from '../declaration/test-fixtures';
import { runValidate } from './validate';

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

async function legacyFixture(): Promise<string> {
    const root = await fixtureRoot();
    return writeFixturePackage(root, {
        dir: 'legacy',
        packageJson: { name: 'legacy', version: '1.0.0' }
    });
}

/** App using `base`, which provides vue but app declares no range → W_NO_RANGE. */
async function warningOnlyFixture(): Promise<string> {
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
    return writeFixturePackage(root, {
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
}

async function notLinkedFixture(): Promise<string> {
    const root = await fixtureRoot();
    return writeFixturePackage(root, {
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
}

describe('runValidate', () => {
    it('should exit 0 with protocol legacy for a package without esmx field', async () => {
        const appDir = await legacyFixture();

        const jsonResult = await runValidate(appDir, { json: true });
        const humanResult = await runValidate(appDir);

        expect(jsonResult.exitCode).toBe(0);
        expect(JSON.parse(jsonResult.output)).toEqual({
            protocol: 'legacy',
            diagnostics: []
        });
        expect(humanResult.exitCode).toBe(0);
        expect(humanResult.output).toContain('entry.node.ts');
        expect(humanResult.output).toContain('esmx migrate');
    });

    it('should exit 0 when the declaration only has warnings', async () => {
        const appDir = await warningOnlyFixture();

        const result = await runValidate(appDir, { json: true });

        const envelope = JSON.parse(result.output);
        expect(result.exitCode).toBe(0);
        expect(envelope.diagnostics).toHaveLength(1);
        expect(envelope.diagnostics[0].code).toBe('W_NO_RANGE');
        expect(envelope.supply.vue).toEqual({
            provider: 'base',
            version: '3.4.21'
        });
        expect(Object.keys(envelope.mounts)).toEqual(['base']);
        expect(envelope.mounts.base.built).toBe(true);
    });

    it('should exit non-zero for E_NOT_LINKED with the exact envelope entry shape', async () => {
        const appDir = await notLinkedFixture();

        const result = await runValidate(appDir, { json: true });

        const envelope = JSON.parse(result.output);
        expect(result.exitCode).toBe(1);
        const entry = envelope.diagnostics.find(
            (d: { code: string }) => d.code === 'E_NOT_LINKED'
        );
        expect(entry).toBeDefined();
        expect(entry.module).toBe('app');
        expect(typeof entry.message).toBe('string');
        expect(typeof entry.fix).toBe('string');
        expect(entry).not.toHaveProperty('severity');
    });

    it('should report diagnostics, supply and mounts in human mode', async () => {
        const appDir = await warningOnlyFixture();

        const result = await runValidate(appDir);

        const plain = util.stripVTControlCharacters(result.output);
        expect(result.exitCode).toBe(0);
        expect(plain).toContain('[W_NO_RANGE]');
        expect(plain).toContain('fix:');
        expect(plain).toContain('vue → base@3.4.21');
        expect(plain).toMatch(/base → .*dist \(built\)/);
    });

    it('should produce pure JSON output without writing to the console', async () => {
        const appDir = await notLinkedFixture();
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await runValidate(appDir, { json: true });

        expect(() => JSON.parse(result.output)).not.toThrow();
        expect(log).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
    });
});

const distCli = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '../../dist/cli/index.mjs'
);

// Spawn-based smoke test: only meaningful against a built CLI; building
// inside tests is out of scope, so skip when dist is absent.
describe.skipIf(!fs.existsSync(distCli))('esmx validate (spawned CLI)', () => {
    it('should emit only the JSON envelope on stdout and exit non-zero on errors', async () => {
        const childProcess = await import('node:child_process');
        const appDir = await notLinkedFixture();

        const spawned = childProcess.spawnSync(
            process.execPath,
            [distCli, 'validate', '--json'],
            { cwd: appDir, encoding: 'utf-8' }
        );

        expect(spawned.status).toBe(1);
        const envelope = JSON.parse(spawned.stdout);
        expect(envelope.diagnostics[0].code).toBe('E_NOT_LINKED');
    });
});
