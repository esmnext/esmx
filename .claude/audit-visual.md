# Visual Audit — Esmx Demo Surfaces (Task A1)

> 任务 A1 交付物。审计了 15 个 micro 远程 + 6 个 standalone + hub + docs 站的当前
> 视觉状态,所有断言带 file:line。**不含**任何重做方案 — 那是 A2 的工作。
>
> 输入给 A2:这份文件 §"Actionable Inconsistencies" 列出的 20 项即"必须解决的问题"。

---

## Executive Summary

15 个 micro 远程 + hub 共享 `ssr-micro-shared/src/layout.ts` 提供的 sidebar / header / footer
和 `--esmx-*` CSS 变量。但**正文区**(每个远程展示框架特性的中央卡片)严重发散:

1. **图标渐变色硬编码**:9 种框架渐变,每个远程一份硬编码 hex。
2. **内联 style vs CSS 类**:所有 micro 远程用内联 `style={{...}}` / `style="..."`,
   6 个 standalone 用 CSS 类 — 两套架构。
3. **字号 / 间距 / 圆角全部硬编码**:`2rem` / `3rem` / `8px 24px` / `48px` 等值
   重复出现在所有 15 个远程,但 layout.ts **没有对应的 token**。
4. **三套 token 命名空间**:
   - micro + hub: `--esmx-*` (~14 个 token,在 layout.ts:205-239)
   - standalone SSR: `--esmx-primary` / `--esmx-sun-core` / `--react-color` 等(另一套)
   - docs 站:`--rp-c-brand` (Rspress 主题 token)

---

## Shared Layout — `ssr-micro-shared/src/layout.ts`

### `--esmx-*` Tokens Defined

| Token | Light Value (line) | Dark Value (line) |
|-------|---------------------|---------------------|
| --esmx-sidebar-width | 260px (206) | (same) |
| --esmx-bg-main | #f8fafc (207) | line 223 |
| --esmx-bg-card | #fff (208) | line 224 |
| --esmx-bg-sidebar | #0f172a (209) | line 225 |
| --esmx-text-primary | #0f172a (210) | line 226 |
| --esmx-text-secondary | #64748b (211) | line 227 |
| --esmx-text-muted | #94a3b8 (212) | line 228 |
| --esmx-border | #e2e8f0 (213) | line 229 |
| --esmx-border-divider | #334155 (214) | line 230 |
| --esmx-link | #3b82f6 (215) | line 231 |
| --esmx-nav-hover-bg | rgba(59,130,246,0.08) (216) | line 232 |
| --esmx-nav-hover-color | #cbd5e1 (217) | line 233 |
| --esmx-card-shadow | 0 4px 20px rgba(0,0,0,0.08) (218) | line 234 |
| --esmx-card-hover-border | #cbd5e1 (219) | line 235 |
| --esmx-glow | rgba(59,130,246,0.06) (220) | line 236 |

### Token Bypasses Inside layout.ts(本应消费却硬编码)

| Line | Hardcoded | 应该用 |
|------|-----------|--------|
| 139 | rgba(255,160,0,0.15) | `--esmx-badge-bg`(未定义) |
| 140 | #ffa000 | `--esmx-badge-color`(未定义) |
| 171 | #3b82f6 (active nav border) | `var(--esmx-link)` |
| 249 | #3b82f6 (focus outline) | `var(--esmx-link)` |
| 269 | rgba(0,0,0,0.5) (mobile overlay) | `--esmx-overlay`(未定义) |
| 352 | #fff (hub title) | `var(--esmx-bg-card)` 或新 token |
| 363 | #94a3b8 (lang toggle) | `var(--esmx-text-muted)` |

---

## Micro-App 远程 — 正文区样式发散

### React 系(3 个克隆)

`ssr-micro-react/src/app.tsx`, `ssr-micro-vite-react/src/app.tsx`, `ssr-micro-rsbuild-react/src/app.tsx`
是**100% 代码克隆**。三处都内联了以下硬编码:

