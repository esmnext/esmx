---
titleSuffix: "Esmx Framework High-Performance Build Engine"
description: "Deep dive into Esmx framework's Rspack build system, including high-performance compilation, multi-environment builds, resource optimization, and other core features to help developers build efficient and reliable modern Web applications."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Rspack, build system, high-performance compilation, hot reload, multi-environment builds, Tree Shaking, code splitting, SSR, resource optimization, development efficiency, build tool"
---

# Rspack

Esmx is implemented based on the [Rspack](https://rspack.dev/) build system, fully utilizing Rspack's high-performance build capabilities. This document introduces Rspack's positioning and core features in the Esmx framework.

## Features

Rspack is the core build system of the Esmx framework, providing the following key features:

- **High-Performance Builds**: Build engine based on Rust implementation, providing extremely fast compilation performance, significantly improving build speed for large projects
- **Development Experience Optimization**: Supports modern development features like hot reload (HMR) and incremental compilation, providing a smooth development experience
- **Multi-Environment Builds**: Unified build configuration supports client, server, and Node.js environments, simplifying multi-end development workflows
- **Resource Optimization**: Built-in resource processing and optimization capabilities, supporting features like code splitting, Tree Shaking, and resource compression

## Building Applications

Esmx's Rspack build system adopts a modular design, mainly including the following core modules:

### @esmx/rspack

Basic build module, providing the following core capabilities:

- **Unified Build Configuration**: Provides standardized build configuration management, supporting multi-environment configuration
- **Resource Processing**: Built-in processing capabilities for TypeScript, CSS, images, and other resources
- **Build Optimization**: Provides performance optimization features like code splitting and Tree Shaking
- **Development Server**: Integrated high-performance development server, supporting HMR

### @esmx/rspack-vue

Vue framework-specific build module, providing:

- **Vue Component Compilation**: Supports efficient compilation of Vue 2/3 components
- **SSR Optimization**: Specific optimizations for server-side rendering scenarios
- **Development Enhancements**: Specific feature enhancements for Vue development environment

## Build Process

Esmx's build process mainly includes the following stages:

1. **Configuration Initialization**
   - Load project configuration
   - Merge default and user configurations
   - Adjust configuration based on environment variables

2. **Resource Compilation**
   - Parse source code dependencies
   - Transform various resources (TypeScript, CSS, etc.)
   - Handle module imports and exports

3. **Optimization Processing**
   - Execute code splitting
   - Apply Tree Shaking
   - Compress code and resources

4. **Output Generation**
   - Generate target files
   - Output resource mappings
   - Generate build reports

## Best Practices

### Development Environment Optimization

- **Incremental Compilation Configuration**: Properly configure `cache` option, utilize caching to speed up builds
- **HMR Optimization**: Targetedly configure hot reload scope, avoid unnecessary module updates
- **Resource Processing Optimization**: Use appropriate loader configuration, avoid duplicate processing

### Production Environment Optimization

- **Code Splitting Strategy**: Properly configure `splitChunks`, optimize resource loading
- **Resource Compression**: Enable appropriate compression configuration, balance build time and artifact size
- **Caching Optimization**: Utilize content hashing and long-term caching strategies to improve loading performance

## Configuration Example

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Custom build configuration
                config({ config }) {
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
For more detailed API instructions and configuration options, please refer to [Rspack API Documentation](/api/app/rspack.html).
:::