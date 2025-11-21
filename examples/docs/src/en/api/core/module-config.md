---
titleSuffix: "ModuleConfig Module Configuration API"
description: "Detailed explanation of ModuleConfig interface, including type definitions, configuration options, resolution mechanisms, and usage examples, helping developers deeply understand the core configuration of Esmx module system."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, ModuleConfig, module configuration, API reference, module import and export, type definitions, configuration interface"
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
* **Description**: Module linking configuration, where the key is the remote module name and the value is the module build artifact directory path.

### imports  

* **Type**: `ModuleConfigImportMapping`
* **Description**: Module import mapping configuration, where the key is the local module identifier and the value is the remote module path. Supports environment-specific configuration.

### scopes

* **Type**: `Record<string, ModuleConfigImportMapping>`
* **Description**: Module scope mapping configuration, where the key is the directory path prefix and the value is the import mapping configuration within that scope.

### exports

* **Type**: `ModuleConfigExportExports`
* **Description**: Module export configuration. Supports multiple configuration formats.

## Type Definitions

### ModuleConfigImportMapping

```typescript
type ModuleConfigImportMapping = Record<
    string,
    string | Record<BuildEnvironment, string>
>;
```

Import mapping configuration type, supporting string and environment-specific configurations.

### ModuleConfigExportExports

```typescript
type ModuleConfigExportExports = ModuleConfigExportExport[];
```

Export configuration array type, supporting mixed arrays of strings and export objects.

### ModuleConfigExportExport

```typescript
type ModuleConfigExportExport = string | ModuleConfigExportObject;
```

Export configuration item type, supporting both string and export object formats.

### ModuleConfigExportObject

```typescript
type ModuleConfigExportObject = Record<
    string,
    ModuleConfigExportObjectValue
>;
```

Export object configuration type, where the key is the export name and the value is the export configuration value.

### ModuleConfigExportObjectValue

```typescript
type ModuleConfigExportObjectValue =
    | string
    | Record<BuildEnvironment, string | boolean>;
```

Export configuration value type, supporting string and environment-specific configurations.


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

Parsed export configuration record type, where the key is the export name and the value is the export configuration object.

### ParsedModuleConfigExport

```typescript
interface ParsedModuleConfigExport {
    name: string;
    file: string;
    pkg: boolean;
}