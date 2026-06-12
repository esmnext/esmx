---
titleSuffix: "用 AI 助手开发 Esmx"
description: "Esmx 框架的 AI 单文件简报:package.json esmx 模块协议、validate/migrate CLI 验证环、遗留语法。让 Claude/Cursor/Copilot/Gemini 写 Esmx 代码前先喂这一页。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,LLM,AI 助手,Claude,Cursor,Copilot,Gemini,模块协议"
---

# 用 AI 助手开发 Esmx

> **目标读者**:AI 助手(Claude、Cursor、Copilot、Gemini……)。**人类**想看
> 教程请去 [快速开始](/zh/guide/start/getting-started)。**人类用 AI 助手
> 写 Esmx 代码** —— 在让 AI 写代码前,把本页贴进它的上下文(或在它能 fetch
> URL 时直接发 `https://esmx.dev/zh/llms.md`)。
>
> 本页是 Esmx 对 AI 工具的**唯一契约**。这里的每个代码块都被 CI 跑过 —
> 在这里能 parse / build,在真实 Esmx 工程里就一定能跑。

## 5 行讲完 Esmx 是什么

1. 微前端框架,用**原生浏览器 ESM + Import Maps**。
2. **没有沙箱、没有代理、没有专有生命周期**。远程就是 host `import` 的标准 ES 模块。
3. **默认 SSR + hydrate**。服务端通过真实 Node ESM loader 渲染(无 jsdom)。
4. **bundler 无关**:官方 **Rspack**、**Rsbuild**、**Vite 8** 集成。三者
   共用同一份联邦 manifest 格式。
5. **`package.json` 中只有一个字段**(`esmx`)声明远程的入口、导出与依赖。
   其他都是标准 JS / TS / Vue / React 等。

## 心智模型

忘掉 Module Federation 的 `expose`/`share`、qiankun 的
`bootstrap`/`mount`/`unmount`、single-spa 的 `registerApplication`。
Esmx 没有这些。

**远程** 是一个发布出去的 ESM 包。它的 `package.json` 声明导出什么。
**Host** 通过框架自动生成的 `<script type="importmap">` 来 import 这些导出。
就这些。

```
┌──────────────────┐                      ┌──────────────────┐
│ host(入口)      │ ─── import map ────▶ │ remote(esm)     │
│ import {App}     │                      │ export App       │
│ from '@your/x'   │                      │ export server    │
└──────────────────┘                      └──────────────────┘
        │                                          │
        └──────────── 同一份 import graph ──────────┘
              (浏览器原生解析;没有 proxy)
```

SSR 同一份 import graph 走 Node ESM loader。同一个 `App` 模块在 Node 里
渲染 SSR,在浏览器里 hydrate。**一份模块,两个运行时,不重复**。

## 快速开始

```bash
npm create esmx@latest my-app
cd my-app
pnpm install
pnpm dev
```

可选模板:`react-csr`、`react-ssr`、`vue-csr`、`vue-ssr`、`vue2-csr`、
`vue2-ssr`、`shared-modules`(联邦共享依赖包)。

## 模块协议:在 `package.json` 的 `esmx` 字段里声明

所有协议事实都放在**一个 `package.json` 字段**(`esmx`)里,只有
**四个可选子字段**。`entry.node.ts` 只保留*行为*(`devApp`、`server`、
`postBuild`)— 把协议事实写进去会报错(`E_PROTOCOL_IN_BEHAVIOR`)。

| 字段 | 含义 |
|---|---|
| `entry` | 框架入口(`client` / `server`),和普通导出一样声明。纯库模块直接省略。 |
| `exports` | 带**逻辑名**的子路径映射:key 是 `./<name>`,value 是相对源文件路径,或 `{ client, server }` 双端分叉(`false` 禁用一端)。消费方永远看不到你的物理路径。 |
| `provides` | 字符串数组:本模块为消费方转供的第三方包(如 `["vue"]`)。供给版本是你**实际安装的解析版本**,构建时写进 manifest。 |
| `uses` | 字符串数组:我消费哪些**模块名**。不是具体 specifier,也不是版本 — 只是名字。**数组顺序是有语义的**(见下面的合并规则)。 |

模块声明严格只含**本地知识**:写它(无论人还是 agent)不需要了解任何
其他模块。三种角色覆盖所有工程:

