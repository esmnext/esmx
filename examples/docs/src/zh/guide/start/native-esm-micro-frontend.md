---
titleSuffix: "原生 ESM 微前端框架"
description: "原生 ESM 微前端：用 Import Maps 和标准 import 组合应用——无需 Module Federation、无需沙箱、原生支持 SSR。Esmx 的实现方式与对比。"
head:
  - - "meta"
    - name: "keywords"
      content: "原生 ESM 微前端, ESM 微前端, 微前端框架, 无需 Module Federation 微前端, Module Federation 替代, Import Maps 微前端, SSR 微前端, 框架无关"
---

# 原生 ESM 微前端

**原生 ESM 微前端**,是指用浏览器自身的模块系统——[ECMAScript Modules](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 与 [Import Maps](https://github.com/WICG/import-maps)——来组合微前端,而不是依赖打包器运行时、JavaScript 沙箱或私有加载器。

Esmx 正是基于这一模型:应用之间用普通的 `import` 相互引用,依赖通过 Import Maps 共享,运行时无需额外产物。由此得到一个**零运行时开销**、**原生支持 SSR**、真正**跨框架**的微前端框架。

## 为什么选原生 ESM

大多数微前端方案都在平台之上再加一层:打包器专属运行时、劫持 `window` 的沙箱,或自定义模块注册表。每一层都带来开销、边界情况和锁定。

原生 ESM 去掉了这一层。浏览器本就会解析、去重、按需加载模块,Import Maps 本就能锁定并共享版本。Esmx 直接复用这些能力,因此:

- **零运行时开销**——没有联邦容器或沙箱需要下载和执行。
- **无锁定**——链接的模块用标准 `import` 引用,同一份代码在浏览器、SSR 与测试中都能运行。
- **SEO 友好的 SSR**——渲染不依赖客户端编排运行时,页面输出完整、可被爬取的 HTML。
- **框架无关**——Vue 3、Vue 2、React、Preact、Solid、Svelte、Lit 微应用可在同一页面共存。

## 原生 ESM vs Module Federation

Module Federation 通过 Webpack/Rspack 运行时容器共享代码。它可用,但会把你绑定到打包器、引入联邦运行时与共享作用域协商,且历史上对 SSR 支持较为别扭。

而原生 ESM 的共享机制**就是平台本身**:Import Maps 解析共享依赖,[模块链接](/zh/guide/essentials/module-linking)让每个包有唯一明确的所有者,而非运行时版本协商。详见[并排对比](/zh/guide/essentials/module-linking#模块链接-vs-module-federation)。

## 原生 ESM vs 沙箱式微前端

沙箱式框架(qiankun、无界、micro-app 等)通过模拟或代理浏览器环境来隔离应用。这种隔离带来运行时成本和一长串兼容性问题。

Esmx 不做沙箱。隔离来自模块图本身——每个微应用通过标准模块拥有自己的作用域——因此没有 `window` 代理、没有样式作用域 hack、也没有每个应用的运行时开销。

## SSR 与 SEO

SSR 是核心设计目标,而非附加功能。由于组合通过原生模块完成,服务端会把每个微应用渲染成完整 HTML,搜索引擎无需执行客户端编排层即可爬取。如果你需要在独立构建的应用间做 SEO 安全的服务端渲染,原生 ESM 是最短路径。

## 默认多框架

一个 Esmx 应用可以同时挂载不同框架编写的微应用。用某个框架写的外壳可以承载另一个框架的视图,共享依赖在它们之间被链接而非重复打包。

## 常见问题

### 原生 ESM 微前端和 Module Federation 一样吗?

不一样。Module Federation 通过打包器运行时容器共享代码;原生 ESM 通过浏览器自身的模块系统与 Import Maps 共享,零额外运行时、且不绑定打包器。

### 不用 Module Federation 能做微前端吗?

可以。Esmx 用标准 `import` 与 Import Maps 组合应用,无需 Module Federation 或沙箱即可实现依赖共享与独立部署。

### 原生 ESM 微前端对 SEO 友好吗?

友好。渲染不依赖客户端编排运行时,服务端输出完整、可爬取的 HTML——这正是 Esmx 把 SSR 作为一等特性的原因。

### 支持混用多个框架吗?

支持。Vue 3、Vue 2、React、Preact、Solid、Svelte、Lit 微应用可运行在同一个应用中。

## 相关

- [介绍](/zh/guide/start/introduction) —— Esmx 核心理念与设计
- [模块链接](/zh/guide/essentials/module-linking) —— 零运行时依赖共享
- [快速开始](/zh/guide/start/getting-started) —— 构建你的第一个 Esmx 应用
