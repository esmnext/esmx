---
titleSuffix: "Rspack Builder Encapsulated by Esmx"
description: "Learn how to use the Rspack builder encapsulated by Esmx to quickly create HTML and Vue applications, and how to support any front-end framework like React, Svelte, etc. by extending the configuration."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,Rspack,build system,HTML application,standard application,multi-target build,SSR,HMR,SWC,LightningCSS,Loader,DefinePlugin,ImportMap,Module Link,external,content hash,performance optimization"
---

# Rspack

Esmx uses [Rspack](https://www.rspack.dev/) as its default high-performance build engine. Developed in Rust, Rspack offers excellent build performance and a Webpack-compatible ecosystem, providing Esmx applications with an extremely fast development experience and efficient packaging capabilities.

To simplify the build configuration for different types of applications, Esmx provides a series of encapsulated Rspack builders. The following is a detailed introduction to these builders and their use cases.

## Builders

Esmx provides a series of hierarchical builders for users to choose and extend according to their needs:
- `createRspackApp`: The most basic builder, providing the core Rspack configuration.
- `createRspackHtmlApp`: Inherits from `createRspackApp`, specifically for building traditional HTML applications, with built-in HTML generation and resource injection capabilities.
- `createRspackVue2App` / `createRspackVue3App`: Inherit from `createRspackHtmlApp`, used for building Vue 2 and Vue 3 applications respectively, integrating Vue loader, HMR, and SSR support.

For detailed API of the builders, please refer to [Rspack Build API](/api/app/rspack).

## HTML

- Used for building traditional multi-page (MPA) or single-page applications (SPA) with HTML as the entry point.

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then(m =>
      m.createRspackHtmlApp(esmx, {
        chain({ chain }) {
          // Customize Rspack configuration here through the chain object
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## Vue

Esmx provides first-class out-of-the-box support for the Vue ecosystem. Whether it is Vue 2 or Vue 3, developers can get a complete build experience including CSR and SSR. For more configuration options for the Vue builder, please refer to the [Rspack Vue Build API](/api/app/rspack-vue).

### Vue 3

- Used for quickly building Vue 3 applications, with complete built-in support for CSR and SSR.

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m =>
      m.createRspackVue3App(esmx, {
        chain({ chain }) {
          // Customize Rspack configuration here through the chain object
        }
      })
    );
  }
} satisfies EsmxOptions;
```

### Vue 2.7

- Used for quickly building Vue 2.7 applications, with complete built-in support for CSR and SSR.

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m =>
      m.createRspackVue2App(esmx, {
        chain({ chain }) {
          // Customize Rspack configuration here through the chain object
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## Adapting to Front-end Frameworks

Esmx's builders are highly extensible. Developers can easily integrate various front-end frameworks such as React, Solid, and Svelte by configuring the corresponding compilers (such as Babel Loader or framework-specific loaders) based on `createRspackHtmlApp`.

The integration of all frameworks can be done uniformly through the `chain` function. The following example shows the entry point for custom configuration:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then(m =>
      m.createRspackHtmlApp(esmx, {
        chain({ chain }) {
          // Customize Rspack configuration here through the chain object
          // to meet the build requirements of a specific framework.
        }
      })
    );
  }
} satisfies EsmxOptions;
```

## Decoupling of Build Tools

Esmx implements the decoupling of build tools. Whether using Rspack, Webpack, Vite, or esbuild, as long as its build output contains a resource manifest that complies with the [ManifestJson specification](/api/core/manifest-json), Esmx can recognize and link these modules.

This design gives developers full freedom of technology selection, allowing them to choose the most suitable build solution for different scenarios without being locked into a specific toolchain.
