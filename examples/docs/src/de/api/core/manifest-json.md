---
titleSuffix: Esmx Framework Build Manifest Dateireferenz
description: Detaillierte Beschreibung der Struktur der Build-Manifest-Datei (manifest.json) des Esmx Frameworks, einschließlich Build-Artefaktverwaltung, Exportdateizuordnung und Ressourcenstatistik, um Entwicklern das Verständnis und die Nutzung des Build-Systems zu erleichtern.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Build-Manifest, Ressourcenverwaltung, Build-Artefakte, Dateizuordnung, API
---

# ManifestJson

`manifest.json` ist eine vom Esmx Framework während des Build-Prozesses generierte Manifest-Datei, die Informationen über die Build-Artefakte eines Dienstes erfasst. Sie bietet eine einheitliche Schnittstelle zur Verwaltung von Build-Artefakten, Exportdateien und Ressourcengrößenstatistiken.

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

## Typdefinitionen
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

Der Name des Dienstes, stammt aus der EsmxOptions.name Konfiguration.

#### exports

- **Typ**: `Record<string, string>`

Die Zuordnung der exportierten Dateien, wobei der Schlüssel der Pfad der Quelldatei und der Wert der Pfad der gebauten Datei ist.

#### buildFiles

- **Typ**: `string[]`

Die vollständige Liste der Build-Artefakte, einschließlich aller generierten Dateipfade.

#### chunks

- **Typ**: `Record<string, ManifestJsonChunks>`

Die Zuordnung zwischen Quelldateien und kompilierten Artefakten, wobei der Schlüssel der Pfad der Quelldatei und der Wert die Kompilierungsinformationen sind.

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

Der Pfad der kompilierten JS-Datei der aktuellen Quelldatei.

#### css

- **Typ**: `string[]`

Die Liste der Pfade der mit der aktuellen Quelldatei verknüpften CSS-Dateien.

#### resources

- **Typ**: `string[]`

Die Liste der Pfade der mit der aktuellen Quelldatei verknüpften Ressourcendateien.

#### sizes

- **Typ**: `ManifestJsonChunkSizes`

Statistische Informationen über die Größe der Build-Artefakte.

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

Die Größe der JS-Datei in Bytes.

#### css

- **Typ**: `number`

Die Größe der CSS-Datei in Bytes.

#### resource

- **Typ**: `number`

Die Größe der Ressourcendatei in Bytes.
```