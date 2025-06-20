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
  
  <p>Node.js server-side implementation of Import Maps for the Esmx framework</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/import/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Quick Start

```bash
npm install @esmx/import
```

```typescript
import { createVmImport } from '@esmx/import';
import { pathToFileURL } from 'node:url';

const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport('my-app/src/utils', import.meta.url);
```

## 📖 Mode Comparison

`@esmx/import` provides two different Import Maps implementation approaches:

| Feature | VM Mode | Loader Mode |
|---------|---------|-------------|
| **Function** | `createVmImport()` | `createLoaderImport()` |
| **Environment** | Development | Production |
| **Hot Reload** | ✅ Supports multiple creation | ❌ Can only be created once |
| **Performance** | Relatively slower | High performance |
| **Isolation** | Fully isolated VM environment | Uses Node.js native Loader |
| **Debugging** | Easy for development debugging | Suitable for production deployment |

## 🔧 Usage Examples

### VM Mode (Development)

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

### Loader Mode (Production)

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

## 📚 API Reference

### createVmImport(baseURL, importMap?)
Creates a VM-based import function with hot reload support.
```typescript
const vmImport = createVmImport(baseURL, importMap);
const module = await vmImport(specifier, parent, sandbox?, options?);
```

### createLoaderImport(baseURL, importMap?)
Creates a Loader-based import function with high performance, can only be created once.
```typescript
const loaderImport = createLoaderImport(baseURL, importMap);
const module = await loaderImport(specifier);
```

### ImportMap Format
```typescript
interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}
```

**Important Notes:**
- Only supports Node.js environment, not browser
- Paths must be absolute paths or complete URLs

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx) 