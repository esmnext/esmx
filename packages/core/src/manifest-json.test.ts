import fs from 'node:fs';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import type { BuildEnvironment } from './core';
import {
    createFixtureRoot,
    removeFixtureRoot,
    writeFixturePackage
} from './declaration/test-fixtures';
import type { ManifestJson } from './manifest-json';
import {
    buildManifestProtocolFields,
    getManifestList,
    MANIFEST_PROTOCOL_VERSION
} from './manifest-json';
import type { ParsedModuleConfig } from './module-config';

const fixtureRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
    const root = await createFixtureRoot();
    fixtureRoots.push(root);
    return root;
}

afterEach(async () => {
    await Promise.all(fixtureRoots.splice(0).map(removeFixtureRoot));
});

describe('buildManifestProtocolFields', () => {
    it('should transcribe protocol, version and uses from the module package.json', async () => {
        const root = await fixtureRoot();
        const moduleRoot = writeFixturePackage(root, {
            dir: 'shared',
            packageJson: {
                name: 'shared',
                version: '1.8.0',
                esmx: { provides: ['vue'], uses: ['base', 'theme'] }
            }
        });

        const fields = buildManifestProtocolFields(moduleRoot, []);

        expect(fields.protocol).toBe(MANIFEST_PROTOCOL_VERSION);
        expect(fields.protocol).toBe(2);
        expect(fields.version).toBe('1.8.0');
        expect(fields.uses).toEqual(['base', 'theme']);
        expect(fields.provides).toEqual({});
    });

    it('should resolve provided package versions from node_modules of the module root', async () => {
        const root = await fixtureRoot();
        const moduleRoot = writeFixturePackage(root, {
            dir: 'shared',
            packageJson: { name: 'shared', version: '1.0.0' }
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/@esmx/router',
            packageJson: { name: '@esmx/router', version: '0.6.1' }
        });

        const fields = buildManifestProtocolFields(moduleRoot, [
            'vue',
            '@esmx/router'
        ]);

        expect(fields.provides).toEqual({
            vue: { version: '3.4.21' },
            '@esmx/router': { version: '0.6.1' }
        });
    });

    it('should resolve subpath specifiers via their parent package', async () => {
        const root = await fixtureRoot();
        const moduleRoot = writeFixturePackage(root, {
            dir: 'shared',
            packageJson: { name: 'shared', version: '1.0.0' }
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/vue',
            packageJson: { name: 'vue', version: '3.4.21' }
        });
        writeFixturePackage(root, {
            dir: 'shared/node_modules/@scope/pkg',
            packageJson: { name: '@scope/pkg', version: '2.1.0' }
        });

        const fields = buildManifestProtocolFields(moduleRoot, [
            'vue/jsx-runtime',
            '@scope/pkg/client'
        ]);

        expect(fields.provides['vue/jsx-runtime'].version).toBe('3.4.21');
        expect(fields.provides['@scope/pkg/client'].version).toBe('2.1.0');
    });

    it('should walk up node_modules for hoisted installs', async () => {
        const root = await fixtureRoot();
        const moduleRoot = writeFixturePackage(root, {
            dir: 'packages/shared',
            packageJson: { name: 'shared', version: '1.0.0' }
        });
        writeFixturePackage(root, {
            dir: 'node_modules/vue',
            packageJson: { name: 'vue', version: '3.5.2' }
        });

        const fields = buildManifestProtocolFields(moduleRoot, ['vue']);

        expect(fields.provides.vue.version).toBe('3.5.2');
    });

    it('should fall back to 0.0.0 for unresolvable packages', async () => {
        const root = await fixtureRoot();
        const moduleRoot = writeFixturePackage(root, {
            dir: 'shared',
            packageJson: { name: 'shared', version: '1.0.0' }
        });

        const fields = buildManifestProtocolFields(moduleRoot, ['ghost']);

        expect(fields.provides.ghost).toEqual({ version: '0.0.0' });
    });

    it('should default version and uses when package.json is missing or has no esmx field', async () => {
        const root = await fixtureRoot();

        const fields = buildManifestProtocolFields(
            path.join(root, 'does-not-exist'),
            []
        );

        expect(fields).toEqual({
            protocol: 2,
            version: '0.0.0',
            provides: {},
            uses: []
        });
    });
});

function writeManifest(
    root: string,
    dir: string,
    manifest: Record<string, unknown>
): string {
    const artifactDir = path.join(root, dir);
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(
        path.join(artifactDir, 'manifest.json'),
        JSON.stringify(manifest)
    );
    return artifactDir;
}

function makeModuleConfig(name: string, dir: string): ParsedModuleConfig {
    return {
        links: {
            [name]: { name, client: dir, server: dir }
        }
    } as unknown as ParsedModuleConfig;
}

const ENV: BuildEnvironment = 'client';

describe('getManifestList — protocol fields at read time', () => {
    it('should default pre-v2 manifests to protocol 1 with empty v2 fields', async () => {
        const root = await fixtureRoot();
        const dir = writeManifest(root, 'legacy/dist/client', {
            name: 'legacy',
            exports: {},
            scopes: {},
            files: [],
            chunks: {}
        });

        const [manifest] = await getManifestList(
            ENV,
            makeModuleConfig('legacy', dir)
        );

        expect(manifest.protocol).toBe(1);
        expect(manifest.version).toBe('0.0.0');
        expect(manifest.provides).toEqual({});
        expect(manifest.uses).toEqual([]);
    });

    it('should keep v2 fields as emitted', async () => {
        const root = await fixtureRoot();
        const emitted: Partial<ManifestJson> = {
            protocol: 2,
            name: 'shared',
            version: '1.8.0',
            provides: {
                vue: { version: '3.4.21' }
            },
            uses: ['base'],
            exports: {},
            scopes: {},
            files: [],
            chunks: {}
        };
        const dir = writeManifest(root, 'shared/dist/client', emitted);

        const [manifest] = await getManifestList(
            ENV,
            makeModuleConfig('shared', dir)
        );

        expect(manifest.protocol).toBe(2);
        expect(manifest.version).toBe('1.8.0');
        expect(manifest.provides).toEqual(emitted.provides);
        expect(manifest.uses).toEqual(['base']);
    });

    it('should reject manifests with a protocol higher than the linker supports', async () => {
        const root = await fixtureRoot();
        const dir = writeManifest(root, 'future/dist/client', {
            protocol: MANIFEST_PROTOCOL_VERSION + 1,
            name: 'future',
            exports: {},
            scopes: {},
            files: [],
            chunks: {}
        });

        await expect(
            getManifestList(ENV, makeModuleConfig('future', dir))
        ).rejects.toThrow(/E_PROTOCOL/);
    });
});
