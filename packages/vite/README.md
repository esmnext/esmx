<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/vite</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/vite">
      <img src="https://img.shields.io/npm/v/@esmx/vite.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/vite.svg" alt="node version" />
    </a>
  </div>
  
  <p>A Vite integration for the Esmx micro-frontend framework, providing SSR and Module Linking capabilities with real module-level HMR</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/vite/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Native ESM Output** - Emits native ESM module-federation artifacts consumed by `@esmx/core`
- **Real HMR** - True module-level Hot Module Replacement in development via the Vite dev server
- **Application Support** - Standard applications and no-framework HTML applications
- **SSR Support** - Server-side rendering through `ssrLoadModule`
- **Zero Loader Config** - Vite natively handles TypeScript, CSS and static assets

## 📦 Installation

```bash
npm install @esmx/vite -D
```

## 🚀 Quick Start

Use it from your `entry.node.ts`:

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/vite').then((m) => m.createViteHtmlApp(esmx));
  }
} satisfies EsmxOptions;
```

For applications using a UI framework, see [@esmx/vite-react](https://github.com/esmnext/esmx/blob/master/packages/vite-react/README.md) and [@esmx/vite-vue](https://github.com/esmnext/esmx/blob/master/packages/vite-vue/README.md).

## 📚 Documentation

Visit the [official documentation](https://esmx.dev/api/app/vite.html) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
