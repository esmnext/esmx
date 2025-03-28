---
titleSuffix: Référence du fichier manifeste de construction du framework Esmx
description: Documentation détaillée sur la structure du fichier manifeste de construction (manifest.json) du framework Esmx, incluant la gestion des artefacts de construction, le mappage des fichiers exportés et les statistiques de ressources, pour aider les développeurs à comprendre et utiliser le système de construction.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Manifeste de construction, Gestion des ressources, Artefacts de construction, Mappage de fichiers, API
---

# ManifestJson

`manifest.json` est un fichier manifeste généré par le framework Esmx lors du processus de construction, utilisé pour enregistrer les informations sur les artefacts de construction du service. Il fournit une interface unifiée pour gérer les artefacts de construction, les fichiers exportés et les statistiques de taille des ressources.

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

## Définitions de types
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

- **Type**: `string`

Nom du service, provenant de la configuration EsmxOptions.name.

#### exports

- **Type**: `Record<string, string>`

Relation de mappage des fichiers exportés, où la clé est le chemin du fichier source et la valeur est le chemin du fichier après construction.

#### buildFiles

- **Type**: `string[]`

Liste complète des fichiers des artefacts de construction, incluant tous les chemins de fichiers générés.

#### chunks

- **Type**: `Record<string, ManifestJsonChunks>`

Relation entre les fichiers sources et les artefacts compilés, où la clé est le chemin du fichier source et la valeur est l'information de compilation.

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

- **Type**: `string`

Chemin du fichier JS compilé pour le fichier source actuel.

#### css

- **Type**: `string[]`

Liste des chemins des fichiers CSS associés au fichier source actuel.

#### resources

- **Type**: `string[]`

Liste des chemins des autres fichiers de ressources associés au fichier source actuel.

#### sizes

- **Type**: `ManifestJsonChunkSizes`

Informations sur la taille des artefacts de construction.

### ManifestJsonChunkSizes

```ts
interface ManifestJsonChunkSizes {
  js: number;
  css: number;
  resource: number;
}
```

#### js

- **Type**: `number`

Taille du fichier JS (en octets).

#### css

- **Type**: `number`

Taille du fichier CSS (en octets).

#### resource

- **Type**: `number`

Taille des fichiers de ressources (en octets).