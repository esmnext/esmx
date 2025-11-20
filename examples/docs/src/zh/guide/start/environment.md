---
titleSuffix: "环境与兼容性"
description: "Esmx 的环境要求与兼容性说明，覆盖 Node.js 与浏览器两端的前提条件与选择策略。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Node.js, 浏览器兼容性, TypeScript, es-module-shims, 环境配置"
---

# 环境要求

本文档介绍了使用本框架所需的环境要求，包括 Node.js 环境和浏览器兼容性。

## Node.js 环境

要求 Node.js 版本 `>= 24`。

::: warning 注意
低于 24 的版本不受支持，安装依赖会失败。
:::

## 浏览器兼容性

兼容性策略分为两种模式：
- 兼容模式：通过 es-module-shims 提供对动态导入与 `import.meta` 的向后兼容。
- 原生 Import Maps 模式：依赖浏览器原生 Import Maps 能力。

### 兼容模式（默认）

| 浏览器 | 最低版本 |
|-------|----------|
| Chrome | >= 64 |
| Edge   | >= 79 |
| Firefox| >= 67 |
| Safari | >= 11.1 |

数据来源：Can I Use（Dynamic Import 与 `import.meta`），检索日期：2025-11。

要启用兼容模式，需要在 HTML 中添加 [es-module-shims](https://github.com/guybedford/es-module-shims) 脚本。它会 Polyfill 动态导入与 `import.meta` 等特性。

```html
<script async src="https://unpkg.com/es-module-shims/dist/es-module-shims.js"></script>
```

::: tip 建议

- 为保证生产环境的稳定性，建议将此脚本下载并部署到您自己的服务器或 CDN。
- 根据目标用户的浏览器分布，综合考虑兼容性成本与收益，再决定是否启用此模式。

:::

### 原生 Import Maps 模式

| 浏览器 | 最低版本 |
|-------|----------|
| Chrome | >= 89 |
| Edge   | >= 89 |
| Firefox| >= 108 |
| Safari | >= 16.4 |

数据来源：Can I Use（Import Maps），检索日期：2025-11。
