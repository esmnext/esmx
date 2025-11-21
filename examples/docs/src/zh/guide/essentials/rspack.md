---
titleSuffix: "Esmx 封装的 Rspack 构建器"
description: "了解如何使用 Esmx 封装的 Rspack 构建器，快速创建 HTML、Vue 应用，并学习如何通过扩展配置来支持 React、Svelte 等任意前端框架。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,Rspack,构建系统,HTML应用,标准应用,多目标构建,SSR,HMR,SWC,LightningCSS,Loader,DefinePlugin,ImportMap,Module Link,外部化,内容哈希,性能优化"
---

# Rspack

Esmx 采用 [Rspack](https://www.rspack.dev/) 作为其默认的高性能构建引擎。Rspack 基于 Rust 开发，拥有卓越的构建性能和与 Webpack 兼容的生态系统，能够为 Esmx 应用提供极速的开发体验和高效的打包能力。

为了简化不同类型应用的构建配置，Esmx 提供了一系列封装好的 Rspack 构建器。以下将详细介绍这些构建器及其使用场景。

 


## 构建器

Esmx 提供了一系列层次化的构建器，以便用户根据需求选择和扩展：
- `createRspackApp`：最基础的构建器，提供了核心的 Rspack 配置。
- `createRspackHtmlApp`：继承自 `createRspackApp`，专门用于构建传统的 HTML 应用，内置了 HTML 生成和资源注入能力。
- `createRspackVue2App` / `createRspackVue3App`：继承自 `createRspackHtmlApp`，分别用于构建 Vue 2 和 Vue 3 应用，集成了 Vue 加载器、HMR 和 SSR 支持。

关于构建器的详细 API，请参阅 [Rspack 构建 API](/api/app/rspack)。

## HTML

- 用于构建以 HTML 为入口的传统多页（MPA）或单页应用（SPA）。

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then(m =>
      m.createRspackHtmlApp(esmx, {
        chain({ chain }) {
          // 在此通过 chain 对象自定义 Rspack 配置
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## Vue

Esmx 为 Vue 生态提供了开箱即用的一流支持。无论是 Vue 2 还是 Vue 3，开发者都能获得包含 CSR 与 SSR 在内的完整构建体验。

### Vue 3

- 用于快速构建 Vue 3 应用，内置 CSR 与 SSR 的完整支持。

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m =>
      m.createRspackVue3App(esmx, {
        chain({ chain }) {
          // 在此通过 chain 对象自定义 Rspack 配置
        }
      })
    );
  }
} satisfies EsmxOptions;
```

### Vue 2.7

- 用于快速构建 Vue 2.7 应用，内置 CSR 与 SSR 的完整支持。

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m =>
      m.createRspackVue2App(esmx, {
        chain({ chain }) {
          // 在此通过 chain 对象自定义 Rspack 配置
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## 适配前端框架

Esmx 的构建器具有很强的扩展性。开发者可以基于 `createRspackHtmlApp`，通过配置相应的编译器（如 Babel Loader 或特定框架的加载器），轻松集成 React、Solid、Svelte 等各类前端框架。

所有框架的集成都可以通过 `chain` 函数统一完成，下面的示例展示了进行自定义配置的入口点：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then(m =>
      m.createRspackHtmlApp(esmx, {
        chain({ chain }) {
          // 在此通过 chain 对象自定义 Rspack 配置，
          // 以适配特定框架的构建需求。
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## 构建工具解耦

Esmx 实现了构建工具的解耦。无论是使用 Rspack、Webpack、Vite 还是 esbuild，只要其构建产物中包含一份符合 [ManifestJson 规范](/api/core/manifest-json) 的资源清单，Esmx 就能识别并链接这些模块。

这种设计赋予了开发者充分的技术选型自由，可以为不同场景选择最适合的构建方案，而无需锁定在特定工具链上。
