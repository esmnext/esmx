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
  
  <h3>Next-generation micro-frontend framework based on ESM with zero runtime overhead, supporting sandbox-free multi-framework hybrid development</h3>
  
  <p>⚡️ <strong>Ultimate Performance</strong> · 🛠️ <strong>Developer Friendly</strong> · 🔧 <strong>Standard Syntax</strong></p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/README.zh-CN.md">简体中文</a>
  </p>
</div>

## 🚀 Core Features

- **Zero Runtime Overhead** - Based on native ESM + Import Map, no sandbox or proxy
- **High-Performance Build** - Powered by Rspack, Rsbuild or Vite, significantly faster builds
- **Complete SSR Support** - High-performance SSR, SEO-friendly
- **Standard ESM Syntax** - No framework-specific APIs, minimal learning curve
- **Multi-Framework Support** - Vue, React, Preact, Solid, and more

## 📊 vs Traditional Micro-frontends

| Feature | Traditional Solutions | Esmx |
|---------|----------------------|------|
| **Architecture** | Manual sandbox + proxy | Native ESM |
| **Runtime Overhead** | Has | Zero |
| **Learning Curve** | Framework APIs | Standard syntax |
| **Module Isolation** | Sandbox simulation | Browser native isolation |


## 🚀 Getting Started

```bash
npx create-esmx@latest my-app
```

📖 [Documentation](https://esmx.dev/guide/start/getting-started.html)

## 📦 Core Packages

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| [**@esmx/core**](https://github.com/esmnext/esmx/tree/master/packages/core) | <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a> | 🔵 **Preview** | Micro-frontend framework with ESM linking |
| [**@esmx/router**](https://github.com/esmnext/esmx/tree/master/packages/router) | <a href="https://www.npmjs.com/package/@esmx/router"><img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic router |
| [**@esmx/router-vue**](https://github.com/esmnext/esmx/tree/master/packages/router-vue) | <a href="https://www.npmjs.com/package/@esmx/router-vue"><img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Vue integration (2.7+ & 3) |
| [**@esmx/router-react**](https://github.com/esmnext/esmx/tree/master/packages/router-react) | <a href="https://www.npmjs.com/package/@esmx/router-react"><img src="https://img.shields.io/npm/v/@esmx/router-react.svg" alt="npm version" /></a> | 🔵 **Preview** | React integration (18+) |
| [**@esmx/rspack**](https://github.com/esmnext/esmx/tree/master/packages/rspack) | <a href="https://www.npmjs.com/package/@esmx/rspack"><img src="https://img.shields.io/npm/v/@esmx/rspack.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic Rspack tool |
| [**@esmx/rspack-vue**](https://github.com/esmnext/esmx/tree/master/packages/rspack-vue) | <a href="https://www.npmjs.com/package/@esmx/rspack-vue"><img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Rspack tool for Vue |
| [**@esmx/rspack-react**](https://github.com/esmnext/esmx/tree/master/packages/rspack-react) | <a href="https://www.npmjs.com/package/@esmx/rspack-react"><img src="https://img.shields.io/npm/v/@esmx/rspack-react.svg" alt="npm version" /></a> | 🔵 **Preview** | Rspack tool for React |
| [**@esmx/rsbuild**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild) | <a href="https://www.npmjs.com/package/@esmx/rsbuild"><img src="https://img.shields.io/npm/v/@esmx/rsbuild.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic Rsbuild tool |
| [**@esmx/rsbuild-vue**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild-vue) | <a href="https://www.npmjs.com/package/@esmx/rsbuild-vue"><img src="https://img.shields.io/npm/v/@esmx/rsbuild-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Rsbuild tool for Vue |
| [**@esmx/rsbuild-react**](https://github.com/esmnext/esmx/tree/master/packages/rsbuild-react) | <a href="https://www.npmjs.com/package/@esmx/rsbuild-react"><img src="https://img.shields.io/npm/v/@esmx/rsbuild-react.svg" alt="npm version" /></a> | 🔵 **Preview** | Rsbuild tool for React |
| [**@esmx/vite**](https://github.com/esmnext/esmx/tree/master/packages/vite) | <a href="https://www.npmjs.com/package/@esmx/vite"><img src="https://img.shields.io/npm/v/@esmx/vite.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic Vite tool |
| [**@esmx/vite-vue**](https://github.com/esmnext/esmx/tree/master/packages/vite-vue) | <a href="https://www.npmjs.com/package/@esmx/vite-vue"><img src="https://img.shields.io/npm/v/@esmx/vite-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Vite tool for Vue |
| [**@esmx/vite-react**](https://github.com/esmnext/esmx/tree/master/packages/vite-react) | <a href="https://www.npmjs.com/package/@esmx/vite-react"><img src="https://img.shields.io/npm/v/@esmx/vite-react.svg" alt="npm version" /></a> | 🔵 **Preview** | Vite tool for React |
| [**@esmx/import**](https://github.com/esmnext/esmx/tree/master/packages/import) | <a href="https://www.npmjs.com/package/@esmx/import"><img src="https://img.shields.io/npm/v/@esmx/import.svg" alt="npm version" /></a> | 🔵 **Preview** | Import map utilities |
| [**create-esmx**](https://github.com/esmnext/esmx/tree/master/packages/create-esmx) | <a href="https://www.npmjs.com/package/create-esmx"><img src="https://img.shields.io/npm/v/create-esmx.svg" alt="npm version" /></a> | 🔵 **Preview** | Project scaffolding tool |

## 🎯 Demo Projects

| Project Name | Tech Stack | Live Preview |
|-------------|------------|--------------|

---

> 💡 **Development**: First run `pnpm build` to build all packages and examples, then `cd` to specific project directory to start development

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=esmnext/esmx&type=Date)](https://www.star-history.com/#esmnext/esmx&Date)