### 角色 1 — 供给方(共享平台包)

```json
{
    "name": "shared",
    "version": "3.2.1",
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": {
            "./ui": "./src/ui/index.ts",
            "./store": {
                "client": "./src/store.client.ts",
                "server": "./src/store.server.ts"
            }
        },
        "provides": ["vue", "@esmx/router"]
    }
}
```

消费方 import 的是 `'shared/ui'` — 逻辑名。重命名 `src/ui/index.ts`
不再是 breaking change。

### 角色 2 — 消费方 + 供给方(业务远程)

```json
{
    "name": "cart",
    "version": "1.8.0",
    "dependencies": { "shared": "^3.0.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./widget": "./src/cart-widget.ts" },
        "uses": ["shared"]
    }
}
```

注意**没有**的东西:没有 `imports` 映射、没有逐 specifier 的接线、`esmx`
里没有版本字段。版本范围放在 npm 本来的位置 — `dependencies`
(∪ `peerDependencies`)— 构建时会拿它去校验已挂载产物的实际版本。

### 角色 3 — 组合方(host)

```json
{
    "name": "host",
    "version": "2.0.0",
    "dependencies": { "shared": "^3.0.0", "cart": "^1.5.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["shared", "cart"]
    }
}
```

`uses` 是**可传递的**:`cart` uses `shared`,那么 uses `cart` 的 host
顺着链就拿到了 `shared` 的供给。业务应用只声明一行,不需要知道链有多深。

### 接线是推导出来的(你永远不用手写)

两条规则取代了所有手写映射:

**合并规则** — 一句话:
`supply(M) = merge(supply(uses[0]), …, supply(uses[n]), M.provides)` —
后面的覆盖前面的,模块自己的 `provides` 是隐式的最后一项,所以**当两个
模块供给同一个包时,`uses` 数组的顺序决定谁赢**(按通用到具体排列,
具体的那层赢;与 `Object.assign` 是同一族约定)。

**查找规则** — bundler 遍历你的代码时逐 specifier 应用,无预扫描、
无需声明:

```
bare specifier 在我合并后的供给表里 → externalize,接到赢家
哪儿都找不到                      → 打进我自己的副本,由 per-module
                                    import-map scope 隔离
```

因此单实例共享是模型的固有属性(每个包只有一个赢家,整个闭包都接到
它),多版本共存也不需要任何词汇 — 打了自己副本的模块自动被 scope 隔离。
纯类型导入(`import type`)永远不会产生接线。

### 诊断:完整分类表

所有失败都是**构建时**的、机器可读的,并带 *what / why / fix* —
而且每个 fix 都是对已存在声明的一次编辑,从不引入新概念。

| 代码 | 类型 | 含义 | 典型修法 |
|---|---|---|---|
| `E_NOT_LINKED` | error | `uses` 里的名字不在挂载表里。 | `npm install` 该模块(npm 包自动挂载在 `node_modules/<name>/dist`),或加一条 `links` 覆盖。 |
| `E_NOT_BUILT` | error | 已挂载但还没有构建产物。只阻塞依赖 manifest 的检查,不阻塞声明级接线。 | 先构建列出的模块。 |
| `E_CYCLE` | error | `uses` 链(或挂载遍历)回到了某个模块。 | 架构错误 — 拆掉环;永远不会被静默忽略。 |
| `E_VERSION` | error | *intent*(赢家版本不满足某层的 `dependencies`/`peerDependencies` 范围)或 *substitution safety*(落选供给方的 chunk 构建时依赖的版本不兼容 — 至少要同 major)。会指出是哪一层、哪项检查失败。 | 调整该层的版本范围,或升级/重建供给方。 |
| `E_NOT_USED` | error | 你 import 了 `'mod/export'`,但 `mod` 不在你的 `uses` 链里。 | 把 `"mod"` 加进 `uses`(和 `dependencies`)。 |
| `E_NO_EXPORT` | error | 供给方声明里没有这个导出。报错信息会列出该模块的实际导出。 | 改 import specifier,或在供给方 `esmx.exports` 里补上导出。 |
| `E_PROTOCOL` | error | 挂载的 manifest 的 `protocol` 比当前 linker 支持的更新。 | 升级 `@esmx/core`。 |
| `E_PROTOCOL_IN_BEHAVIOR` | error | `entry.node.ts` 里发现了协议事实(`modules` 配置)。 | 移到 `package.json` `esmx` — `esmx migrate` 帮你做。 |
| `W_MULTI_CANDIDATE` | warning | 合并链里某个包有多个供给方。报告赢家、落选者、被重接的层。 | 分层基座的正常现象;赢家不对就调整 `uses` 顺序。 |
| `W_NO_RANGE` | warning | 某层消费了被供给的包但没声明任何版本范围。 | 把该包加进 `dependencies` 或 `peerDependencies`。 |
| `W_TYPE_DRIFT` | warning | 你 `devDependencies` 里的类型副本与当选赢家的解析版本(代码实际运行的版本)不一致。 | 对齐 `devDependencies` 版本。 |

