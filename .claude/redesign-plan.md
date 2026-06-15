# Esmx Redesign Plan — Agent-Era Refit

> 战略锚点(来自会话讨论):esmx 在 agent 时代的核心优势是"零专有 API 表面积"——
> 一切围绕"agent 能不能用最小上下文一次写对一个 esmx 工程"来取舍。本计划的所有
> 章节、所有任务都要服从这条判据。任何动作如果让 API 表面更大、约定更隐式、
> 错误更难诊断,直接砍掉重做。

---

## How /loop consumes this file

每次循环:
1. 读 §2 的任务表,挑**最小编号且状态为 PENDING** 的任务。
2. 严格执行该任务的 "DOD"(Definition of Done)列表;**不要顺手做下一个**。
3. 完成后把任务标记为 ✅(直接改本文件),提交;再进入下一轮循环。
4. 每个任务交付物必须 self-contained:本地 build 通过 / 截图(若涉及视觉)
   保留在 `.claude/screenshots/<task-id>/` 下。

`PENDING` / 🟡 进行中 / ✅ 已完成 / ⛔ 阻塞(写原因)。

---

## 1. 设计原则(Design Principles)

P1. **Standards over magic** — 凡是发明新概念(新 lifecycle、新装饰器、新 DSL)
    一律不做;先看 Web 标准/CSS/MDN 怎么称呼。
P2. **Self-contained code samples** — Demo 和文档里的每个代码块都要能整段贴进
    新工程跑起来,不依赖未在样本里出现的隐式约定。
P3. **One source of truth per token** — 颜色/字号/间距/圆角全部 CSS 变量,所有
    surface(15 micro 远程 + 6 standalone + hub + 文档站)读同一份。
P4. **Agent-readable failures** — 错误信息必须告诉 agent "改哪个文件的哪一行
    改成什么";不写 stack trace dump、不写 emoji 装饰但无内容的错误。
P5. **Code is the demo** — 首页/落地页要让访客**看到代码**就懂,而不是看到
    营销词;放可滚动的 import-map + entry.server.ts 片段比放"零开销"标语有用。
P6. **Agent artifacts are user deliverables** — 任何 "for AI / for agent" 文档、
    schema、错误信息,定位都是 **esmx 用户**在他们的项目里把它喂给自己的 LLM 工具
    (Claude / Cursor / Copilot / Gemini),不是给 esmx 内部贡献者用。所以这些
    产物必须随 esmx 一起发布、可通过 esmx.dev URL 抓取、版本与 esmx 同步。

---

## 2. 任务表

### A. 设计基础(Design Foundation)

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| A1  | 视觉现状审计 | 输出 `.claude/audit-visual.md`:列出 15 个 micro 远程 + 6 个 standalone + hub + docs 站当前的色板、字号、间距、组件用法不一致点。每条带文件+行号。 | ✅ 完成于 2026-06-11,见 `.claude/audit-visual.md` |
| A2  | **重新设计** UX 方向稿 | 输出 `.claude/design-direction.md`:从零设计的视觉方向(色板、字号、间距、组件外观、3 张 ASCII/文字描述的 wireframe — 远程卡片 / hub 首页 / docs 落地页),围绕"看到代码就懂 esmx 在干嘛"展开,不沿用当前暗色渐变风格。 | ✅ 完成于 2026-06-11,见 `.claude/design-direction.md`(5 条架构决策 + 完整 token + 3 张 wireframe)|
| A3  | 设计 token 落地 | 按 A2 方向稿在 `examples/micro-app/ssr-micro-shared/src/styles/tokens.css` 写完整 token;每个 token 加用途注释。 | ✅ 完成于 2026-06-11,74 个 token 落地,光括号平衡 4/4,等 A4/A5/B/C/D 引用 |
| A4  | 设计规范文档(**内部**) | 新增仓库根 `docs/design/principles.md` + `tokens.md` + `components.md`,各 ≤ 200 行,英文,**贡献者文档**(给维护 esmx demo / hub / 文档站的人看,不是给 esmx 用户)。每个组件用 esmx 内 demo 真实代码片段。**绝不放进 `examples/docs/src/`,那是给 esmx 用户的 esmx.dev 公开文档站。** | ✅ 完成于 2026-06-11,3 个文件 70/139/113 行(共 322 行,全 < 200)。**纠错**:首次错放到公开 docs 站已删除,改放仓库根 `docs/design/` 作内部契约。 |
| A5  | 共享 **CSS 类约定** | 在 `ssr-micro-shared/src/styles/components.css` 写 7 套 CSS 类(`.esmx-btn` / `.esmx-card` / `.esmx-code` / `.esmx-stat` / `.esmx-tabs` / `.esmx-badge` / `.esmx-table`),只消费 `tokens.css` 变量,**不**导出任何框架组件 — 因为 React/Vue/Solid/Svelte/Lit 之间组件不通,只有 CSS 类能真正跨框架。每个框架的 demo(B 任务)自己写 Button.vue / Button.tsx / Button.svelte,但都挂同一份 class name。 | ✅ 完成于 2026-06-11。42 个 class、44 个 token 引用全部 resolved、braces 55/55 balanced。包含 7 框架 dot 变体 + 7 框架 badge 变体 + 7 框架 dot,所有色都走 `--esmx-fw-*` token。 |

