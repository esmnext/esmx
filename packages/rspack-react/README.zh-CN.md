<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/rspack-react</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/rspack-react">
      <img src="https://img.shields.io/npm/v/@esmx/rspack-react.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/rspack-react.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/rspack-react">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/rspack-react" alt="size" />
    </a>
  </div>
  
  <p>为 Esmx 微前端框架提供的高性能 React 集成，支持 React 18+ 并具备 SSR 和模块链接能力</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/rspack-react/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **React 支持** - 完整支持 React 18+ 应用
- **高性能构建** - 基于 Rspack 的极速构建，针对 React 优化
- **模块链接** - 内置模块链接能力，支持微前端架构
- **SSR 支持** - 完整的 React 应用 SSR 支持
- **热模块替换** - React 组件热重载，提升开发体验
- **TypeScript 支持** - 完整的 TypeScript 类型支持

## 📦 安装

```bash
# npm
npm install @esmx/rspack-react -D

# pnpm
pnpm add @esmx/rspack-react -D

# yarn
yarn add @esmx/rspack-react -D
```

## 🚀 快速开始

在 `entry.node.ts` 中使用：

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then((m) =>
      m.createRspackReactApp(esmx)
    );
  }
} satisfies EsmxOptions;
```

## 📚 文档

访问[官方文档](https://esmx.dev)获取详细的使用指南和 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)

