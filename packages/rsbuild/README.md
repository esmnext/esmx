<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/rsbuild</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/rsbuild">
      <img src="https://img.shields.io/npm/v/@esmx/rsbuild.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/rsbuild.svg" alt="node version" />
    </a>
  </div>
  
  <p>An Rsbuild integration for the Esmx micro-frontend framework, built on the Rspack kernel, providing SSR and Module Linking capabilities</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/rsbuild/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Rspack Kernel** - Built on Rsbuild over the high-performance Rspack engine
- **Native ESM Output** - Emits native ESM module-federation artifacts consumed by `@esmx/core`
- **Real HMR** - Hot Module Replacement in development via webpack-hot-middleware
- **Application Support** - Standard applications and no-framework HTML applications
- **SSR Support** - Built-in server-side rendering support

## 📦 Installation

```bash
npm install @esmx/rsbuild -D
```

## 🚀 Quick Start

Use it from your `entry.node.ts`:

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rsbuild').then((m) => m.createRsbuildHtmlApp(esmx));
  }
} satisfies EsmxOptions;
```

For applications using a UI framework, see [@esmx/rsbuild-react](https://github.com/esmnext/esmx/blob/master/packages/rsbuild-react/README.md) and [@esmx/rsbuild-vue](https://github.com/esmnext/esmx/blob/master/packages/rsbuild-vue/README.md).

## 📚 Documentation

Visit the [official documentation](https://esmx.dev/api/app/rsbuild.html) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
