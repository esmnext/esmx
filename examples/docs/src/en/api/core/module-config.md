---
titleSuffix: Esmx Module Configuration API Reference
description: Detailed explanation of the ModuleConfig interface, including type definitions, configuration options, parsing mechanisms, and usage examples to help developers deeply understand the core configuration of the Esmx module system.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, Module Configuration, API Reference, Module Import Export, Type Definitions, Configuration Interface
---

# ModuleConfig

The core configuration interface for the module system.

## Interface Definition

```typescript
interface ModuleConfig {
    links?: Record<string, string>;
    imports?: Record<string, string | Record<BuildEnvironment, string>>;
    exports?: ModuleConfigExportExports;
}
```

### links

- **Type**: `Record<string, string>`
- **Description**: Module link configuration. Key is the remote module name, value is the module build artifact directory path.

### imports

- **Type**: `Record<string, string | Record<BuildEnvironment, string>>`
- **Description**: Module import mapping configuration. Key is the local module identifier, value is the remote module path. Supports environment-specific configuration.

### exports

- **Type**: `ModuleConfigExportExports`
- **Description**: Module export configuration. Supports multiple configuration forms.

## Type Definitions

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports = Array<string | Record<string, string | ModuleConfigExportObject>>;
```

Array type for export configuration, supporting mixed array (string and object) forms.

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = {
    file?: string;
    files?: Record<BuildEnvironment, string | false>;
    pkg?: boolean;
};
```

#### file

- **Type**: `string`
- **Description**: Input file path, relative to the project root directory.

#### files

- **Type**: `Record<BuildEnvironment, string | false>`
- **Description**: Environment-specific input file configuration. Supports differentiated builds for client and server.

#### pkg

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to rewrite import paths within the module.

### BuildEnvironment

```typescript
type BuildEnvironment = 'client' | 'server';
```

Build target environment type.

## Parsed Interface

### ParsedModuleConfig

```typescript
interface ParsedModuleConfig {
    name: string;
    root: string;
    links: Record<
        string,
        {
            name: string;
            root: string;
            client: string;
            clientManifestJson: string;
            server: string;
            serverManifestJson: string;
        }
    >;
    environments: {
        client: {
            imports: Record<string, string>;
            exports: ParsedModuleConfigExports;
        };
        server: {
            imports: Record<string, string>;
            exports: ParsedModuleConfigExports;
        };
    };
}
```

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}
```

## Prefix Syntax Sugar

The following prefixes are supported in string items of the `exports` array form:

### pkg: prefix

- **Format**: `'pkg:packageName'`
- **Processing**: Automatically sets `pkg: false`, preserving original import paths
- **Example**: `'pkg:axios'` → `{ file: 'axios', pkg: false }`

### root: prefix

- **Format**: `'root:path/to/file.ext'`
- **Processing**: Automatically sets `pkg: true`, removes file extension, adds `./` prefix
- **Example**: `'root:src/utils/format.ts'` → `{ file: './src/utils/format', pkg: true }`

## Default Export Items

The framework automatically adds the following default export items for each module:

```typescript
{
  'src/entry.client': {
    files: {
      client: './src/entry.client',
      server: false
    }
  },
  'src/entry.server': {
    files: {
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
      'pkg:axios',
      'root:src/utils/format.ts'
    ]
  }
} satisfies EsmxOptions;
```

### Array Form (Recommended)

```typescript
exports: [
  'pkg:axios',
  'root:src/utils/format.ts',
  {
    'api-client': './src/api/client.ts',
    'utils': {
      file: './src/utils/index.ts',
      pkg: true
    }
  }
]
```

### Environment-Specific Import Configuration

```typescript
imports: {
  // Standard import mapping (applies to both environments)
  'axios': 'shared-lib/axios',
  
  // Environment-specific import mapping
  'storage': {
    client: 'shared-lib/storage/client',
    server: 'shared-lib/storage/server'
  },
  
  // Another environment-specific example
  'config': {
    client: 'shared-lib/config/browser',
    server: 'shared-lib/config/node'
  }
}
```

### Environment-Specific Export Configuration

```typescript
exports: [
  {
    'storage': {
      files: {
        client: './src/storage/indexedDB.ts',
        server: './src/storage/filesystem.ts'
      }
    }
  }
]
```

### Object Form (Object Elements in Array)

```typescript
exports: [
  {
    'utils': './src/utils.ts',
    'api': './src/api.ts'
  },
  {
    'components': {
      file: './src/components/index.ts',
      pkg: true
    }
  }
]