| 元素 | 值 | 行 |
|------|-----|-----|
| Counter margin | `'16px 0'` | 15 |
| Counter font-size | `'3rem'` | 18 |
| Counter font-weight | 800 | 19 |
| Counter margin-bottom | `'12px'` | 21 |
| Button gap | `'12px'` | 29 |
| Button padding | `'8px 24px'` | 36 |
| Button radius | `'8px'` | 36 |
| Button font-size | `'1.2rem'` | 42 |
| Plus button bg | `'var(--esmx-link)'` ✓ | 39 |
| Minus button bg | `'#ef4444'` ✗ | 53 |
| Card padding | `'48px'` | 108 |
| Card radius | `'16px'` | 107 |
| Icon size | 56×56 | 115-116 |
| Icon radius | `'14px'` | 119 |
| **Icon gradient** | `'linear-gradient(135deg, #0ea5e9, #0284c7)'` | 118 |
| H1 font-size | `'2rem'` | 168 |
| H1 font-weight | 800 | 169 |

### Vue 系(3 个克隆)

`ssr-micro-vue3/src/app.vue`, `ssr-micro-vite-vue/src/app.vue`, `ssr-micro-rsbuild-vue/src/app.vue`
**100% 克隆**。差异:icon gradient = `linear-gradient(135deg, #3b82f6, #2563eb)`(vue3:7)

### Vue 2 — `ssr-micro-vue2/src/app.vue`

差异:icon gradient = `linear-gradient(135deg, #42b883, #369870)`(line 7)。其余与 Vue 3 一致。

### Preact — `ssr-micro-preact/src/app.tsx`

差异:icon gradient = `linear-gradient(135deg, #673ab8, #512da8)`(line 101)。

### Preact HTM — `ssr-micro-preact-htm/src/app.ts`

特殊:把样式抽成字符串常量(line 18-22):
```ts
const badgeStyle = 'width:56px;height:56px;background:linear-gradient(135deg, #8b5cf6, #7c3aed);...'
const cardStyle = `background:var(--esmx-bg-card);...`
const h1Style = 'font-size:2rem;font-weight:800;...'
```
icon gradient = `#8b5cf6, #7c3aed`(line 19)。

### Solid — `ssr-micro-solid/src/app.tsx`

特殊:用 kebab-case 对象(line 45-61):`'border-radius': '16px'`,`'padding-top': 'calc(...)'`。
icon gradient = `linear-gradient(135deg, #2c4f7c, #446b9e)`(line 68)。

### Svelte — `ssr-micro-svelte/src/App.svelte`

特殊:字符串插值的内联 style(line 18)。硬编码了 `var(--esmx-sidebar-width, 260px)`
里的 fallback —— 没用导入的 SIDEBAR_WIDTH 常量。
icon gradient = `linear-gradient(135deg, #ff3e00, #bf2e00)`(line 25)。

### Lit — `ssr-micro-lit/src/lit-app.ts`

模板字符串多行内联(line 23-83)。icon gradient = `linear-gradient(135deg, #324FFF, #283593)`(line 41)。

### HTML 系(3 个克隆)

`ssr-micro-html/src/html-app.ts`, `ssr-micro-vite-html`, `ssr-micro-rsbuild-html` **100% 克隆**。
模板字符串拼 HTML。icon gradient = `linear-gradient(135deg, #f59e0b, #d97706)`(html-app.ts:44)。

---

## Hub 首页 — `ssr-micro-hub/src/home-app.ts`

App 卡片元数据(line 17-99)包含 `iconBg` 渐变 + `tagColor` / `tagBg` 配对:

| 框架 | Icon Gradient | Tag Color |
|------|---------------|-----------|
| HTML | `#f59e0b → #d97706` | `#f59e0b` |
| Vue 2 | `#42b883 → #369870` | `#42b883` |
| Vue 3 | `#3b82f6 → #2563eb` | `#3b82f6` |
| React | `#0ea5e9 → #0284c7` | `#0ea5e9` |
| Preact | `#673ab8 → #512da8` | `#673ab8` |
| Preact HTM | `#8b5cf6 → #7c3aed` | `#8b5cf6` |
| Lit | `#324FFF → #283593` | `#324FFF` |
| Solid | `#2c4f7c → #446b9e` | `#2c4f7c` |
| Svelte | `#ff3e00 → #bf2e00` | `#ff3e00` |

Hero h1:`clamp(2rem, 5vw, 3rem)` 响应式(line 118)— **micro 远程内 h1 用固定 `2rem`,不一致**。

---

## Standalone SSR 示例(6 个)

