# 微应用多打包器示例 — Loop 执行交接说明

> 目标：在 `examples/micro-app/` 新增 6 个远程，使 hub 组合出由 **Rspack + Rsbuild + Vite** 三种打包器分别构建的微前端，并共享同一份 `@esmx/router`（异构联邦）。
> 范围：仅新增 6 个远程 + 改 `ssr-micro-hub`。**不改其它现有远程、不改 shared、不改任何 packages/**/src 源码。**

## 架构（先理解）

- `ssr-micro-shared`：导出共享依赖（`@esmx/router`、`unhead`）+ `src/index.ts`。所有远程共用它的同一份 router。
- `ssr-micro-hub`：宿主。`links` 列出所有远程，`imports` 把 `@esmx/router` 指向 shared，`routes.ts` 汇总各远程的 `routes`。
- 各远程：独立构建产出 `dist`，导出 `src/routes.ts`（一个 `RouteConfig[]`，含唯一 path），由 hub 经 links 消费渲染。

## 6 个新远程（每个 = 拷贝一个现有远程后改 4 处）

| 新远程 | 拷贝自 | 打包器包 | devApp 工厂 | routes 路径 |
|--------|--------|----------|-------------|-------------|
| `ssr-micro-vite-html` | `ssr-micro-html` | `@esmx/vite` | `createViteHtmlApp` | `/vite-html/` |
| `ssr-micro-vite-react` | `ssr-micro-react` | `@esmx/vite-react` | `createViteReactApp` | `/vite-react/` |
| `ssr-micro-vite-vue` | `ssr-micro-vue3` | `@esmx/vite-vue` | `createViteVueApp` | `/vite-vue/` |
| `ssr-micro-rsbuild-html` | `ssr-micro-html` | `@esmx/rsbuild` | `createRsbuildHtmlApp` | `/rsbuild-html/` |
| `ssr-micro-rsbuild-react` | `ssr-micro-react` | `@esmx/rsbuild-react` | `createRsbuildReactApp` | `/rsbuild-react/` |
| `ssr-micro-rsbuild-vue` | `ssr-micro-vue3` | `@esmx/rsbuild-vue` | `createRsbuildVueApp` | `/rsbuild-vue/` |

### 每个新远程要改的 4 处（其余文件原样保留）
1. **package.json**：`name` 改为新名；devDependencies 里把旧打包器包（`@esmx/rspack` / `@esmx/rspack-react` / `@esmx/rspack-vue`）换成对应新包；其余依赖（框架、shared、router-*、types）保留。
2. **src/entry.node.ts**：`devApp` 的 `import('@esmx/...')` 与工厂函数改为上表对应项；可删掉 rspack 专有的 `chain(context){}` 选项（vite/rsbuild 不用 chain）。`modules`（links/imports/exports）**原样保留**——尤其 `imports: { '@esmx/router': 'ssr-micro-shared/@esmx/router' }`，这是跨打包器共享 router 的关键。
3. **src/routes.ts**：把 `path` 改为上表唯一路径（避免与现有 `/react/`、`/vue3/`、`/html/` 冲突）。
4. 其它（`app.*` / `create-app.*` / `entry.server.ts` / `entry.client.ts`）**不动**。

> 注：vue 远程从 `ssr-micro-vue3` 拷，保留其 `exports` 里的 `@vue/server-renderer`（server-only）配置。

## 每轮闭环（任务 #21–#26，每个一个远程）

1. `TaskList` 取最低编号 pending；`TaskUpdate` 置 in_progress。
2. `cp -r` 拷贝模板目录；删掉拷来的 `dist`/`node_modules`（若有）。
3. 改上述 4 处。
4. `pnpm install`（链接新 workspace 包）。
5. **先确保 shared 已构建**：`pnpm --filter ssr-micro-shared build`（远程 link `../ssr-micro-shared/dist`，必须存在）。
6. `cd examples/micro-app/<new> && pnpm build`（即 `esmx build`）→ 确认产出 `dist/{client,server,node}/manifest.json` 且含 `src/routes` 导出。
7. `pnpm --filter <new> lint:type` 通过（若该包有 lint:type 脚本）。
8. `git status` 确认只新增了该远程目录（+ pnpm-lock.yaml），无 `src/` 源码改动、未动其它远程。
9. 通过则 `TaskUpdate` completed。

## 任务 #27：接入 hub + 端到端验证

改 `examples/micro-app/ssr-micro-hub`：
1. **package.json**：devDependencies 加 6 个 `"ssr-micro-<x>": "workspace:*"`。
2. **src/entry.node.ts** 的 `modules.links`：加 6 条 `'ssr-micro-<x>': '../ssr-micro-<x>/dist'`。
3. **src/routes.ts**：加 6 行 `import { routes as <x>Routes } from 'ssr-micro-<x>/src/routes'`，并把它们 spread 进 `baseRoutes`。
4. `pnpm install`。
5. **按依赖序构建**：shared → 6 个新远程（+现有远程）→ hub。最稳：在仓库根跑 `pnpm build`（会构建全部 examples）；或手动 `pnpm --filter ssr-micro-shared build` 然后逐个远程 build，最后 `pnpm --filter ssr-micro-hub build`。
6. 启动 hub：`cd examples/micro-app/ssr-micro-hub && node dist/index.mjs`（监听 :3000）。
7. **curl 验证**（均应 200 且含对应远程内容）：
   - `/demo/`（首页/组合页）
   - `/vite-html/`、`/vite-react/`、`/vite-vue/`
   - `/rsbuild-html/`、`/rsbuild-react/`、`/rsbuild-vue/`
8. 验证通过 = 一个 hub 同时渲染 Rspack/Vite/Rsbuild 三种打包器构建的远程，且它们共享 shared 的同一份 `@esmx/router`（异构联邦成立）。
9. `git status` 确认仅改 hub 的 3 个文件 + 新增 6 远程 + lockfile。

## 约束
- 不改任何 `packages/**/src` 源码；不改 shared 与其它现有远程（hub 的 3 处接入除外）。
- commit 用英文 Conventional Commits；按需每个远程一笔提交，hub 接入一笔。
- 全部进当前分支 `feat-vite-rsbuild-bundler-support`（PR #300）。

## 完成定义
#21–#27 全部 completed；6 个新远程各自 `esmx build` 通过；hub `esmx build`+`start` 后 6 条新路由均 200 且渲染正确；`git status` 证明无 src 改动。
