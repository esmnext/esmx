<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/import</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/import">
      <img src="https://img.shields.io/npm/v/@esmx/import.svg" alt="npm version" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://www.npmjs.com/package/@esmx/import">
      <img src="https://img.shields.io/npm/dm/@esmx/import.svg" alt="npm downloads" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/import">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/import.svg" alt="bundle size" />
    </a>
  </div>
  
  <p>为 Esmx 框架提供 Import Maps 的 Node.js 服务端实现</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/import/README.md">English</a> | 中文
  </p>
</div>

## 🚀 快速开始

```bash
npm install @esmx/import
```

```typescript
import { createVmImport } from '@esmx/import';
import { pathToFileURL } from 'node:url';

const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport('my-app/src/utils', import.meta.url);
```

## 📖 模式对比

`@esmx/import` 提供两种不同的 Import Maps 实现方式：

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

### ImportMap 格式
```typescript
interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}
```

**注意事项:**
- 仅支持 Node.js 环境，不支持浏览器
- 路径必须为绝对路径或完整 URL

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx) 