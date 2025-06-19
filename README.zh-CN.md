<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
  <h1>Esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml"><img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
    <a href="https://www.esmnext.com/coverage/"><img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" /></a>
    <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" /></a>
  </div>
  
  <h3>基于ESM的下一代微前端框架，无沙箱零开销，支持多框架混合开发</h3>
  
  <p>⚡️ <strong>极致性能</strong> · 🛠️ <strong>开发友好</strong> · 🔧 <strong>标准语法</strong></p>
  
  <p>
    简体中文 | <a href="https://github.com/esmnext/esmx/blob/master/README.md">English</a>
  </p>
</div>

## 🚀 核心特性

- **零运行时开销** - 基于原生ESM + ImportMap，无沙箱代理
- **高性能构建** - Rspack驱动，显著提升构建速度  
- **完整SSR支持** - 高性能服务端渲染，SEO友好
- **标准ESM语法** - 无框架特定API，学习成本极低
- **严格测试保障** - [完整测试覆盖](https://www.esmnext.com/coverage/)，持续集成验证
- **多框架支持** - Vue、React、Preact、Solid等

## 📊 vs 传统微前端

| 特性 | 传统方案 | Esmx |
|------|----------|------|
| **架构** | 人工沙箱 + 代理 | 原生ESM |
| **运行时** | 有开销 | **零开销** |
| **学习成本** | 框架API | **标准语法** |
| **模块隔离** | 沙箱模拟 | **浏览器原生** |

## ⚡ 快速上手

```typescript
// Remote App - 导出模块
export default {
  modules: { exports: ['npm:vue', 'root:src/Button.vue'] }
}

// Host App - 导入模块  
export default {
  modules: {
    links: { 'remote': './node_modules/remote' },
    imports: { 'vue': 'remote/npm/vue' }
  }
}

// 标准ESM语法使用
import { createApp } from 'vue';
import Button from 'remote/src/Button.vue';
```

## 🚀 快速开始

📖 [完整指南](https://www.esmnext.com/guide/start/getting-started.html)

## 📦 核心软件包

| 包名 | 版本 | 状态 | 说明 |
|------|------|------|------|
| [**@esmx/core**](https://github.com/esmnext/esmx/tree/master/packages/core) | <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a> | 🟡 **开发中** | 微前端框架，提供原生ESM模块链接能力 |
| [**@esmx/router**](https://github.com/esmnext/esmx/tree/master/packages/router) | <a href="https://www.npmjs.com/package/@esmx/router"><img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" /></a> | 🟢 **稳定版** | 与框架无关的路由库 |
| [**@esmx/router-vue**](https://github.com/esmnext/esmx/tree/master/packages/router-vue) | <a href="https://www.npmjs.com/package/@esmx/router-vue"><img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" /></a> | 🟢 **稳定版** | @esmx/router 的 Vue 集成包，支持Vue 2.7+和Vue 3 |
| [**@esmx/rspack**](https://github.com/esmnext/esmx/tree/master/packages/rspack) | <a href="https://www.npmjs.com/package/@esmx/rspack"><img src="https://img.shields.io/npm/v/@esmx/rspack.svg" alt="npm version" /></a> | 🔵 **预览版** | 与框架无关的 Rspack 打包工具 |
| [**@esmx/rspack-vue**](https://github.com/esmnext/esmx/tree/master/packages/rspack-vue) | <a href="https://www.npmjs.com/package/@esmx/rspack-vue"><img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" /></a> | 🔵 **预览版** | Vue 框架的 Rspack 打包工具 |

## 🎯 演示项目

| 项目名称 | 技术栈 | 在线预览 |
|----------|--------|----------|
| [**ssr-html**](https://github.com/esmnext/esmx/tree/master/examples/ssr-html) | 原生HTML + TypeScript | [预览](https://www.esmnext.com/ssr-html/) |
| [**ssr-vue2-host**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-host) | Vue 2.7 + SSR | [预览](https://www.esmnext.com/ssr-vue2-host/) |
| [**ssr-vue2-remote**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-remote) | Vue 2.7 | [预览](https://www.esmnext.com/ssr-vue2-remote/) |
| [**ssr-preact-htm**](https://github.com/esmnext/esmx/tree/master/examples/ssr-preact-htm) | Preact + HTM | [预览](https://www.esmnext.com/ssr-preact-htm/) |

---

> 💡 **提示**: 所有示例都支持一键启动，运行 `pnpm install && pnpm dev` 即可本地预览