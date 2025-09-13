---
titleSuffix: Esmx 框架构建清单文件参考
description: 详细介绍 Esmx 框架的构建清单文件（manifest.json）结构，包括构建产物管理、导出文件映射和资源统计功能，帮助开发者理解和使用构建系统。
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, 构建清单, 资源管理, 构建产物, 文件映射, API
---

# ManifestJson

`manifest.json` 是 Esmx 框架在构建过程中生成的清单文件，用于记录服务构建的产物信息。它提供了统一的接口来管理构建产物、导出文件和资源统计。

## 类型定义

### ManifestJson

```typescript
interface ManifestJson {
  name: string;
  imports: Record<string, string>;
  exports: ManifestJsonExports;
  buildFiles: string[];
  chunks: ManifestJsonChunks;
}
```

#### name

- **类型**: `string`
- **描述**: 服务名称，来自于模块配置中的名称

#### imports

- **类型**: `Record<string, string>`
- **描述**: 导入映射配置，key为本地导入名，value为对应的构建文件路径

#### exports

- **类型**: `ManifestJsonExports`
- **描述**: 导出配置映射，包含详细的导出项信息

#### buildFiles

- **类型**: `string[]`
- **描述**: 构建产物的完整文件清单，包含所有生成的文件路径

#### chunks

- **类型**: `Record<string, ManifestJsonChunk>`
- **描述**: 源文件与编译产物的对应关系，key为源文件标识符，value为编译信息

### ManifestJsonExport

```typescript
interface ManifestJsonExport {
  name: string;
  pkg: boolean;
  file: string;
  identifier: string;
}
```

#### name

- **类型**: `string`
- **描述**: 导出项名称

#### pkg

- **类型**: `boolean`
- **描述**: 是否重写模块导入路径

#### file

- **类型**: `string`
- **描述**: 导出项对应的文件路径

#### identifier

- **类型**: `string`
- **描述**: 导出项的唯一标识符

### ManifestJsonChunk

```typescript
interface ManifestJsonChunk {
  name: string;
  js: string;
  css: string[];
  resources: string[];
}
```

#### name

- **类型**: `string`
- **描述**: 当前源文件的标识符

#### js

- **类型**: `string`
- **描述**: 当前源文件编译后的 JS 文件路径

#### css

- **类型**: `string[]`
- **描述**: 当前源文件关联的 CSS 文件路径列表

#### resources

- **类型**: `string[]`
- **描述**: 当前源文件关联的其它资源文件路径列表
