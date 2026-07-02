---
titleSuffix: "llms.txt 指南"
description: "Esmx 的 AI 单文件简报：模块协议、esmx validate 验证、遗留语法。让 Claude、Cursor、Copilot、Gemini 写 Esmx 代码前先读这页。"
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
| `uses` | 字符串数组:我消费哪些**模块名**。不是具体 specifier,也不是版本 — 只是名字。顺序无关紧要 — 它只决定哪些模块可达(见下面的单一所有者规则)。 |

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
    "devDependencies": { "shared": "^3.0.0" },
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
里没有版本字段。版本范围放在 npm 本来的位置,构建时拿它去校验已挂载产物的
实际版本。被消费的模块是**构建/组合期依赖**(被挂载、被组合,生产运行时从不
从 `node_modules` 取),所以放 `devDependencies` —— 只有 `@esmx/core` 等真正
Node 运行时需要的才留在 `dependencies`。范围从
`devDependencies` ∪ `dependencies` ∪ `peerDependencies` 读取。

### 角色 3 — 组合方(host)

```json
{
    "name": "host",
    "version": "2.0.0",
    "devDependencies": { "shared": "^3.0.0", "cart": "^1.5.0" },
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

**单一所有者规则** — 一句话:每个共享包、在每个 major 版本上,在一个
组合里只有**一个所有者**(owner)—— 即唯一在 `provides` 里列出它的那个
模块 —— 整个闭包都接到这个所有者。没有选举、没有优先级:`uses` 数组顺序
只决定哪些模块可达,从不决定谁拥有某个包。如果同一组合里有两个不同模块
供给同一个 `(package, major)`,这是**硬错误**(`E_DUP_PROVIDER`):共享
依赖必须有单一所有者 —— 把它合并进一个共享模块,或者用 npm alias 给其中
一份赋予独立的包身份,以表达有意的同 major 共存。所有者**按 major 版本
分组**,所以共存的 major(比如 vue 2 和 vue 3)是彼此隔离的孤岛,各自有
自己的单一所有者(`W_MULTI_MAJOR`,纯信息性),每个消费方接到满足自己
声明范围的那个 major。

**查找规则** — bundler 遍历你的代码时逐 specifier 应用,无预扫描、
无需声明:

```
bare specifier 在我的供给表里 → externalize,接到所有者
哪儿都找不到                 → 打进我自己的副本,由 per-module
                               import-map scope 隔离
