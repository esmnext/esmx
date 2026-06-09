# 文档真实性审计 + 补缺 — Loop 执行交接说明

> 目标：全面核对 esmx **所有类型**文档与**真实源码**的一致性（真实性审计），并补齐缺失的文档。
> 范围：**核心库（@esmx/core）、构建包（rspack/rsbuild/vite 系）、router 相关（router/router-react/router-vue）、脚手架（create-esmx）**。
> 不涉及：@esmx/import、@esmx/fetch、@esmx/class-state 的专属文档；文档站 `blog/`（叙事性，非真实性目标）。

## 文档类型总览（不止 API 页！）

| 文档类型 | 位置 | 覆盖任务 |
|----------|------|----------|
| 文档站 · 核心 API | `examples/docs/src/{en,zh}/api/core/*.md` | #6 |
| 文档站 · 构建包 API | `examples/docs/src/{en,zh}/api/app/*.mdx`（含 6 个待补） | #7–#11 |
| 文档站 · router API | `.../api/router*/*.md` | #12,#13 |
| 文档站 · 指南（essentials/router） | `.../guide/essentials/*`、`.../guide/router/*` | #14 |
| 文档站 · 上手（start） | `.../guide/start/*`（getting-started 对照 create-esmx 真实 CLI） | #15 |
| **包级 README（双语）** | `packages/<pkg>/README.md` + `README.zh-CN.md`（含 create-esmx） | #16（审）, #17（补6新包） |
| **根级 README（双语）** | `README.md` + `README.zh-CN.md` | #18 |
| **示例 README** | `examples/ssr-{vite,rsbuild}-*/README.md` | #19 |
| 文档站 · blog | `.../blog/*` | 不处理 |

## 文档与源码的对应关系

文档站在 `examples/docs/`（rspress），**双语**：`src/en/**` 与 `src/zh/**` 一一对应。

| 文档区域 | 路径 | 对应源码（真相来源） |
|----------|------|----------------------|
| 核心 API | `src/{en,zh}/api/core/*.md` | `packages/core/src/{app,core,manifest-json,module-config,pack-config,render-context}.ts` |
| 构建包 API | `src/{en,zh}/api/app/*.mdx` | `packages/{rspack,rspack-react,rspack-vue,vite,rsbuild,vite-react,vite-vue,rsbuild-react,rsbuild-vue}/src/index.ts` |
| router API | `src/{en,zh}/api/router/*.md` | `packages/router/src/index.ts` 及其导出类型 |
| router-react API | `src/{en,zh}/api/router-react/*.md` | `packages/router-react/src/index.ts` |
| router-vue API | `src/{en,zh}/api/router-vue/*.md` | `packages/router-vue/src/index.ts` |
| 指南 | `src/{en,zh}/guide/essentials/*`、`guide/router/*` | 对应包源码 + 示例 |

导航由各目录下 `_meta.json` 控制（en、zh 各一份），新增文档必须同步更新。

## 真实性审计方法（每个文档文件都要做）

源码是唯一真相来源。对照 `<pkg>/src/index.ts` 的真实导出与类型/函数签名，逐条核对：

1. **无虚构**：文档里出现的每个导出名、类型、函数签名、参数、字段，必须在源码中真实存在且签名一致。
2. **无失真**：参数顺序/可选性/类型、返回类型、默认值与源码一致。
3. **无遗漏**：源码中的每个**公开导出**都应有文档覆盖（至少出现在对应页面）。
4. **无过时**：删除源码中已不存在的 API、改名的旧名、废弃的用法。
5. **示例可信**：代码示例引用的 API 真实存在、import 路径正确、能跑通逻辑（必要时实际验证）。
6. **双语一致**：en 与 zh 结构、章节、API 覆盖一致（仅自然语言不同）。

发现 doc 与 code 不一致时，**以源码为准修正文档**。若怀疑是**源码 bug**（而非文档错），不要在本 loop 改源码——在该任务的说明里记录"疑似源码问题：…"，继续修文档使其匹配现状。

## 补缺文档（构建包，6 个新包）

`api/app/` 目前只有 rspack/rspack-react/rspack-vue，缺以下 6 个（对应已合并的多打包器 PR）：

