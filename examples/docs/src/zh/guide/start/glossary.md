---
titleSuffix: 术语表
description: Esmx 框架核心术语解释，帮助开发者理解模块链接、依赖隔离等关键概念。
head:
  - - meta
    - name: keywords
      content: Esmx, 术语表, 模块链接, 微前端, ESM, import map
---

# 术语表

本术语表收录 Esmx 框架及微前端架构中最核心、最易混淆的专业术语，帮助用户快速理解项目架构与技术理念。

## 模块链接

模块链接（Module Linking）是指利用原生 ES Modules（ESM）和 import map，在运行时动态链接多个包或模块，实现它们之间的解耦与协作。该机制允许各个包独立开发、独立部署，并在主应用中通过 import map 进行统一管理和加载。

## 原生 ESM

原生 ESM（Native ESM）是指浏览器和 Node.js 原生支持的 ES Modules 机制，允许开发者使用标准的 import/export 语法进行模块化开发。Esmx 框架的所有模块链接和依赖隔离均基于原生 ESM 实现。

## 导入映射

import map 是一种浏览器原生机制，用于控制 ESM 模块的导入路径映射。通过 import map，可以实现依赖隔离和多包协作，避免包之间的路径冲突。

## 零运行时

零运行时（Zero Runtime）是 Esmx 的核心设计理念，指框架本身不引入任何额外的运行时代码，所有功能均依赖于原生平台能力，从而提升性能并降低复杂度。

## 无沙盒

无沙盒（No Sandbox）是指 Esmx 不依赖 iframe 等传统沙盒机制进行模块隔离，而是通过原生 ESM 和 import map 实现安全与隔离，提升灵活性和性能。

## 依赖隔离

依赖隔离（Dependency Isolation）是指各模块或包之间的依赖互不干扰。Esmx 通过 import map 和 ESM 实现依赖隔离，防止包间冲突，保证系统稳定性。

## 多框架混合

多框架混合（Multi-Framework Integration）是指 Esmx 支持在同一项目中集成和运行多种前端框架（如 Vue、React、Svelte 等），实现多团队、多技术栈的协作开发。

## 包协作/模块解耦

包协作（Package Collaboration）和模块解耦（Module Decoupling）是指通过模块链接机制，各包或模块可以独立开发、测试、部署，并在运行时协同工作，提升系统的可维护性和扩展性。

## 微前端

微前端（Micro Frontends）是一种前端架构模式，允许多个团队独立开发、部署和运行各自的前端应用，并通过主应用集成为一个整体。Esmx 属于微前端架构范畴。

## 主应用

主应用（Host）是指在微前端或模块链接架构中，负责加载、集成和调度远程应用或模块的主控项目。主应用通常负责全局路由、状态管理和 UI 框架。

## 远程应用/模块

远程应用或模块（Remote）是指被主应用动态加载和集成的独立子应用或功能模块，支持独立开发、测试和部署。

## 应用

应用（Application）是指可独立运行、独立部署的前端子系统，通常包含完整的页面、路由和业务逻辑。

## 模块

模块（Module）是指可被链接和复用的功能单元，如包、组件库、工具库等，是 Esmx 实现解耦和复用的基础。

## 包

包（Package）是指 NPM 包或 Monorepo 子包，强调物理结构和发布单元，是 Esmx 多包协作的基础。 