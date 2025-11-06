---
titleSuffix: "Esmx Build Manifest File Reference"
description: "Reference for Esmx build manifest (manifest.json) structure including outputs, export mapping, and resource stats to understand and use the build system."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, ManifestJson, build manifest, resource management, outputs, file mapping, API"
---

# ManifestJson

`manifest.json` is generated during Esmx builds to record output information. It provides a unified interface for managing build outputs, exports, and resource statistics.

## Type Definitions

### ManifestJson

```typescript
interface ManifestJson {
  name: string;
  scopes: Record<string, Record<string, string>>;
  exports: ManifestJsonExports;
  files: string[];
  chunks: ManifestJsonChunks;
}
```

#### name

- Type: `string`
- Description: Module name from module configuration

#### scopes

- Type: `Record<string, Record<string, string>>`
- Description: ImportMap scopes mapping. Key is scope prefix, value maps `specifier -> resolved` for runtime resolution by path prefix.

#### exports

- Type: `ManifestJsonExports`
- Description: Export entries mapping. Key is export path, value is export info

#### files

- Type: `string[]`
- Description: Full list of build output files

#### chunks

- Type: `ManifestJsonChunks`
- Description: Compiled file info. Key is source file, value is compiled info

### ManifestJsonExports

```typescript
type ManifestJsonExports = Record<string, ManifestJsonExport>;
```

Mapping of export entries.

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

- Type: `string`
- Description: Export entry name

#### pkg

- Type: `boolean`
- Description: Whether the export is a package

#### file

- Type: `string`
- Description: File path for the export

#### identifier

- Type: `string`
- Description: Unique identifier for the export

### ManifestJsonChunks

```typescript
type ManifestJsonChunks = Record<string, ManifestJsonChunk>;
```

Mapping of compiled files.

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

- Type: `string`
- Description: Identifier of the current source file

#### js

- Type: `string`
- Description: Path to compiled JS for the source file

#### css

- Type: `string[]`
- Description: CSS files associated with the source file

#### resources

- Type: `string[]`
- Description: Other resources associated with the source file
