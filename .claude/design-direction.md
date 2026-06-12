# Esmx UX Design Direction (Task A2)

> 任务 A2 交付物 — 从零重新设计的 UX 方向稿。
>
> 输入:`.claude/audit-visual.md`(A1 审计)+ `.claude/redesign-plan.md` §1 原则。
> 输出给 A3/A4/A5:本文件是 token 落地、设计文档撰写、组件实现的 single source of truth。

---

## 1. 心智锚点

**"Show, don't sell."** —— 访客打开任意一个 esmx 表面(首页 / 远程 demo / 文档),
**第一屏就应该看到代码**,而不是看到营销词、渐变、或框架 logo。我们的产品是
"标准 ESM + import map 做联邦",这件事**只能用代码示意**,任何插画都是稀释。

衍生的五条架构决策,贯穿全方向稿:

| # | 决策 | 替代 | 理由 |
|---|------|------|------|
| D1 | **代码即主体** — demo 卡片的视觉重心是源码片段(语法高亮、monospace),框架渲染输出作为次要"运行结果"窗格 | (现状:渲染输出 + 大渐变 logo 占主体,代码不可见) | P5。esmx 的差异化是"标准 ESM 写法",必须给用户看到 |
| D2 | **样式架构统一为 CSS 类** — 所有 micro + standalone 用 class,**清除内联 style** | (现状:micro 全内联,standalone 全 class,两套架构) | P2。CSS 类更易复制粘贴、易切换暗色、易给 agent 解释 |
| D3 | **Token 集合统一** — 一套 `--esmx-*` token,定义在 `ssr-micro-shared/src/styles/tokens.css`,**所有表面**(15 micro + 6 standalone + hub + docs 站 rspress theme)都引用 | (现状:三套并行命名空间,品牌色三处不同) | P3。一份真理 |
| D4 | **框架色降级为"小色点"** — 9 种框架色不再做卡片背景渐变,改为 8-10px 圆点 + 框架文字标签 | (现状:每个远程一份硬编码 135° 渐变,大块占视野) | P1。框架色是元数据,不是品牌,不该抢主视觉 |
| D5 | **Light mode 为默认** — 文档站、hub、所有 demo 都以浅色为默认,深色作为用户偏好/toggle 提供 | (现状:hub sidebar 深色 + 内容浅色混合,docs 浅色,标准 demo 浅色 — 不一致) | P1。Light = documentation-grade,与"infrastructure not entertainment"调性一致 |

---

## 2. 视觉气质参考

**目标气质**:Stripe Docs / Astro / Tailwind v3 / TC39 提案页 / MDN 的交集 —
"专业、密集、文档级,但不沉闷"。

**反面参考**(我们 **不** 做):
- 渐变背景 + 大 hero 插画(Vercel、Next 早期)
- 暗色霓虹效果(炫技,信息密度低)
- 多色卡片网格(像 hackathon 提交页)
- 营销味动画 / lottie 装饰

---

## 3. 色板(Light + Dark)

### 3.1 品牌色(单一,克制使用)

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--esmx-brand`        | `#0091e2` | `#48b9ec` | 链接、Primary CTA、active 状态、品牌徽章 |
| `--esmx-brand-hover`  | `#0079bd` | `#65c5f0` | hover |
| `--esmx-brand-soft`   | `#e6f3fa` | `#0c2030` | 浅色背景填充(badge bg、focus ring 等) |

**说明**:cyan 而非 blue。`#0091e2` 是从现 docs `#12b2ef` 加深(对比度提到 AA+),
作为唯一品牌色,**替换** micro 系 `#3b82f6` + standalone `#001137`。

### 3.2 表面色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--esmx-bg-canvas`    | `#fdfdfd` | `#0c1117` | 页面底色 |
| `--esmx-bg-paper`     | `#ffffff` | `#161b22` | 卡片、面板 |
| `--esmx-bg-subtle`    | `#f5f7f9` | `#1c232c` | 代码块底色、表头、alternate row |
| `--esmx-bg-overlay`   | `rgba(13,17,23,0.5)` | `rgba(0,0,0,0.6)` | mobile drawer overlay |

