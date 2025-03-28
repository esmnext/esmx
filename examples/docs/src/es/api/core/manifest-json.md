---
titleSuffix: Referencia del archivo de manifiesto de construcción del framework Esmx
description: Descripción detallada de la estructura del archivo de manifiesto de construcción (manifest.json) del framework Esmx, incluyendo la gestión de artefactos de construcción, mapeo de archivos exportados y estadísticas de recursos, para ayudar a los desarrolladores a comprender y utilizar el sistema de construcción.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Manifiesto de construcción, Gestión de recursos, Artefactos de construcción, Mapeo de archivos, API
---

# ManifestJson

`manifest.json` es un archivo de manifiesto generado por el framework Esmx durante el proceso de construcción, utilizado para registrar la información de los artefactos generados en la construcción del servicio. Proporciona una interfaz unificada para gestionar los artefactos de construcción, los archivos exportados y las estadísticas de tamaño de los recursos.

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

## Definición de tipos
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

- **Tipo**: `string`

Nombre del servicio, proviene de la configuración EsmxOptions.name.

#### exports

- **Tipo**: `Record<string, string>`

Relación de mapeo de archivos exportados, donde la clave es la ruta del archivo fuente y el valor es la ruta del archivo construido.

#### buildFiles

- **Tipo**: `string[]`

Lista completa de archivos de artefactos de construcción, incluyendo todas las rutas de archivos generados.

#### chunks

- **Tipo**: `Record<string, ManifestJsonChunks>`

Relación entre los archivos fuente y los artefactos compilados, donde la clave es la ruta del archivo fuente y el valor es la información de compilación.

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

- **Tipo**: `string`

Ruta del archivo JS compilado a partir del archivo fuente actual.

#### css

- **Tipo**: `string[]`

Lista de rutas de archivos CSS asociados al archivo fuente actual.

#### resources

- **Tipo**: `string[]`

Lista de rutas de otros archivos de recursos asociados al archivo fuente actual.

#### sizes

- **Tipo**: `ManifestJsonChunkSizes`

Información de estadísticas de tamaño de los artefactos de construcción.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Tipo**: `number`

Tamaño del archivo JS (en bytes).

#### css

- **Tipo**: `number`

Tamaño del archivo CSS (en bytes).

#### resource

- **Tipo**: `number`

Tamaño del archivo de recursos (en bytes).