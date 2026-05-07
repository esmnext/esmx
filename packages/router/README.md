<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router">
      <img src="https://img.shields.io/npm/v/@esmx/router.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router" alt="size" />
    </a>
  </div>
  
  <p>A universal, framework-agnostic router that works seamlessly with modern frontend frameworks</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/router/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Framework Agnostic** - Works with any frontend framework (Vue, React, Preact, Solid, etc.)
- **Universal Support** - Runs in both browser and Node.js environments
- **TypeScript Ready** - Full TypeScript support with excellent type inference
- **High Performance** - Optimized for production use with minimal bundle size
- **SSR Compatible** - Complete SSR support
- **Modern API** - Clean and intuitive API design

## 📦 Installation

```bash
# npm
npm install @esmx/router

# pnpm
pnpm add @esmx/router

# yarn
yarn add @esmx/router
```

## 🚀 Quick Start

```typescript
import { Router, RouterMode } from '@esmx/router';

// Create router instance
const router = new Router({
  root: '#app', // DOM mount target (optional, defaults to '')
  mode: RouterMode.history,
  routes: [
    { path: '/', component: () => 'Home Page' },
    { path: '/about', component: () => 'About Page' }
  ]
});

// Navigate to route
await router.push('/about');
```

## 📚 Documentation

Visit the [official documentation](https://esmx.dev) for detailed usage guides and API reference.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx) 
