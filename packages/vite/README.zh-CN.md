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
  
  <p>Esmx 微前端框架的 Vite 集成，提供 SSR 与模块链接能力，并支持真正的模块级 HMR</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/vite/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **原生 ESM 产物** - 产出可被 `@esmx/core` 消费的原生 ESM 模块联邦产物
- **真正的 HMR** - 开发环境通过 Vite 开发服务器实现真正的模块级热替换
- **应用支持** - 支持标准应用与无框架的 HTML 应用
- **SSR 支持** - 通过 `ssrLoadModule` 实现服务端渲染
- **零 Loader 配置** - Vite 原生处理 TypeScript、CSS 与静态资源

## 📦 安装

```bash
npm install @esmx/vite -D
```

## 🚀 快速开始

在 `entry.node.ts` 中使用：

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/vite').then((m) => m.createViteHtmlApp(esmx));
  }
} satisfies EsmxOptions;
```

使用 UI 框架的应用，请参阅 [@esmx/vite-react](https://github.com/esmnext/esmx/blob/master/packages/vite-react/README.zh-CN.md) 与 [@esmx/vite-vue](https://github.com/esmnext/esmx/blob/master/packages/vite-vue/README.zh-CN.md)。

## 📚 文档

访问[官方文档](https://esmx.dev/zh/api/app/vite.html)获取详细的使用指南与 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)
