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
  
  <p>Esmx 微前端框架的 Rsbuild 集成，基于 Rspack 内核，提供 SSR 与模块链接能力</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/rsbuild/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **Rspack 内核** - 基于 Rsbuild，运行在高性能的 Rspack 引擎之上
- **原生 ESM 产物** - 产出可被 `@esmx/core` 消费的原生 ESM 模块联邦产物
- **HMR** - 开发环境通过 webpack-hot-middleware 实现热替换
- **应用支持** - 支持标准应用与无框架的 HTML 应用
- **SSR 支持** - 内置服务端渲染支持

## 📦 安装

```bash
npm install @esmx/rsbuild -D
```

## 🚀 快速开始

在 `entry.node.ts` 中使用：

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rsbuild').then((m) => m.createRsbuildHtmlApp(esmx));
  }
} satisfies EsmxOptions;
```

使用 UI 框架的应用，请参阅 [@esmx/rsbuild-react](https://github.com/esmnext/esmx/blob/master/packages/rsbuild-react/README.zh-CN.md) 与 [@esmx/rsbuild-vue](https://github.com/esmnext/esmx/blob/master/packages/rsbuild-vue/README.zh-CN.md)。

## 📚 文档

访问[官方文档](https://esmx.dev/zh/api/app/rsbuild.html)获取详细的使用指南与 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)
