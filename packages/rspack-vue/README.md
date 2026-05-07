<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/rspack-vue</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/rspack-vue">
      <img src="https://img.shields.io/npm/v/@esmx/rspack-vue.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/rspack-vue.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/rspack-vue">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/rspack-vue" alt="size" />
    </a>
  </div>
  
  <p>A high-performance Vue integration for Esmx microfrontend framework, providing Vue 2.7+ and Vue 3 support with SSR and Module Linking capabilities</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/rspack-vue/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Universal Vue Support** - Supports both Vue 2.7+ and Vue 3 applications
- **High-Performance Build** - Ultra-fast building based on Rspack with Vue optimization
- **Module Linking** - Built-in module linking capabilities for microfrontend architecture
- **SSR Support** - Complete Vue application SSR support
- **Hot Module Replacement** - Fast development experience with Vue component hot reloading
- **TypeScript Ready** - Full TypeScript support with excellent developer experience

## 📦 Installation

```bash
# npm
npm install @esmx/rspack-vue -D

# pnpm
pnpm add @esmx/rspack-vue -D

# yarn
yarn add @esmx/rspack-vue -D
```

## 🚀 Quick Start

```typescript
import { createEsmx } from '@esmx/core';
import { createRspackVue } from '@esmx/rspack-vue';

const esmx = createEsmx({
  app: {
    name: 'vue-app',
    entry: './src/index.ts'
  }
});

const rspack = createRspackVue(esmx);
await rspack.build();
```

## 📚 Documentation

Visit the [official documentation](https://esmx.dev) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
