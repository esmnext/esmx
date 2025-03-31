---
titleSuffix: Esmx Framework High-Performance Build Engine
description: An in-depth analysis of the Rspack build system in the Esmx framework, covering core features such as high-performance compilation, multi-environment builds, and resource optimization, empowering developers to build efficient and reliable modern web applications.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, Build System, High-Performance Compilation, Hot Module Replacement, Multi-Environment Build, Tree Shaking, Code Splitting, SSR, Resource Optimization, Development Efficiency, Build Tool
---

# Rspack

Esmx implements its build system based on [Rspack](https://rspack.dev/), fully leveraging Rspack's high-performance build capabilities. This document introduces the role and core functionalities of Rspack within the Esmx framework.

## Features

As the core build system of the Esmx framework, Rspack provides the following key features:

- **High-Performance Build**: Rust-based build engine delivering blazing-fast compilation speeds, significantly improving build performance for large-scale projects
- **Development Experience Optimization**: Supports modern development features like Hot Module Replacement (HMR) and incremental compilation for a smooth development workflow
- **Multi-Environment Build**: Unified build configuration supporting client-side, server-side, and Node.js environments, simplifying multi-platform development
- **Resource Optimization**: Built-in resource processing and optimization capabilities, including code splitting, Tree Shaking, and resource compression

## Building Applications

Esmx's Rspack build system adopts a modular design, primarily consisting of the following core modules:

### @esmx/rspack

The foundational build module providing these core capabilities:

- **Unified Build Configuration**: Standardized build configuration management supporting multi-environment setups
- **Resource Processing**: Built-in handling for TypeScript, CSS, images, and other resources
- **Build Optimization**: Features like code splitting and Tree Shaking for performance optimization
- **Development Server**: Integrated high-performance development server with HMR support

### @esmx/rspack-vue

Dedicated build module for Vue framework, offering:

- **Vue Component Compilation**: Efficient compilation support for Vue 2/3 components
- **SSR Optimization**: Specific optimizations for server-side rendering scenarios
- **Development Enhancements**: Specialized improvements for Vue development environments

## Build Process

The Esmx build process consists of the following main stages:

1. **Configuration Initialization**
   - Load project configuration
   - Merge default and user configurations
   - Adjust configurations based on environment variables

2. **Resource Compilation**
   - Parse source code dependencies
   - Transform various resources (TypeScript, CSS, etc.)
   - Process module imports/exports

3. **Optimization Processing**
   - Perform code splitting
   - Apply Tree Shaking
   - Compress code and resources

4. **Output Generation**
   - Generate target files
   - Output resource maps
   - Generate build reports

## Best Practices

### Development Environment Optimization

- **Incremental Compilation Configuration**: Properly configure `cache` options to leverage caching for faster builds
- **HMR Optimization**: Strategically configure HMR scope to avoid unnecessary module updates
- **Resource Processing Optimization**: Use appropriate loader configurations to prevent redundant processing

### Production Environment Optimization

- **Code Splitting Strategy**: Configure `splitChunks` appropriately to optimize resource loading
- **Resource Compression**: Enable suitable compression configurations to balance build time and output size
- **Cache Optimization**: Utilize content hashing and long-term caching strategies to improve loading performance

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