### 3.3 边框 & 分隔

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--esmx-border`         | `#e5e9ed` | `#30363d` | 默认边框 |
| `--esmx-border-strong`  | `#c9d1d9` | `#484f58` | 表头、分组分隔 |
| `--esmx-border-subtle`  | `#eef1f3` | `#21262d` | 表格行分隔 |

### 3.4 文本

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--esmx-text-primary`   | `#0c1117` | `#e6edf3` | 标题、正文 |
| `--esmx-text-secondary` | `#5a6473` | `#8b949e` | 副标题、说明文字 |
| `--esmx-text-muted`     | `#8b949e` | `#6e7681` | 元数据、placeholder、URL、时间戳 |
| `--esmx-text-inverse`   | `#ffffff` | `#0c1117` | Primary 按钮文字 |

### 3.5 状态色

| Token | Value(双模一致) | 用途 |
|-------|-----------------|------|
| `--esmx-success` | `#22a06b` | live / pass |
| `--esmx-warning` | `#d97706` | preview / pending |
| `--esmx-danger`  | `#dc3545` | fail / minus button(替换硬编码 `#ef4444`)|
| `--esmx-info`    | `#0091e2` | 同 brand |

### 3.6 框架色(D4 — 仅用作 8-10px 圆点 + 标签文字)

| Token | Value | Framework |
|-------|-------|-----------|
| `--esmx-fw-react`  | `#149eca` | React |
| `--esmx-fw-vue`    | `#41b883` | Vue |
| `--esmx-fw-preact` | `#673ab8` | Preact |
| `--esmx-fw-solid`  | `#2c4f7c` | Solid |
| `--esmx-fw-svelte` | `#ff3e00` | Svelte |
| `--esmx-fw-lit`    | `#324fff` | Lit |
| `--esmx-fw-html`   | `#e34f26` | HTML |

**绝不**用作背景渐变、按钮色、大块填充。仅圆点 / 边框 / 标签字色。

### 3.7 重要 token vs 现状对照

| 现状 | 新方案 | 备注 |
|------|--------|------|
| 三处不同品牌色(`#3b82f6` / `#12b2ef` / `#001137`)| `--esmx-brand: #0091e2` 单一 | D3 |
| `#ef4444` 硬编码 minus 按钮 × 15 | `--esmx-danger` | A1 #2 |
| 9 个框架渐变硬编码 | 7 个 `--esmx-fw-*` 圆点 | A1 #1, D4 |
| Rspress `--rp-c-brand: #12b2ef` | docs 站 `:root` 重写映射到 `--esmx-brand` | D3 |

---

## 4. 字号 & 字体

### 4.1 字体栈

| Token | Stack |
|-------|-------|
| `--esmx-font-sans` | `'Inter Variable', ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif` |
| `--esmx-font-mono` | `'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` |

**说明**:Inter / JetBrains Mono 都通过 `npm:@fontsource-variable/*` 或 CDN 注入。
不强制下载;可降级到 system-ui。

### 4.2 字号梯度(modular 1.25)

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-fs-xs`      | `0.75rem` (12px) | 元数据、time、tag |
| `--esmx-fs-sm`      | `0.875rem` (14px) | 副文本、表格 |
| `--esmx-fs-base`    | `1rem` (16px) | 正文 |
| `--esmx-fs-md`      | `1.125rem` (18px) | 强调段落 |
| `--esmx-fs-lg`      | `1.25rem` (20px) | h4 |
| `--esmx-fs-xl`      | `1.5rem` (24px) | h3 |
| `--esmx-fs-2xl`     | `2rem` (32px) | h2 |
| `--esmx-fs-3xl`     | `2.5rem` (40px) | h1 |
| `--esmx-fs-display` | `clamp(2.5rem, 4vw + 1rem, 3.5rem)` (40-56px) | landing hero |

**对比现状**:counter 数字从硬编码 `3rem` → `--esmx-fs-2xl`(2rem)— 不再夸张大。
h1 从 `2rem` weight 800 → `--esmx-fs-3xl` weight 600。

### 4.3 行高 & 字重

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-leading-tight`  | 1.2 | 大标题 |
| `--esmx-leading-snug`   | 1.4 | 中等标题 |
| `--esmx-leading-normal` | 1.6 | 正文 |
| `--esmx-leading-loose`  | 1.8 | 文档长段落 |
| `--esmx-fw-regular`     | 400 |  |
| `--esmx-fw-medium`      | 500 | 表头、强调 |
| `--esmx-fw-semibold`    | 600 | h1-h4(替换 800)|
| `--esmx-fw-bold`        | 700 | 仅 inline `<strong>` |

