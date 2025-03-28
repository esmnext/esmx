---
titleSuffix: Esmx フレームワーク ビルドマニフェストファイルリファレンス
description: Esmx フレームワークのビルドマニフェストファイル（manifest.json）の構造について詳しく説明します。ビルド成果物の管理、エクスポートファイルのマッピング、リソース統計機能などを含み、開発者がビルドシステムを理解し使用するのに役立ちます。
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, ビルドマニフェスト, リソース管理, ビルド成果物, ファイルマッピング, API
---

# ManifestJson

`manifest.json` は、Esmx フレームワークのビルドプロセス中に生成されるマニフェストファイルで、サービスのビルド成果物情報を記録します。ビルド成果物、エクスポートファイル、リソースサイズ統計を管理するための統一されたインターフェースを提供します。

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

## 型定義
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

- **型**: `string`

サービス名。EsmxOptions.name 設定から取得されます。

#### exports

- **型**: `Record<string, string>`

外部にエクスポートするファイルのマッピング関係。key はソースファイルのパス、value はビルド後のファイルパスです。

#### buildFiles

- **型**: `string[]`

ビルド成果物の完全なファイルリスト。生成されたすべてのファイルパスを含みます。

#### chunks

- **型**: `Record<string, ManifestJsonChunks>`

ソースファイルとコンパイル成果物の対応関係。key はソースファイルのパス、value はコンパイル情報です。

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

- **型**: `string`

現在のソースファイルがコンパイルされた後の JS ファイルのパス。

#### css

- **型**: `string[]`

現在のソースファイルに関連する CSS ファイルのパスリスト。

#### resources

- **型**: `string[]`

現在のソースファイルに関連するその他のリソースファイルのパスリスト。

#### sizes

- **型**: `ManifestJsonChunkSizes`

ビルド成果物のサイズ統計情報。

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **型**: `number`

JS ファイルのサイズ（バイト単位）。

#### css

- **型**: `number`

CSS ファイルのサイズ（バイト単位）。

#### resource

- **型**: `number`

リソースファイルのサイズ（バイト単位）。