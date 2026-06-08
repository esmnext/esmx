<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/rsbuild-react</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/rsbuild-react">
      <img src="https://img.shields.io/npm/v/@esmx/rsbuild-react.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/rsbuild-react.svg" alt="node version" />
    </a>
  </div>
  
  <p>React preset for @esmx/rsbuild — JSX transform and Fast Refresh on top of Esmx module linking</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/rsbuild-react/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **React Support** - JSX/TSX transform and Fast Refresh via `@rsbuild/plugin-react`
- **Built on @esmx/rsbuild** - Rspack-kernel build, native ESM output, and SSR; re-exports the base `@esmx/rsbuild` API
- **Zero Config** - The React plugin is wired up automatically for every build target

## 📦 Installation

```bash
npm install @esmx/rsbuild-react -D
```

`react` and `react-dom` are peer dependencies.

## 🚀 Quick Start

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rsbuild-react').then((m) =>
      m.createRsbuildReactApp(esmx)
    );
  }
} satisfies EsmxOptions;
```

## 📚 Documentation

Visit the [official documentation](https://esmx.dev/api/app/rsbuild-react.html) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)