### 4.4 字距

代码与等宽 UI 标签字距 `0`。大写标签(section eyebrow)字距 `0.08em`。
正文不设。

---

## 5. 间距 & 尺寸 scale

### 5.1 间距(4px 基准,t-shirt)

| Token | px | 常见用途 |
|-------|-----|---------|
| `--esmx-space-0`  | 0    |  |
| `--esmx-space-1`  | 4px  | icon-text gap |
| `--esmx-space-2`  | 8px  | button gap、tag padding-y |
| `--esmx-space-3`  | 12px | tight padding |
| `--esmx-space-4`  | 16px | card 内 padding、纵向段距 |
| `--esmx-space-5`  | 20px | medium padding |
| `--esmx-space-6`  | 24px | card padding(替换现 48px)|
| `--esmx-space-8`  | 32px | section 段距 |
| `--esmx-space-10` | 40px | hero 段距 |
| `--esmx-space-12` | 48px | hero 上下边距 |
| `--esmx-space-16` | 64px | landing block 间距 |
| `--esmx-space-20` | 80px | landing hero 上下 |

**关键变化**:card padding 从 48px → 24px(更密集,接近文档站风格)。

### 5.2 圆角(更小,更"工程感")

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-radius-sm`   | 4px | badge、tag、input |
| `--esmx-radius-md`   | 6px | button |
| `--esmx-radius-lg`   | 8px | card |
| `--esmx-radius-xl`   | 12px | modal、hero card |
| `--esmx-radius-pill` | 9999px | chip、avatar dot |

**关键变化**:card 圆角从 16px → 8px。Icon 14px 不再适用(D4 已弃用大 icon)。

### 5.3 阴影(克制,优先用边框)

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-shadow-sm` | `0 1px 2px rgba(13,17,23,0.06)` | hover 微提升 |
| `--esmx-shadow-md` | `0 2px 8px rgba(13,17,23,0.06), 0 1px 2px rgba(13,17,23,0.04)` | popover |
| `--esmx-shadow-lg` | `0 8px 24px rgba(13,17,23,0.08), 0 2px 4px rgba(13,17,23,0.04)` | modal |

默认 card **无阴影**,只用边框。Hover 时增加 `--esmx-shadow-sm`。

