import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REGISTRY, RELEASE_PACKAGES } from './release-config.mjs';

const root = resolve(import.meta.dirname, '..');
const version = process.env.VERSION;
const distTag = process.env.DIST_TAG;
if (!version || !distTag) throw new Error('缺少 VERSION 或 DIST_TAG');
const packManifest = JSON.parse(
    readFileSync(resolve(root, 'release-artifacts/manifest.json'), 'utf8')
);

function registryIntegrity(name) {
    const result = spawnSync(
        'npm',
        [
            'view',
            `${name}@${version}`,
            'dist.integrity',
            `--registry=${REGISTRY}`
        ],
        { encoding: 'utf8' }
    );
    return result.status === 0 ? result.stdout.trim() : null;
}

for (const name of RELEASE_PACKAGES) {
    const pack = packManifest.find((item) => item.name === name);
    if (!pack || pack.version !== version) {
        throw new Error(`${name} manifest 版本不是 ${version}`);
    }
    const tarball = resolve(root, 'release-artifacts', pack.filename);
    if (!existsSync(tarball)) throw new Error(`缺少 tarball：${pack.filename}`);
    const localIntegrity = `sha512-${createHash('sha512')
        .update(readFileSync(tarball))
        .digest('base64')}`;
    if (localIntegrity !== pack.integrity) {
        throw new Error(
            `${name} 下载 tarball 与构建 manifest integrity 不一致`
        );
    }

    const existingIntegrity = registryIntegrity(name);
    if (existingIntegrity) {
        if (existingIntegrity !== pack.integrity) {
            throw new Error(
                `${name}@${version} 已存在，但 registry integrity 与本次产物不一致`
            );
        }
        console.log(`⏭️  ${name}@${version} 已存在且 integrity 一致，安全跳过`);
        continue;
    }

    console.log(`📦 发布 ${name}@${version}`);
    execFileSync(
        'npm',
        [
            'publish',
            tarball,
            '--provenance',
            '--access',
            'public',
            '--tag',
            distTag,
            `--registry=${REGISTRY}`
        ],
        { cwd: root, stdio: 'inherit' }
    );
}
