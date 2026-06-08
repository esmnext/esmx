<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/vite-vue</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/vite-vue">
      <img src="https://img.shields.io/npm/v/@esmx/vite-vue.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/vite-vue.svg" alt="node version" />
    </a>
  </div>
  
  <p>Vue 3 preset for @esmx/vite — Single-File Component support on top of Esmx module linking</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/vite-vue/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Vue 3 Support** - SFC compilation and HMR via `@vitejs/plugin-vue`
- **Built on @esmx/vite** - Native ESM output, real HMR, and SSR; re-exports the base `@esmx/vite` API
- **Zero Config** - The Vue plugin is wired up automatically for every build target

## 📦 Installation

```bash
npm install @esmx/vite-vue -D
```

`vue` (>=3) is a peer dependency.

## 🚀 Quick Start

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/vite-vue').then((m) => m.createViteVueApp(esmx));
  }
} satisfies EsmxOptions;
```

## 📚 Documentation

Visit the [official documentation](https://esmx.dev/api/app/vite-vue.html) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
