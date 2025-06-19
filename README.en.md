<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
  <h1>Esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version" /></a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml"><img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" /></a>
    <a href="https://www.esmnext.com/coverage/"><img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version" /></a>
    <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/dm/@esmx/core.svg" alt="downloads monthly" /></a>
    <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size" /></a>
  </div>
  
  <p>Esmx is a next-generation micro-frontend framework based on native ESM, with no sandbox or runtime overhead, supporting multi-framework hybrid development and providing high-performance server-side rendering capabilities.</p>
  
  <p>
    <a href="./README.md">简体中文</a> | English
  </p>
</div>


## 💫 Embrace Modern Micro-frontends

**It's time to say goodbye to the past and embrace a true micro-frontend architecture!**

In recent years, as monolithic applications became bloated, micro-frontend architecture emerged. However, existing solutions had to add layers of wrappers to achieve application isolation:

- Manually crafted sandbox environments
- Complex dependency handling
- Heavy runtime overhead

These compromises brought significant performance burdens, making simple development complex and standard processes obscure.

## ⛓️ Shackles of the Old World

These historical burdens are hindering our progress:

- **Artificial Isolation**: Sandboxes simulate isolated environments but can never match the browser's native module isolation capabilities
- **Heavy Runtime**: Injected dependencies, proxied JS execution - every operation consumes precious performance
- **Complex Toolchains**: To handle dependencies, build tools had to be modified, making simple projects hard to maintain
- **Fragmented Experience**: Special deployment strategies and runtime processing deviate from modern frontend standards
- **Closed Ecosystem**: Framework coupling and custom interfaces force technology choices into specific ecosystems

## ☀️ Dawn of a New Era

Today, web standards evolution brings new possibilities. We can finally build micro-frontends in the purest way:

- **Back to Native**: Embrace ESM and importmap, returning dependency management to browser standards
- **Natural Isolation**: Module scope provides the most reliable isolation without additional runtime overhead
- **Open Ecosystem**: Any modern frontend framework can integrate seamlessly, with no technology lock-in
- **Developer Experience**: Intuitive development patterns, familiar debugging workflows - everything feels natural
- **Peak Performance**: Zero runtime overhead, reliable caching strategies - truly lightweight applications

## 📚 Core Concepts

In Esmx, module import/export configuration is simple and intuitive - just a few lines of code enable seamless application integration.

**Module Export**    
Configure modules to expose in `remote`:

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

**Module Import**    
Configure module linking and import mapping in `host`:

```ts
export default {
  modules: {
    links: {
      'remote': './node_modules/remote'
    },
    imports: {
      'axios': 'remote/npm/axios'
    }
  }
}
```

Use directly in code:

```ts
import axios from 'axios';
import utils from 'remote/src/utils';
```

## 🚀 Quick Start
Read the [Getting Started Guide](https://www.esmnext.com/guide/start/getting-started.html).

## 🔧 Example Projects

- [Lightweight HTML App](https://www.esmnext.com/ssr-html/)
  - 🚀 Rspack-based server-side rendering
  - 💡 Full routing, component, and styling support
  - 📱 Responsive design for multiple devices

- [Vue2 Micro-frontend](https://www.esmnext.com/ssr-vue2-host/)
  - 🔗 ESM-based module integration
  - 📦 Independent development for host/child apps
  - 🌐 Unified dependency management with SSR

- [Preact + HTM](https://www.esmnext.com/ssr-preact-htm/)
  - ⚡️ Ultra-light bundle size
  - 🎯 High-performance SSR implementation
  - 🛠 Optimized for low-resource scenarios

See the [examples](https://github.com/esmnext/esmx/tree/master/examples) directory for complete examples.

## 📜 Version Notes

- [v3.x](https://www.esmnext.com) - Development
Current version uses Rspack for better development experience and build performance.

> **Known Issues**:
> - ESM module export optimization: `modern-module`'s `export *` syntax has stability issues [#8557](https://github.com/web-infra-dev/rspack/issues/8557)

- [v2.x](https://github.com/esmnext/esmx/blob/v2/docs/zh-CN/README.md) - Not recommended for production
This version is no longer recommended for production environments.

- [v1.x](https://fmfe.github.io/genesis-docs/guide/) - Deprecated
Originally named Genesis, the predecessor of Esmx. No new features or non-critical bug fixes.

## 👥 Contributors

Thanks to all contributors to Esmx!

[![Contributors](https://contrib.rocks/image?repo=esmnext/esmx)](https://github.com/esmnext/esmx/graphs/contributors)

## 📈 Trends
![Star growth chart](https://starchart.cc/esmnext/esmx.svg)

## ⚖️ License

MIT Licensed. See [LICENSE](./LICENSE).