`examples/ssr-{vite,rsbuild}-{html,react,vue}/src/app.css` + `hello-world.css`。
**独立的 token 命名空间**,与 micro 系完全不通:

| Token | Value |
|-------|-------|
| --esmx-primary | #001137 |
| --esmx-secondary | #273498 |
| --esmx-accent | #0074c2 |
| --esmx-light | #00abe7 |
| --esmx-sun-core | #ffa000 |
| --esmx-sun-rays | #ffc107 |
| --react-color | #61dafb |
| --react-dark | #20232a |
| --text-primary | #213547 |
| --text-secondary | #666 |
| --bg-card | #fcfcfc |

样式架构:**CSS 类**(不是内联 style)。Button padding `0.6em 1.2em`(em 单位),
而 micro 系用 `8px 24px`(px 单位)。Card padding `2em` vs micro 系 `48px`。

---

## Docs 站 — `examples/docs/src/styles/index.css`

Rspress theme token:`--rp-c-brand: #12b2ef`, `--rp-c-brand-light: #5bcbf5`,
`--rp-c-brand-darker: #0b739e`, `--rp-container-info-border: #12b2ef33`。
Logo:48px 桌面 / 40px 移动(line 17-26)。

**关键观察**:docs 站的 brand cyan `#12b2ef` 与 micro 系 `--esmx-link` 的 `#3b82f6` **不同**。
esmx 没有统一的品牌主色。

---

## Font Scale 对比

| 用途 | Micro-Apps | Standalone | Docs |
|------|-----------|------------|------|
| h1 | 2rem | 3.2em | (Rspress) |
| Counter display | 3rem | — | — |
| Button | 1.2rem | 1em | — |
| 正文 | 0.875rem – 1.125rem | 0.9em – 1em | — |

**单位不统一**:micro 全 `rem`,standalone 混用 `em` / `rem`。

## Spacing 对比

| 用途 | Micro-Apps | Standalone |
|------|-----------|------------|
| Button padding | 8px 24px | 0.6em 1.2em |
| Card padding | 48px | 2em |
| Card radius | 16px | 12px |
| Button radius | 8px | 8px |
| Counter margin | 16px 0 | — |
| Flex gap | 12px | 3.5rem |

---

## Actionable Inconsistencies (按影响排序)

> 这 20 项是 A2 重新设计时**必须解决**的现状问题。

### HIGH 影响

1. **图标渐变 — 9 个硬编码变体跨 15 个远程**
   每个 micro 远程都硬编码一个框架色渐变。
   证据:`ssr-micro-react/src/app.tsx:118`, `ssr-micro-vue3/src/app.vue:7`,
   `ssr-micro-svelte/src/App.svelte:25`, `ssr-micro-html/src/html-app.ts:44` 等。
   **A2 必须决定**:框架色是产品识别度的一部分还是噪声?要么提为 token map
   (`--esmx-fw-react` 等),要么改为统一的中性图标体系。

2. **Minus button 色 — 15 远程硬编码 `#ef4444`**
   红色减号按钮全部硬编码。证据:`ssr-micro-react:53`, `ssr-micro-vue2:18`,
   `ssr-micro-svelte:50` 等。**未定义 `--esmx-button-danger` token**。

3. **Counter display 字号 — 15 远程硬编码 `3rem`**
   证据:`ssr-micro-react:18`, `ssr-micro-vue3:15`, `ssr-micro-solid:9` 等。
   **未定义 `--esmx-font-size-display` token**。

4. **h1 — 15 远程硬编码 `font-size: 2rem; font-weight: 800`**
   证据:`ssr-micro-react:168-169`, `ssr-micro-vue3:13`, `ssr-micro-svelte:42` 等。
   **未定义 `--esmx-font-size-h1` / `--esmx-font-weight-bold` token**。

5. **Standalone vs micro 完全不同的 token 命名空间**
   `examples/ssr-vite-react/src/app.css:1-17` 自创 `--esmx-primary`, `--esmx-sun-*`,
   与 `layout.ts:205` 的 `--esmx-link` 等完全无关联。两套品牌色。

### MEDIUM 影响

6. **Button padding `8px 24px` 跨 15 远程**(`ssr-micro-react:36` 等)— 无 token。
7. **Card padding `48px` 跨 15 远程**(`ssr-micro-react:108` 等)— 无 token。
8. **内联 style vs CSS class 架构不一致**:micro 全内联,standalone 全 class。
   要么改造 micro 用 class、要么 standalone 改内联,选一个。
