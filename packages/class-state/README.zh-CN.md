<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/class-state</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/class-state">
      <img src="https://img.shields.io/npm/v/@esmx/class-state.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/class-state.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/class-state">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/class-state" alt="size" />
    </a>
  </div>
  
  <p>为现代 JavaScript 应用提供轻量级的基于类的状态管理解决方案</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/class-state/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **基于类的设计** - 简洁直观的基于类的状态管理方案
- **框架无关** - 适用于任何 JavaScript 框架或原生 JavaScript
- **TypeScript 支持** - 完整的 TypeScript 类型推断与类型安全
- **响应式系统** - 内置响应式能力，自动更新 UI
- **轻量级** - 极小的包体积，功能完备
- **现代 API** - 基于现代 JavaScript 特性设计

## 📦 安装

```bash
# npm
npm install @esmx/class-state

# pnpm
pnpm add @esmx/class-state

# yarn
yarn add @esmx/class-state
```

## 🚀 快速开始

```typescript
import { State } from '@esmx/class-state';

class Counter extends State {
  count = 0;

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}

const counter = new Counter();

// 订阅状态变更
counter.subscribe(() => {
  console.log('计数:', counter.count);
});

counter.increment(); // 计数: 1
counter.decrement(); // 计数: 0
```

## 📚 文档

访问[官方文档](https://esmx.dev)获取详细的使用指南和 API 参考。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx) 
