---
titleSuffix: Riferimento del file di manifestazione del framework Esmx
description: Descrizione dettagliata della struttura del file di manifestazione (manifest.json) del framework Esmx, inclusa la gestione degli artefatti di build, il mapping dei file esportati e le funzionalità di statistica delle risorse, per aiutare gli sviluppatori a comprendere e utilizzare il sistema di build.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Manifestazione di build, Gestione delle risorse, Artefatti di build, Mapping dei file, API
---

# ManifestJson

`manifest.json` è un file di manifestazione generato durante il processo di build del framework Esmx, utilizzato per registrare le informazioni sugli artefatti di build del servizio. Fornisce un'interfaccia unificata per gestire gli artefatti di build, i file esportati e le statistiche sulle dimensioni delle risorse.

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

## Definizione dei tipi
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

Nome del servizio, derivato dalla configurazione EsmxOptions.name.

#### exports

- **Tipo**: `Record<string, string>`

Mapping dei file esportati, dove la chiave è il percorso del file sorgente e il valore è il percorso del file dopo la build.

#### buildFiles

- **Tipo**: `string[]`

Elenco completo dei file degli artefatti di build, che include tutti i percorsi dei file generati.

#### chunks

- **Tipo**: `Record<string, ManifestJsonChunks>`

Relazione tra i file sorgente e gli artefatti compilati, dove la chiave è il percorso del file sorgente e il valore sono le informazioni di compilazione.

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

Percorso del file JS compilato per il file sorgente corrente.

#### css

- **Tipo**: `string[]`

Elenco dei percorsi dei file CSS associati al file sorgente corrente.

#### resources

- **Tipo**: `string[]`

Elenco dei percorsi delle altre risorse associate al file sorgente corrente.

#### sizes

- **Tipo**: `ManifestJsonChunkSizes`

Informazioni sulle dimensioni degli artefatti di build.

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

Dimensione del file JS (in byte).

#### css

- **Tipo**: `number`

Dimensione del file CSS (in byte).

#### resource

- **Tipo**: `number`

Dimensione delle risorse (in byte).