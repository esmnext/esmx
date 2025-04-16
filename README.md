<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
  <h1>Esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml"><img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/dm/@esmx/core.svg" alt="downloads monthly" /></a>
    <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" /></a>
  </div>
  
  <p>Esmx 是基于原生 ESM 的下一代微前端框架，无沙盒无运行时，支持多框架混合开发，并提供高性能服务端渲染能力。</p>
  
  <p>
    简体中文 | <a href="./README.en.md">English</a>
  </p>
</div>



## 💫 拥抱现代微前端

**是时候告别过去，拥抱真正的微前端架构了！**

在过去的几年里，当巨石应用变得臃肿不堪，微前端架构应运而生。然而，现有的微前端方案为了实现应用隔离，不得不在原有架构之上增加层层包装：

- 人工打造的沙箱环境
- 复杂的依赖处理
- 繁重的运行时

这些妥协带来了沉重的性能负担，让简单的开发变得复杂，让标准的流程变得晦涩。

## ⛓️ 旧世界的枷锁

这些历史包袱，正在阻碍我们前进的步伐：

- **人工隔离**：用沙箱模拟隔离环境，却始终无法企及浏览器原生的模块隔离能力
- **繁重运行时**：注入依赖、代理 JS 执行，每一次操作都在消耗宝贵的性能
- **复杂工具链**：为了处理依赖关系，不得不改造构建工具，让简单的项目变得难以维护
- **割裂体验**：特殊的部署策略、运行时处理，让开发流程偏离了现代前端的标准实践
- **封闭生态**：框架耦合、定制接口，让技术选型被迫绑定在特定的生态中

## ☀️ 新时代的曙光

而今天，Web 标准的进化为我们带来了新的可能。我们终于可以用最纯粹的方式构建微前端：

- **回归原生**：拥抱 ESM 和 importmap，让依赖管理回归浏览器标准。
- **天然隔离**：模块作用域提供了最可靠的隔离，无需任何额外的运行时开销。
- **开放共赢**：任何现代前端框架都能无缝接入，技术选型不再受限。
- **开发体验**：符合直觉的开发模式，熟悉的调试流程，一切都那么自然。
- **极致性能**：零运行时开销，可靠的缓存策略，让应用真正轻量起来。

## 📚 基本概念

在 Esmx 中，模块的导入导出配置简单直观，只需几行代码即可完成应用间的无缝集成。

**模块导出**    
`remote` 配置需要对外暴露的模块：

```ts
export default {
  modules: {
    exports: [
      'npm:axios',
      'root:src/utils.ts'
    ]
  }
}
```

**模块导入**    
`host` 配置模块链接和导入映射

```ts
export default {
  modules: {
    links: {
      'remote': './node_modules/remote'
    },
    imports: {
      'axios': 'remote/npm/axios'
    }
  }
}
```

在代码中直接导入使用：

```ts
import axios from 'axios';
import utils from 'remote/src/utils';
```

## 🚀 快速开始
请阅读[快速开始](https://www.esmnext.com/guide/start/getting-started.html)。

## 🔧 示例项目

- [轻量级 HTML 应用](https://www.esmnext.com/ssr-html/)
  - 🚀 基于 Rspack 的服务端渲染
  - 💡 完整路由、组件、样式支持
  - 📱 响应式设计适配多设备

- [Vue2 微前端示例](https://www.esmnext.com/ssr-vue2-host/)
  - 🔗 基于 ESM 的模块集成
  - 📦 主/子应用独立开发
  - 🌐 统一依赖管理与 SSR

- [Preact + HTM](https://www.esmnext.com/ssr-preact-htm/)
  - ⚡️ 极致轻量的包体积
  - 🎯 高性能 SSR 实现
  - 🛠 低资源消耗场景优化

查看 [examples](https://github.com/esmnext/esmx/tree/master/examples) 目录获取完整示例。

## 📜 版本说明

- [v3.x](https://www.esmnext.com) - 开发阶段
当前版本基于 Rspack 构建，提供更优的开发体验和构建性能。

> **已知问题**：
> - ESM 模块导出优化中：`modern-module` 的 `export *` 语法存在稳定性问题 [#8557](https://github.com/web-infra-dev/rspack/issues/8557)

- [v2.x](https://github.com/esmnext/esmx/blob/v2/docs/zh-CN/README.md) - 不推荐生产使用
此版本不再推荐用于生产环境，建议使用最新版本。

- [v1.x](https://fmfe.github.io/genesis-docs/guide/) - 已停止维护
原名 Genesis，是 Esmx 的前身。不再接受新功能和非关键性 bug 修复。


## 👥 贡献者

感谢所有为 Esmx 做出贡献的开发者！

[![Contributors](https://contrib.rocks/image?repo=esmnext/esmx)](https://github.com/esmnext/esmx/graphs/contributors)

## 📈 趋势
![Star growth chart](https://starchart.cc/esmnext/esmx.svg)

## ⚖️ 许可证

本项目采用 [MIT](./LICENSE) 许可证。

## 💬 社区

可以在 [飞书](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=3c3vca77-bfc0-4ef5-b62b-9c5c9c92f1b4) 上和我们交流
