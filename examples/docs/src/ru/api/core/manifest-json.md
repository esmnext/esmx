---
titleSuffix: Справочник по файлу манифеста сборки Esmx
description: Подробное описание структуры файла манифеста сборки (manifest.json) в фреймворке Esmx, включая управление артефактами сборки, отображение экспортируемых файлов и статистику ресурсов, чтобы помочь разработчикам понять и использовать систему сборки.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, манифест сборки, управление ресурсами, артефакты сборки, отображение файлов, API
---

# ManifestJson

`manifest.json` — это файл манифеста, генерируемый фреймворком Esmx в процессе сборки, который используется для записи информации о результатах сборки сервиса. Он предоставляет унифицированный интерфейс для управления артефактами сборки, экспортируемыми файлами и статистикой размеров ресурсов.

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

## Определение типов
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

- **Тип**: `string`

Имя сервиса, взятое из конфигурации EsmxOptions.name.

#### exports

- **Тип**: `Record<string, string>`

Отображение экспортируемых файлов, где ключ — это путь к исходному файлу, а значение — путь к собранному файлу.

#### buildFiles

- **Тип**: `string[]`

Полный список файлов артефактов сборки, включающий пути ко всем сгенерированным файлам.

#### chunks

- **Тип**: `Record<string, ManifestJsonChunks>`

Соответствие между исходными файлами и скомпилированными артефактами, где ключ — это путь к исходному файлу, а значение — информация о компиляции.

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

- **Тип**: `string`

Путь к JS-файлу, скомпилированному из текущего исходного файла.

#### css

- **Тип**: `string[]`

Список путей к CSS-файлам, связанным с текущим исходным файлом.

#### resources

- **Тип**: `string[]`

Список путей к другим ресурсам, связанным с текущим исходным файлом.

#### sizes

- **Тип**: `ManifestJsonChunkSizes`

Статистика размеров артефактов сборки.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Тип**: `number`

Размер JS-файла (в байтах).

#### css

- **Тип**: `number`

Размер CSS-файла (в байтах).

#### resource

- **Тип**: `number`

Размер ресурсного файла (в байтах).