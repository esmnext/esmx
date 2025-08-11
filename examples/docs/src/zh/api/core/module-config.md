---
titleSuffix: Esmx 模块配置 API 参考
description: ModuleConfig 接口详细说明，包括类型定义、配置选项、解析机制和使用示例，帮助开发者深入理解 Esmx 模块系统的核心配置。
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, 模块配置, API 参考, 模块导入导出, 类型定义, 配置接口
---

# ModuleConfig

模块系统的核心配置接口。

## 接口定义

```typescript
interface ModuleConfig {
    links?: Record<string, string>;
    imports?: Record<string, string>;
    exports?: ModuleConfigExportExports;
}
```

### links

* **类型**: `Record<string, string>`
* **描述**: 模块链接配置。键为远程模块名称，值为模块构建产物目录路径。

### imports  

* **类型**: `Record<string, string>`
* **描述**: 模块导入映射配置。键为本地模块标识符，值为远程模块路径。

### exports

* **类型**: `ModuleConfigExportExports`
* **描述**: 模块导出配置。支持多种配置形式。

## 类型定义

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports =
    | Array<string | Record<string, string | ModuleConfigExportObject>>
    | Record<string, string | ModuleConfigExportObject>;
```

导出配置的联合类型，支持混合数组（字符串和对象）、对象两种形式。

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = {
    input?: string;
    entryPoints?: Record<BuildEnvironment, string | false>;
    rewrite?: boolean;
};
```

#### input

* **类型**: `string`
* **描述**: 输入文件路径，相对于项目根目录。

#### entryPoints

* **类型**: `Record<BuildEnvironment, string | false>`
* **描述**: 环境特定的输入文件配置。支持客户端和服务端差异化构建。

#### rewrite

* **类型**: `boolean`
* **默认值**: `true`
* **描述**: 是否重写模块内的导入路径。

### BuildEnvironment

```typescript
type BuildEnvironment = 'client' | 'server';
```

构建目标环境类型。

## 解析后接口

### ParsedModuleConfig

```typescript
interface ParsedModuleConfig {
    name: string;
    root: string;
    links: Record<string, LinkInfo>;
    imports: Record<string, string>;
    exports: ParsedModuleConfigExports;
}
```

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    entryPoints: Record<BuildEnvironment, string | false>;
    rewrite: boolean;
}
```

## 前缀语法糖

在 `exports` 数组形式的字符串项中支持以下前缀：

### npm: 前缀

* **格式**: `'npm:packageName'`
* **处理**: 自动设置 `rewrite: false`，保持原始导入路径
* **示例**: `'npm:axios'` → `{ input: 'axios', rewrite: false }`

### root: 前缀  

* **格式**: `'root:path/to/file.ext'`
* **处理**: 自动设置 `rewrite: true`，去除文件扩展名，添加 `./` 前缀
* **示例**: `'root:src/utils/format.ts'` → `{ input: './src/utils/format', rewrite: true }`

## 默认导出项

框架自动为每个模块添加以下默认导出项：

```typescript
{
  'src/entry.client': {
    entryPoints: {
      client: './src/entry.client',
      server: false
    }
  },
  'src/entry.server': {
    entryPoints: {
      client: false,
      server: './src/entry.server'
    }
  }
}
```

## 示例

### 基础配置

```typescript
export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist'
    },
    imports: {
      'axios': 'shared-lib/axios'
    },
    exports: [
      'npm:axios',
      'root:src/utils/format.ts'
    ]
  }
} satisfies EsmxOptions;
```

### 数组形式

```typescript
exports: [
  'npm:axios',
  'root:src/utils/format.ts',
  {
    'api-client': './src/api/client.ts'
  }
]
```

### 对象形式

```typescript
exports: {
  'axios': 'axios',
  'utils': './src/utils/index.ts',
  'storage': {
    entryPoints: {
      client: './src/storage/indexedDB.ts',
      server: './src/storage/filesystem.ts'
    }
  }
}
```

### 混合数组形式

```typescript
exports: [
  {
    'utils': './src/utils.ts',
    'api': './src/api.ts'
  },
  {
    'components': {
      input: './src/components/index.ts',
      rewrite: true
    }
  }
]
```
