<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/pkg-wrapper</h1>

  <div>
    <a href="https://www.npmjs.com/package/@esmx/pkg-wrapper">
      <img src="https://img.shields.io/npm/v/@esmx/pkg-wrapper.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/pkg-wrapper.svg" alt="node version" />
    </a>
  </div>

  <p>为 Esmx 联邦边界生成静态具名导出的虚拟模块(<code>esmx://&lt;spec&gt;</code>),适配 CommonJS / ESM 包</p>

  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/pkg-wrapper/README.md">English</a> | 中文
  </p>
</div>

## 为什么需要它

Esmx 把 `react` 这类联邦包打包成独立 ESM chunk,让每个远程在运行时共享同一份实例。生产构建直接以 `react` 作为打包入口工作正常,但 **开发模式** 下 rspack / rsbuild 会跳过对入口 CJS 包的具名导出枚举 —— `import { useState } from 'react'` 解析为 `undefined`,SSR 在 `createContext is not a function` 处崩溃。

本包为每个 `pkg:` 导出生成一个 **虚拟 wrapper 模块**:用原始 specifier import 真实包,显式重导出所有静态具名导出 —— 让联邦 chunk 保留包的完整 API,不受打包器枚举优化影响。

```
        ┌───────────────────────────────────────┐
   pkg:react ──▶│  esmx://react   (虚拟模块)             │
                │                                       │
                │  export { useState, createContext,    │
                │           ... } from 'react';         │
                │  export { default } from 'react';     │
                └───────────────────────────────────────┘
                                │ bundler 入口
                                ▼
                联邦 chunk (react.<hash>.mjs)
                                │ import map
                                ▼
                          消费方远程
```

## 特性

- **与打包器一致的枚举** — 使用 `cjs-module-lexer`(CJS)和 `es-module-lexer`(ESM),正是 rspack / vite / rolldown 内部用的工具
- **CJS 条件分支** — 对经典的 `if (NODE_ENV === 'production') module.exports = require('./prod') else require('./dev')` 模式(react、vue、react-dom),lex 两个分支并取 **交集**,确保 wrapper 在任一变体下都能通过编译
- **ESM `export *` 递归** — 跨文件跟随 `export * from './impl'`(如 vue 的 `index.mjs` → `index.js` 链)
- **ESM-only `exports` map** — 先用 `import.meta.resolve` 解析,处理那些 `package.json` 只暴露 `import` 条件的包(如 `@esmx/router`)
- **不执行运行时** — 从不真正执行目标包;只做静态表面探测,避免拾取动态的 dev-only 属性(如 react 的 `act`),那些属性打包器静态 lexer 看不到

## 安装

```bash
npm install @esmx/pkg-wrapper
# 或
pnpm add @esmx/pkg-wrapper
```

## 用法

```ts
import { buildPkgWrapper } from '@esmx/pkg-wrapper';

const { source, names, hasDefault } = await buildPkgWrapper({
    root: '/path/to/project',
    spec: 'react'
});

// source:
//   export { useState, createContext, ... } from "react";
//   export { default } from "react";
```

把 `source` 接入到你的打包器虚拟模块系统:

| 打包器 | 机制 |
|---|---|
| Vite / Rolldown | 插件 `resolveId` + `load` 钩子 |
| rspack / rsbuild | [`rspack-plugin-virtual-module`](https://www.npmjs.com/package/rspack-plugin-virtual-module) |

`@esmx/rspack`、`@esmx/rsbuild`、`@esmx/vite` 就是这样接入本包的 —— 可以参考它们的源代码。

## API

### `buildPkgWrapper(opts): Promise<{ source, names, hasDefault }>`

探测一个包,返回可直接作为虚拟模块安装的 wrapper 源码。

```ts
interface BuildPkgWrapperOptions {
    /** 项目根路径(作为解析起点)。 */
    root: string;
    /** pkg 标识符 —— 用户在 `pkg:react` 中写的部分。 */
    spec: string;
}
```

### `generatePkgWrapperSource(spec, names, hasDefault): string`

纯源码构造函数。当你已经有 names 列表时使用。

### `inspectPkg(root, spec): Promise<{ names, hasDefault }>`

只做探测步骤 —— 返回 wrapper 会暴露的名字列表。

## License

MIT
