---
titleSuffix: "Esmx Module Configuration API Reference"
description: "Detailed specification of the ModuleConfig interface, including type definitions, options, resolution, and usage to understand the core module system configuration."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, ModuleConfig, module configuration, API, imports, exports, types"
---

# ModuleConfig

Core configuration interface for the module system.

## Interface

```typescript
interface ModuleConfig {
    links?: Record<string, string>;
    imports?: ModuleConfigImportMapping;
    scopes?: Record<string, ModuleConfigImportMapping>;
    exports?: ModuleConfigExportExports;
}
```

### links

- Type: `Record<string, string>`
- Description: Remote module links. Key is remote module name, value is the path to its build output directory.

### imports  

- Type: `ModuleConfigImportMapping`
- Description: Import specifier mapping. Key is local specifier, value is remote path. Supports environment-specific configuration.

### scopes

- Type: `Record<string, ModuleConfigImportMapping>`
- Description: Scope-based import mapping. Key is a path prefix, value is the import mapping for that scope.

### exports

- Type: `ModuleConfigExportExports`
- Description: Export configuration supporting multiple forms.

## Type Definitions

### ModuleConfigImportMapping

```typescript
type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;
```

Import mapping type supporting plain strings and environment-specific mappings.

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports = ModuleConfigExportExport[];
```

Array of export definitions supporting a mix of strings and objects.

### ModuleConfigExportExport

```typescript
type ModuleConfigExportExport = string | ModuleConfigExportObject;
```

Single export entry, either a string or an object definition.

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = Record<
    string,
    ModuleConfigExportObjectValue
>;
```

Object form where keys are export names and values are export configuration values.

### ModuleConfigExportObjectValue

```typescript
type ModuleConfigExportObjectValue =
    | string
    | Record<BuildEnvironment, string | boolean>;
```

Export value that supports plain strings and environment-specific configuration.


### BuildEnvironment

```typescript
type BuildEnvironment = 'client' | 'server';
```

Build target environment type.

## Parsed Interfaces

### ParsedModuleConfig

```typescript
interface ParsedModuleConfig {
    name: string;
    root: string;
    links: Record<string, ParsedModuleConfigLink>;
    environments: {
        client: ParsedModuleConfigEnvironment;
        server: ParsedModuleConfigEnvironment;
    };
}
```

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

Record of parsed export configurations where keys are export names and values are parsed export objects.

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}
```