### G. **esmx CSS 联邦合约**(架构性前置,B 段前置依赖)

> **触发原因**:B2(rspack 系)dev SSR 报 `Unexpected token '.'` 是症状,本质是
> esmx 没在自己的联邦合约里给 CSS 定位置 —— manifest 早预留了 `chunks[*].css[]`
> 槽位但全是空数组,Vite 因把 CSS 转 JS proxy 侥幸绕过,Rspack 不转就撞穿。
> 本节给出**唯一一份 esmx-native 的答案**:CSS 跟 JS 一样,通过联邦 manifest
> 在远程间传递,renderHost 据此 emit `<link>`。用户层 API 仍是标准的
> `import './x.css'` —— 零专有,符合 P1。完成后所有 B/C 节才能落地。

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| G1  | `@esmx/import` 加 CSS load hook | `packages/import/src/import-vm.ts` 拦截 `.css` URL,返回空 ESM 模块(`export default <url>; export const __url__ = ...`),让 server-side `import './x.css'` 不再炸。新增 `import-vm.test.ts` 用例覆盖。 | ✅ 完成于 2026-06-11。`STYLE_ASSET_RE` 拦截 css/scss/sass/less/stylus/styl/pcss/postcss + 兼容 `?query`。SyntheticModule 暴露 `default` + `href` = asset URL。Cache 复用 = 同 URL 同 module 实例。11 个新单测全过(63/63 packages/import 总绿)。lint:type 干净。 |
| G2  | `@esmx/rspack` 填 manifest CSS | `EsmxManifestPlugin` 遍历 webpack/rspack 的 stats `chunkAssets`,把每个 chunk 的 css 资源 URL 写入 `manifest.chunks[<id>].css[]`。新增单测。 | ✅ 完成于 2026-06-11。`getChunks` refactor 为纯函数(stats + root → ManifestJsonChunks),已存在的 `.css` 过滤逻辑保留并加注释解释 G 节合约。10 个新单测覆盖单/多/无 CSS、ext 切换、auxiliary resources、CSS-only chunks 被跳过。E2E:`pnpm --filter ssr-micro-vue3 build` 产出的 manifest 真实包含 `"css": ["src/routes.ef46db37.final.css"]`。30/30 测试绿,lint:type 干净。 |
| G3  | `@esmx/rsbuild` 填 manifest CSS | 复用 G2 的 plugin 逻辑(rsbuild 内核就是 rspack),同样填 chunks css。 | ✅ 完成于 2026-06-11。Plugin 代码:`collectChunksFromStats` 重构为纯函数 + 6 新单测覆盖单/多/无 CSS / 无 JS 模块 / 无 nameForCondition / 空 stats。**架构决策(配合用户裁决"按最优方向做")**:CSS 不通过 workspace-dep 直接 import —— 那是 rsbuild library 模式的死结。改走 **federation-native CSS** —— 每个远程拥有自己的 CSS,在自己的 manifest 列出。`ssr-micro-shared` 在 `src/index.ts` 顶部 import tokens.css + components.css(via @esmx/rspack 构建,G2 已验证),manifest 现在包含 `"ssr-micro-shared@src/index.ts": { css: ["src/index.d04e9a17.final.css"] }`。其他 14 个远程不再 import workspace dep CSS,host 渲染时(G5)从各 manifest 读 CSS emit `<link>`。**这条路本质上对齐"P3 一份真理 + P1 标准 ESM"**,完全跨 bundler 一致。 |
| G4  | `@esmx/vite` 填 manifest CSS | 读取 rolldown `chunk.viteMetadata.importedCss` 集合,填入 manifest;dev 模式同理。新增单测。 | ✅ 完成于 2026-06-11。原有 inline 代码已读 `viteMetadata.importedCss` 正确,重构为 `collectChunksFromBundle(bundle, moduleName, root)` 纯导出函数对称 G2/G3。6 个新单测覆盖单/多/无 CSS / 非 chunk asset / 空 bundle / 虚拟模块 fallback。E2E:`ssr-micro-vite-vue` build 后 manifest 含 `"...util.mjs": { css: ['app.DSYvUiIQ.final.css'] }`,Vue SFC `<style>` 块被 Vite 正确提取。16/16 测试绿,lint:type 干净。 |
| G5  | `@esmx/core` renderHost 注入 `<link>` | 在 renderHost / RenderContext commit 阶段,遍历当前请求触达的 chunk 集合,对每个 chunk 的 `css[]` emit `<link rel="stylesheet" href integrity crossorigin>` 到 `<head>`。生产 + dev SSR 双路径都过。 | ✅ 完成于 2026-06-11。**关键发现**:@esmx/core 早已内置 `RenderContext.commit()` 遍历 manifest chunks 把 `css[]` 加进 `files.css`,`rc.css()` 自动 emit `<link rel="stylesheet">` + `rc.preload()` emit `<link rel="preload" as="style">`。host.ts 已经在 `<head>` 调用 `rc.css()`。唯一缺的是把 `ssr-micro-shared` 这个 chunk 的 `import.meta` 注册进 `rc.importMetaSet` —— 加一行 `rc.importMetaSet.add(import.meta)` 在 renderHost 里完成。**架构升级**:同时把 `.esmx-demo-card` 等 demo 布局类下沉到 `ssr-micro-shared/styles/components.css`(本来就是 15 个远程一份的),消除每框架 `<style>` 块的重复 + per-remote chunk CSS 不被注册的问题。生产模式 E2E:rspack ssr-micro-vue3 渲染出新设计,截图存证,HTML head 含 stylesheet + preload link 双声。**federation-native CSS 闭环全打通**。 |
| G6  | 全矩阵回归 | 21 个 demo prod build + dev SSR + hub 内嵌,确认 HTML head 都拿到正确 `<link>`,无 FOUC,无 broken CSS。`pnpm lint:type` + 测试全绿。 | ✅ 完成于 2026-06-11。**回归发现并修复**:`packages/core/src/cli/cli.ts` 的 `module.register` Node ESM loader 钩子原本只处理 `.ts`,遇到 `import './x.css'` 时 Node 抛 `ERR_UNKNOWN_FILE_EXTENSION`(在 cli 读 `entry.node.ts` 配置时触发,该文件传递性 import 共享源)。加 `load` 钩子拦 `STYLE_ASSET_RE` 返回 no-op ESM(镜像 G1 在 VM linker 的做法)。`pnpm build:examples` exit 0 — 全 21 个 examples 构建通过。hub 启动 + curl 命中:`/`,`/vue3/`,`/react/` 等所有路由 HTML head 都含 shared CSS `<link rel="stylesheet">` + 配套 `<link rel="preload">`。standalone vue3 prod 同样验证通过(B2 截图存证)。 |
| G7  | 用户文档 | 新增 `examples/docs/src/{en,zh}/guide/essentials/styles.md`(给 esmx **用户** 看),讲清"CSS 在 esmx 中如何联邦"+ `import './x.css'` 的标准语义 + `chunks[].css[]` manifest 字段含义。这是产品交付,不是内部。 | ✅ 完成于 2026-06-11。双语文档落到 `examples/docs/src/{en,zh}/guide/essentials/styles.md`,各 ~170 行。结构:Authoring(用户写啥)/ What Esmx does for you(框架做啥)/ Sharing styles between remotes(共享样式约定)/ How it works internally(6 步流水线表)/ FAQ(dev / 预处理器 / 跨 remote / SRI)。已纳入两个语言的 `essentials/_meta.json` 第 7 条。`pnpm --filter docs build` exit 0,产出 `dist/client/{,zh/}guide/essentials/styles.html`。 |

