import { spawnSync } from 'node:child_process';
import {
    accessSync,
    constants,
    existsSync,
    readdirSync,
    readFileSync
} from 'node:fs';
import { resolve } from 'node:path';
import { RELEASE_PACKAGES } from './release-config.mjs';

const root = resolve(import.meta.dirname, '..');
const manifests = new Map();

for (const directory of readdirSync(resolve(root, 'packages'))) {
    const dirent = `packages/${directory}/package.json`;
    if (!existsSync(resolve(root, dirent))) continue;
    const manifest = JSON.parse(readFileSync(resolve(root, dirent), 'utf8'));
    if (!manifest.private) manifests.set(manifest.name, { dirent, manifest });
}

const actual = [...manifests.keys()].sort();
const expected = [...RELEASE_PACKAGES].sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
        `发布包清单不一致\n期望: ${expected.join(', ')}\n实际: ${actual.join(', ')}`
    );
}

for (const name of ['@esmx/core', 'create-esmx']) {
    const { dirent, manifest } = manifests.get(name);
    for (const bin of Object.values(manifest.bin ?? {})) {
        const file = resolve(root, dirent, '..', bin);
        accessSync(file, constants.X_OK);
    }
}

const results = [];
for (const name of RELEASE_PACKAGES) {
    const packed = spawnSync(
        'pnpm',
        ['--filter', name, 'pack', '--dry-run', '--json'],
        { cwd: root, encoding: 'utf8' }
    );
    if (packed.status !== 0) {
        throw new Error(`pnpm pack dry-run 失败：${name}\n${packed.stderr}`);
    }
    const result = JSON.parse(packed.stdout);
    if (result?.name !== name) {
        throw new Error(
            `pnpm pack 产物错误：期望 ${name}，实际 ${result?.name}`
        );
    }
    if (/invalid bin|removing/i.test(packed.stderr)) {
        throw new Error(`pnpm pack 报告无效 bin：${name}\n${packed.stderr}`);
    }
    results.push(result);
}

console.log(`✅ ${results.length} 个发布包的 pack 产物验证通过`);
