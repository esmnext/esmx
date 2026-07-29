// CI 端发布校验：从触发 tag 解析版本号、判定 dist-tag、校验未重复发布。
//
// 用法（在 release workflow 的一个 step 里调用）：
//   node scripts/verify-release.mjs
//
// 它会：
// 1. 从 GITHUB_REF 读取 push 触发的 vX.Y.Z tag
// 2. 校验版本号格式
// 3. 校验 tag、lerna.json、固定 16 包 manifest 的版本完全一致
// 4. 校验 tag commit 是 origin/master 的祖先
// 5. 判定 dist-tag，并把 VERSION/DIST_TAG 写入 $GITHUB_ENV
// 6. 探测 registry 已存在的包，供幂等恢复流程安全跳过
//
// 若校验失败，以非零码退出，workflow 停止。

import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import semver from 'semver';
import { RELEASE_PACKAGES } from './release-config.mjs';

const ROOT = resolve(import.meta.dirname, '..');

function run(cmd) {
    try {
        return execSync(cmd, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        }).trim();
    } catch {
        return null;
    }
}

function isValidSemver(v) {
    return semver.valid(v) === v;
}

function fail(msg) {
    console.error(`\n❌ ${msg}`);
    process.exit(1);
}

// 1. 解析版本号
let version;
const ref = process.env.GITHUB_REF || ''; // refs/tags/v3.0.0-rc.120
const tagMatch = ref.match(/^refs\/tags\/v(.+)$/);
if (tagMatch) {
    version = tagMatch[1];
} else if (process.env.VERSION_INPUT) {
    // workflow_dispatch 传入
    version = process.env.VERSION_INPUT;
}
if (!version) {
    fail('无法解析版本号：GITHUB_REF 不是 tag，且未提供 VERSION_INPUT');
}
if (!isValidSemver(version)) {
    fail(`版本号不合法：${version}`);
}

if (!tagMatch) {
    fail('发布必须由 v* tag 触发，不接受非 tag 来源');
}

const lernaVersion = JSON.parse(
    readFileSync(resolve(ROOT, 'lerna.json'), 'utf8')
).version;
if (lernaVersion !== version) {
    fail(`tag 版本 ${version} 与 lerna.json 版本 ${lernaVersion} 不一致`);
}

const packages = [];
for (const directory of readdirSync(resolve(ROOT, 'packages'))) {
    const file = resolve(ROOT, 'packages', directory, 'package.json');
    if (!existsSync(file)) continue;
    const manifest = JSON.parse(readFileSync(file, 'utf8'));
    if (!manifest.private) packages.push(manifest);
}
const actualNames = packages.map((item) => item.name).sort();
const expectedNames = [...RELEASE_PACKAGES].sort();
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    fail(
        `发布包清单不一致：期望 ${expectedNames.join(', ')}，实际 ${actualNames.join(', ')}`
    );
}
for (const manifest of packages) {
    if (manifest.version !== version) {
        fail(
            `${manifest.name} 版本 ${manifest.version} 与 tag ${version} 不一致`
        );
    }
}

const sha = process.env.GITHUB_SHA;
if (sha) {
    const onMaster = run(`git merge-base --is-ancestor ${sha} origin/master`);
    if (onMaster === null) {
        fail(`tag commit ${sha} 不是 origin/master 的祖先`);
    }
}

// 2. 所有发布统一更新 latest（与 scripts/release.mjs 保持一致）
const distTag = 'latest';

console.log(`版本：${version}`);
console.log(`dist-tag：${distTag}`);

// 3. 写入 GITHUB_ENV（供后续 step 用 ${{ env.VERSION }} / ${{ env.DIST_TAG }}）
const githubEnv = process.env.GITHUB_ENV;
if (githubEnv) {
    appendFileSync(githubEnv, `VERSION=${version}\n`);
    appendFileSync(githubEnv, `DIST_TAG=${distTag}\n`);
} else {
    // 本地调试输出
    console.log('(GITHUB_ENV 未设置，跳过写入)');
}

// 4. 全量探测；已存在的包由幂等发布脚本跳过，以支持部分发布恢复。
const existing = [];
for (const name of RELEASE_PACKAGES) {
    const published = run(
        `npm view ${name}@${version} version --registry=https://registry.npmjs.org`
    );
    if (published === version) existing.push(name);
}
console.log(
    existing.length
        ? `检测到 ${existing.length} 个已发布包，将在发布阶段安全跳过`
        : '目标版本的 16 个包均未发布'
);

console.log('\n✅ 校验通过，可以发布');