9. **Hero h1 响应式不一致**:hub `clamp(2rem, 5vw, 3rem)`(`home-app.ts:118`)
   vs 远程内固定 `2rem`(`ssr-micro-react:168`)。移动端字号偏大。
10. **Border-radius 数列乱**:card 16px / button 8px / icon 14px。
    需要 `--esmx-radius-{sm,md,lg,xl}` scale。
11. **Plus button 实现分裂**:多数用 `var(--esmx-link)` 内联;preact-htm 抽常量
    (`ssr-micro-preact-htm/src/app.ts:18-22`)。

### LOW 影响

12. **Svelte 硬编码 sidebar fallback `260px`**(`App.svelte:18`)— 应该 import SIDEBAR_WIDTH。
13. **Mobile overlay `rgba(0,0,0,0.5)`**(`layout.ts:269`)— 无 token。
14. **Layout focus outline 硬编码 `#3b82f6`**(`layout.ts:249`)— 应用 `var(--esmx-link)`。
15. **Layout 标准化徽章 `#ffa000 / rgba(255,160,0,0.15)`**(`layout.ts:139-140`)— 无 token。
16. **Counter margin `16px 0` 跨 15 远程**(`ssr-micro-react:15` 等)— 无 token。
17. **Button gap `12px` 跨 15 远程**(`ssr-micro-react:29` 等)— 无 token。
18. **Hub title `#fff`**(`layout.ts:352`)— 硬编码。
19. **Icon SVG size 28×28 跨所有远程**(`ssr-micro-react:131-132` 等)— 无 token。
20. **Docs 品牌色 `--rp-c-brand: #12b2ef`**(`docs/src/styles/index.css`)与 micro 系
    `--esmx-link: #3b82f6` 不同 — esmx 没统一品牌主色。

---

## Token Coverage Matrix

| Token | 定义状态 | 使用状态 | 备注 |
|-------|---------|---------|------|
| --esmx-sidebar-width | ✅ | 部分(Svelte 硬编码 fallback) | 需要强制 |
| --esmx-bg-card | ✅ | ✅ 全用 | OK |
| --esmx-link | ✅ | 部分(layout 内仍有硬编码 `#3b82f6`) | OK |
| --esmx-text-primary | ✅ | ✅ | OK |
| --esmx-text-secondary | ✅ | 用得少 | 未充分利用 |
| --esmx-border | ✅ | ✅ | OK |
| --esmx-font-size-h1 | ❌ | 硬编码 `2rem` × 15 | **缺失** |
| --esmx-font-size-display | ❌ | 硬编码 `3rem` × 15 | **缺失** |
| --esmx-font-weight-bold | ❌ | 硬编码 `800` × 15 | **缺失** |
| --esmx-button-padding | ❌ | 硬编码 `8px 24px` × 15 | **缺失** |
| --esmx-button-danger | ❌ | 硬编码 `#ef4444` × 15 | **缺失** |
| --esmx-card-padding | ❌ | 硬编码 `48px` × 15 | **缺失** |
| --esmx-radius-{sm,md,lg,xl} | ❌ | 硬编码 4/8/14/16px | **缺失** |
| --esmx-icon-size | ❌ | 硬编码 28px | **缺失** |
| --esmx-overlay | ❌ | 硬编码 rgba(0,0,0,0.5) | **缺失** |
| --esmx-badge-bg/color | ❌ | 硬编码 #ffa000 系 | **缺失** |
| --esmx-fw-{react,vue,...} | ❌ | 硬编码 9 个渐变 | **A2 决策项** |

---

**审计结论**:当前 esmx demo 存在**两个并行的设计系统**(micro vs standalone)、
**一份共享 layout 自身仍有硬编码**、**所有正文区都缺 token 覆盖**。A2 重新设计时
需在以下层面同时做决定:

1. 统一品牌主色(目前 `#3b82f6` / `#12b2ef` / `#001137` 三处不同)
2. 框架色对外暴露策略(token map vs 中性图标)
3. 样式架构(内联 vs class)
4. 字号 / 间距 / 圆角 scale 的具体数值与命名
5. micro 与 standalone 是否合并到一套 token