```

因此单实例共享是模型的固有属性(每个包只有一个所有者,整个闭包都接到
它),多版本共存也不需要任何词汇 — 打了自己副本的模块自动被 scope 隔离。
纯类型导入(`import type`)永远不会产生接线。

### 诊断:完整分类表

所有失败都是**构建时**的、机器可读的,并带 *what / why / fix* —
而且每个 fix 都是对已存在声明的一次编辑,从不引入新概念。

| 代码 | 类型 | 含义 | 典型修法 |
|---|---|---|---|
| `E_NOT_LINKED` | error | `uses` 里的名字不在挂载表里。 | `npm install` 该模块(npm 包自动挂载在 `node_modules/<name>/dist`),或加一条 `links` 覆盖。 |
| `E_NOT_BUILT` | error | 已挂载但还没有构建产物。只阻塞依赖 manifest 的检查,不阻塞声明级接线。 | 先构建列出的模块。 |
| `E_CYCLE` | error | `uses` 链(或挂载遍历)回到了某个模块。 | 架构错误 — 拆掉环。会**硬停**解析(扣留 supply),绝不基于依赖顺序的结果接线。 |
| `E_DUP_PROVIDER` | error | 两个不同模块拥有同一个 `(package, major)`。会指出这两个所有者。 | 共享依赖必须有单一所有者:删掉重复的 `provides` 项(合并进一个共享模块),或用 npm alias 给其中一份赋予独立的包身份,以表达有意的同 major 共存。 |
| `E_VERSION` | error | *intent*:所有者的解析版本不满足某消费层的 `dependencies`/`peerDependencies` 范围。会指出是哪一层。 | 调整该层的版本范围,或升级/重建所有者。 |
| `E_TARGET_MISSING` | error | 声明的 `entry`/`exports` 指向的文件在磁盘上不存在。仅检查根模块(挂载的依赖发布的是 `dist` 而非 `src`)。由 `esmx validate` 发射。 | 修正根模块 `esmx` 声明里的路径,或补上缺失的文件。 |
| `E_NOT_USED` | error | 你 import 了 `'mod/export'`,但 `mod` 不在你的 `uses` 链里。**构建时 / 由打包器发射** —— 不由 `esmx validate` 发射。 | 把 `"mod"` 加进 `uses`(和 `dependencies`)。 |
| `E_NO_EXPORT` | error | 供给方声明里没有这个导出。报错信息会列出该模块的实际导出。**构建时 / 由打包器发射** —— 不由 `esmx validate` 发射。 | 改 import specifier,或在供给方 `esmx.exports` 里补上导出。 |
| `E_PROTOCOL` | error | 挂载的 manifest 的 `protocol` 比当前 linker 支持的更新。 | 升级 `@esmx/core`。 |
| `E_PROTOCOL_IN_BEHAVIOR` | error | `entry.node.ts` 里发现了协议事实(`modules` 配置)。 | 移到 `package.json` `esmx` — 一次机械改写。 |
| `E_SCHEMA` | error | `esmx` 声明结构非法 — 类型错误、出现未知键,或某个导出/入口路径不是 `./` 相对路径。最常见的书写错误。 | 看报错信息:它会指出违规字段和允许的形态;按提示修正声明。 |
| `W_MULTI_MAJOR` | warning | 某个包有多个 major 版本共存,每个 major 是有自己单一所有者的隔离孤岛。纯信息性 — 跨 major 冲突在结构上不可能发生。 | 共存是有意为之就什么都不用做;否则对齐各所有者安装的 major。 |
| `W_NO_RANGE` | warning | 某层消费了被供给的包但没声明任何版本范围。 | 把该包加进 `dependencies` 或 `peerDependencies`。 |
| `W_TYPE_DRIFT` | warning | 你 `devDependencies` 里的类型副本与所有者的解析版本(代码实际运行的版本)不一致。 | 对齐 `devDependencies` 版本。 |

### 验证环:`esmx validate --json`

`esmx validate` 是解析**阶段 1–2** 的**免构建 dry run**:挂载遍历、传递
`uses`、版本检查、供给表、单一所有者校验(`E_DUP_PROVIDER`)。每次改完声明
就跑;声明对不对由它的退出码裁定,而不是靠人读。它保证的是**解析有效性,
而非可构建性**。它**会**检查根模块声明的 `entry`/`exports` 指向的文件在
磁盘上是否存在(`E_TARGET_MISSING`,仅根模块 —— 挂载的依赖发布的是 `dist`
而非 `src`)。剩下的边界是:它**不**发射阶段 3、由打包器发射的
`E_NOT_USED` / `E_NO_EXPORT`(打包器在构建时逐 specifier 词法分析源码后
发现),也**不**做类型检查。所以诚实的闭环是:先 `esmx validate`,**再**
跑一次构建 / `tsc`;validate 是快速的第一道门,不是全部预言机。加 `--json`
输出含三个键的结构化信封 —— `diagnostics`(错误**和**警告)、`supply`
(逐 major 所有者表)、`mounts`(解析出的挂载表):

```json
{
    "diagnostics": [
        {
            "code": "E_VERSION",
            "check": "intent",
            "module": "base",
            "package": "vue",
            "found": "3.0.2",
            "required": "^3.4.0",
            "message": "发生了什么、为什么",
            "fix": "该做哪条声明编辑"
        }
    ],
    "supply": {
        "vue": {
            "groups": [
                { "major": 3, "provider": "shared", "version": "3.5.13" }
            ]
        }
    },
    "mounts": {
        "shared": {
            "name": "shared",
            "root": "/abs/path/to/shared",
            "artifactDir": "/abs/path/to/shared/dist",
            "built": true
        }
    }
}
```

`check` 只出现在 `E_VERSION` 条目上,取值 `"intent"`。`diagnostics` 为空
数组表示声明完全确定了一份合法接线。没有 `esmx` 字段的包则输出
`{ "protocol": "legacy", "diagnostics": [] }`。

> **唯一要盯的是重复所有者。** 如果同一组合里有两个模块都 `provide` 同一个
> `(package, major)`,`validate` 会报 `E_DUP_PROVIDER` 并指出这两个所有者
> —— 修法是删掉其中一条 `provides`(合并进一个共享模块),或用 npm alias
> 给其中一份赋予独立的包身份。这里没有选举、也没有需要推理的闭包级重接:
> 每个 `(package, major)` 恰好一个所有者,整个闭包都接到它,代码实际运行的
> 版本就是这个所有者的解析版本。绿色 `validate`(`diagnostics` 为空)再加一次
> 构建 / `tsc`,就是全部闭环。

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

加进 `devDependencies` 和 `uses` — 接线就这两行(被消费的远程是构建/组合期
依赖,放 `devDependencies`,不是 `dependencies`):

```json
{
    "devDependencies": { "my-remote": "^0.1.0" },
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

凡是能通过 `node_modules` 解析到的模块都**自动挂载**在
`node_modules/<name>/dist` — 不用配路径。registry 安装和 monorepo
兄弟目录都覆盖:pnpm `workspace:*` 依赖的符号链接会被跟随并 realpath,
所以 workspace 依赖 + 上面的 `uses` 一条就是全部。只有 npm 解析不到的
产物目录(部署路径、远程拉取的产物)才需要 `links` 覆盖挂载点
(它是*环境*事实,写在 `entry.node.ts` 的 `modules` 块里):

```ts
modules: {
    links: {
        'my-remote': '/srv/deploy/my-remote/dist'
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
> 现代化时把它改写成新声明。但不要为新模块生成它。

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

这一切的转换是一次机械改写(可写成 codemod,但没有随框架提供的命令)。
按 RFC 0001,遗留语法将在后续阶段彻底删除 — 不会长期双语法并存。

## **不存在** 的 API

不要凭想象生成这些 — 它们不是真实 API:

- `Esmx.register(...)` / `registerApplication(...)`(single-spa 风格)
- `bootstrap` / `mount` / `unmount` / `update` 生命周期 export(qiankun 风格)
- `expose` / `shared` / `singleton` / `optional` / `resolutions` / `sealed`
  配置(Module Federation 风格)。Esmx **完全不需要共享仲裁词汇**:组合是
  构建时解析的静态结构 — 单实例共享是固有属性(每个 `(package, major)`
  一个所有者,整个闭包都接到它;出现第二个所有者就是 `E_DUP_PROVIDER`),
  多实例共存就是某个模块打了自己的 scope 隔离副本。
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
新协议下这会更早暴露:`E_NOT_LINKED`(远程没挂载)和 `E_NOT_BUILT`(还没
构建产物)由 `esmx validate` 抓住;`E_NOT_USED`(`uses` 里没有这个远程)和
`E_NO_EXPORT`(导出未声明)是阶段 3 的码,由打包器在**构建时**报,不在
`validate` 里 —— 所以先 `esmx validate`、再跑构建。遗留工程则检查:
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
