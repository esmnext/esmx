---
titleSuffix: Esmx 框架兼容性指南
description: 详细介绍 Esmx 框架的环境要求，包括 Node.js 版本要求和浏览器兼容性说明，帮助开发者正确配置开发环境。
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, 浏览器兼容性, TypeScript, es-module-shims, 环境配置
---

# 环境要求

本文档介绍了使用本框架所需的环境要求，包括 Node.js 环境和浏览器兼容性。

## Node.js 环境

框架要求 Node.js 版本 >= 22.6，主要用于支持 TypeScript 类型导入（通过 `--experimental-strip-types` 标志），无需额外编译步骤。

## 浏览器兼容性

框架默认采用兼容模式构建，以支持更广泛的浏览器。但需要注意，要实现完整的浏览器兼容支持，需要手动添加 [es-module-shims](https://github.com/guybedford/es-module-shims) 依赖。


### 兼容模式（默认）
- 🌐 Chrome：>= 63 
- 🦊 Firefox：>= 67
- 🧭 Safari：>= 11.1

根据 [Can I Use](https://caniuse.com/?search=dynamic%20import) 的统计数据，兼容模式下的浏览器覆盖率达到 96.81%。

### 原生支持模式
- 🌐 Chrome：>= 89 
- 🦊 Firefox：>= 108 
- 🧭 Safari：>= 16.4 

原生支持模式具有以下优势：
- 零运行时开销，无需额外的模块加载器
- 浏览器原生解析，更快的执行速度
- 更好的代码分割和按需加载能力

根据 [Can I Use](https://caniuse.com/?search=importmap) 的统计数据，兼容模式下的浏览器覆盖率达到 93.5%。

### 启用兼容支持

::: warning 重要提示
虽然框架默认使用兼容模式构建，但要实现对旧版浏览器的完整支持，您需要在项目中添加 [es-module-shims](https://github.com/guybedford/es-module-shims) 依赖。

:::


在 HTML 文件中添加以下脚本：

```html
<!-- 开发环境 -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- 生产环境 -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip 最佳实践

1. 生产环境建议：
   - 将 es-module-shims 部署到自有服务器
   - 确保资源加载的稳定性和访问速度
   - 避免潜在的安全风险
2. 性能考虑：
   - 兼容模式会带来少量性能开销
   - 可以根据目标用户群的浏览器分布决定是否启用

:::