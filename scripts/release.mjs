// 本地发布脚本：pnpm release <version>
//
// 流程：前置校验 → 门禁(type+test) → build → lerna version bump
//       → push tag → 回显 CI run URL → 结构化输出
//
// 设计要点：
// - 不在本地 publish，发布交给 CI（GitHub Actions OIDC trusted
//   publishing + provenance，无 npm token 或 OTP）。
// - 失败回滚：bump 之后、push 之前任何失败，回滚 version commit + tag。
// - 对 agent 触发友好：结构化 JSON 输出，零交互。
//
// dist-tag 判定：版本号含 `-`（如 3.0.0-rc.120）→ rc；否则 → latest。
// 这与 .github/workflows/release.yml 里 scripts/verify-release.mjs 的逻辑一致。

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------- 工具函数 ----------

/** 同步执行命令，返回 { ok, stdout, stderr }。inherit=true 时直接打印到终端。 */
function run(cmd, { inherit = false, cwd = ROOT } = {}) {
    const args = cmd.split(/\s+/);
    const bin = args.shift();
    const res = spawnSync(bin, args, {
        cwd,
        stdio: inherit ? 'inherit' : 'pipe',
        encoding: 'utf8'
    });
    return {
        ok: res.status === 0,
        stdout: res.stdout ?? '',
        stderr: res.stderr ?? ''
    };
}

/** 简单 semver 校验：X.Y.Z[-prerelease][+build] */
function isValidSemver(v) {
    return semver.valid(v) === v;
}

/** prerelease → dist-tag rc；正式版 → latest */
function distTagFor(version) {
    return version.includes('-') ? 'rc' : 'latest';
}

/** 当前 git HEAD 短 hash */
function gitHeadShort() {
    return run('git rev-parse --short HEAD').stdout.trim();
}

/** 比较 semver：a > b 返回 1，相等 0，小于 -1。仅比较主.次.修与 prerelease。 */
/** 读 lerna.json 当前版本 */
function currentVersion() {
    return JSON.parse(readFileSync(resolve(ROOT, 'lerna.json'), 'utf8'))
        .version;
}

/** 查 npm registry 上某包某版本是否已发布 */
function isPublished(name, version) {
    const res = run(
        `npm view ${name}@${version} version --registry=https://registry.npmjs.org`,
        { inherit: false }
    );
    return res.ok && res.stdout.trim() === version;
}

/** 输出结构化结果（agent 友好） */
function emitResult(payload) {
    console.log('\n─'.repeat(60));
    console.log(JSON.stringify(payload, null, 2));
    console.log('─'.repeat(60));
}

function fail(msg, payload) {
    console.error(`\n❌ ${msg}`);
    if (payload) emitResult({ status: 'failed', error: msg, ...payload });
    process.exit(1);
}

// ---------- 主流程 ----------

const version = process.argv[2];

// 1. 参数校验
if (!version) {
    fail(
        '缺少版本号。用法：pnpm release <version>，例如 pnpm release 3.0.0-rc.120'
    );
}
if (!isValidSemver(version)) {
    fail(`版本号不合法：${version}（应为 X.Y.Z 或 X.Y.Z-prerelease）`);
}

console.log(`\n🚀 发布 ${version}（dist-tag: ${distTagFor(version)}）\n`);

// 2. 前置校验：git 干净、分支正确
const status = run('git status --porcelain').stdout.trim();
if (status) {
    fail('工作区不干净，请先提交或 stash 改动', { dirty: status.split('\n') });
}
const branch = run('git rev-parse --abbrev-ref HEAD').stdout.trim();
if (branch !== 'master') {
    fail(`当前分支 ${branch}，请在 master 上发布`);
}

// 3. 版本递增校验
const cur = currentVersion();
console.log(`当前版本：${cur} → 目标：${version}`);
if (!semver.gt(version, cur)) {
    fail(`目标版本 ${version} 必须大于当前版本 ${cur}`);
}

