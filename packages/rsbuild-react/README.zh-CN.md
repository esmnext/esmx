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
  
  <p>@esmx/rsbuild 的 React 预设——在 Esmx 模块链接之上提供 JSX 转换与 Fast Refresh</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/rsbuild-react/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **React 支持** - 通过 `@rsbuild/plugin-react` 提供 JSX/TSX 转换与 Fast Refresh
- **基于 @esmx/rsbuild** - Rspack 内核构建、原生 ESM 产物与 SSR；并重新导出基础的 `@esmx/rsbuild` API
- **零配置** - React 插件自动作用于所有构建目标

## 📦 安装

```bash
npm install @esmx/rsbuild-react -D
```

`react` 与 `react-dom` 为 peer 依赖。

## 🚀 快速开始

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

## 📚 文档

访问[官方文档](https://esmx.dev/zh/api/app/rsbuild-react.html)获取详细的使用指南与 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)
