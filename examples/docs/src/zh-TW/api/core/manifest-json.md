---
titleSuffix: Esmx 框架建構清單檔案參考
description: 詳細介紹 Esmx 框架的建構清單檔案（manifest.json）結構，包括建構產物管理、匯出檔案映射和資源統計功能，幫助開發者理解和使用建構系統。
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, 建構清單, 資源管理, 建構產物, 檔案映射, API
---

# ManifestJson

`manifest.json` 是 Esmx 框架在建構過程中產生的清單檔案，用於記錄服務建構的產物資訊。它提供了統一的介面來管理建構產物、匯出檔案和資源大小統計。

```json title="dist/client/manifest.json"
{
  "name": "your-app-name",
  "exports": {
    "src/entry.client": "src/entry.client.8537e1c3.final.js",
    "src/title/index": "src/title/index.2d79c0c2.final.js"
  },
  "buildFiles": [
    "src/entry.client.2e0a89bc.final.css",
    "images/cat.ed79ef6b.final.jpeg",
    "chunks/830.63b8fd4f.final.css",
    "images/running-dog.76197e20.final.gif",
    "chunks/473.42c1ae75.final.js",
    "images/starry.d914a632.final.jpg",
    "images/sun.429a7bc5.final.png",
    "chunks/473.63b8fd4f.final.css",
    "images/logo.3923d727.final.svg",
    "chunks/534.63b8fd4f.final.css",
    "src/title/index.2d79c0c2.final.js",
    "src/entry.client.8537e1c3.final.js",
    "chunks/534.e85c5440.final.js",
    "chunks/830.cdbdf067.final.js"
  ],
  "chunks": {
    "your-app-name@src/views/home.ts": {
      "js": "chunks/534.e85c5440.final.js",
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

## 類型定義
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

- **類型**: `string`

服務名稱，來自於 EsmxOptions.name 配置。

#### exports

- **類型**: `Record<string, string>`

對外匯出的檔案映射關係，key 為原始檔案路徑，value 為建構後的檔案路徑。

#### buildFiles

- **類型**: `string[]`

建構產物的完整檔案清單，包含所有產生的檔案路徑。

#### chunks

- **類型**: `Record<string, ManifestJsonChunks>`

原始檔案與編譯產物的對應關係，key 為原始檔案路徑，value 為編譯資訊。

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

- **類型**: `string`

當前原始檔案編譯後的 JS 檔案路徑。

#### css

- **類型**: `string[]`

當前原始檔案關聯的 CSS 檔案路徑列表。

#### resources

- **類型**: `string[]`

當前原始檔案關聯的其它資源檔案路徑列表。

#### sizes

- **類型**: `ManifestJsonChunkSizes`

建構產物的大小統計資訊。

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **類型**: `number`

JS 檔案大小（位元組）。

#### css

- **類型**: `number`

CSS 檔案大小（位元組）。

#### resource

- **類型**: `number`

資源檔案大小（位元組）。