// CI 端发布校验：从触发 tag 解析版本号、判定 dist-tag、校验未重复发布。
//
// 用法（在 release workflow 的一个 step 里调用）：
//   node scripts/verify-release.mjs
//
// 它会：
// 1. 从环境变量读取触发 tag（push: GITHUB_REF=refs/tags/vX.Y.Z；
//    workflow_dispatch: 读 inputs.version 或 GITHUB_REF）
// 2. 校验版本号格式
// 3. 判定 dist-tag（prerelease → rc，正式 → latest）
// 4. 把 VERSION 和 DIST_TAG 写入 $GITHUB_ENV（供后续 step 引用）
// 5. 校验 @esmx/core@VERSION 在 registry 上不存在（防重发）
//
// 若校验失败，以非零码退出，workflow 停止。

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

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
    return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(v);
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

// 2. dist-tag 判定（与 scripts/release.mjs 保持一致）
const distTag = version.includes('-') ? 'rc' : 'latest';

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

// 4. 防重复发布
const published = run(
    `npm view @esmx/core@${version} version --registry=https://registry.npmjs.org`
);
if (published === version) {
    fail(`@esmx/core@${version} 已存在于 registry，拒绝重复发布`);
}

console.log('\n✅ 校验通过，可以发布');
