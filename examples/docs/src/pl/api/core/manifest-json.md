---
titleSuffix: Dokumentacja pliku manifestu frameworku Esmx
description: Szczegółowy opis struktury pliku manifestu (manifest.json) frameworku Esmx, obejmujący zarządzanie artefaktami budowania, mapowanie plików eksportowych oraz statystyki zasobów, aby pomóc programistom w zrozumieniu i wykorzystaniu systemu budowania.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, manifest budowania, zarządzanie zasobami, artefakty budowania, mapowanie plików, API
---

# ManifestJson

`manifest.json` to plik manifestu generowany przez framework Esmx podczas procesu budowania, służący do rejestrowania informacji o artefaktach budowania usługi. Dostarcza ujednoliconego interfejsu do zarządzania artefaktami budowania, plikami eksportowymi oraz statystykami rozmiaru zasobów.

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

## Definicje typów
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

- **Typ**: `string`

Nazwa usługi, pochodząca z konfiguracji EsmxOptions.name.

#### exports

- **Typ**: `Record<string, string>`

Mapowanie plików eksportowych, gdzie klucz to ścieżka do pliku źródłowego, a wartość to ścieżka do pliku po budowaniu.

#### buildFiles

- **Typ**: `string[]`

Pełna lista plików artefaktów budowania, zawierająca wszystkie wygenerowane ścieżki plików.

#### chunks

- **Typ**: `Record<string, ManifestJsonChunks>`

Odpowiedniość między plikami źródłowymi a skompilowanymi artefaktami, gdzie klucz to ścieżka do pliku źródłowego, a wartość to informacje o kompilacji.

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

- **Typ**: `string`

Ścieżka do pliku JS skompilowanego z bieżącego pliku źródłowego.

#### css

- **Typ**: `string[]`

Lista ścieżek do plików CSS powiązanych z bieżącym plikiem źródłowym.

#### resources

- **Typ**: `string[]`

Lista ścieżek do innych plików zasobów powiązanych z bieżącym plikiem źródłowym.

#### sizes

- **Typ**: `ManifestJsonChunkSizes`

Statystyki rozmiaru artefaktów budowania.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Typ**: `number`

Rozmiar pliku JS (w bajtach).

#### css

- **Typ**: `number`

Rozmiar pliku CSS (w bajtach).

#### resource

- **Typ**: `number`

Rozmiar pliku zasobu (w bajtach).