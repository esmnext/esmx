---
titleSuffix: "Esmx High-Performance Build Engine"
description: "Rspack in Esmx: high-performance compilation, multi-env builds, resource optimization, and key features for modern reliable Web apps."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Rspack, Build System, High-performance Compilation, HMR, Multi-env Builds, Tree Shaking, Code Splitting, SSR, Resource Optimization, Developer Experience, Build Tool"
---

# Rspack

Esmx leverages the [Rspack](https://rspack.dev/) build system, taking advantage of its high-performance compilation capabilities. This document introduces Rspack’s role and core functions within Esmx.

## Features

- **High-performance builds**: Rust-based engine provides fast compilation, speeding up large projects
- **Developer experience**: HMR, incremental compilation, and modern dev features
- **Multi-env builds**: unified configuration for client, server, and node targets
- **Resource optimization**: built-in handling and optimization for code splitting, tree shaking, and minification

## Build Modules

### @esmx/rspack

- **Unified config management**
- **Resource handling** for TypeScript, CSS, images
- **Build optimizations**
- **Dev server** with HMR

### @esmx/rspack-vue

- **Vue component compilation** for Vue 2/3
- **SSR optimizations**
- **Dev enhancements** for Vue

## Build Flow

1. **Init config**
2. **Compile resources**
3. **Optimize** (split chunks, tree shaking, minify)
4. **Output** (files, asset maps, report)

## Best Practices

### Development

- Configure `cache` for incremental builds
- Scope HMR updates
- Optimize loader usage

### Production

- Tune `splitChunks`
- Enable compression
- Use content hashing and long-term cache strategies

## Example

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config({ config }) {
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
See [Rspack API docs](/api/app/rspack.html) for more details.
:::