| 新文档 | 源码 | 主要导出 |
|--------|------|----------|
| `app/vite.mdx` | packages/vite/src/index.ts | createViteApp, createViteHtmlApp, ViteAppOptions, ViteAppConfigContext, ViteHtmlAppOptions, BuildTarget, vite |
| `app/rsbuild.mdx` | packages/rsbuild/src/index.ts | createRsbuildApp, createRsbuildHtmlApp, RsbuildAppOptions, RsbuildAppConfigContext, RsbuildHtmlAppOptions, BuildTarget, rspack |
| `app/vite-react.mdx` | packages/vite-react/src/index.ts | createViteReactApp, ViteReactAppOptions（+ re-export @esmx/vite） |
| `app/vite-vue.mdx` | packages/vite-vue/src/index.ts | createViteVueApp, ViteVueAppOptions |
| `app/rsbuild-react.mdx` | packages/rsbuild-react/src/index.ts | createRsbuildReactApp, RsbuildReactAppOptions |
| `app/rsbuild-vue.mdx` | packages/rsbuild-vue/src/index.ts | createRsbuildVueApp, RsbuildVueAppOptions |

要求：
- **结构参照 `src/en/api/app/rspack.mdx`**（frontmatter + PackageManagerTabs 安装 + Type Exports + Function Exports + 示例）。en 与 zh 各一份。
- 内容必须**从真实源码生成**，不照搬 rspack 的差异点：vite 用 Rollup/Vite 配置（`ViteAppConfigContext.config: InlineConfig`）、dev 为真模块级 HMR；rsbuild 基于 rspack 内核（`RsbuildAppConfigContext.config: RsbuildConfig`）。
- 更新 `src/en/api/app/_meta.json` 与 `src/zh/api/app/_meta.json`，把 6 个新条目按合理顺序加入（建议：rspack 系、vite 系、rsbuild 系分组）。

## 每轮闭环（每个任务）

1. `TaskList` 取最低编号 pending；`TaskUpdate` 置 in_progress。
2. 读对应源码（`<pkg>/src/index.ts` + 相关 .ts 的真实签名）。
3. 按"真实性审计方法"逐文件核对/修正，或按"补缺"新建文档（en+zh + _meta）。
4. 验证：
   - 改动/新增的 `_meta.json` 是合法 JSON 且引用的文件都存在。
   - en 与 zh 覆盖一致。
   - **新增文档的任务**：跑 `pnpm --filter docs build`（rspress）确认整站能构建（捕获坏的 import/链接/MDX 语法）。纯审计任务若只改 .md 文字，可只做局部校验，但每完成 2~3 个审计任务也建议跑一次 docs build。
5. `git status` 确认只动了**文档文件**（`examples/docs/**`、`packages/<pkg>/README*.md`、根 `README*.md`、`examples/ssr-*/README.md`），**绝不改任何 `packages/**/src` 源码**。
6. 通过则 `TaskUpdate` 置 completed；否则保持 in_progress 并记录卡点。
7. 每轮只完整做完一个任务。#6–#19 全部完成后停止 loop。

## 约束
- 只改**文档**（文档站页面、各级 README）；**绝不改任何包的 `src/` 源码**。
- 代码注释/commit 用英文；文档面向用户，en/README.md 用英文、zh/README.zh-CN.md 用中文。
- 不动范围外的包（import/fetch/class-state）的文档，不动 blog。create-esmx 在范围内。
- README 任务：参照 `packages/rspack/README.md` 与 `README.zh-CN.md` 的结构（徽章、Features、Installation、Usage），中英文件结构对齐。

## 验证命令
```bash
# 看某包真实导出
sed -n '1,80p' packages/<pkg>/src/index.ts
# 文档整站构建（新增文档后必跑）
pnpm --filter docs build
# JSON 合法性
node -e "JSON.parse(require('fs').readFileSync('examples/docs/src/en/api/app/_meta.json','utf8'))"
# 确认只动了文档
git status --short | grep -v '^?? ' ; git status --short | grep -vE 'examples/docs/'
```

## 参考
- 现有范本：`examples/docs/src/en/api/app/rspack.mdx`（构建包文档结构）、`api/core/esmx.md`（核心 API 结构）。
- 已完成的多打包器实现：`packages/{vite,rsbuild,vite-react,vite-vue,rsbuild-react,rsbuild-vue}/`（PR #300）。

## 完成定义
#6–#19 全部 completed；范围内每个文档文件（文档站 API/指南/上手 + 各级 README + 示例 README）都经源码核对、失真已修；6 个新构建包的文档站页面与包级 README 齐全（双语 + _meta）；根 README 与上手文档已纳入 vite/rsbuild；`pnpm --filter docs build` 通过；`git status` 证明只改了文档（无 `src/` 源码改动）。
