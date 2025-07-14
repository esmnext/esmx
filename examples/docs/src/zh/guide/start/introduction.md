---
titleSuffix: Esmx 框架概述
description: Esmx 是基于 ESM 的微前端框架，提供高性能服务端渲染能力。
head:
  - - meta
    - property: keywords
      content: Esmx, 微前端, ESM, 服务端渲染, SSR, 模块链接, 模块联邦
---

# 介绍

## Esmx 是什么

基于 ECMAScript Modules (ESM) 的微前端框架，用于构建高性能 SSR 应用。

**技术演进：**
- **v1.0**：HTTP 请求实现组件按需加载
- **v2.0**：Webpack Module Federation 实现应用集成
- **v3.0**：浏览器原生 ESM 的[模块链接](/guide/essentials/module-linking)系统

## 解决的问题

### 传统微前端方案的局限

- 运行时依赖注入和沙箱代理带来性能损耗
- 自研沙箱不如浏览器原生模块隔离能力
- 依赖共享需要改造构建工具
- 部署策略与 Web 标准相悖
- 框架耦合限制技术栈

### Esmx 的解决方案

- 浏览器 ESM 和 Import Maps 管理依赖
- ECMAScript 模块作用域实现隔离
- 支持多种前端框架
- 零运行时开销

## 技术组成

- [Import Maps](https://caniuse.com/?search=import%20map) 实现模块映射
- [es-module-shims](https://github.com/guybedford/es-module-shims) 提供兼容支持
- Rspack [module-import](https://rspack.dev/config/externals#externalstypemodule-import) 处理外部依赖
- ESM 热更新和 TypeScript 原生执行

## 核心特性

与 [Next.js](https://nextjs.org) 或 [Nuxt.js](https://nuxt.com/) 不同，Esmx 专注于微前端基础设施：

### 功能特性

- 模块链接系统
- 服务端渲染
- TypeScript 类型支持
- 框架中立性

## 项目状态

已通过 5 年迭代，在企业环境中验证，支撑数十个业务项目稳定运行。
