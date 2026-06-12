---
titleSuffix: "用 AI 助手开发 Esmx"
description: "Esmx 框架的 AI 单文件简报。让 Claude/Cursor/Copilot/Gemini 写 Esmx 代码前先喂这一页。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,LLM,AI 助手,Claude,Cursor,Copilot,Gemini"
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
5. **`package.json` 中只有一个字段**(`esmx`)声明远程的导出与依赖。
   其他都是标准 JS / TS / Vue / React 等。

## 心智模型

忘掉 Module Federation 的 `expose`/`share`、qiankun 的
`bootstrap`/`mount`/`unmount`、single-spa 的 `registerApplication`。
Esmx 没有这些。

**远程** 是一个发布出去的 ESM 包。它的 `package.json` 列出导出。
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

## 最小 Rspack 远程

三个文件,整段可粘贴。

**`package.json`**:

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
    "dependencies": {
        "@esmx/core": "^3.0.0-rc.117"
    },
    "devDependencies": {
        "@esmx/rspack": "^3.0.0-rc.117"
    }
}
```

**`src/entry.node.ts`** — Esmx 配置 + Node HTTP server:

```ts
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // 此远程发布的导出。`file: ''` 让 name 可见但不绑定 entry。
        exports: {
            './app': { file: './src/app' }
        }
    },
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

## 暴露模块

在 `entry.node.ts` 的 `modules.exports` 里加条目:

```ts
modules: {
    exports: {
        './app': { file: './src/app' },
        './card': { file: './src/components/card.vue' },
        './utils': { file: './src/utils' }
    }
}
```

消费方(其他远程或 host)按 `远程名 + 导出路径` 来 import:

```ts
import { Card } from 'my-remote/card';
```

框架根据你的远程 manifest 重写这条 bare import,通过 import map 解析。

## 消费其他远程

Host 的 `entry.node.ts`:

```ts
modules: {
    // 把 "import 'my-remote/...'" 映射到此 URL 的 manifest。
    links: {
        'my-remote': 'http://localhost:4000'
    }
}
```

然后代码里:

```ts
import { Card } from 'my-remote/card';
```

Host 拉一次 `my-remote` 的 manifest,构建 import map,注入每个 SSR HTML 响应
的 head。浏览器原生解析 — 没有客户端 loader。

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

## **不存在** 的 API

不要凭想象生成这些 — 它们不是真实 API:

- `Esmx.register(...)` / `registerApplication(...)`(single-spa 风格)
- `bootstrap` / `mount` / `unmount` / `update` 生命周期 export(qiankun 风格)
- `expose` / `shared` / `singleton` 配置(Module Federation 风格)
- `useStyles()` / `injectGlobalStyles()` hook
- `<MicroApp />` JSX 组件
- `window.__POWERED_BY_QIANKUN__` 全局变量
- 任何沙箱 / proxy / iframe 抽象

如果发现你自己在写这些,八成在想别的框架。

## 常见错误

**dev SSR 报 `SyntaxError: Unexpected token '.'`。**
你从框架 loader 不认的路径 import 了 `.css`。解决:CSS 在用它的远程内部打包
(不要跨远程直接 import workspace-dep 的 CSS),host 会通过该共享包的
manifest 注入 link。

**`esmx build` 报 `ERR_UNKNOWN_FILE_EXTENSION ".css"`。**
CLI 的 Node ESM loader 钩子原本会处理,但如果 `entry.node.ts` 传递性
import 了未经 bundler 预处理的 `.css`,把那个 import 改到只在 JS-eval 路径
执行(如 `entry.client.ts`)。

**`Cannot find module '<remote>/<export>'`。**
三点检查:(1) 消费端 `modules.links` 是否有 `'<remote>'`?(2) 发布端
`modules.exports` 是否有 `'<export>'`?(3) 发布端是否构建过(host 读它的
`dist/manifest.json`)?

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
