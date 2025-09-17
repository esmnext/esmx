---
titleSuffix: Esmx Module Configuration API Reference
description: Detailed explanation of ModuleConfig interface, including type definitions, configuration options, resolution mechanisms, and usage examples, helping developers deeply understand the core configuration of Esmx module system.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, Module Configuration, API Reference, Module Import/Export, Type Definitions, Configuration Interface
---

# ModuleConfig

The core configuration interface for the module system.

## Interface Definition

```typescript
interface ModuleConfig {
    links?: Record<string, string>;
    imports?: ModuleConfigImportMapping;
    scopes?: Record<string, ModuleConfigImportMapping>;
    exports?: ModuleConfigExportExports;
}
```

### links

* **Type**: `Record<string, string>`
* **Description**: Module linking configuration. Key is remote module name, value is module build artifact directory path.

### imports  

* **Type**: `ModuleConfigImportMapping`
* **Description**: Module import mapping configuration. Key is local module identifier, value is remote module path. Supports environment-specific configurations.

### scopes

* **Type**: `Record<string, ModuleConfigImportMapping>`
* **Description**: Module scope mapping configuration. Key is directory path prefix, value is import mapping configuration within that scope.

### exports

* **Type**: `ModuleConfigExportExports`
* **Description**: Module export configuration. Supports multiple configuration forms.

## Type Definitions

### ModuleConfigImportMapping

```typescript
type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;
```

Import mapping configuration type, supporting strings and environment-specific configurations.

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports = ModuleConfigExportExport[];
```

Array type for export configuration, supporting mixed arrays of strings and export objects.

### ModuleConfigExportExport

```typescript
type ModuleConfigExportExport = string | ModuleConfigExportObject;
```

Export configuration item type, supporting both string and export object forms.

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = Record<
    string,
    ModuleConfigExportObjectValue
>;
```

Export object configuration type, key is export name, value is export configuration value.

### ModuleConfigExportObjectValue

```typescript
type ModuleConfigExportObjectValue =
    | string
    | Record<BuildEnvironment, string | boolean>;
```

Export configuration value type, supporting strings and environment-specific configurations.


### BuildEnvironment

```typescript
type BuildEnvironment = 'client' | 'server';
```

Build target environment type.

## Resolved Interfaces

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

Resolved export configuration record type, key is export name, value is export configuration object.

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}
