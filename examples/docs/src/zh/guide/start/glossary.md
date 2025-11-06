---
titleSuffix: "术语表"
description: "Esmx 的核心术语与统一译法，确保与 packages 保持一致。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 术语表, 模块链接（Module Linking）, 微前端, ESM, import map"
---

# 术语表



## 模块链接（Module Linking）

利用原生 ESM 与 Import Maps 在运行时链接多个包或模块，实现解耦与协作。

## ESM（ECMAScript Modules）

浏览器与 Node.js 原生的模块机制，使用 `import`/`export` 语法。

## Import Maps（导入映射）

浏览器原生机制，控制 ESM 模块的路径映射与作用域。

## Hydration（客户端激活）

SSR 后在客户端激活页面交互的过程。

## Middleware（中间件）

静态资源与请求处理的抽象接口。

## 依赖隔离

通过 Import Maps 与模块作用域避免依赖冲突，提升稳定性。

## 多框架混合

在同一项目中集成多种前端框架，保持框架中立设计。

## 包协作/模块解耦

通过模块链接实现包独立开发与运行时协同。

## 微前端（Micro Frontends）

支持多团队独立开发与集成的前端架构模式。

## 主应用（Host）

加载与调度远程应用或模块的核心应用。

## 远程应用/模块（Remote）

由主应用动态加载的子应用或模块。

## 应用（Application）

可独立运行与部署的前端子系统。

## 模块（Module）

可被链接与复用的功能单元，如组件库与工具库。

## 包（Package）

NPM 包或 Monorepo 子包，强调发布单元与物理结构。
