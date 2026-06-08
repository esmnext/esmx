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
  
  <p>@esmx/vite 的 Vue 3 预设——在 Esmx 模块链接之上提供单文件组件支持</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/vite-vue/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **Vue 3 支持** - 通过 `@vitejs/plugin-vue` 提供 SFC 编译与 HMR
- **基于 @esmx/vite** - 原生 ESM 产物、真正的 HMR 与 SSR；并重新导出基础的 `@esmx/vite` API
- **零配置** - Vue 插件自动作用于所有构建目标

## 📦 安装

```bash
npm install @esmx/vite-vue -D
```

`vue`（>=3）为 peer 依赖。

## 🚀 快速开始

```typescript
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/vite-vue').then((m) => m.createViteVueApp(esmx));
  }
} satisfies EsmxOptions;
```

## 📚 文档

访问[官方文档](https://esmx.dev/zh/api/app/vite-vue.html)获取详细的使用指南与 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)
