---
titleSuffix: Esmx Framework High-Performance Build Engine
description: An in-depth analysis of the Rspack build system in the Esmx framework, including core features such as high-performance compilation, multi-environment builds, and resource optimization, helping developers build efficient and reliable modern web applications.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, Build System, High-Performance Compilation, Hot Module Replacement, Multi-Environment Build, Tree Shaking, Code Splitting, SSR, Resource Optimization, Development Efficiency, Build Tools
---

# Rspack

Esmx is built on the [Rspack](https://rspack.dev/) build system, leveraging its high-performance build capabilities. This document will introduce the role and core features of Rspack in the Esmx framework.

## Features

Rspack is the core build system of the Esmx framework, offering the following key features:

- **High-Performance Builds**: A Rust-based build engine that provides extremely fast compilation performance, significantly improving build speeds for large projects.
- **Optimized Development Experience**: Supports modern development features such as Hot Module Replacement (HMR) and incremental compilation, delivering a smooth development experience.
- **Multi-Environment Builds**: Unified build configurations support client, server, and Node.js environments, simplifying multi-platform development workflows.
- **Resource Optimization**: Built-in resource processing and optimization capabilities, including code splitting, Tree Shaking, and resource compression.

## Building Applications

Esmx's Rspack build system is designed with a modular architecture, primarily consisting of the following core modules:

### @esmx/rspack

The foundational build module, providing the following core capabilities:

- **Unified Build Configuration**: Standardized build configuration management with support for multi-environment configurations.
- **Resource Processing**: Built-in handling for TypeScript, CSS, images, and other resources.
- **Build Optimization**: Features such as code splitting and Tree Shaking for performance optimization.
- **Development Server**: Integrated high-performance development server with HMR support.

### @esmx/rspack-vue

A specialized build module for the Vue framework, offering:

- **Vue Component Compilation**: Efficient compilation for Vue 2/3 components.
- **SSR Optimization**: Specific optimizations for server-side rendering scenarios.
- **Development Enhancements**: Enhanced features tailored for Vue development environments.

## Build Process

The build process in Esmx is divided into the following stages:

1. **Configuration Initialization**
   - Load project configurations.
   - Merge default and user configurations.
   - Adjust configurations based on environment variables.

2. **Resource Compilation**
   - Resolve source code dependencies.
   - Transform various resources (TypeScript, CSS, etc.).
   - Handle module imports and exports.

3. **Optimization**
   - Perform code splitting.
   - Apply Tree Shaking.
   - Compress code and resources.

4. **Output Generation**
   - Generate target files.
   - Output resource maps.
   - Generate build reports.

## Best Practices

### Development Environment Optimization

- **Incremental Compilation Configuration**: Properly configure the `cache` option to leverage caching for faster builds.
- **HMR Optimization**: Configure the scope of hot updates to avoid unnecessary module updates.
- **Resource Processing Optimization**: Use appropriate loader configurations to avoid redundant processing.

### Production Environment Optimization

- **Code Splitting Strategy**: Properly configure `splitChunks` to optimize resource loading.
- **Resource Compression**: Enable appropriate compression configurations to balance build time and output size.
- **Cache Optimization**: Utilize content hashing and long-term caching strategies to improve loading performance.

## Configuration Example

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Custom build configuration
                config({ config }) {
                    // Add custom Rspack configurations here
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
For more detailed API documentation and configuration options, please refer to the [Rspack API Documentation](/api/app/rspack.html).
:::