// 4. 防重复：registry 上不该已存在（用 @esmx/core 探测）
if (isPublished('@esmx/core', version)) {
    fail(`@esmx/core@${version} 在 registry 上已存在，不可重复发布`);
}

// 5. 门禁：type check + unit test
console.log('\n🔒 门禁：lint:type + test');
for (const step of ['pnpm lint:type', 'pnpm test']) {
    console.log(`\n▶ ${step}`);
    const res = run(step, { inherit: true });
    if (!res.ok) fail(`门禁失败：${step}`);
}
console.log('\n✅ 门禁通过');

// 6. build
console.log('\n🔨 build:packages');
const buildRes = run('pnpm build:packages', { inherit: true });
if (!buildRes.ok) fail('build:packages 失败');
for (const step of [
    'node scripts/prepare-release-artifacts.mjs',
    'node scripts/validate-release-artifacts.mjs'
]) {
    const result = run(step, { inherit: true });
    if (!result.ok) fail(`发布产物校验失败：${step}`);
}

// 7. lerna version bump（本地 commit + tag，不 push，便于失败回滚）
//    --no-push：我们自己 push；--force-publish：所有包统一升版本
//    --exact：依赖锁精确版本；--yes：跳过 prompt
//    （lerna 8 真实支持的 flag，已在 lerna/dist/commands/version/command.js 核实）
console.log('\n🏷️  lerna version bump');
const BEFORE = run('git rev-parse HEAD').stdout.trim();
// 回滚辅助：删除本次 bump 产生的 version commit/tag 和未提交修改。
function rollbackBump() {
    const tag = `v${version}`;
    run(`git tag -d ${tag}`, { inherit: false });
    run(`git reset --hard ${BEFORE}`, { inherit: true });
    const clean = run('git status --porcelain').stdout.trim();
    if (clean) {
        fail('版本升级回滚后工作区仍不干净', {
            dirty: clean.split('\n')
        });
    }
    console.log(`↩️  已回滚到 ${BEFORE}`);
}

const bumpRes = run(
    `npx lerna version ${version} --no-push --exact --force-publish --yes`,
    { inherit: true }
);
if (!bumpRes.ok) {
    rollbackBump();
    fail('lerna version 失败，已回滚');
}

// 确认 lerna 确实产生了 version commit
const afterCommit = run('git rev-parse HEAD').stdout.trim();
if (afterCommit === BEFORE) {
    rollbackBump();
    fail('lerna version 未产生 commit，已回滚');
}

// 8. push commit + tag
console.log('\n📤 push version commit + tag');
const pushRes = run(
    `git push --atomic origin HEAD:master refs/tags/v${version}`,
    { inherit: true }
);
if (!pushRes.ok) {
    rollbackBump();
    fail('git push 失败，已回滚本地 version commit');
}

// 9. 取 CI run URL（tag push 触发 release workflow）
let ciRunUrl = null;
let runId = null;
try {
    // 等几秒让 GitHub 收到 push 并创建 run
    run('sleep 4');
    const listRes = run(
        'gh run list --workflow=release.yml --limit 1 --json databaseId,url,status,headBranch',
        { inherit: false }
    );
    if (listRes.ok && listRes.stdout.trim()) {
        const runs = JSON.parse(listRes.stdout);
        if (runs[0]) {
            ciRunUrl = runs[0].url;
            runId = runs[0].databaseId;
        }
    }
} catch {
    // gh 不在或未认证时静默——push 已成功，CI 会照常触发
}

// 10. 结构化输出
emitResult({
    status: 'triggered',
    version,
    distTag: distTagFor(version),
    currentVersion: cur,
    tagCommit: afterCommit.slice(0, 12),
    tag: `v${version}`,
    ciRunUrl,
    ciRunId: runId,
    next: ciRunUrl
        ? `轮询 CI：gh run watch ${runId} ｜ 查看：${ciRunUrl}`
        : 'CI 已由 tag 推送触发。查看：https://github.com/esmnext/esmx/actions'
});

console.log(`\n✅ 已触发 ${version} 的发布。`);
if (ciRunUrl) console.log(`   CI：${ciRunUrl}`);
