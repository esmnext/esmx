<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/import</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/import">
      <img src="https://img.shields.io/npm/v/@esmx/import.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/import.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/import">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/import" alt="size" />
    </a>
  </div>
  
  <p>为 Esmx 框架提供 Import Map 的 Node.js 服务端实现</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/import/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

- **双重实现** - 开发环境使用 VM 模式，生产环境使用 Loader 模式
- **热重载支持** - VM 模式支持多次创建，提供开发灵活性
- **高性能** - Loader 模式针对生产环境优化
- **Node.js 专注** - 专为 Node.js 服务端环境设计
- **TypeScript 支持** - 完整的 TypeScript 类型安全
- **ESM 标准** - 完全符合 Import Map 规范

## 📦 安装

```bash
# npm
npm install @esmx/import

# pnpm
pnpm add @esmx/import

# yarn
yarn add @esmx/import
```

## 🚀 快速开始

```typescript
import { createVmImport } from '@esmx/import';
import { pathToFileURL } from 'node:url';

const baseURL = pathToFileURL('/project');
const importMap = {
    imports: {
        'my-app/src/utils': '/project/src/utils.mjs'
    }
};

const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport('my-app/src/utils', import.meta.url);
```

## 📖 模式对比

`@esmx/import` 提供两种不同的 Import Map 实现方式：

| 特性 | VM 模式 | Loader 模式 |
|------|---------|-------------|
| **函数** | `createVmImport()` | `createLoaderImport()` |
| **适用环境** | 开发环境 | 生产环境 |
| **热重载** | ✅ 支持多次创建 | ❌ 只能创建一次 |
| **性能** | 相对较慢 | 高性能 |
| **隔离性** | 完全隔离的 VM 环境 | 使用 Node.js 原生 Loader |
| **调试** | 便于开发调试 | 适合生产部署 |

## 🔧 使用示例

### VM 模式 (开发环境)

```typescript
import { createVmImport } from '@esmx/import';
import { pathToFileURL } from 'node:url';

const baseURL = pathToFileURL('/project');
const importMap = {
  imports: {
    'my-app/src/utils': '/project/src/utils.mjs'
  }
};

const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport('my-app/src/utils', import.meta.url);
```

### Loader 模式 (生产环境)

```typescript
import { createLoaderImport } from '@esmx/import';
import { pathToFileURL } from 'node:url';

const baseURL = pathToFileURL('/app/dist/server');
const importMap = {
  imports: {
    'my-app/src/utils': '/app/dist/server/my-app/src/utils.mjs'
  }
};

const loaderImport = createLoaderImport(baseURL, importMap);
const module = await loaderImport('my-app/src/utils');
```

## 📚 API 参考

### createVmImport(baseURL, importMap?)
创建基于 VM 的导入函数，支持热重载。
```typescript
const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport(specifier, parent, sandbox?, options?);
```

### createLoaderImport(baseURL, importMap?)
创建基于 Loader 的导入函数，高性能，只能创建一次。
```typescript
const loaderImport = createLoaderImport(baseURL, importMap);
const module = await loaderImport(specifier);
```

### Import Map 格式
```typescript
interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}
```

**注意事项：**
- 仅支持 Node.js 环境，不支持浏览器
- 路径必须为绝对路径或完整 URL

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx) 