### 5.4 容器宽度

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-width-narrow`  | 720px  | 长文阅读 |
| `--esmx-width-content` | 960px  | 标准内容 |
| `--esmx-width-wide`    | 1200px | landing / hub |
| `--esmx-width-full`    | 1440px | hub 表格 max-width |

### 5.5 过渡

| Token | Value | 用途 |
|-------|-------|------|
| `--esmx-duration-instant` | 100ms | 颜色 / opacity |
| `--esmx-duration-fast`    | 150ms | 边框 / shadow |
| `--esmx-duration-normal`  | 200ms | transform / 布局 |
| `--esmx-ease-out`         | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 默认缓动 |

---

## 6. 组件外观规范

### 6.1 Button

| 变体 | 外观 |
|------|------|
| **Default**(ghost) | bg: transparent · border: 1px `--esmx-border` · color: `--esmx-text-primary` · hover: bg `--esmx-bg-subtle` |
| **Primary** | bg: `--esmx-brand` · border: 0 · color: `--esmx-text-inverse` · hover: bg `--esmx-brand-hover` |
| **Danger**  | bg: `--esmx-danger` · border: 0 · color: `--esmx-text-inverse` · hover: 稍暗 |
| **Subtle**  | bg: `--esmx-bg-subtle` · border: 0 · color: `--esmx-text-primary` |
| **Icon**    | 32×32, 圆形,只装 svg / unicode |

通用属性:
- 字号:`--esmx-fs-sm`(14px)· 字重 medium · padding `8px 14px` · 圆角 `--esmx-radius-md`
- 大尺寸 Primary CTA 用 `--esmx-fs-base` + padding `10px 18px`
- 不再有 `1.2rem` button 字体(现状违反 scale)

### 6.2 Card

- bg: `--esmx-bg-paper` · border 1px `--esmx-border` · 无 shadow · padding `--esmx-space-6` · 圆角 `--esmx-radius-lg`
- Hover:border 变为 `--esmx-border-strong` + 加 `--esmx-shadow-sm`,不改变背景
- **不再有渐变背景、不再有 64px 巨大 icon**

### 6.3 Code block

- bg: `--esmx-bg-subtle` · 无 border · padding `--esmx-space-4` `--esmx-space-5` · 圆角 `--esmx-radius-md`
- 字号 `--esmx-fs-sm`(14px)· font `--esmx-font-mono` · line-height 1.55
- 语法高亮:用 shiki 的 `github-light` / `github-dark`(与默认主题色对齐)
- 文件名 header(可选):上方一条 `--esmx-bg-paper` 条,左侧 monospace `path/file.ts`

### 6.4 Stat / Counter

替代当前"3rem 巨型数字"。新结构:

```
COUNT
7
```

- 上方 eyebrow:`--esmx-fs-xs` · uppercase · letter-spacing 0.08em · color `--esmx-text-muted`
- 数字:`--esmx-fs-2xl`(32px,不再是 48px)· weight semibold · font mono · color `--esmx-text-primary`
- 整体 padding:`--esmx-space-4`
- 旁边一组小按钮(Default 变体)负责 +/−

### 6.5 Tabs

- 下划线式,不要 pill 背景
- 字号 `--esmx-fs-sm` · 默认 color `--esmx-text-secondary`
- Active:color `--esmx-brand` · `border-bottom: 2px solid --esmx-brand`
- 容器 `border-bottom: 1px solid --esmx-border`

### 6.6 Badge / Tag

- 圆角 `--esmx-radius-pill` · 字号 `--esmx-fs-xs` · padding `2px 8px`
- font mono · 用于版本号 / 框架 / status
- 颜色:`framework` 用 `--esmx-fw-*` 作 border + text(bg 透明);`status` 用 status 色族
- **框架色点**变体:`8px × 8px` 圆形 · `inline-block` · 不跟边框

### 6.7 Table

- 字号 `--esmx-fs-sm` · padding `8px 12px` · border-bottom `--esmx-border-subtle`
- 表头:`--esmx-bg-subtle` bg · `--esmx-fw-medium` · uppercase eyebrow style
- 行 hover:`--esmx-bg-subtle`
- 用于 hub 首页(D2)的 demo 索引

### 6.8 Banner / Callout

- bg: `--esmx-brand-soft` · border-left 3px `--esmx-brand` · padding `--esmx-space-4` · 圆角 `--esmx-radius-md`
- 用于"Using esmx with AI? Feed it llms.md"这种关键引导

---

## 7. 三张 Wireframe

### 7.1 Remote demo 卡片(任意框架,布局一致)

替换现"巨型框架渐变 icon + 3rem 数字按钮"。新版"代码 + 渲染"双栏:

```
┌─ ssr-micro-vite-vue ─────────────────────────────────── /demo/vv3 ─┐
│                                                                     │
│  ┌─ src/app.vue ─────────────────────┐  ┌─ Rendered output ─────┐  │
│  │ <script setup lang="ts">           │  │                        │  │
│  │   import { ref } from 'vue'        │  │     COUNT              │  │
│  │   const count = ref(0)             │  │     7                  │  │
│  │ </script>                          │  │                        │  │
│  │                                    │  │   [ + ]  [ − ]         │  │
│  │ <template>                         │  │                        │  │
│  │   <p>Count: {{ count }}</p>        │  │                        │  │
│  │   <button @click="count++">+</…    │  └────────────────────────┘  │
│  │   <button @click="count--">-</…    │                              │
│  │ </template>                        │   • Vue 3                    │
│  └────────────────────────────────────┘   • Vite 8                   │
│                                            • SSR + hydrate           │
│                                                                     │
│  source · `examples/micro-app/ssr-micro-vite-vue/src/app.vue`       │
└─────────────────────────────────────────────────────────────────────┘
```

- **左栏(60%)**:`src/app.vue` 源码,shiki 语法高亮,文件名 header。**主视觉**。
- **右栏(40%)**:Rendered output 框 — 一个小窗格里渲染框架真实输出(Stat 组件 + 两个 button)。
- **下方**:三个 framework dot tag + source path(可点击跳到 GitHub blob)。

**关键变化**:不再有 56px 渐变 icon、不再有 3rem 数字、所有 inline `style` 改用 class。

### 7.2 Hub 首页

替代当前 9 个渐变卡片网格。新版"语句 + 数据表 + 实时 import map":

```
┌────────────────────────────────────────────────────────────────────────┐
│ esmx hub                                                  [light/dark] │
│────────────────────────────────────────────────────────────────────────│
│                                                                        │
│   21 demos. 7 frameworks. 3 bundlers.                                 │
│   One import map.                                                     │
│                                                                        │
│   ┌─ Demos ─────────────────────────────────┐ ┌─ Live import map ─┐  │
│   │ FRAMEWORK   BUNDLER    STATUS    URL    │ │ {                  │  │
│   │ ──────────────────────────────────────  │ │   "imports": {     │  │
│   │ ● Vue 3     Vite       ● live  /vv3  →  │ │     "vue":         │  │
│   │ ● Vue 3     Rspack     ● live  /vr3  →  │ │       "/vue/...",  │  │
│   │ ● Vue 3     Rsbuild    ● live  /vb3  →  │ │     "react":       │  │
│   │ ● Vue 2     Rspack     ● live  /vr2  →  │ │       "/react/..", │  │
│   │ ● React 19  Vite       ● live  /rr   →  │ │     ...            │  │
│   │ ● React 19  Rspack     ● live  /rs   →  │ │   },               │  │
│   │ ● React 19  Rsbuild    ● live  /rb   →  │ │   "scopes": { ... }│  │
│   │ ● Preact    Rspack     ● live  /pr   →  │ │ }                  │  │
│   │ ● Solid     Rspack     ● live  /sl   →  │ │                    │  │
│   │ ● Svelte    Rspack     ● live  /sv   →  │ │ refreshes on       │  │
│   │ ● Lit       Rspack     ● live  /lt   →  │ │ remote restart     │  │
│   │ ● HTML      Vite       ● live  /vh   →  │ │                    │  │
│   │ ...                                     │ │                    │  │
│   └─────────────────────────────────────────┘ └────────────────────┘  │
│                                                                        │
│   ┌─ Using esmx with an AI assistant? ────────────────────────────┐   │
│   │   →  Feed it esmx.dev/llms.md  (one file, ≤1500 lines)         │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- 标题是一个"事实陈述",不是营销:`21 demos. 7 frameworks. 3 bundlers. One import map.`
- 数据表代替渐变卡片网格 — demo 索引本身长得像文档
- 右侧浮动一份**真实 live import map**(从服务端实时拉)— 让访客看到"这就是让 21 个 demo 互相联邦的全部魔法"
- 底部 callout 引导用户的 AI 工具

