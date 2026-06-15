<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/core</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core">
      <img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/core">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" />
    </a>
  </div>
  
  <p>A high-performance microfrontend framework supporting Vue, React, Preact, Solid, and Svelte with SSR and Module Linking capabilities</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/core/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Native Microfrontend** - Based on ESM + Import Map for native module loading with zero runtime overhead
- **Dependency Management** - Centralized dependency management with content-hash-based strong caching strategy
- **Application Isolation** - ESM native module isolation ensuring runtime stability
- **SSR Support** - Flexible SSR strategy supporting any frontend framework
- **Developer Experience** - Complete TypeScript support with native Module Linking capabilities

## 📦 Installation

```bash
# npm
npm install @esmx/core

# pnpm
pnpm add @esmx/core

# yarn
yarn add @esmx/core
```

## 🚀 Quick Start

Define your app in `entry.node.ts`, choosing a build-tool integration in `devApp`:

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) => m.createRspackHtmlApp(esmx));
  }
} satisfies EsmxOptions;
```

Then drive it with the `esmx` CLI: `esmx dev`, `esmx build`, `esmx start`.

📖 [Documentation](https://esmx.dev/guide/start/getting-started.html)

## 📚 Documentation

Visit the [official documentation](https://esmx.dev) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