### 验证环:`esmx validate --json`

`esmx validate` 是整个解析过程的**免构建 dry run**:挂载遍历、版本检查、
供给合并、导出检查。每次改完声明就跑;声明对不对由它的退出码裁定,而不是
靠人读。加 `--json` 输出结构化信封 — 错误**和**警告都在:

```json
{
    "diagnostics": [
        {
            "code": "E_VERSION",
            "check": "substitution-safety",
            "module": "base",
            "package": "vue",
            "found": "3.0.2",
            "required": "built against 3.4.21 (same major)",
            "message": "发生了什么、为什么",
            "fix": "该做哪条声明编辑"
        }
    ]
}
```

`check` 只出现在 `E_VERSION` 条目上,取值 `"intent"` 或
`"substitution-safety"`。`diagnostics` 为空数组表示声明完全确定了一份
合法接线。

### 存量工程迁移:`esmx migrate`

`esmx migrate` 是一个 codemod:把遗留的 `entry.node.ts` `modules` 配置
(`pkg:`/`root:` 导出、`imports`)提升为 `package.json` `esmx` 声明,并把
消费方的 import 调用点改写为逻辑名,输出机器可读的变更报告。跑完后再跑一遍
`esmx validate --json`。

## 最小 Rspack 远程

三个文件加一个 client entry,整段可粘贴。

**`package.json`** — 协议事实在这里:

```json
{
    "name": "my-remote",
    "version": "0.1.0",
    "type": "module",
    "private": true,
    "scripts": {
        "dev": "esmx dev",
        "build": "esmx build",
        "start": "esmx start"
    },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": {
            "./app": "./src/app.ts"
        }
    },
    "dependencies": {
        "@esmx/core": "^3.0.0-rc.117"
    },
    "devDependencies": {
        "@esmx/rspack": "^3.0.0-rc.117"
    }
}
```

**`src/entry.node.ts`** — 只有行为(dev server + Node HTTP server),
没有协议事实:

```ts
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackApp(esmx));
    },
    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({ params: { url: req.url } });
                res.end(rc.html);
            });
        });
        server.listen(3000, () => console.log('http://localhost:3000'));
    }
} satisfies EsmxOptions;
```

**`src/entry.server.ts`** — 服务端渲染入口:

```ts
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();
    rc.html = `<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}
    ${rc.css()}
</head>
<body>
    <h1>Hello from Esmx</h1>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};
```

**`src/entry.client.ts`** — 客户端入口(hydration 引导):

```ts
console.log('hydrated');
```

完整应用就这么多。`pnpm dev` 然后访问 `http://localhost:3000`。

## 最小 Vite 远程

把 `entry.node.ts` 里的 `@esmx/rspack` 换成:

```ts
async devApp(esmx) {
    return import('@esmx/vite').then((m) => m.createViteApp(esmx));
}
```

…devDependency 换成:

```json
"@esmx/vite": "^3.0.0-rc.117"
```

其他完全一样。**同一份联邦 manifest,同一个 render context,同一份
import map**。bundler 选择只是开发者体验差异。

`@esmx/rsbuild` 同理(`m.createRsbuildApp(esmx)`)。

## 消费其他远程

加进 `dependencies` 和 `uses` — 接线就这两行:

```json
{
    "dependencies": { "my-remote": "^0.1.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["my-remote"]
    }
}
```

然后代码里按**逻辑导出名** import:

```ts
import { App } from 'my-remote/app';
```

