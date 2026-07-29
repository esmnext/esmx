import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    mkdirSync,
    readFileSync,
    renameSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import { resolve } from 'node:path';
import { RELEASE_PACKAGES } from './release-config.mjs';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'release-artifacts');
rmSync(destination, { force: true, recursive: true });
mkdirSync(destination);

const packs = [];
for (const name of RELEASE_PACKAGES) {
    const result = spawnSync(
        'pnpm',
        [
            '--filter',
            name,
            'pack',
            '--json',
            `--pack-destination=${destination}`
        ],
        { cwd: root, encoding: 'utf8' }
    );
    if (result.status !== 0) throw new Error(`${name}\n${result.stderr}`);
    const pack = JSON.parse(result.stdout);
    if (pack?.name !== name) throw new Error(`pack 产物错误：${name}`);
    const originalFilename = resolve(pack.filename);
    const filename = originalFilename.split('/').at(-1);
    const finalFilename = resolve(destination, filename);
    if (originalFilename !== finalFilename) {
        renameSync(originalFilename, finalFilename);
    }
    const bytes = readFileSync(finalFilename);
    const integrity = `sha512-${createHash('sha512')
        .update(bytes)
        .digest('base64')}`;
    const manifestResult = spawnSync(
        'tar',
        ['-xOf', finalFilename, 'package/package.json'],
        { encoding: 'utf8' }
    );
    if (manifestResult.status !== 0)
        throw new Error(`${name}: 无法读取 tarball`);
    const packedManifest = JSON.parse(manifestResult.stdout);
    for (const field of [
        'dependencies',
        'devDependencies',
        'optionalDependencies',
        'peerDependencies'
    ]) {
        for (const [dependency, range] of Object.entries(
            packedManifest[field] ?? {}
        )) {
            if (String(range).startsWith('workspace:')) {
                throw new Error(
                    `${name}: ${field}.${dependency} 仍含 ${range}`
                );
            }
        }
    }
    packs.push({
        name,
        version: pack.version,
        filename,
        integrity
    });
}
writeFileSync(
    resolve(destination, 'manifest.json'),
    `${JSON.stringify(packs, null, 2)}\n`
);
console.log(`✅ 已生成 ${packs.length} 个待发布 tarball`);
