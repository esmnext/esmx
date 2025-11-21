---
titleSuffix: "核心术语解读"
description: "本页统一了 Esmx 框架的核心术语及其标准译法，涵盖了从底层技术到上层架构的各个方面，旨在帮助开发者准确理解和使用 Esmx 的各项能力。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 术语表, 模块链接, 微前端, ESM, Import Maps, 构建器, 依赖隔离"
---

# 术语表

## 核心技术

### ESM (ECMAScript Modules)
浏览器与 Node.js 原生的模块机制，使用 `import`/`export` 语法。

### 导入映射 (Import Maps)
浏览器原生机制，控制 ESM 模块的路径映射与作用域。

## 架构与模式

### 模块链接 (Module Linking)
利用原生 ESM 与 Import Maps 在运行时链接多个包或模块，实现解耦与协作。

### 微前端 (Micro-Frontends)
支持多团队独立开发与集成的前端架构模式。

### 依赖隔离 (Dependency Isolation)
通过 Import Maps 与模块作用域避免依赖冲突，提升稳定性。

### 框架无关 (Framework Agnostic)
在同一项目中集成多种前端框架，保持框架中立设计。

## 角色与单元

### 主应用 (Host)
加载与调度远程应用或模块的核心应用。

### 远程应用/模块 (Remote)
由主应用动态加载的子应用或模块。

### 应用 (Application)
可独立运行与部署的前端子系统。

### 模块 (Module)
一个独立的、可复用的代码单元，它封装了特定的功能或数据。在现代 JavaScript (ESM) 中，通常指一个文件，通过 `import` 和 `export` 与其他模块交互。

### 包 (Package)
一个或多个模块的集合，作为一个独立的单元进行分发和版本管理。在 Node.js 生态中，通常指一个包含 `package.json` 文件的目录，可以通过 npm 等包管理器进行发布和安装。

## 构建与渲染

### 构建器 (Builder)
Esmx 中用于简化构建配置的封装层，针对特定应用类型（如 HTML, Vue）提供开箱即用的最佳实践。

### 客户端激活 (Hydration)
将服务端渲染（SSR）生成的静态 HTML 与客户端的 JavaScript 进行关联，为其附加事件监听器并恢复应用状态，使其恢复完整交互能力的过程。

### 中间件 (Middleware)
用于在服务端请求处理流程中插入自定义逻辑的函数或模块，常用于服务静态资源、身份验证或添加日志。

### 渲染上下文 (RenderContext)
Esmx 中用于管理渲染过程的核心对象，负责在 CSR 和 SSR 场景下注入资源、约束模块加载顺序，并传递上下文数据。
