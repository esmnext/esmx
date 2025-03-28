---
titleSuffix: Esmx Çerçevesi Manifest Dosyası Referansı
description: Esmx çerçevesinin manifest dosyasının (manifest.json) yapısını detaylı olarak açıklar, derleme çıktılarını yönetme, dosya eşleme ve kaynak istatistikleri gibi özellikleri kapsar, geliştiricilerin derleme sistemini anlamasına ve kullanmasına yardımcı olur.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Derleme Manifesti, Kaynak Yönetimi, Derleme Çıktıları, Dosya Eşleme, API
---

# ManifestJson

`manifest.json`, Esmx çerçevesinin derleme sürecinde oluşturulan bir manifest dosyasıdır ve hizmet derleme çıktılarını kaydetmek için kullanılır. Derleme çıktılarını yönetmek, dosyaları dışa aktarmak ve kaynak boyut istatistikleri sağlamak için birleşik bir arayüz sunar.

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

## Tür Tanımları
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

- **Tür**: `string`

Hizmet adı, EsmxOptions.name yapılandırmasından alınır.

#### exports

- **Tür**: `Record<string, string>`

Dışa aktarılan dosyaların eşleme ilişkisi, anahtar kaynak dosya yolu, değer ise derlenmiş dosya yoludur.

#### buildFiles

- **Tür**: `string[]`

Derleme çıktılarının tam dosya listesi, oluşturulan tüm dosya yollarını içerir.

#### chunks

- **Tür**: `Record<string, ManifestJsonChunks>`

Kaynak dosyalar ile derleme çıktıları arasındaki ilişki, anahtar kaynak dosya yolu, değer ise derleme bilgileridir.

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

- **Tür**: `string`

Mevcut kaynak dosyanın derlenmiş JS dosyasının yolu.

#### css

- **Tür**: `string[]`

Mevcut kaynak dosya ile ilişkili CSS dosyalarının yolları.

#### resources

- **Tür**: `string[]`

Mevcut kaynak dosya ile ilişkili diğer kaynak dosyalarının yolları.

#### sizes

- **Tür**: `ManifestJsonChunkSizes`

Derleme çıktılarının boyut istatistikleri.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Tür**: `number`

JS dosyasının boyutu (bayt cinsinden).

#### css

- **Tür**: `number`

CSS dosyasının boyutu (bayt cinsinden).

#### resource

- **Tür**: `number`

Kaynak dosyalarının boyutu (bayt cinsinden).