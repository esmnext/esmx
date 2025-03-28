---
titleSuffix: Esmx Framework Bouwmanifest Bestandsreferentie
description: Gedetailleerde uitleg over de structuur van het bouwmanifestbestand (manifest.json) van het Esmx-framework, inclusief beheer van bouwproducten, bestandsmapping en bronstatistieken, om ontwikkelaars te helpen het bouwsysteem te begrijpen en te gebruiken.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Bouwmanifest, Bronbeheer, Bouwproducten, Bestandsmapping, API
---

# ManifestJson

`manifest.json` is een manifestbestand dat door het Esmx-framework wordt gegenereerd tijdens het bouwproces. Het wordt gebruikt om informatie over de bouwproducten van de service vast te leggen. Het biedt een uniforme interface voor het beheren van bouwproducten, exportbestanden en bronstatistieken.

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

## Type Definitie
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

De servicenaam, afkomstig van de EsmxOptions.name configuratie.

#### exports

- **Type**: `Record<string, string>`

De mapping van exportbestanden, waarbij de key het pad van het bronbestand is en de value het pad van het gebouwde bestand.

#### buildFiles

- **Type**: `string[]`

De volledige lijst van bouwproducten, inclusief alle gegenereerde bestandspaden.

#### chunks

- **Type**: `Record<string, ManifestJsonChunks>`

De relatie tussen bronbestanden en gecompileerde producten, waarbij de key het pad van het bronbestand is en de value de compilatie-informatie.

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

Het pad van het gecompileerde JS-bestand voor het huidige bronbestand.

#### css

- **Type**: `string[]`

De lijst met CSS-bestandspaden die aan het huidige bronbestand zijn gekoppeld.

#### resources

- **Type**: `string[]`

De lijst met andere bronbestandspaden die aan het huidige bronbestand zijn gekoppeld.

#### sizes

- **Type**: `ManifestJsonChunkSizes`

Statistieken over de grootte van de bouwproducten.

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

De grootte van het JS-bestand (in bytes).

#### css

- **Type**: `number`

De grootte van het CSS-bestand (in bytes).

#### resource

- **Type**: `number`

De grootte van het bronbestand (in bytes).