# 全矩阵验证清单

> 自动化 loop 推进。每轮 1-3 项。所有 ✅ 后进入自动化测试阶段。
> 最后更新: 见每轮 commit 时间戳

## A. Standalone 示例

| 示例 | 适配器 | 框架 | prod build | postBuild SSR | dev SSR | 浏览器水合 |
|---|---|---|---|---|---|---|
| ssr-vite-html | vite | HTML | ✅ | ✅ | ✅ runtime 200 | n/a(无交互) |
| ssr-vite-react | vite | React 19 | ✅ | ✅ | ✅ runtime 200 | ✅ via hub /vite-react/ counter 0→1 |
| ssr-vite-vue | vite | Vue 3 | ✅ | ✅ `<h1>Vue SSR Demo` | ✅ runtime 200 | ⬜(via hub /vite-vue/ 已 SSR ✅) |
| ssr-rsbuild-react | rsbuild | React 19 | ✅ | ✅ `<h1>React SSR Demo` | ✅ runtime 200 | ⬜(via hub /rsbuild-react/ 已 SSR ✅) |

## B. Micro 远程

| Remote | 适配器 | prod build | standalone runtime | 浏览器水合 | hub 组合 |
|---|---|---|---|---|---|
| ssr-micro-shared | rspack lib | ✅ | n/a | n/a | n/a |
| ssr-micro-hub | rspack | ✅ | ✅ :3000 | ⬜ | ✅ / + /demo/ |
| ssr-micro-html | rspack | ✅ | ✅ :3001 | ⬜ | ✅ /html/ |
| ssr-micro-lit | rspack | ✅ | ✅ :3002 | ⬜ | ✅ /lit/ |
| ssr-micro-vue2 | rspack | ✅ | ✅ :3003 | ⬜ | ✅ /vue2/ |
| ssr-micro-vue3 | rspack | ✅ | ✅ :3004 | ⬜ | ✅ /vue3/ |
| ssr-micro-react | rspack | ✅ | ✅ :3005 | ⬜ | ✅ /react/ |
| ssr-micro-preact | rspack | ✅ | ✅ :3006 | ⬜ | ✅ /preact/ |
| ssr-micro-preact-htm | rspack | ✅ | ✅ :3007 | ⬜ | ✅ /preact-htm/ |
| ssr-micro-solid | rspack | ✅ | ✅ :3008 | ⬜ | ✅ /solid/ |
| ssr-micro-svelte | rspack | ✅ | ✅ :3009 | ⬜ | ✅ /svelte/ |
| ssr-micro-vite-html | vite | ✅ | ✅ :3010 | ⬜ | ✅ /vite-html/ |
| ssr-micro-vite-react | vite | ✅ | ✅ :3011 | ⬜ | ✅ /vite-react/ |
| ssr-micro-vite-vue | vite | ✅ | ✅ :3012 | ⬜ | ✅ /vite-vue/ |
| ssr-micro-rsbuild-html | rsbuild | ✅ | ✅ :3013 | ⬜ | ✅ /rsbuild-html/ |
| ssr-micro-rsbuild-react | rsbuild | ✅ | ✅ :3014 | ⬜ | ✅ /rsbuild-react/ |
| ssr-micro-rsbuild-vue | rsbuild | ✅ | ✅ :3015 | ⬜ | ✅ /rsbuild-vue/ |

## C. Dev SSR 矩阵

| 路径 | 框架 / 示例 | dev HTTP | dev 浏览器 + HMR |
|---|---|---|---|
| vite dev (ssrLoadModule) | HTML | ✅ :3010 | ⬜ |
| vite dev (ssrLoadModule) | React | ✅ :3011 | ⬜ |
| vite dev (ssrLoadModule) | Vue | ✅ :3012 | ⬜ |
| rsbuild dev (vm-import) | HTML | ✅ :3013 | ⬜ |
| rsbuild dev (vm-import) | React | ✅ :3014 | ⬜ |
| rsbuild dev (vm-import) | Vue | ✅ :3015 | ⬜ |
| rspack dev (vm-import) | React | ✅ :3005 | ⬜ |
| rspack dev (vm-import) | Vue3 | ✅ :3004 | ⬜ |
| rspack dev (vm-import) | Preact | ✅ :3006 | ⬜ |
| rspack dev (vm-import) | Solid | ✅ :3008 | ⬜ |
| rspack dev (vm-import) | Svelte | ✅ :3009 | ⬜ |
| rspack dev (vm-import) | Lit | ✅ :3002 | ⬜ |

## D. 单测 & 类型 & 构建

