---
titleSuffix: Esmx 框架高性能构建引擎
description: 深入解析 Esmx 框架的 Rspack 构建系统，包括高性能编译、多环境构建、资源优化等核心特性，助力开发者构建高效、可靠的现代 Web 应用。
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, 构建系统, 高性能编译, 热更新, 多环境构建, Tree Shaking, 代码分割, SSR, 资源优化, 开发效率, 构建工具
---

# Rspack

Esmx 基于 [Rspack](https://rspack.dev/) 构建系统实现，充分利用了 Rspack 的高性能构建能力。本文档将介绍 Rspack 在 Esmx 框架中的定位和核心功能。

## 特性

Rspack 是 Esmx 框架的核心构建系统，它提供了以下关键特性：

- **高性能构建**：基于 Rust 实现的构建引擎，提供极速的编译性能，显著提升大型项目的构建速度
- **开发体验优化**：支持热更新（HMR）、增量编译等现代开发特性，提供流畅的开发体验
- **多环境构建**：统一的构建配置支持客户端（client）、服务端（server）和 Node.js（node）环境，简化多端开发流程
- **资源优化**：内置的资源处理和优化能力，支持代码分割、Tree Shaking、资源压缩等特性

## 构建应用

Esmx 的 Rspack 构建系统采用模块化设计，主要包含以下核心模块：

### @esmx/rspack

基础构建模块，提供以下核心能力：

- **统一构建配置**：提供标准化的构建配置管理，支持多环境配置
- **资源处理**：内置对 TypeScript、CSS、图片等资源的处理能力
- **构建优化**：提供代码分割、Tree Shaking 等性能优化特性
- **开发服务器**：集成高性能的开发服务器，支持 HMR

### @esmx/rspack-vue

Vue 框架专用构建模块，提供：

- **Vue 组件编译**：支持 Vue 2/3 组件的高效编译
- **SSR 优化**：针对服务端渲染场景的特定优化
- **开发增强**：Vue 开发环境的特定功能增强

## 构建流程

Esmx 的构建流程主要分为以下几个阶段：

1. **配置初始化**
   - 加载项目配置
   - 合并默认配置和用户配置
   - 根据环境变量调整配置

2. **资源编译**
   - 解析源代码依赖
   - 转换各类资源（TypeScript、CSS 等）
   - 处理模块导入导出

3. **优化处理**
   - 执行代码分割
   - 应用 Tree Shaking
   - 压缩代码和资源

4. **输出生成**
   - 生成目标文件
   - 输出资源映射
   - 生成构建报告

## 最佳实践

### 开发环境优化

- **增量编译配置**：合理配置 `cache` 选项，利用缓存加快构建速度
- **HMR 优化**：针对性配置热更新范围，避免不必要的模块更新
- **资源处理优化**：使用适当的 loader 配置，避免重复处理

### 生产环境优化

- **代码分割策略**：合理配置 `splitChunks`，优化资源加载
- **资源压缩**：启用适当的压缩配置，平衡构建时间和产物大小
- **缓存优化**：利用内容哈希和长期缓存策略，提升加载性能

## 配置示例

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // 自定义构建配置
                config({ config }) {
                    // 在此处添加自定义的 Rspack 配置
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
更多详细的 API 说明和配置选项，请参考 [Rspack API 文档](/api/app/rspack.html)。
:::
