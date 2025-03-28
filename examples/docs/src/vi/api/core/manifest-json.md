---
titleSuffix: Tài liệu tham khảo tệp manifest của khung Esmx
description: Tài liệu chi tiết về cấu trúc tệp manifest (manifest.json) của khung Esmx, bao gồm quản lý sản phẩm build, ánh xạ tệp xuất và thống kê tài nguyên, giúp nhà phát triển hiểu và sử dụng hệ thống build.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Tệp manifest, Quản lý tài nguyên, Sản phẩm build, Ánh xạ tệp, API
---

# ManifestJson

`manifest.json` là tệp manifest được tạo ra trong quá trình build của khung Esmx, dùng để ghi lại thông tin sản phẩm build của dịch vụ. Nó cung cấp một giao diện thống nhất để quản lý sản phẩm build, tệp xuất và thống kê kích thước tài nguyên.

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

## Định nghĩa kiểu
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

- **Kiểu**: `string`

Tên dịch vụ, được lấy từ cấu hình EsmxOptions.name.

#### exports

- **Kiểu**: `Record<string, string>`

Ánh xạ tệp xuất ra ngoài, key là đường dẫn tệp nguồn, value là đường dẫn tệp sau khi build.

#### buildFiles

- **Kiểu**: `string[]`

Danh sách đầy đủ các tệp sản phẩm build, bao gồm tất cả các đường dẫn tệp được tạo ra.

#### chunks

- **Kiểu**: `Record<string, ManifestJsonChunks>`

Mối quan hệ tương ứng giữa tệp nguồn và sản phẩm biên dịch, key là đường dẫn tệp nguồn, value là thông tin biên dịch.

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

- **Kiểu**: `string`

Đường dẫn tệp JS sau khi biên dịch tệp nguồn hiện tại.

#### css

- **Kiểu**: `string[]`

Danh sách đường dẫn tệp CSS liên quan đến tệp nguồn hiện tại.

#### resources

- **Kiểu**: `string[]`

Danh sách đường dẫn tệp tài nguyên khác liên quan đến tệp nguồn hiện tại.

#### sizes

- **Kiểu**: `ManifestJsonChunkSizes`

Thông tin thống kê kích thước sản phẩm build.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Kiểu**: `number`

Kích thước tệp JS (byte).

#### css

- **Kiểu**: `number`

Kích thước tệp CSS (byte).

#### resource

- **Kiểu**: `number`

Kích thước tệp tài nguyên (byte).