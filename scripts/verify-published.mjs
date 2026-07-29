import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REGISTRY, RELEASE_PACKAGES } from './release-config.mjs';

const { VERSION: version, DIST_TAG: distTag } = process.env;
if (!version || !distTag) throw new Error('缺少 VERSION 或 DIST_TAG');
const manifest = JSON.parse(
    readFileSync(
        resolve(import.meta.dirname, '../release-artifacts/manifest.json'),
        'utf8'
    )
);

let failed = 0;
for (const name of RELEASE_PACKAGES) {
    const tagResult = spawnSync(
        'npm',
        ['view', name, `dist-tags.${distTag}`, `--registry=${REGISTRY}`],
        { encoding: 'utf8' }
    );
    const actualTag =
        tagResult.status === 0 ? tagResult.stdout.trim() : 'MISSING';
    const integrityResult = spawnSync(
        'npm',
        [
            'view',
            `${name}@${version}`,
            'dist.integrity',
            `--registry=${REGISTRY}`
        ],
        { encoding: 'utf8' }
    );
    const actualIntegrity =
        integrityResult.status === 0
            ? integrityResult.stdout.trim()
            : 'MISSING';
    const expectedIntegrity = manifest.find(
        (item) => item.name === name
    )?.integrity;
    if (actualTag === version && actualIntegrity === expectedIntegrity) {
        console.log(`✅ ${name}@${version} (${distTag})`);
    } else {
        console.error(
            `❌ ${name}: tag=${actualTag}, integrity=${actualIntegrity}`
        );
        failed++;
    }
}
if (failed) process.exit(1);
