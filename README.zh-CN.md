<div align="center">
  <img src="https://esmx.dev/logo.svg?t=202511" width="180" alt="Esmx Logo" />
  <h1>Esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml"><img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
    <a href="https://esmx.dev/coverage/"><img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" /></a>
    <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" /></a>
  </div>
  
  <h3>基于 ESM 的下一代微前端框架，无沙箱、零开销，支持多框架混合开发</h3>
  
  <p>⚡️ <strong>极致性能</strong> · 🛠️ <strong>开发友好</strong> · 🔧 <strong>标准语法</strong></p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/README.md">English</a> | 简体中文
  </p>
</div>

## 🚀 核心特性

- **零运行时开销** - 基于原生 ESM + Import Map，无沙箱代理
- **高性能构建** - 基于 Rspack、Rsbuild 或 Vite，构建速度显著提升
- **完整 SSR 支持** - 高性能 SSR，SEO 友好
- **标准 ESM 语法** - 无框架特定 API，学习曲线平缓
- **多框架支持** - 支持 Vue、React、Preact、Solid 等多种前端框架

## 📊 vs 传统微前端

| 特性 | 传统方案 | Esmx |
|------|----------|------|
| **架构** | 沙箱 + 代理 | 原生 ESM |
| **运行时开销** | 有 | 零 |
| **学习成本** | 框架特定 API | 标准语法 |
| **模块隔离** | 沙箱模拟 | 浏览器原生隔离 |


## 🚀 快速开始

```bash
npx create-esmx@latest my-app
```

📖 [文档](https://esmx.dev/guide/start/getting-started.html)

## 📦 核心软件包

| 包名 | 版本 | 状态 | 说明 |
|------|------|------|------|
| [**@esmx/core**](https://github.com/esmnext/esmx/tree/master/packages/core) | <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a> | 🔵 **预览** | 微前端框架，ESM 模块链接 |
| [**@esmx/router**](https://github.com/esmnext/esmx/tree/master/packages/router) | <a href="https://www.npmjs.com/package/@esmx/router"><img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关的路由库 |
| [**@esmx/router-vue**](https://github.com/esmnext/esmx/tree/master/packages/router-vue) | <a href="https://www.npmjs.com/package/@esmx/router-vue"><img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue 集成包（2.7+ & 3） |
| [**@esmx/router-react**](https://github.com/esmnext/esmx/tree/master/packages/router-react) | <a href="https://www.npmjs.com/package/@esmx/router-react"><img src="https://img.shields.io/npm/v/@esmx/router-react.svg" alt="npm version" /></a> | 🔵 **预览** | React 集成包（18+） |
| [**@esmx/rspack**](https://github.com/esmnext/esmx/tree/master/packages/rspack) | <a href="https://www.npmjs.com/package/@esmx/rspack"><img src="https://img.shields.io/npm/v/@esmx/rspack.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关的 Rspack 工具 |
| [**@esmx/rspack-vue**](https://github.com/esmnext/esmx/tree/master/packages/rspack-vue) | <a href="https://www.npmjs.com/package/@esmx/rspack-vue"><img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue 专用的 Rspack 工具 |
| [**@esmx/rspack-react**](https://github.com/esmnext/esmx/tree/master/packages/rspack-react) | <a href="https://www.npmjs.com/package/@esmx/rspack-react"><img src="https://img.shields.io/npm/v/@esmx/rspack-react.svg" alt="npm version" /></a> | 🔵 **预览** | React 专用的 Rspack 工具 |
| [**@esmx/rsbuild**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild) | <a href="https://www.npmjs.com/package/@esmx/rsbuild"><img src="https://img.shields.io/npm/v/@esmx/rsbuild.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关的 Rsbuild 工具 |
| [**@esmx/rsbuild-vue**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild-vue) | <a href="https://www.npmjs.com/package/@esmx/rsbuild-vue"><img src="https://img.shields.io/npm/v/@esmx/rsbuild-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue 专用的 Rsbuild 工具 |
| [**@esmx/rsbuild-react**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild-react) | <a href="https://www.npmjs.com/package/@esmx/rsbuild-react"><img src="https://img.shields.io/npm/v/@esmx/rsbuild-react.svg" alt="npm version" /></a> | 🔵 **预览** | React 专用的 Rsbuild 工具 |
| [**@esmx/vite**](https://github.com/esmnext/esmx/tree/master/packages/vite) | <a href="https://www.npmjs.com/package/@esmx/vite"><img src="https://img.shields.io/npm/v/@esmx/vite.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关的 Vite 工具 |
| [**@esmx/vite-vue**](https://github.com/esmnext/esmx/tree/master/packages/vite-vue) | <a href="https://www.npmjs.com/package/@esmx/vite-vue"><img src="https://img.shields.io/npm/v/@esmx/vite-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue 专用的 Vite 工具 |
| [**@esmx/vite-react**](https://github.com/esmnext/esmx/tree/master/packages/vite-react) | <a href="https://www.npmjs.com/package/@esmx/vite-react"><img src="https://img.shields.io/npm/v/@esmx/vite-react.svg" alt="npm version" /></a> | 🔵 **预览** | React 专用的 Vite 工具 |
| [**@esmx/import**](https://github.com/esmnext/esmx/tree/master/packages/import) | <a href="https://www.npmjs.com/package/@esmx/import"><img src="https://img.shields.io/npm/v/@esmx/import.svg" alt="npm version" /></a> | 🔵 **预览** | Import Map 工具 |
| [**@esmx/pkg-wrapper**](https://github.com/esmnext/esmx/tree/master/packages/pkg-wrapper) | <a href="https://www.npmjs.com/package/@esmx/pkg-wrapper"><img src="https://img.shields.io/npm/v/@esmx/pkg-wrapper.svg" alt="npm version" /></a> | 🔵 **预览** | 为联邦入口生成 CJS / ESM 具名导出 wrapper |
| [**create-esmx**](https://github.com/esmnext/esmx/tree/master/packages/create-esmx) | <a href="https://www.npmjs.com/package/create-esmx"><img src="https://img.shields.io/npm/v/create-esmx.svg" alt="npm version" /></a> | 🔵 **预览** | 项目脚手架工具 |

## 🎯 演示项目

| 项目名称 | 技术栈 | 在线预览 |
|----------|--------|----------|

---

> 💡 **开发流程**：执行 `pnpm build` 构建所有包和示例，然后进入具体项目目录开始开发

## 📈 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=esmnext/esmx&type=Date)](https://www.star-history.com/#esmnext/esmx&Date)