### 7.3 esmx.dev 首页

替代当前 rspress 默认 hero + features。新版"代码即首屏":

```
┌────────────────────────────────────────────────────────────────────────┐
│ esmx       docs · api · guide · github             [light/dark][lang]  │
│────────────────────────────────────────────────────────────────────────│
│                                                                        │
│  ┌──────────────────────────┐    ┌─ package.json ───────────────────┐  │
│  │                          │    │ {                                │  │
│  │  Native-ESM              │    │   "esmx": {                      │  │
│  │  micro-frontends.        │    │     "exports": {                 │  │
│  │                          │    │       "./components": {          │  │
│  │  No sandbox.             │    │         "browser":  "...",       │  │
│  │  No proxy.               │    │         "server":   "..."        │  │
│  │  No custom API.          │    │       },                         │  │
│  │  Just import maps and    │    │       "pkg:react": {             │  │
│  │  standard ESM.           │    │         "pkg": true              │  │
│  │                          │    │       }                          │  │
│  │  [Quickstart →]          │    │     }                            │  │
│  │  [Live demos]            │    │   }                              │  │
│  │                          │    │ }                                │  │
│  └──────────────────────────┘    └──────────────────────────────────┘  │
│                                                                        │
│────────────────────────────────────────────────────────────────────────│
│                                                                        │
│   WHAT MAKES IT DIFFERENT                                              │
│                                                                        │
│   ┌─ Zero runtime overhead ─┐ ┌─ Standard ESM ────┐ ┌─ Any bundler ─┐ │
│   │ <script type=           │ │ import {App} from │ │ Rspack         │ │
│   │   "importmap">          │ │   '@your/remote'  │ │ Rsbuild        │ │
│   │   { "imports": ...      │ │                   │ │ Vite           │ │
│   │ </script>               │ │ no qiankun        │ │ — all output   │ │
│   │                         │ │ lifecycle, no     │ │ the same       │ │
│   │ browser does the rest   │ │ proprietary       │ │ federation     │ │
│   │                         │ │ loader            │ │ chunks         │ │
│   └─────────────────────────┘ └───────────────────┘ └────────────────┘ │
│                                                                        │
│────────────────────────────────────────────────────────────────────────│
│                                                                        │
│   ┌─ Using esmx with an AI assistant? ───────────────────────────┐    │
│   │  Claude / Cursor / Copilot / Gemini — feed them one file:    │    │
│   │  → https://esmx.dev/llms.md                                  │    │
│   │  ≤ 1500 lines · every code block CI-validated · versioned    │    │
│   │  with esmx                                                   │    │
│   └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│────────────────────────────────────────────────────────────────────────│
│                                                                        │
│   FRAMEWORK × BUNDLER                                                  │
│                                                                        │
│              │ Vite 8 │ Rspack │ Rsbuild │                             │
│   ───────────┼────────┼────────┼─────────┤                             │
│   Vue 3      │   ●    │   ●    │    ●    │ → 3 demos                   │
│   Vue 2      │        │   ●    │         │ → 1                         │
│   React 19   │   ●    │   ●    │    ●    │ → 3                         │
│   Preact     │        │   ●    │         │ → 2                         │
│   Solid      │        │   ●    │         │ → 1                         │
│   Svelte     │        │   ●    │         │ → 1                         │
│   Lit        │        │   ●    │         │ → 1                         │
│   HTML       │   ●    │   ●    │    ●    │ → 3                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Hero 左侧:**只有文字 + 两个 CTA**,无任何插画 / icon / 渐变
- Hero 右侧:**真实的 `package.json` 片段** — 直接展示 esmx 的核心 API surface(`exports` 字段)
- "What makes it different" 三栏:**每栏的视觉重心是一段真代码**,marketing 文字只作脚注
- AI callout 单独高亮(`--esmx-brand-soft` 背景 + `border-left`)
- Framework matrix 表格 — 不是 9 个图标卡片

---

## 8. 落地范围 / 反例清单

A2 **不**涉及:
- 具体的 React/Vue 组件实现(A4/B 任务)
- token 写入 css 文件(A3)
- 设计规范 md 文档撰写(A4)
- create-esmx 模板调整(E4)

A2 **完成**(本文件 §3-§7)= 所有 token 的命名、值、用途意图;所有组件外观决策;
三张关键页面的 wireframe。任何后续任务遇到"这里该用什么颜色 / 字号 / 圆角"都
**回查本文件**,不自创。

---

## 9. 给 A3 / A4 / A5 的明确接口

- **A3**(写 `tokens.css`):用 §3-§5 的表格直接落 CSS 变量。**完整复制名字和值**。
- **A4**(写 `principles.md` / `tokens.md` / `components.md`):用 §1 / §3-§5 / §6 内容为骨架。
- **A5**(共享组件原语 Button / Card / Stat / CodeBlock / Tabs / Badge):用 §6 的外观规范实现。**Stat 用新数字字号(2xl),不是旧 3rem。**
- **B1**(参考远程 `ssr-micro-vite-vue` 重做):严格按 §7.1 wireframe + §6 组件。
- **D1**(hub 重做):按 §7.2。
- **D2**(landing 重做):按 §7.3。