npm 安装的模块**自动挂载**在 `node_modules/<name>/dist` — 不用配路径。
monorepo 兄弟目录或部署目录用 `links` 覆盖挂载点(它是*环境*事实,目前
仍写在 `entry.node.ts` 的 `modules` 块里):

```ts
modules: {
    links: {
        'my-remote': '../my-remote/dist'
    }
}
```

消费方根据挂载模块的 manifest 构建 import map,注入每个 SSR HTML 响应。
浏览器原生解析 — 没有客户端 loader。

## 联邦 CSS

直接 `import './x.css'`。bundler 提取,manifest 记录 CSS chunk,host 在
SSR HTML head 里 emit `<link rel="stylesheet">`。dev 与 prod 一样,三个
bundler 一样。

```ts
// 任何远程的源,比如 src/entry.client.ts
import './styles/globals.css';
```

或者组件里:

```vue
<script setup>
import './card.css';
</script>
```

```tsx
import './card.css';
export const Card = ({children}) => <div className="card">{children}</div>;
```

没有 `useStyles()`、没有 `injectGlobalStyles()`、没有特殊文件命名约定。
完整合约见 `/zh/guide/essentials/styles`。

## Render Context API

`rc` 是 `@esmx/core` 的 `RenderContext`。在 SSR HTML 模板里调它的方法:

| 方法 | emit 出 |
|------|--------|
| `rc.preload()` | 本请求触达的所有 JS / CSS chunk 的 `<link rel="preload">` |
| `rc.css()` | 同上的 `<link rel="stylesheet">` |
| `rc.importmap()` | `<script type="importmap">`,把 bare 标识符映射到 chunk URL |
| `rc.moduleEntry()` | `<script type="module">` 加载 client entry |
| `rc.modulePreload()` | `<link rel="modulepreload">` 给传递性依赖 |
| `rc.html = '...'` | 框架最终返回的 HTML。`rc.commit()` 后赋一次值。 |

**在读取以上任何方法之前,务必 `await rc.commit()`** — 框架在 commit
阶段才决定本请求触达哪些 chunk,填充 `files.css` / `files.js` 等。

## 路由与 hydration

Esmx 自带路由(`@esmx/router`)+ Vue/React 绑定(`@esmx/router-vue`、
`@esmx/router-react`)。支持嵌套路由、守卫、懒加载、SSR 解析。

典型 client entry hydrate:

```ts
// src/entry.client.ts
import { hydrateApp } from './app';
await hydrateApp();
```

…`hydrateApp` 调框架绑定(Vue 是 `createSSRApp(...)`,React 是
`hydrateRoot(...)`)对 server 渲过的同一棵组件树 hydrate。

## 遗留语法(已废弃 — 下个大版本删除)

> **写新代码一律用上面的 `package.json` `esmx` 声明。**下面的语法在过渡期
> 仍然能跑,而且你**一定会**在存量工程里见到 — 要认得、要会维护,用户要求
> 现代化时给出 `esmx migrate`。但不要为新模块生成它。

遗留工程把所有协议事实放在 `entry.node.ts` 的 `modules` 键下,四个字段:

