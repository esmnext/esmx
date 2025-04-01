<p align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
</p>

<h1 align="center">Esmx</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version"></a>
  <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size"></a>
  <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/dm/@esmx/core.svg" alt="downloads monthly"></a>
</p>
<p align="center">Esmx 是基于原生 ESM 的下一代微前端框架，无沙盒无运行时，支持多框架混合开发，并提供高性能服务端渲染能力。</p>

<p align="center">
  📚 <b>文档：</b>
  <a href="https://www.esmnext.com">简体中文</a>|
  <a href="https://www.esmnext.com/en/">English</a>
</p>



## 💫 拥抱现代微前端

**是时候告别过去，拥抱真正的微前端架构了。**

在过去的几年里，当巨石应用变得臃肿不堪，微前端架构应运而生。然而，现有的微前端方案为了实现应用隔离，不得不在原有架构之上增加层层包装：人工打造的沙箱环境、复杂的依赖处理、繁重的运行时。这些妥协带来了沉重的性能负担，让简单的开发变得复杂，让标准的流程变得晦涩。

### 🔧 旧世界的枷锁

这些历史包袱，正在阻碍我们前进的步伐：

- **人工隔离**：用沙箱模拟隔离环境，却始终无法企及浏览器原生的模块隔离能力
- **繁重运行时**：注入依赖、代理 JS 执行，每一次操作都在消耗宝贵的性能
- **复杂工具链**：为了处理依赖关系，不得不改造构建工具，让简单的项目变得难以维护
- **割裂体验**：特殊的部署策略、运行时处理，让开发流程偏离了现代前端的标准实践
- **封闭生态**：框架耦合、定制接口，让技术选型被迫绑定在特定的生态中

### 🌟 新时代的曙光

而今天，Web 标准的进化为我们带来了新的可能。我们终于可以用最纯粹的方式构建微前端：

- **回归原生**：拥抱 ESM 和 importmap，让依赖管理回归浏览器标准
- **天然隔离**：模块作用域提供了最可靠的隔离，无需任何额外的运行时开销
- **开放共赢**：任何现代前端框架都能无缝接入，技术选型不再受限
- **开发体验**：符合直觉的开发模式，熟悉的调试流程，一切都那么自然
- **极致性能**：零运行时开销，可靠的缓存策略，让应用真正轻量起来

## 🎯 示例项目

### [轻量级 HTML 应用](https://www.esmnext.com/ssr-html/)
一个完整的 HTML 服务端渲染示例，展示了如何使用 Esmx 构建现代化的 Web 应用：
- 🚀 基于 Rust 构建的 Rspack，提供极致的构建性能
- 💡 包含路由、组件、样式、图片等完整功能支持
- 🛠 快速的热更新、友好的错误提示和完整的类型支持
- 📱 现代化的响应式设计，完美适配各种设备

### [Vue2 微前端示例](https://www.esmnext.com/ssr-vue2-host/)
展示基于 Vue2 的微前端架构，包含主应用和子应用：

**主应用：**
- 🔗 基于 ESM 导入子应用模块
- 🛠 统一的依赖管理（如 Vue 版本）
- 🌐 支持服务端渲染

**子应用：**
- 📦 模块化导出（组件、composables）
- 🚀 独立的开发服务器
- 💡 支持开发环境热更新

这个示例展示了：
1. 如何通过 ESM 复用子应用的组件和功能
2. 如何确保主子应用使用相同版本的依赖
3. 如何在开发环境中独立调试子应用

### [Preact + HTM](https://www.esmnext.com/ssr-preact-htm/)
基于 Preact + HTM 的高性能实现：
- ⚡️ 极致的包体积优化
- 🎯 性能优先的架构设计
- 🛠 适用于资源受限场景

所有示例都包含完整的工程配置和最佳实践指南，帮助你快速上手并应用到生产环境。查看 [examples](https://github.com/esmnext/esmx/tree/master/examples) 目录了解更多详情。

## 📚 版本说明

### [v3.x](https://www.esmnext.com) - 开发阶段
当前版本基于 Rspack 构建，提供更优的开发体验和构建性能。

> **已知问题**：
> - ESM 模块导出优化中：`modern-module` 的 `export *` 语法存在稳定性问题 [#8557](https://github.com/web-infra-dev/rspack/issues/8557)

### [v2.x](https://github.com/esmnext/esmx/blob/v2/docs/zh-CN/README.md) - 不推荐生产使用
此版本不再推荐用于生产环境，建议使用最新版本。

### [v1.x](https://fmfe.github.io/genesis-docs/guide/) - 已停止维护
原名 Genesis，是 Esmx 的前身。不再接受新功能和非关键性 bug 修复。

## 👥 贡献者

感谢所有为 Esmx 做出贡献的开发者！

[![Contributors](https://contrib.rocks/image?repo=esmnext/esmx)](https://github.com/esmnext/esmx/graphs/contributors)

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。
