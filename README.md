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
  
  <h3>Next-generation micro-frontend framework based on ESM with zero runtime overhead, supporting sandbox-free multi-framework hybrid development</h3>
  
  <p>⚡️ <strong>Ultimate Performance</strong> · 🛠️ <strong>Developer Friendly</strong> · 🔧 <strong>Standard Syntax</strong></p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/README.zh-CN.md">简体中文</a>
  </p>
</div>

## 🚀 Core Features

- **Zero Runtime Overhead** - Based on native ESM + ImportMap, no sandbox or proxy
- **High-Performance Build** - Powered by Rspack, significantly faster builds
- **Complete SSR Support** - High-performance server-side rendering, SEO-friendly
- **Standard ESM Syntax** - No framework-specific APIs, minimal learning curve
- **Multi-Framework Support** - Vue, React, Preact, Solid, and more

## 📊 vs Traditional Micro-frontends

| Feature | Traditional Solutions | Esmx |
|---------|----------------------|------|
| **Architecture** | Manual sandbox + proxy | Native ESM |
| **Runtime** | Has overhead | Zero overhead |
| **Learning Curve** | Framework APIs | Standard syntax |
| **Module Isolation** | Sandbox simulation | Browser native |


## 🚀 Getting Started

```bash
npx create-esmx@latest my-app
```

📖 [Documentation](https://www.esmnext.com/guide/start/getting-started.html)

## 📦 Core Packages

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| [**@esmx/core**](https://github.com/esmnext/esmx/tree/master/packages/core) | <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a> | 🔵 **Preview** | Micro-frontend framework with ESM linking |
| [**@esmx/router**](https://github.com/esmnext/esmx/tree/master/packages/router) | <a href="https://www.npmjs.com/package/@esmx/router"><img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic router |
| [**@esmx/router-vue**](https://github.com/esmnext/esmx/tree/master/packages/router-vue) | <a href="https://www.npmjs.com/package/@esmx/router-vue"><img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Vue integration (2.7+ & 3) |
| [**@esmx/rspack**](https://github.com/esmnext/esmx/tree/master/packages/rspack) | <a href="https://www.npmjs.com/package/@esmx/rspack"><img src="https://img.shields.io/npm/v/@esmx/rspack.svg" alt="npm version" /></a> | 🔵 **Preview** | Framework-agnostic Rspack tool |
| [**@esmx/rspack-vue**](https://github.com/esmnext/esmx/tree/master/packages/rspack-vue) | <a href="https://www.npmjs.com/package/@esmx/rspack-vue"><img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" /></a> | 🔵 **Preview** | Rspack tool for Vue |

## 🎯 Demo Projects

| Project Name | Tech Stack | Live Preview |
|-------------|------------|--------------|
| [**ssr-html**](https://github.com/esmnext/esmx/tree/master/examples/ssr-html) | Native HTML + TypeScript | [Preview](https://www.esmnext.com/ssr-html/) |
| [**ssr-vue2-host**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-host) | Vue 2.7 + SSR | [Preview](https://www.esmnext.com/ssr-vue2-host/) |
| [**ssr-vue2-remote**](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-remote) | Vue 2.7 | [Preview](https://www.esmnext.com/ssr-vue2-remote/) |
| [**ssr-preact-htm**](https://github.com/esmnext/esmx/tree/master/examples/ssr-preact-htm) | Preact + HTM | [Preview](https://www.esmnext.com/ssr-preact-htm/) |

---

> 💡 **Development**: First run `pnpm build` to build all packages and examples, then `cd` to specific project directory to start development

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=esmnext/esmx&type=Date)](https://www.star-history.com/#esmnext/esmx&Date)