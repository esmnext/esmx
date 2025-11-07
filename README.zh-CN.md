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
  
  <h3>基于ESM的下一代微前端框架，无沙箱零开销，支持多框架混合开发</h3>
  
  <p>⚡️ <strong>极致性能</strong> · 🛠️ <strong>开发友好</strong> · 🔧 <strong>标准语法</strong></p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/README.md">English</a> | 简体中文
  </p>
</div>

## 🚀 核心特性

- **零运行时开销** - 基于原生ESM + ImportMap，无沙箱代理
- **高性能构建** - 基于Rspack驱动，显著提升构建速度
- **完整SSR支持** - 高性能服务端渲染，SEO友好
- **标准ESM语法** - 无框架特定API，学习成本极低
- **多框架支持** - 支持Vue、React、Preact、Solid等多种前端框架

## 📊 vs 传统微前端

| 特性 | 传统方案 | Esmx |
|------|----------|------|
| **架构** | 人工沙箱 + 代理 | 原生ESM |
| **运行时** | 有开销 | 零开销 |
| **学习成本** | 框架API | 标准语法 |
| **模块隔离** | 沙箱模拟 | 浏览器原生 |


## 🚀 快速开始

```bash
npx create-esmx@latest my-app
```

📖 [文档](https://esmx.dev/guide/start/getting-started.html)

## 📦 核心软件包

| 包名 | 版本 | 状态 | 说明 |
|------|------|------|------|
| [**@esmx/core**](https://github.com/esmnext/esmx/tree/master/packages/core) | <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a> | 🔵 **预览** | 微前端框架，ESM模块链接 |
| [**@esmx/router**](https://github.com/esmnext/esmx/tree/master/packages/router) | <a href="https://www.npmjs.com/package/@esmx/router"><img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关路由库 |
| [**@esmx/router-vue**](https://github.com/esmnext/esmx/tree/master/packages/router-vue) | <a href="https://www.npmjs.com/package/@esmx/router-vue"><img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue集成包 (2.7+ & 3) |
| [**@esmx/rspack**](https://github.com/esmnext/esmx/tree/master/packages/rspack) | <a href="https://www.npmjs.com/package/@esmx/rspack"><img src="https://img.shields.io/npm/v/@esmx/rspack.svg" alt="npm version" /></a> | 🔵 **预览** | 框架无关Rspack工具 |
| [**@esmx/rspack-vue**](https://github.com/esmnext/esmx/tree/master/packages/rspack-vue) | <a href="https://www.npmjs.com/package/@esmx/rspack-vue"><img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" /></a> | 🔵 **预览** | Vue专用Rspack工具 |

## 🎯 演示项目

| 项目名称 | 技术栈 | 在线预览 |
|----------|--------|----------|
| [**ssr-html**](https://github.com/esmnext/esmx/tree/master/examples/ssr-html) | 原生HTML + TypeScript | [预览](https://esmx.dev/ssr-html/) |
| [**ssr-vue2-host**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-host) | Vue 2.7 + SSR | [预览](https://esmx.dev/ssr-vue2-host/) |
| [**ssr-vue2-remote**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-remote) | Vue 2.7 | [预览](https://esmx.dev/ssr-vue2-remote/) |
| [**ssr-preact-htm**](https://github.com/esmnext/esmx/tree/master/examples/ssr-preact-htm) | Preact + HTM | [预览](https://esmx.dev/ssr-preact-htm/) |

---

> 💡 **开发流程**: 首先执行 `pnpm build` 构建所有包和示例，然后 `cd` 到具体项目目录开始开发

## 📈 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=esmnext/esmx&type=Date)](https://www.star-history.com/#esmnext/esmx&Date)