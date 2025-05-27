---
titleSuffix: Esmx Framework Build Manifest Reference
description: Detailed documentation on the structure of Esmx framework's build manifest file (manifest.json), covering build artifact management, export file mapping, and resource statistics to help developers understand and utilize the build system.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Build Manifest, Resource Management, Build Artifacts, File Mapping, API
---

# ManifestJson

`manifest.json` is a manifest file generated during the build process of the Esmx framework, used to record information about service build artifacts. It provides a unified interface for managing build artifacts, exported files, and resource size statistics.

```json title="dist/client/manifest.json"
{
  "name": "your-app-name",
  "exports": {
    "src/entry.client": "src/entry.client.8537e1c3.final.mjs",
    "src/title/index": "src/title/index.2d79c0c2.final.mjs"
  },
  "buildFiles": [
    "src/entry.client.2e0a89bc.final.css",
    "images/cat.ed79ef6b.final.jpeg",
    "chunks/830.63b8fd4f.final.css",
    "images/running-dog.76197e20.final.gif",
    "chunks/473.42c1ae75.final.mjs",
    "images/starry.d914a632.final.jpg",
    "images/sun.429a7bc5.final.png",
    "chunks/473.63b8fd4f.final.css",
    "images/logo.3923d727.final.svg",
    "chunks/534.63b8fd4f.final.css",
    "src/title/index.2d79c0c2.final.mjs",
    "src/entry.client.8537e1c3.final.mjs",
    "chunks/534.e85c5440.final.mjs",
    "chunks/830.cdbdf067.final.mjs"
  ],
  "chunks": {
    "your-app-name@src/views/home.ts": {
      "js": "chunks/534.e85c5440.final.mjs",
      "css": ["chunks/534.63b8fd4f.final.css"],
      "resources": [
        "images/cat.ed79ef6b.final.jpeg",
        "images/logo.3923d727.final.svg",
        "images/running-dog.76197e20.final.gif",
        "images/starry.d914a632.final.jpg",
        "images/sun.429a7bc5.final.png"
      ],
      "sizes": {
        "js": 7976,
        "css": 5739,
        "resource": 796974
      }
    }
  }
}
```

## Type Definitions
### ManifestJson

```ts
interface ManifestJson {
  name: string;
  exports: Record<string, string>;
  buildFiles: string[];
  chunks: Record<string, ManifestJsonChunks>;
}
```

#### name

- **Type**: `string`

Service name, derived from EsmxOptions.name configuration.

#### exports

- **Type**: `Record<string, string>`

Mapping of exported files, where the key is the source file path and the value is the built file path.

#### buildFiles

- **Type**: `string[]`

Complete list of build artifacts, containing all generated file paths.

#### chunks

- **Type**: `Record<string, ManifestJsonChunks>`

Correspondence between source files and compiled artifacts, where the key is the source file path and the value is compilation information.

### ManifestJsonChunks

```ts
interface ManifestJsonChunks {
  js: string;
  css: string[];
  resources: string[];
  sizes: ManifestJsonChunkSizes;
}
```

#### js

- **Type**: `string`

Path to the compiled JS file for the current source file.

#### css

- **Type**: `string[]`

List of CSS file paths associated with the current source file.

#### resources

- **Type**: `string[]`

List of other resource file paths associated with the current source file.

#### sizes

- **Type**: `ManifestJsonChunkSizes`

Size statistics of build artifacts.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Type**: `number`

JS file size (in bytes).

#### css

- **Type**: `number`

CSS file size (in bytes).

#### resource

- **Type**: `number`

Resource file size (in bytes).