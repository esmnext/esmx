---
titleSuffix: "ModuleConfig 模块配置 API"
description: "Esmx ModuleConfig 接口：类型定义、配置选项与模块链接系统的解析机制。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, ModuleConfig, 模块配置, API 参考, 模块导入导出, 类型定义, 配置接口"
---

# ModuleConfig

模块系统的核心配置接口。

## 接口定义

```typescript
interface ModuleConfig {
    lib?: boolean;
    links?: Record<string, string>;
    imports?: ModuleConfigImportMapping;
    exports?: ModuleConfigExportExports;
}
```

### lib

* **类型**: `boolean`
* **描述**: 指定当前模块是否为纯库模式。当设置为 `true` 时，模块不会自动创建默认的入口文件导出（如 `src/entry.client` 和 `src/entry.server`）。

**默认值**: `false`

### links

* **类型**: `Record<string, string>`
* **描述**: 模块链接配置。键为远程模块名称，值为模块构建产物目录路径。

### imports

* **类型**: `ModuleConfigImportMapping`
* **描述**: 模块导入映射配置。键为本地模块标识符，值为远程模块路径。支持环境特定的配置。

### exports

* **类型**: `ModuleConfigExportExports`
* **描述**: 模块导出配置。支持多种配置形式。

## 类型定义

### ModuleConfigImportMapping

```typescript
type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;
```

导入映射配置类型，支持字符串和环境特定的配置。

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports = ModuleConfigExportExport[];
```

导出配置的数组类型，支持字符串和导出对象的混合数组。

### ModuleConfigExportExport

```typescript
type ModuleConfigExportExport = string | ModuleConfigExportObject;
```

导出配置项类型，支持字符串和导出对象两种形式。

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = Record<
    string,
    ModuleConfigExportObjectValue
>;
```

导出对象配置类型，键为导出名称，值为导出配置值。

### ModuleConfigExportObjectValue

```typescript
type ModuleConfigExportObjectValue =
    | string
    | Record<BuildEnvironment, string | boolean>;
```

导出配置值类型，支持字符串和环境特定的配置。


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
    lib: boolean;
    links: Record<string, ParsedModuleConfigLink>;
    environments: {
        client: ParsedModuleConfigEnvironment;
        server: ParsedModuleConfigEnvironment;
    };
}
```

#### lib

* **类型**: `boolean`
* **描述**: 当前模块是否为纯库模式。

### ParsedModuleConfigEnvironment

```typescript
interface ParsedModuleConfigEnvironment {
    imports: Record<string, string>;
    exports: ParsedModuleConfigExports;
    scopes: Record<string, Record<string, string>>;
}
```

### ParsedModuleConfigLink

```typescript
interface ParsedModuleConfigLink {
    name: string;
    root: string;
    client: string;
    clientManifestJson: string;
    server: string;
    serverManifestJson: string;
}
```

### ParsedModuleConfigExports

```typescript
type ParsedModuleConfigExports = Record<
    string,
    ParsedModuleConfigExport
>;
```

解析后的导出配置记录类型，键为导出名称，值为导出配置对象。

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}
```
