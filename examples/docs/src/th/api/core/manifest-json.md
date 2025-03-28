---
titleSuffix: Esmx Framework Build Manifest File Reference
description: Detailed explanation of the build manifest file (manifest.json) structure in Esmx framework, including build artifact management, export file mapping, and resource statistics, helping developers understand and use the build system.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Build Manifest, Resource Management, Build Artifacts, File Mapping, API
---

# ManifestJson

`manifest.json` เป็นไฟล์รายการที่สร้างขึ้นในกระบวนการ build ของเฟรมเวิร์ค Esmx ใช้สำหรับบันทึกข้อมูลผลลัพธ์ของการ build บริการ ไฟล์นี้ให้อินเทอร์เฟซที่มาตรฐานสำหรับการจัดการผลลัพธ์ build, ไฟล์ที่ export และสถิติขนาดทรัพยากร

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

## นิยามประเภท
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

- **ประเภท**: `string`

ชื่อบริการ มาจากการกำหนดค่า EsmxOptions.name

#### exports

- **ประเภท**: `Record<string, string>`

ความสัมพันธ์การแมปไฟล์ที่ export ออกไป โดย key คือ path ของไฟล์ต้นฉบับ และ value คือ path ของไฟล์หลัง build

#### buildFiles

- **ประเภท**: `string[]`

รายการไฟล์ผลลัพธ์ build ที่สมบูรณ์ ประกอบด้วย path ของไฟล์ทั้งหมดที่สร้างขึ้น

#### chunks

- **ประเภท**: `Record<string, ManifestJsonChunks>`

ความสัมพันธ์ระหว่างไฟล์ต้นฉบับกับผลลัพธ์การ compile โดย key คือ path ของไฟล์ต้นฉบับ และ value คือข้อมูลการ compile

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

- **ประเภท**: `string`

path ของไฟล์ JS ที่ compile จากไฟล์ต้นฉบับปัจจุบัน

#### css

- **ประเภท**: `string[]`

รายการ path ของไฟล์ CSS ที่เกี่ยวข้องกับไฟล์ต้นฉบับปัจจุบัน

#### resources

- **ประเภท**: `string[]`

รายการ path ของไฟล์ทรัพยากรอื่นๆ ที่เกี่ยวข้องกับไฟล์ต้นฉบับปัจจุบัน

#### sizes

- **ประเภท**: `ManifestJsonChunkSizes`

ข้อมูลสถิติขนาดของผลลัพธ์ build

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **ประเภท**: `number`

ขนาดไฟล์ JS (หน่วย: ไบต์)

#### css

- **ประเภท**: `number`

ขนาดไฟล์ CSS (หน่วย: ไบต์)

#### resource

- **ประเภท**: `number`

ขนาดไฟล์ทรัพยากร (หน่วย: ไบต์)