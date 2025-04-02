<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
  <h1>Esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml"><img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/dm/@esmx/core.svg" alt="downloads monthly" /></a>
    <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" /></a>
  </div>
  
  <p>Esmx is a next-generation micro-frontend framework based on native ESM, with no sandbox or runtime overhead, supporting multi-framework hybrid development and providing high-performance server-side rendering capabilities.</p>
  
  <p>
    <a href="./README.md">简体中文</a> | English
  </p>
</div>



## 💫 Embracing Modern Micro-Frontend

**It's time to say goodbye to the past and embrace true micro-frontend architecture!**

In recent years, as monolithic applications became unwieldy, micro-frontend architecture emerged as a solution. However, existing micro-frontend solutions, in order to achieve application isolation, had to add layers of wrapping on top of the original architecture:

- Artificially created sandbox environments
- Complex dependency management
- Heavy runtime overhead

These compromises have brought significant performance burdens, making simple development complex and standard processes obscure.

### 🔧 Shackles of the Old World

These historical burdens are hindering our progress:

- **Artificial Isolation**: Using sandboxes to simulate isolation environments, yet never able to match the browser's native module isolation capabilities
- **Heavy Runtime**: Injecting dependencies, proxying JS execution, each operation consuming precious performance
- **Complex Toolchain**: Having to modify build tools to handle dependencies, making simple projects difficult to maintain
- **Fragmented Experience**: Special deployment strategies and runtime processing that deviate from modern frontend standard practices
- **Closed Ecosystem**: Framework coupling and custom interfaces forcing technology choices to be bound to specific ecosystems

### 🌟 Dawn of a New Era

Today, the evolution of Web standards brings us new possibilities. We can finally build micro-frontends in the purest way:

- **Back to Native**: Embracing ESM and importmap, returning dependency management to browser standards
- **Natural Isolation**: Module scope provides the most reliable isolation without any additional runtime overhead
- **Open Collaboration**: Any modern frontend framework can seamlessly integrate, with no limitations on technology choices
- **Developer Experience**: Intuitive development mode, familiar debugging process, everything feels natural
- **Ultimate Performance**: Zero runtime overhead, reliable caching strategies, making applications truly lightweight

## Basic Concepts

In Esmx, module import and export configuration is simple and intuitive, requiring just a few lines of code to achieve seamless integration between applications.

### Module Export
`remote` configuration for exposing modules:

```ts
export default {
  modules: {
    exports: [
      'npm:axios',
      'root:src/utils.ts'
    ]
  }
}
```

### Module Import
`host` configuration for module import mapping:

```ts
export default {
  modules: {
    links: {
      'remote': 'root:./node_modules/remote'
    },
    imports: {
      'axios': 'remote/npm/axios'
    }
  }
}
```

Direct import usage in code:

```ts
import axios from 'axios';
import utils from 'remote/src/utils';
```

## Quick Start
Please read the [Getting Started](https://www.esmnext.com/guide/start/getting-started.html) guide.

## 🎯 Example Projects

### [Lightweight HTML Application](https://www.esmnext.com/ssr-html/)
A complete HTML server-side rendering example showing how to build modern web applications with Esmx:
- 🚀 Based on Rust-built Rspack, providing ultimate build performance
- 💡 Complete support for routing, components, styles, images, and more
- 🛠 Fast hot updates, friendly error messages, and complete type support
- 📱 Modern responsive design, perfectly adapting to various devices

### [Vue2 Micro-Frontend Example](https://www.esmnext.com/ssr-vue2-host/)
Demonstrates Vue2-based micro-frontend architecture with host and remote applications:

**Host Application:**
- 🔗 ESM-based import of remote application modules
- 🛠 Unified dependency management (e.g., Vue version)
- 🌐 Support for server-side rendering

**Remote Application:**
- 📦 Modular exports (components, composables)
- 🚀 Independent development server
- 💡 Support for hot updates in development environment

This example demonstrates:
1. How to reuse components and functionality from remote applications through ESM
2. How to ensure host and remote applications use the same dependency versions
3. How to independently debug remote applications in development environment

### [Preact + HTM](https://www.esmnext.com/ssr-preact-htm/)
High-performance implementation based on Preact + HTM:
- ⚡️ Ultimate package size optimization
- 🎯 Performance-first architecture design
- 🛠 Suitable for resource-constrained scenarios

All examples include complete project configurations and best practice guides to help you quickly get started and apply to production environments. Check the [examples](https://github.com/esmnext/esmx/tree/master/examples) directory for more details.

## 📚 Version Information

### [v3.x](https://www.esmnext.com) - Development Stage
Current version is built on Rspack, providing better development experience and build performance.

> **Known Issues**:
> - ESM module export optimization: `modern-module`'s `export *` syntax has stability issues [#8557](https://github.com/web-infra-dev/rspack/issues/8557)

### [v2.x](https://github.com/esmnext/esmx/blob/v2/docs/zh-CN/README.md) - Not Recommended for Production
This version is no longer recommended for production use. Please use the latest version.

### [v1.x](https://fmfe.github.io/genesis-docs/guide/) - Maintenance Discontinued
Formerly known as Genesis, it is the predecessor of Esmx. No longer accepting new features or non-critical bug fixes.


## 👥 Contributors

Thanks to all developers who have contributed to Esmx!

[![Contributors](https://contrib.rocks/image?repo=esmnext/esmx)](https://github.com/esmnext/esmx/graphs/contributors)

## 🌟 Trends
![Star growth chart](https://starchart.cc/esmnext/esmx.svg)

## 📄 License

This project is licensed under the [MIT](./LICENSE) License.