---
titleSuffix: Esmx Module Configuration API Reference
description: ModuleConfig interface detailed documentation, including type definitions, configuration options, resolution mechanisms and usage examples, helping developers understand the core configuration of Esmx module system.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, Module Configuration, API Reference, Module Import Export, Type Definition, Configuration Interface
---

# ModuleConfig

Core configuration interface for the module system.

## Interface Definition

```typescript
interface ModuleConfig {
    links?: Record<string, string>;
    imports?: Record<string, string>;
    exports?: ModuleConfigExportExports;
}
```

### links

* **Type**: `Record<string, string>`
* **Description**: Module link configuration. Key is remote module name, value is module build output directory path.

### imports  

* **Type**: `Record<string, string>`
* **Description**: Module import mapping configuration. Key is local module identifier, value is remote module path.

### exports

* **Type**: `ModuleConfigExportExports`
* **Description**: Module export configuration. Supports multiple configuration forms.

## Type Definitions

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports =
    | Array<string | Record<string, string | ModuleConfigExportObject>>
    | Record<string, string | ModuleConfigExportObject>;
```

Union type for export configuration, supporting mixed array (strings and objects) and object forms.

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = {
    input?: string;
    inputTarget?: Record<BuildSsrTarget, string | false>;
    rewrite?: boolean;
};
```

#### input

* **Type**: `string`
* **Description**: Input file path, relative to project root directory.

#### inputTarget

* **Type**: `Record<BuildSsrTarget, string | false>`
* **Description**: Environment-specific input file configuration. Supports client and server differentiated builds.

#### rewrite

* **Type**: `boolean`
* **Default**: `true`
* **Description**: Whether to rewrite import paths within modules.

### BuildSsrTarget

```typescript
type BuildSsrTarget = 'client' | 'server';
```

Build target environment type.

## Parsed Interface

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
    inputTarget: Record<BuildSsrTarget, string | false>;
    rewrite: boolean;
}
```

## Prefix Syntactic Sugar

The following prefixes are supported in string items of `exports` array form:

### npm: Prefix

* **Format**: `'npm:packageName'`
* **Processing**: Automatically sets `rewrite: false`, maintains original import paths
* **Example**: `'npm:axios'` → `{ input: 'axios', rewrite: false }`

### root: Prefix  

* **Format**: `'root:path/to/file.ext'`
* **Processing**: Automatically sets `rewrite: true`, removes file extension, adds `./` prefix
* **Example**: `'root:src/utils/format.ts'` → `{ input: './src/utils/format', rewrite: true }`

## Default Export Items

The framework automatically adds the following default export items for each module:

```typescript
{
  'src/entry.client': {
    inputTarget: {
      client: './src/entry.client',
      server: false
    }
  },
  'src/entry.server': {
    inputTarget: {
      client: false,
      server: './src/entry.server'
    }
  }
}
```

## Examples

### Basic Configuration

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

### Array Form

```typescript
exports: [
  'npm:axios',
  'root:src/utils/format.ts',
  {
    'api-client': './src/api/client.ts'
  }
]
```

### Object Form

```typescript
exports: {
  'axios': 'axios',
  'utils': './src/utils/index.ts',
  'storage': {
    inputTarget: {
      client: './src/storage/indexedDB.ts',
      server: './src/storage/filesystem.ts'
    }
  }
}
```

### Mixed Array Form

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