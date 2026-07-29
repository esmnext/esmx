import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RELEASE_PACKAGES } from './release-config.mjs';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'release-artifacts');
rmSync(destination, { force: true, recursive: true });
mkdirSync(destination);

const packs = [];
for (const name of RELEASE_PACKAGES) {
    const result = spawnSync(
        'npm',
        [
            'pack',
            '--json',
            '--ignore-scripts',
            `--workspace=${name}`,
            `--pack-destination=${destination}`
        ],
        { cwd: root, encoding: 'utf8' }
    );
    if (result.status !== 0) throw new Error(`${name}\n${result.stderr}`);
    const [pack] = JSON.parse(result.stdout);
    if (pack?.name !== name) throw new Error(`pack 产物错误：${name}`);
    packs.push(pack);
}
writeFileSync(
    resolve(destination, 'manifest.json'),
    `${JSON.stringify(
        packs.map(({ name, version, filename, integrity }) => ({
            name,
            version,
            filename,
            integrity
        })),
        null,
        2
    )}\n`
);
console.log(`✅ 已生成 ${packs.length} 个待发布 tarball`);
