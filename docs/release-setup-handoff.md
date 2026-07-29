# esmx 自动发布配置与验收

## 目标

在 `master` 分支执行一条命令：

```bash
pnpm release <version>
```

本地完成门禁、构建、统一升版及原子推送 commit/tag；GitHub Actions
随后通过 npm OIDC Trusted Publishing 发布 16 个包并生成 provenance。
整个流程不使用 npm token、OTP 或人工审批。

## 发布架构

- 本地入口：`scripts/release.mjs`
- CI workflow：`.github/workflows/release.yml`
- 触发条件：只接受 `v*.*.*` tag
- GitHub Environment：`release`，仅允许 `v*` tag，无 required reviewer
- CI `build` job：无 OIDC 权限，执行版本校验、构建、测试和 pack
- CI `publish` job：仅此 job 拥有 `id-token: write`
- 发布物：build job 生成的 16 个不可变 tarball
- 恢复策略：逐包发布；已存在版本只有在 registry `dist.integrity`
  与本次 tarball 完全一致时才会跳过

发布前会强制验证：

- tag、`lerna.json` 和 16 个发布包的版本完全一致
- 发布包名称与固定清单完全一致
- tag commit 是 `origin/master` 的祖先
- CLI bin 存在且具有可执行权限
- 16 个包均可通过 `npm pack --dry-run`
- 下载 tarball 的 SHA-512 integrity 与构建 manifest 一致

## npm Trusted Publisher

每个包必须配置同一关系：

| 字段 | 值 |
|---|---|
| Repository | `esmnext/esmx` |
| Workflow file | `release.yml` |
| Environment | `release` |
| Allowed action | `npm publish` |

包清单：

```text
@esmx/core
create-esmx
@esmx/import
@esmx/pkg-wrapper
@esmx/router
@esmx/router-react
@esmx/router-vue
@esmx/rsbuild
@esmx/rsbuild-react
@esmx/rsbuild-vue
@esmx/rspack
@esmx/rspack-react
@esmx/rspack-vue
@esmx/vite
@esmx/vite-react
@esmx/vite-vue
```

npm CLI 11.5.1 以上可以直接配置，无需逐包操作网页：

```bash
npm trust github <package> \
  --repo esmnext/esmx \
  --file release.yml \
  --env release \
  --allow-publish \
  --yes
```

配置后必须逐包核验：

```bash
npm trust list <package> --json
```

## 发版

工作区必须干净且位于 `master`：

```bash
pnpm release 3.0.0-rc.120
```

脚本会依次执行 type check、unit tests、build、pack 产物校验、
`lerna version`，然后通过 `git push --atomic` 同时推送 version commit
和 tag。任何 push 失败都会回滚本地 bump。

## 最终验收

只有以下项目全部成立才算发布成功：

1. GitHub Release workflow 的 build/publish jobs 均成功。
2. artifact 下载日志确认 digest 验证成功。
3. 16 个包的精确版本均为目标版本。
4. 16 个包的 `rc` 或 `latest` dist-tag 均指向目标版本。
5. registry `dist.integrity` 与本次构建 manifest 完全一致。
6. 16 个包均展示来自 `esmnext/esmx`、`release.yml` 的 npm provenance。
7. `esmx` 和 `create-esmx` 两个 CLI 可从发布包安装并执行。
