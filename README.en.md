<p align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="180" alt="Esmx Logo" />
</p>

<h1 align="center">Esmx</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/v/@esmx/core.svg" alt="npm version"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@esmx/core.svg" alt="node version"></a>
  <a href="https://bundlephobia.com/package/@esmx/core"><img src="https://img.shields.io/bundlephobia/minzip/@esmx/core" alt="size"></a>
  <a href="https://www.npmjs.com/package/@esmx/core"><img src="https://img.shields.io/npm/dm/@esmx/core.svg" alt="downloads monthly"></a>
</p>
<p align="center">Esmx is a next-generation microfrontend framework based on native ESM, featuring no sandbox, no runtime overhead, multi-framework support, and high-performance server-side rendering capabilities.</p>

<p align="center">
  <a href="./README.md">简体中文</a> | English
</p>

## 💫 Embrace Modern Microfrontend

**It's time to bid farewell to the past and embrace true microfrontend architecture!**

In recent years, as monolithic applications became increasingly unwieldy, microfrontend architecture emerged as a solution. However, existing microfrontend solutions, in their pursuit of application isolation, had to add layers of complexity on top of the original architecture: artificially created sandbox environments, complex dependency handling, and heavy runtime overhead. These compromises have resulted in significant performance burdens, making simple development complex and standard processes obscure.

### 🔧 Shackles of the Old World

These historical burdens are hindering our progress:

- **Artificial Isolation**: Using sandboxes to simulate isolation environments, yet never achieving the native module isolation capabilities of browsers
- **Heavy Runtime**: Injecting dependencies and proxying JS execution, each operation consuming valuable performance
- **Complex Toolchain**: Having to modify build tools to handle dependencies, making simple projects difficult to maintain
- **Fragmented Experience**: Special deployment strategies and runtime processing that deviate from modern frontend standard practices
- **Closed Ecosystem**: Framework coupling and custom interfaces that force technology choices to be bound to specific ecosystems

### 🌟 Dawn of a New Era

Today, the evolution of Web standards brings us new possibilities. We can finally build microfrontends in the purest way:

- **Back to Native**: Embracing ESM and importmap, returning dependency management to browser standards
- **Natural Isolation**: Module scope provides the most reliable isolation without any additional runtime overhead
- **Open Win-Win**: Any modern frontend framework can seamlessly integrate, no more technology constraints
- **Development Experience**: Intuitive development mode, familiar debugging process, everything feels natural
- **Ultimate Performance**: Zero runtime overhead, reliable caching strategy, making applications truly lightweight

## Quick Start
Please read the [Getting Started Guide](https://www.esmnext.com/guide/start/getting-started.html).

## 🎯 Example Projects

### [Lightweight HTML Application](https://www.esmnext.com/ssr-html/)
A complete HTML server-side rendering example showcasing how to build modern web applications with Esmx:
- 🚀 Built with Rust-based Rspack for ultimate build performance
- 💡 Complete support for routing, components, styles, images, and more
- 🛠 Fast hot updates, friendly error messages, and complete type support
- 📱 Modern responsive design, perfect for all devices

### [Vue2 Microfrontend Example](https://www.esmnext.com/ssr-vue2-host/)
Demonstrates Vue2-based microfrontend architecture with host and child applications:

**Host Application:**
- 🔗 ESM-based child application module imports
- 🛠 Unified dependency management (e.g., Vue version)
- 🌐 Server-side rendering support

**Child Application:**
- 📦 Modular exports (components, composables)
- 🚀 Independent development server
- 💡 Development environment hot updates

This example shows:
1. How to reuse child application components and features through ESM
2. How to ensure host and child applications use the same dependency versions
3. How to independently debug child applications in development environment

### [Preact + HTM](https://www.esmnext.com/ssr-preact-htm/)
High-performance implementation based on Preact + HTM:
- ⚡️ Extreme bundle size optimization
- 🎯 Performance-first architecture design
- 🛠 Suitable for resource-constrained scenarios

All examples include complete engineering configuration and best practice guides to help you quickly get started and apply to production environments. Check the [examples](https://github.com/esmnext/esmx/tree/master/examples) directory for more details.

## 📚 Version Information

### [v3.x](https://www.esmnext.com) - In Development
Current version is built on Rspack, providing better development experience and build performance.

> **Known Issues**:
> - ESM module export optimization in progress: `export *` syntax in `modern-module` has stability issues [#8557](https://github.com/web-infra-dev/rspack/issues/8557)

### [v2.x](https://github.com/esmnext/esmx/blob/v2/docs/zh-CN/README.md) - Not Recommended for Production
This version is no longer recommended for production use. Please use the latest version.

### [v1.x](https://fmfe.github.io/genesis-docs/guide/) - Maintenance Ended
Originally named Genesis, it is the predecessor of Esmx. No longer accepting new features or non-critical bug fixes.

## 👥 Contributors

Thanks to all developers who contributed to Esmx!

[![Contributors](https://contrib.rocks/image?repo=esmnext/esmx)](https://github.com/esmnext/esmx/graphs/contributors)

## 📄 License

This project is licensed under the [MIT](./LICENSE) license.