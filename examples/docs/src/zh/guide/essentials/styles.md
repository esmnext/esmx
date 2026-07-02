---
titleSuffix: "Esmx 联邦中的样式"
description: "Esmx 把 CSS 当作联邦一等资源：照常写 import './x.css'，框架经 manifest 注入真实的 link stylesheet，跨 bundler 一致。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,CSS,联邦,样式表,Import Maps,SSR,manifest"
---

# 样式

Esmx 把 CSS 当作**联邦一等资源** —— 每个远程自己打包样式,在 manifest 里
声明,host 渲染时为每个触达的 chunk 注入 `<link rel="stylesheet">`。你写的
就是标准的 `import './x.css'`,没有 Esmx 专有 API。

## 编写

在任意远程,从 TypeScript 或框架入口导入 CSS,语法和你 bundler 一直熟悉的
完全一致:

```ts
// src/entry.client.ts
import './styles/globals.css';
import { hydrateApp } from './app';

hydrateApp();
```

或在 Vue/React/Svelte 组件里:

```vue
<script setup lang="ts">
import './card.css';
</script>
```

```tsx
import './card.css';
export const Card = (props) => <div className="card">{props.children}</div>;
```

没有 `useStyles()` hook,没有 `injectGlobalStyles()` 工具函数,没有特殊文件
命名约定。CSS 的 `import` 语句本身就是合约的触发点。

## Esmx 替你做的事

每个远程的 bundler(Rspack / Rsbuild / Vite)把 CSS 导入提取为真实
`.css` 文件,远程的 `manifest.json` 按 chunk 列出来:

```json
{
    "name": "my-remote",
    "chunks": {
        "my-remote@src/entry.client.ts": {
            "js": "src/entry.client.aaa.mjs",
            "css": ["src/entry.client.bbb.css"],
            "resources": []
        }
    }
}
```

当 host SSR 渲染一个触达 `my-remote` chunk 的页面时,`RenderContext`
收集 chunk 的 CSS URL,`rc.css()` emit:

```html
<link rel="stylesheet" href="/my-remote/src/entry.client.bbb.css">
```

…前面还配一份 `<link rel="preload" as="style">`,让浏览器在 HTML 还没解析完
就开始下载样式表。零 FOUC。

## 在多个远程之间共享样式

每个远程拥有自己的 CSS,**共享设计系统的规范做法是把它放进所有远程都
会加载的那个联邦依赖**。常见模式:

```ts
// shared-host/src/index.ts
import './styles/tokens.css';      // 颜色/字号变量
import './styles/components.css';  // 共享的 .btn / .card 等

export { renderHost, hydrateHost } from './host';
```

每个消费端的远程都会从 `shared-host` import 些东西(layout、router 上下文、
…)。共享 chunk 的 CSS 随它一起走 federation manifest,host 自动 emit
`<link>` —— **消费端不需要自己 `import` 共享 CSS**。

::: tip
共享 CSS 只存一份。每个远程仍写自己的框架原生组件,但消费同一套 class
名称(`.btn`, `.card`, …)和同一套 CSS 变量。
:::

## 内部机制

| 步骤 | 组件 | 发生了什么 |
|------|------|-----------|
| 1 | 你的远程 | `import './x.css'` 在 chunk 上声明 side effect |
| 2 | Bundler(Rspack/Rsbuild/Vite)| 提取为 `.css` 资源,在 `manifest.json` 的 chunk `css[]` 中列出 |
| 3 | `@esmx/import`(服务端) | VM 加载远程模块时,CSS 导入返回空 synthetic module(URL 仅作元数据) |
| 4 | `RenderContext.commit()` | 读取每个触达 chunk 的 `css[]`,合入 `files.css` |
| 5 | `rc.css()` / `rc.preload()` | 在 SSR HTML 中 emit `<link>` 标签 |
| 6 | 浏览器 | 按 manifest 中的 URL 加载 CSS |

三个官方 bundler 集成(`@esmx/rspack`、`@esmx/rsbuild`、`@esmx/vite`)
对第 2 步的实现完全一致 —— `chunks[*].css[]` 是 manifest 合约的一部分,
不是某个 bundler 的方言。

## 常见问题

**dev 模式工作吗?**
工作。dev manifest 在重新构建时更新,host 走同一条 `<link>` 注入路径,
不需要你额外为 HMR 处理 CSS。

**CSS Modules / Tailwind / PostCSS / Sass 怎么办?**
预处理由各 bundler 自己负责。Esmx 只关心最终落在 manifest 中的 `.css`
URL。你的 `app.module.css`、`@apply`、`scss` 都按 bundler 文档使用即可。

**能直接 `import` 另一个远程的 CSS 吗?**
不该需要 —— 见"共享样式"那一节。如果你硬要这么做,library 模式下的
bundler 对 workspace-dep CSS 处理可能不一致。**让产出 CSS 的远程负责
自己的样式**。

**Subresource Integrity (SRI)?**
生产模式下每个 emit 的 CSS chunk 都有 `sha384-…` 完整性哈希,带到
`<link rel="stylesheet" integrity="…" crossorigin>` 属性里。浏览器拒绝
应用被篡改的样式表。

## 参考

- [Render Context — `rc.css()` / `rc.preload()`](/zh/api/core/render-context)
- 每个 bundler 的 manifest 都含上文的 `chunks[*].css[]` 字段。

## 相关

- [渲染上下文](/zh/guide/essentials/render-context) —— `rc.css()` / `rc.preload()` 生成收集到的样式表链接
- [模块链接](/zh/guide/essentials/module-linking) —— 远程模块如何拥有并共享样式