| 包 | lint:type | unit tests | build |
|---|---|---|---|
| @esmx/core | ✅ | ✅ 176/176 | ✅ |
| @esmx/pkg-wrapper(新) | ✅ | ✅ 10/10 | ✅ |
| @esmx/import | ✅ | ✅ 51/51 | ✅ |
| @esmx/router | ✅ | ✅ 978/978 | ✅ |
| @esmx/router-react | ✅ | ✅ 22/22 | ✅ |
| @esmx/router-vue | ✅ | ✅ 165/165 | ✅ |
| @esmx/rspack | ✅ | ✅ 20/20 | ✅ |
| @esmx/rspack-react | ✅ | — 无单测 | ✅ |
| @esmx/rspack-vue | ✅ | — 无单测 | ✅ |
| @esmx/rsbuild | ✅ | ✅ 6/6 | ✅ |
| @esmx/rsbuild-react | ✅ | — 无单测 | ✅ |
| @esmx/rsbuild-vue | ✅ | — 无单测 | ✅ |
| @esmx/vite | ✅ | ✅ 10/10 | ✅ |
| @esmx/vite-react | ✅ | — 无单测 | ✅ |
| @esmx/vite-vue | ✅ | — 无单测 | ✅ |

**总计:1428/1428 单测 pass,0 failed.**

## E. 文档

| 项 | 状态 |
|---|---|
| @esmx/pkg-wrapper README en | ✅ |
| @esmx/pkg-wrapper README zh | ✅ |
| 根 README 包列表纳入 pkg-wrapper | ✅ en + zh |
| migration / changelog 说明 vite 8、virtual modules、pkg-wrapper | ⬜ |

## F. Known issues / 遗留

| 项 | 状态 |
|---|---|
| ssr-vite-vue postBuild 是空 stub | ✅ 已恢复且通过 |
| 真实部署(Cloudflare Pages)SRI 校验 | ⬜ 改动太多需重测 |
| Preview MCP 代理改字节 → SRI 不匹配 | 🔒 基础设施,不影响 esmx |

## G. Git / PR

| 项 | 状态 |
|---|---|
| 改动整理 commits | ⬜ |
| push 到 PR #300 | ⬜ |

---

## Iteration log

### Iter 1
- ✅ ssr-vite-vue postBuild(`<h1>Vue SSR Demo`,2589 B index.html)
- ✅ ssr-rsbuild-react postBuild(`<h1>React SSR Demo`,3546 B index.html)
- ✅ 17 个 @esmx/* 包 lint:type 全 OK
- 解决遗留 stub

### Iter 2
- ✅ 全包单测 1428/1428 pass(其中 router 978、router-vue 165、router-react 22、import 51、core 176、rspack 20、rsbuild 6、vite 10)
- ✅ 4 个 standalone runtime SSR(端口 3000/3002/3003/3004,全 200)
- ⚠️ @esmx/pkg-wrapper 无单测,需后续补(Iter 6 已补)

### Iter 3
- ✅ 16 个 micro remotes standalone runtime SSR(:3000-3015,全 200,带正确 h1 标题)
- 包括 vite × 3、rsbuild × 3、rspack × 10(含 lit、preact-htm、vue2、solid、svelte 等)

### Iter 4
- ✅ Hub-composed 跨远程组合 SSR(全 15 个远程 + landing + demo + zh locale,共 20 路径,全 200)
- vite × 3、rsbuild × 3、rspack × 9 都能在 hub 下被联邦运行时正确加载并渲染 — 这是 PR 最重要的端到端验证(虚拟模块 wrapper + module.register 整链路通)

### Iter 5
- ✅ Dev SSR 全矩阵 11/11 通过(vite × 3、rsbuild × 3、rspack × 5 + lit:3002)
- 原 #40 `createContext is not a function` 在 dev 模式所有路径下都消除
- vite 用 ssrLoadModule、rspack/rsbuild 用 vm-import,各自路径都被打通

### Iter 6
- ✅ @esmx/pkg-wrapper README en + zh
- ✅ @esmx/pkg-wrapper 单测 10/10 pass(覆盖 CJS conditional、ESM proxy、ESM-only exports map、unresolvable graceful warn)
- 修了 ESM-only 解析(用 Node 24 `findPackageJSON` API 替代 `import.meta.resolve(parent)` 的二参非可靠行为)
- 修了 condition map 递归遍历(Node 优先级 `node > import > module > default`)
- 全量重建 21/21 examples 仍 ✅(回归确认)

### Iter 7
- ✅ 根 README + README.zh-CN 纳入 @esmx/pkg-wrapper
- ✅ 浏览器水合(via hub :3000):
  - /react/ (rspack) counter 0→3 ✅
  - /vue3/ (rspack) counter 0→2 ✅
  - /vite-react/ (vite) counter 0→1 ✅
  - /rsbuild-vue/ (rsbuild) counter 0→2 ✅
- 无 console error
- 联邦运行时(虚拟模块 wrapper + import map + module.register)在 client/server 完整闭环