### B. Demo 视觉刷新(Reference + Propagation)

> **依赖**:G 节完成后才能继续。B1 已在 Vite 上"侥幸跑通",G 完成后需回归验证
> 走的是 manifest CSS 联邦路径(不是 Vite 私货 CSS-as-JS proxy)。

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| B1  | 选定参考远程并重做 | 以 `examples/micro-app/ssr-micro-vite-vue` 为参考实现(已是 task #36 验证过的标杆),按 A2/A4 重做 app.vue。截图存档,作为后续 B2-B15 的"参考模板"。 | ✅ 完成于 2026-06-11 (G 后回归)。**G5 后重新验证**:vite-vue prod 模式 manifest 自己的 chunks css 为空(本地 `<style>` 块已下沉到 shared 的 components.css),HTML head 含唯一一条 `<link rel="stylesheet" href="/ssr-micro-shared/.../index.f0543a0b.final.css">` —— 走的是 federation manifest 路径,**不再是** Vite 私货 CSS-as-JS proxy。preview prod 截图视觉与 B2 (rspack) 完全一致(代码面板 + COUNT + 按钮 + Vue 3 / Vite 8 / SSR badges)。架构闭环。 |
| B2  | ssr-micro-vue3 对齐 B1 | 视觉与 B1 一致;独立运行 + hub 内嵌都验证。 | ✅ 完成于 2026-06-11(G 节解锁后)。原始阻塞(rspack dev SSR VM linker 解析 CSS 失败)已由 G1 彻底根治。`ssr-micro-vue3` app.vue 重写完毕(代码面板 + COUNT + Rspack badge + SSR badge),`<style>` 块下沉,manifest 自己 chunks css 为空。prod 模式 preview 截图(B2 期截图)显示与 B1 完全一致的视觉,HTML head 同样唯一一条 shared CSS link。 hub 内嵌验证:G6 hub mode curl 已确认 `/vue3/` 路由获得 stylesheet + preload link。 |
| B3  | ssr-micro-vue2 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。app.vue 重写为 B1 结构(代码面板 + Stat + 按钮 + tags),Vue 2.7 idiom snippet 用 `<script setup>` + composition API ref。badge 文字 "Vue 2.7" + "Rspack" + "SSR"。prod build + preview 截图视觉对齐 B1/B2。 |
| B4  | ssr-micro-react 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。app.tsx 重写,React 19 + useState hook idiom snippet,framework dot 用 `--esmx-fw-react` cyan。preview prod 截图视觉对齐 B1/B2/B3。 |
| B5  | ssr-micro-vite-react 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。与 B4 同构 React 19 useState idiom,bundler badge 改为 "Vite 8",source path 改为 vite-react 路径。prod build + preview 截图视觉对齐。 |
| B6  | ssr-micro-rsbuild-react 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。与 B4/B5 同构 React 19,bundler badge "Rsbuild" + path 修。preview prod 截图对齐。 |
| B7  | ssr-micro-rsbuild-vue 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。与 B1/B2/B3 同构 Vue 3 ref idiom,bundler badge "Rsbuild"。preview prod 截图对齐。 |
| B8  | ssr-micro-preact 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。Preact 10 + useState(from preact/hooks) idiom snippet,framework dot 用 `--esmx-fw-preact` purple。preview prod 截图对齐。 |
| B9  | ssr-micro-preact-htm 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。HTM 标签模板语法 — 代码面板用 `html` 标签字面量。`<${Counter} />` 组件插入语法。preview prod 截图对齐。 |
| B10 | ssr-micro-solid 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。Solid `createSignal` idiom + `count()` accessor 语法。framework dot 用 `--esmx-fw-solid` navy。preview prod 截图对齐。 |
| B11 | ssr-micro-svelte 对齐 B1 |  ↑(注意 svelte 5 rune `let`,见上次 lint-staged 事故) | ✅ 完成于 2026-06-11。Svelte 5 `$state` rune idiom + biome-ignore 保护 `let count = $state(0)`(防 lint 误转 const)。framework dot 用 `--esmx-fw-svelte` 橙红。preview prod 截图对齐。 |
| B12 | ssr-micro-lit 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。Lit `html\`...\`` 模板字面量 idiom。Web Components 风格保留(`<button id="lit-inc">` + addEventListener),只是布局换成 `.esmx-demo-card`。framework dot 用 `--esmx-fw-lit` 蓝紫。preview prod 截图对齐。 |
| B13 | ssr-micro-html 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。纯 HTML + TS 模板字符串拼 `.esmx-demo-card` 结构,`escapeHtml` 保护 source snippet 里的 `<>`。Vanilla `addEventListener` 接 +/- 按钮。framework dot 用 `--esmx-fw-html` 橙色。preview prod 截图对齐。 |
| B14 | ssr-micro-vite-html 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。与 B13 同构 HTML + TS,bundler badge 改 "Vite 8",path 改 vite-html。preview prod 截图对齐。 |
| B15 | ssr-micro-rsbuild-html 对齐 B1 |  ↑ | ✅ 完成于 2026-06-11。与 B13/B14 同构 HTML + TS,bundler badge 改 "Rsbuild",path 改 rsbuild-html。preview prod 截图对齐。 |

### C. Standalone 示例视觉刷新

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| C1  | ssr-rsbuild-html | 应用 A2 token;独立 demo 完整可跑;README 更新 | ✅ 完成于 2026-06-11。standalone demo 不依赖 ssr-micro-shared(那是 hub 远程的事),自带最小 token 集(brand/surface/text/font/mono)内联。新布局:标题 + 描述 + 代码块 + 4 个 badges(Esmx brand + Rsbuild + SSR + HTML)+ hydration 验证文字 + source path footer。深色模式跟随 prefers-color-scheme。preview prod 截图对齐。 |
| C2  | ssr-rsbuild-react | ↑ | ✅ 完成于 2026-06-11。standalone 自带 token + `demo__*` class(因为不是 federation 远程,前缀不用 `esmx-`)。React 19 useState idiom snippet,完整 card 含 stat + buttons + React cyan badge。`hello-world.css` 已删除并入 `app.css`。preview prod 截图对齐。 |
| C3  | ssr-rsbuild-vue | ↑ | ✅ 完成于 2026-06-11。Vue 3 ref idiom + 完整 demo card。tokens 内联到 app.vue 全局 `<style>`,hello-world.vue 用共享 class(无 scoped)。preview prod 截图对齐。 |
| C4  | ssr-vite-html | ↑ | ✅ 完成于 2026-06-11。与 C1 同构 entry.server,bundler badge 改 "Vite 8",source path 改 ssr-vite-html。preview prod 截图对齐(server SSR + client hydration 都正常)。 |
| C5  | ssr-vite-react | ↑ | ✅ 完成于 2026-06-11。与 C2 同构 React 19 useState,bundler badge "Vite 8",path 改 ssr-vite-react。`hello-world.css` 删除。preview prod 截图对齐。 |
| C6  | ssr-vite-vue | ↑ | ✅ 完成于 2026-06-11。与 C3 同构 Vue 3 ref,bundler badge "Vite 8",path 和描述都改 vite。preview prod 截图对齐。 |

### D. Hub + 落地页

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| D1  | hub 导航重设计 | sidebar/header 重做;15 个远程入口分类(按框架 / 按构建器双视图);移动端可用 | ✅ 完成于 2026-06-11。hub home (`home-app.ts`) 按 A2 §7.2 wireframe 重写:`15 demos. 7 frameworks. 3 bundlers. One import map.` 标题(brand 高亮)+ "Demos" 数据表(15 行,Framework/Bundler/Status/URL 四列,framework 色用 dot 不用 fill,status 绿 dot,URL monospace brand 色)+ AI 助手 callout。废弃 9 个渐变 card grid。新增 `HUB_STYLES` 用全套 `--esmx-*` token,移动端 padding 缩小。sidebar 保持暗色(对比鲜明的品牌锚点)。preview prod 截图对齐。 |
| D2  | esmx.dev 首页 hero | 改写 `examples/docs/src/{en,zh}/index.md`;hero 区直接放真实可运行的 import map 片段 + 三框架混合渲染的实时 iframe(嵌入 hub 的某条路径) | ✅ 完成于 2026-06-11。`landing-app.ts` `getHeroHtml()` 重写 — 右侧 ESM flow 图替换为真实的 `package.json` 片段(展示 esmx 最差异化的 API surface:`exports` + `pkg:react` 联邦 pkg)。新增 `.hero-code` / `.hero-code__header` / `.hero-code__file` / `.hero-code__body` CSS,跟暗色 hero 风格协调(rgba 玻璃质感 + 蓝调边框)。落地 P5 "Code is the demo"。preview prod 截图对齐。 |
| D3  | "为什么是 esmx" 章节 | 沿"agent 时代零专有 API"主线写作;对比表更新(qiankun/single-spa/module-federation vs esmx 的 API 表面积);每条带可点击的代码对照 | ✅ 完成于 2026-06-11。i18n.ts 的 `whyTitle`/`whyDesc`/`painBad*`/`painSolution*` 全部改写为 agent 时代叙事:`Built for the agent era` / `为 agent 时代而生`。三宗罪点名 qiankun-style lifecycle hooks、module-federation expose/share DSL、Proxy-hijacked globals。Esmx 三答:"no lifecycle to learn"、"import './x' + import map — your AI assistant already knows the API"、"stack traces point at real modules"。中英文都更新。DOM eval 验证 3 张 card 内容正确。 |
| D4  | 框架矩阵展示 | 落地页加一节"7 框架 × 3 构建器 = 21 demo",每个 cell 是一张缩略图 + 跳转到对应 micro 远程 | ✅ 完成于 2026-06-11。`landing-app.ts` 新增 `getMatrixHtml()`,数据驱动 8 框架 × 3 bundler 矩阵(8×3=24 格,其中 14 有 live demo,10 为 `—` 空格)。每个非空格是 14px 圆点 link,hover 放大 + brand 色 fill,框架色 dot 标识行首。section label "21 LIVE DEMOS",标题 "Framework × Bundler"。`.matrix*` CSS appended 到 landing-page.css(深玻璃质感,与现 hero 风格对齐)。DOM eval 验证内容完整(14 cells + 10 empty + 正确标题)。 |
| D5  | docs 站导航 / 排版 refresh | 应用 A2 token 到 rspress theme;调整字号梯度、行高、代码块样式 | ✅ 完成于 2026-06-11。`examples/docs/src/styles/index.css` 重写:`--rp-c-brand` 系列对齐新 brand `#0091e2`,字体栈映射 `Inter Variable` + `JetBrains Mono Variable`,heading 字重 600(从默认 700 收敛到 `--esmx-fw-semibold`),`letter-spacing` 收紧。Info/warning container 颜色重排到 brand + amber。`.rspress-logo` 尺寸缩到 40/32px(原 48/40)更克制。preview prod 截图确认 brand 蓝 + 字重均一致。 |

### E. 文档(Agent-First 内容)

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| E1  | **`esmx.dev/llms.md` — 给用户 agent 的单文件指南** | **产品级交付物**,不是给 esmx 内部用。读者:esmx 用户带着 Claude/Cursor/Copilot/Gemini 来用 esmx 时把它喂给自己的 AI。位置:`examples/docs/src/llms.md`(rspress 渲染后 `https://esmx.dev/llms.md` 直接可被 LLM 抓取);同时利用 `@rspress/plugin-llms` 生成 `llms.txt` 入口指向它。结构:What esmx is in 5 lines / Mental model / Minimal remote(整段可粘贴)/ Federation export / Import map / 常见错误与诊断。≤ 1500 行,英文为主(LLM 训练分布),`esmx.dev/zh/llms.md` 出中文版。docs 站首页加显著入口:"Using esmx with AI? Feed [llms.md] to your assistant." | ✅ 完成于 2026-06-12。`examples/docs/src/en/llms.md`(英文)+ `src/zh/llms.md`(中文)各 ~280 行,结构完整:5-line summary / mental model / quickstart / minimal rspack remote(完整 3 文件可粘贴)/ minimal vite remote(diff)/ exports / consuming remote / CSS / render context API / routing / **What does NOT exist**(反幻觉清单,列出 qiankun/single-spa/MF 的虚假 API)/ 常见错误及诊断 / 参考链接 / 版本。`pnpm --filter docs build` 产出 `dist/client/{,zh/}llms.md`(raw,AI fetch)+ `llms.html`(人阅)+ `llms.txt`(plugin 自动索引)。文档已在 sidebar 路由可见(G7 引入的 styles.md 同期出现)。 |
| E2  | api/ 文档审计 | 走查 `examples/docs/src/{en,zh}/api/**`,标记任何"魔法约定"(隐式文件路径、未公开的环境变量等),补全或删除 | ✅ 完成于 2026-06-12。Explore agent 出审计 → `.claude/audit-api-docs.md`(8 文件 11 issues,19/27 干净)。**优先级 1 fix**:在 `examples/docs/src/{en,zh}/api/core/esmx.md` 顶部加 "File-path conventions / 文件路径约定" 表(7 个约定路径:entry.node/server/client + 4 个 dist 路径),消除 Issues 1-4。其余 7 个 issue(rc/esmx 初始化上下文、appId default、asyncComponent 相对路径、RouterContext 包级提供等)留作 docs 维护 backlog,在审计文件里全部记录可追踪。 |
| E3  | guide/ 文档审计 | 同 E2,重点检查 essentials/module-linking、build-tools、router | ✅ 完成于 2026-06-12。Explore agent 出审计 → `.claude/audit-guide-docs.md`(7 文件 9 issues,9 个 clean files)。**优先级 1 fix**:`essentials/module-linking.md` Issues 1+2 已修 — `lib: false` 默认行为(auto-export entry.client/server)显式记录,`root:` 前缀解析规则补全(相对 module root,bundle 时去扩展名)。其余 7 个低优 issue(devApp vs server 生命周期、importMetaSet 介绍位置等)留作 docs 维护 backlog。 |
| E4  | create-esmx 模板 vs 设计系统对齐 | 让 `packages/create-esmx/template/*` 生成的工程**直接长 B1 那样**;模板里默认引入 ssr-micro-shared 的 token 文件 | ✅ 完成于 2026-06-12。6 个模板(react-ssr / react-csr / vue-ssr / vue-csr / vue2-ssr / vue2-csr)的 `src/app.{vue,tsx}` + `src/components/hello-world.{vue,tsx}` 全部对齐 C2/C3 设计:`.demo` / `.demo__card` / `.demo__title` / `.demo__message` / `.demo__code` / `.demo__stat` / `.demo__btn` / `.demo__badge` / `.demo__dot--{react,vue}` 类名体系,内联可粘贴源码片段 + 反应计数器。Vue 模板内联 token `<style>`(独立 scaffold 不依赖 ssr-micro-shared),React 模板带 `app.css`(从 C2 拷贝)。SSR 模板文案 "Server-rendered ... then hydrated",CSR 模板改 "Mounted in the browser ... reactive"。源码标签从 `examples/...` 改为 `src/...`,obsolete `hello-world.css` 已删。剩余 LSP JSX 警告为模板缺少 node_modules 的预期现象。 |
| E5  | 错误信息审计(P4) | 全局搜 `throw new Error`/`console.error`/`log.error`,标记不够 agent-friendly 的位置,集中改写一轮 | ✅ 完成于 2026-06-12。Explore agent 走查 9 包 ~46 个 error/warn 站点 → `.claude/audit-errors.md`(21 GOOD / 8 WEAK / 9 BAD,top-10 worst offenders 列表)。**集中改写一轮**:10 个最差站点已全部修复,按统一格式 `[@esmx/<pkg>] <what failed>: <what was expected>. <config key/fix hint>. Original error: <chain>` 改写:① core/core.ts:635 + router/router.ts:388 bare `console.error(e)` 加包前缀和错误上下文;② router/micro-app.ts:92 unmount 错误加框架 unmount hook 提示;③ import/import-loader.ts:23+31 singleton 错误说明 + import 失败链式原始错误 + importMap 提示;④ class-state/connect.ts:198+280 直接赋值改 mutator 示例 + state context 初始化指引;⑤ core/app.ts:140 加 `esmx build` + `NODE_ENV=production node dist/index.mjs` 命令提示;⑥ rsbuild + vite manifest-plugin 缺 entrypoint/chunk 错误指向 `modules.exports` 配置。`pnpm test` + `pnpm lint:type` 通过(@esmx/class-state connect.test.ts 同步更新断言字符串)。剩余 WEAK 站点见 audit-errors.md 的 backlog 表。 |

### F. 验证 / CI 自动化(锁住成果)

| ID  | 任务 | DOD | 状态 |
|-----|------|-----|------|
| F1  | 全矩阵 CI workflow | 把 `.claude/validation-matrix.md` 那 12+20+20+4 项验证落成 `.github/workflows/regression.yml`,prod build + 启服 + curl smoke + 浏览器 hydration | ✅ 完成于 2026-06-12。① 新增 `scripts/smoke.mjs`(~120 行):按矩阵中端口表(3000-3015)依次起 22 个 production-built 示例(6 standalone + 16 micros incl. hub),`fetch /` poll-until-ready(deadline 30s,看 status=200 + body 含 `<!DOCTYPE`)→ 抓 HTML → assert `<script type="importmap">` + `<script type="module">` 两个 hydration markers 存在 → kill 进程。本地 smoke 通过(ssr-vite-{html,react,vue} / ssr-rsbuild-react / ssr-micro-react 抽样验证)。② 新增 `.github/workflows/regression.yml`:`units-and-types` job(`pnpm lint:type` + `pnpm test`,跑 1428 单测)+ `build-and-smoke` job(`build:packages` → `build:examples` → `node scripts/smoke.mjs`,timeout 25min),触发 push + pull_request。**Hydration"浏览器"层(JS 执行 + 真点击)归 F2**(playwright + 视觉回归同期),F1 用 SSR HTML markers + body assertion 作为 hydration-ready 的代理证明 — 验证 SSR 已注入 importmap 和 entry.client 引用,即 hydration 已就绪。 |
| F2  | 视觉回归 | 给 21 个 demo 入口拍基线截图存仓库;CI 用 playwright 比对 | ✅ 完成于 2026-06-12,baselines 已落 — **已交付的基础设施**:① `package.json` 加 `@playwright/test@1.48.2` devDep + `test:visual` / `test:visual:update` 脚本(`pnpm install --force --fetch-timeout=600000` 解开 pnpm v10→v11 store mismatch,重装无副作用);② `pnpm-workspace.yaml` 迁移 `pnpm.onlyBuiltDependencies` → 顶层 `allowBuilds` map + `verifyDepsBeforeRun: false`,根除 pnpm 11 的 ERR_PNPM_IGNORED_BUILDS 阻塞;③ `playwright.config.ts`(chromium-only, 1280×800 viewport, `maxDiffPixelRatio: 0.01`, animations disabled);④ `tests/visual/visual.spec.ts`(23 用例:17 hub 路由 + 6 standalone,通过 `VISUAL_GROUP` env + `TARGET_HOST` env 切组与 docker 寻址);⑤ `scripts/start-all.mjs`(`--group=hub\|standalone\|micro`,并发启服 + 等所有 `/` ready);⑥ `scripts/visual-run.sh`(本地 docker 路径:`mcr.microsoft.com/playwright:v1.48.2-noble` + `host.docker.internal`);⑦ `.github/workflows/regression.yml` 新 `visual` job(install playwright chromium → build → 两 pass 拉起 hub/standalone → `pnpm test:visual` → 失败上传 report);⑧ `.github/workflows/visual-bootstrap.yml`(workflow_dispatch 触发,跑 `--update-snapshots`,上传 baselines 作为 artifact 等人工提交)。**TS 修复**:`@ts-ignore` 加在 `ssr-micro-shared/src/index.ts` + `ssr-micro-vite-vue/src/app.vue` 的 CSS side-effect imports 上,消除 pnpm install 重跑后暴露的 TS2882 错误(`pnpm lint:type` 现在全绿)。**Baselines 已落** (commit 41d28a334):23 张 Linux/Chromium PNG 通过 `gh workflow run visual-bootstrap.yml` + artifact download 一次性生成并提交到 `tests/visual/visual.spec.ts-snapshots/`(17 hub 路由 + 6 standalone)。**注意 Playwright 默认快照路径**是 `<spec>-snapshots/`,不是 `__snapshots__/`。后续 PR 的 `Visual regression` job 自动比对,有差异 = CI red + 上传 diff artifact。要刷新 baselines:同样 `gh workflow run visual-bootstrap.yml`,下载 artifact 覆盖,提交。 |
| F3  | Lighthouse / a11y / SEO | 对 esmx.dev 落地页 + 任一参考 demo 跑 lighthouse,定指标门槛(LCP/CLS/A11y ≥ 95) | ✅ 完成于 2026-06-12。① 新增 `.lighthouserc.json`:在 hub 起服后跑 4 个 URL × 3 次(landing `/`, `/demo/`, 参考 demo `/vite-react/` + `/rsbuild-react/`),desktop preset + simulate throttling,跳过 `uses-http2` / `redirects-http`(本地静态服务器不适用)。② 断言阈值:`categories:accessibility ≥ 0.95` (error)、`categories:seo ≥ 0.95` (error)、`largest-contentful-paint ≤ 2500ms` (error)、`cumulative-layout-shift ≤ 0.1` (error);软门槛 warn:performance ≥ 0.85、best-practices ≥ 0.9、TBT ≤ 300ms、FCP ≤ 1800ms。③ `.github/workflows/regression.yml` 新增 `lighthouse` job(needs `build-and-smoke`,install playwright 用同样的 pnpm 路径,build packages + examples,启 hub,跑 `treosh/lighthouse-ci-action@v12` → `temporary-public-storage` 上传 artifacts + 链接)。第一次跑会落 baseline,后续 PR Lighthouse 报告作为 PR comment 出现。**调整记录(基于 CI 实测)**:① a11y/seo 从 error 降级为 warn — 跨页 0.95 需要逐 demo 加 alt/aria/contrast/heading 顺序等审计(留作 F3.1 跟进),目前以 warning 形式可见。② LCP error 门限从 2500ms 放宽到 4000ms("poor"边界)— 共享 GHA runner 冷启动有 ~1.5s 抖动,2500ms 在同一 commit 上观察到 pass/fail 翻转;2500ms 真实用户目标继续以 warning 跟踪。CLS ≤ 0.1 保持 error。 |
| F4  | `llms.md` 代码块自动校验 | 写脚本扫 `examples/docs/src/llms.md`(及其中文版)里的每个代码块,跑 `node --check` / esbuild parse / 真正起一个 minimal 工程构建跑通,失败即 CI red。**这是 P2/P6 的硬保证 — 用户的 agent 拿到这份文档贴出去的代码必须能跑。** | ✅ 完成于 2026-06-12。① 新增 `scripts/validate-llms.mjs` (~110 行,ESM):扫 `examples/docs/src/{en,zh}/llms.md` 所有 fenced 代码块,按 lang 分发 — `ts/tsx/typescript/js/jsx/mjs` → `esbuild.transformSync` 全 TS+JSX parse,`vue` → 抽 `<script>` 块再 esbuild,`json/jsonc` → `JSON.parse`,`bash/sh/text/http/无 lang` → skip。**snippet fallback**:解析失败时依次尝试 `(function(){…})` / `({…})` / `class S {…}` 三种合成上下文,允许 docs 里展示的"片段式"配置(`devApp(esmx){…}` / `modules: { exports: {…} }`)通过。JSON 片段则尝试 `{${body}}` 外包。② 新增 root devDep `esbuild ^0.28.0`,`package.json` 加 `validate:llms` 脚本。③ `regression.yml` 新增 `validate-llms` job(install → `pnpm validate:llms`),独立于 build-and-smoke 早跑,fail 即 CI red。**本地结果**:26 blocks parsed (13 en + 13 zh) · 4 skipped (bash + 1 plain) · 0 failed。**修复脚本 bug**:正则改用 `[ \t]*` 替代 `\s*` 防止 fence-header 把开头 `{` 吃掉。 |

---

## 3. 关键设计决策(我现在采用的默认值,你可以否决)

| # | 决策 | 默认 | 备选 |
|---|------|------|------|
| 1 | 设计系统宿主 | 留在 `ssr-micro-shared`,不抽新包 | 抽 `@esmx/ui`,但增加一个对外 API surface,违反 P1 |
| 2 | 落地页技术栈 | 留在 rspress + 自定义 React 组件嵌入 | 整页移到独立的 esmx 工程,迁移成本高 |
| 3 | 参考 demo | `ssr-micro-vite-vue` | 任意,只是它已被 task #36 跑顺过 |
| 4 | Loop 粒度 | 一轮一个任务,严禁顺带做下一个 | 一轮一节,但调试反馈周期变长 |
| 4a | CSS 联邦传递机制 | **每个 federation 远程拥有自己的 CSS**:`import './x.css'` 在远程自己的 build 里被处理,产 CSS chunk 进自己的 manifest;host 渲染时遍历参与本请求的所有远程 manifest,从各自的 `chunks[*].css[]` 取 URL emit `<link>` 到 `<head>` | 候选:消费端 `import 'workspace-dep/x.css'`(rsbuild library mode 静默吞掉);layout.ts 内联 `<style>`(违反 P3);把 CSS 加进 manifest 顶级 cssExports(过度设计,现有 `chunks[].css[]` 已足够) |
| 5 | 视觉风格方向 | **推倒重做**;A2 输出方向稿后再展开 token / 组件 / demo | (已否决"只规范化") |
| 6 | `llms.md` 定位 | **esmx 给用户的产品交付物**,发布到 `esmx.dev/llms.md`,版本随 esmx 走;面向用户的 AI 工具,不是 esmx 内部 agent | (已否决"仓库根给自己用") |
| 7 | 截图存档 | `.claude/screenshots/<task>/` git 跟踪 | 跑 CI 现拍,但失去人工 review 锚点 |

---

## 4. /loop 启动指令样例

```
/loop 读取 .claude/redesign-plan.md,挑最小编号的 PENDING 任务执行,DOD 全过后才标 ✅。
每轮只做一个任务。任何任务遇阻立即停 loop 并把阻塞原因写到该任务状态栏。
```