```ts
// entry.node.ts(遗留)
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // 挂载模块的位置(手写相对 dist 路径)。
        links: {
            'shared': '../shared/dist'
        },
        // 手动 specifier → 供给方接线(被供给合并取代)。
        imports: {
            'vue': 'shared/vue'
        },
        // 字符串前缀 DSL:
        //   'pkg:vue'           → 转供 npm 包 "vue"
        //                         (新协议:provides: ["vue"])
        //   'root:src/index.ts' → 暴露一个源文件;公开名就是源路径
        //                         ("shared/src/index")
        //                         (新协议:exports: {"./ui": "./src/ui/index.ts"})
        exports: [
            'pkg:vue',
            'root:src/index.ts'
        ]
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

与新协议的关键差异 — 也是遗留语法的坑:

- **公开导出名等于源路径。**遗留消费方写
  `import { x } from 'shared/src/index'` — 供给方的目录结构就是 API,
  重命名一个源文件会 break 所有消费方。新协议下只有逻辑名
  (`'shared/ui'`)是公开的,没有 `./src/*` 直通。
- **接线是手写的。**每个消费方都要手写 `imports`,而新协议从声明里推导。
- **运行之前什么都不校验。**没有版本检查、没有导出检查、没有结构化诊断。

`esmx migrate` 会机械化地完成全部转换。按 RFC 0001,遗留语法将在后续
阶段彻底删除 — 不会长期双语法并存。

## **不存在** 的 API

不要凭想象生成这些 — 它们不是真实 API:

- `Esmx.register(...)` / `registerApplication(...)`(single-spa 风格)
- `bootstrap` / `mount` / `unmount` / `update` 生命周期 export(qiankun 风格)
- `expose` / `shared` / `singleton` / `optional` / `resolutions` / `sealed`
  配置(Module Federation 风格)。Esmx **完全不需要共享仲裁词汇**:组合是
  构建时解析的静态合并 — 单实例共享是固有属性(每个包一个赢家,整个闭包
  重接到它),多实例共存就是某个模块打了自己的 scope 隔离副本。
- 解析锁文件(`esmx.resolution.json` 之类)。**emit 进 `dist` 的 import
  map 本身就是解析结果**;声明完全确定它。诊断信息在 `esmx validate` 和
  构建日志里,不在任何提交的产物里。
- `esmx.uses` 里的 specifier 级清单 — `uses` 只是模块名数组;具体
  specifier 由 bundler 自己发现。
- `useStyles()` / `injectGlobalStyles()` hook
- `<MicroApp />` JSX 组件
- `window.__POWERED_BY_QIANKUN__` 全局变量
- 任何沙箱 / proxy / iframe 抽象

如果发现你自己在写这些,八成在想别的框架。

## 常见错误

**第一反应:跑 `esmx validate --json`。**大多数接线错误都会在那里以
结构化诊断浮出(见上面的分类表),修法直接写在 `fix` 里。

**dev SSR 报 `SyntaxError: Unexpected token '.'`。**
你从框架 loader 不认的路径 import 了 `.css`。解决:CSS 在用它的远程内部打包
(不要跨远程直接 import workspace-dep 的 CSS),host 会通过该共享包的
manifest 注入 link。

**`esmx build` 报 `ERR_UNKNOWN_FILE_EXTENSION ".css"`。**
CLI 的 Node ESM loader 钩子原本会处理,但如果 `entry.node.ts` 传递性
import 了未经 bundler 预处理的 `.css`,把那个 import 改到只在 JS-eval 路径
执行(如 `entry.client.ts`)。

**运行时报 `Cannot find module '<remote>/<export>'`。**
新协议下这几乎总会更早地以 `E_NOT_LINKED`(远程没挂载)、`E_NOT_USED`
(`uses` 里没有这个远程)、`E_NO_EXPORT`(导出未声明)或 `E_NOT_BUILT`
(还没构建产物)的形式被抓住 — 跑 `esmx validate`。遗留工程则检查:
(1) 消费端 `modules.links` 是否有 `'<remote>'`?(2) 发布端
`modules.exports` 是否有该导出?(3) 发布端是否构建过
(`dist/manifest.json` 存在)?

**Hydration 不匹配 / `<div data-ssr>` mount 后变空。**
client 树跟 server 渲染的 HTML 不一致。常见原因:server 用了跟 client 不同
的值(当前时间、随机 id、locale)。把那些值放进 `RenderContext.params`,
让两端看到同一份输入。

**`createVmImport` 加载 chunk 失败。**
你的 `entry.node.ts` 在用 `import('./x')` 而不是让 Esmx 的 VM loader 接管。
用 `esmx.render({...})` 和 `rc.commit()`,不要手工 import server chunk。

## 想了解更多

- **完整 API 参考**:`/zh/api/core/esmx`、`/zh/api/core/render-context`
- **路由**:`/zh/api/router/router`、`/zh/guide/router/getting-started`
- **构建器配置**:`/zh/api/app/rspack`、`/zh/api/app/rsbuild`、`/zh/api/app/vite`
- **联邦样式**:`/zh/guide/essentials/styles`
- **模块链接深入**:`/zh/guide/essentials/module-linking`

不要从一行简介推断 API 签名 — 完整参考页里有每个选项的可运行示例。拿不准
就把上面 URL 给用户,不要猜签名。

## 版本

本页随 `@esmx/core` 版本走。页眉显示生成本页的版本。如果某代码块跟你装的
版本行为不一致,`npm ls @esmx/core` 查一下当前装的版本。
