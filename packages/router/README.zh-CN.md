<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router">
      <img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://www.esmnext.com/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router" alt="size" />
    </a>
  </div>
  
  <p>通用的框架无关路由器，与现代前端框架无缝协作</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/router/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **框架无关** - 适用于任何前端框架（Vue、React、Preact、Solid 等）
- **通用支持** - 在浏览器和 Node.js 环境中运行
- **TypeScript 就绪** - 完整的 TypeScript 支持，出色的类型推断
- **高性能** - 为生产环境优化，最小化包体积
- **SSR 兼容** - 完整的服务端渲染支持
- **现代 API** - 简洁直观的 API 设计

## 📦 安装

```bash
npm install @esmx/router
```

## 🚀 快速开始

```typescript
import { Router, RouterMode } from '@esmx/router';

// 创建路由器实例
const router = new Router({
  root: '#app', // 浏览器环境中必需
  mode: RouterMode.history,
  routes: [
    { path: '/', component: () => '首页' },
    { path: '/about', component: () => '关于页面' }
  ]
});

// 导航到路由
await router.push('/about');
```

## 📚 文档

访问[官方文档](https://www.esmnext.com)获取详细的使用指南和 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx) 