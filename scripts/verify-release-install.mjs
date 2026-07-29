import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { RELEASE_PACKAGES } from './release-config.mjs';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
    readFileSync(resolve(root, 'release-artifacts/manifest.json'), 'utf8')
);
if (manifest.length !== RELEASE_PACKAGES.length) {
    throw new Error('发布 tarball 清单数量错误');
}

const installDirectory = mkdtempSync(
    resolve(tmpdir(), 'esmx-release-install-')
);
execFileSync('npm', ['init', '-y'], {
    cwd: installDirectory,
    stdio: 'ignore'
});
execFileSync(
    'npm',
    [
        'install',
        '--ignore-scripts',
        ...manifest.map((item) =>
            resolve(root, 'release-artifacts', item.filename)
        )
    ],
    { cwd: installDirectory, stdio: 'inherit' }
);

const binDirectory = resolve(installDirectory, 'node_modules/.bin');
execFileSync(resolve(binDirectory, 'esmx'), ['validate', '--json'], {
    cwd: installDirectory,
    stdio: 'ignore'
});
execFileSync(resolve(binDirectory, 'create-esmx'), ['--help'], {
    cwd: installDirectory,
    stdio: 'ignore'
});

console.log('✅ 16 个 tarball 可由 npm 安装，两个 CLI 均可执行');
