---
titleSuffix: Referência do arquivo de manifesto de construção do framework Esmx
description: Detalha a estrutura do arquivo de manifesto de construção (manifest.json) do framework Esmx, incluindo gerenciamento de artefatos de construção, mapeamento de arquivos exportados e estatísticas de recursos, ajudando os desenvolvedores a entender e usar o sistema de construção.
head:
  - - meta
    - property: keywords
      content: Esmx, ManifestJson, Manifesto de Construção, Gerenciamento de Recursos, Artefatos de Construção, Mapeamento de Arquivos, API
---

# ManifestJson

O `manifest.json` é um arquivo de manifesto gerado durante o processo de construção do framework Esmx, usado para registrar informações sobre os artefatos de construção do serviço. Ele fornece uma interface unificada para gerenciar artefatos de construção, arquivos exportados e estatísticas de tamanho de recursos.

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

## Definição de Tipos
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

Nome do serviço, proveniente da configuração EsmxOptions.name.

#### exports

- **Tipo**: `Record<string, string>`

Mapeamento de arquivos exportados, onde a chave é o caminho do arquivo de origem e o valor é o caminho do arquivo após a construção.

#### buildFiles

- **Tipo**: `string[]`

Lista completa de arquivos de artefatos de construção, contendo todos os caminhos de arquivos gerados.

#### chunks

- **Tipo**: `Record<string, ManifestJsonChunks>`

Relação entre arquivos de origem e artefatos compilados, onde a chave é o caminho do arquivo de origem e o valor são as informações de compilação.

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

Caminho do arquivo JS compilado a partir do arquivo de origem atual.

#### css

- **Tipo**: `string[]`

Lista de caminhos de arquivos CSS associados ao arquivo de origem atual.

#### resources

- **Tipo**: `string[]`

Lista de caminhos de outros arquivos de recursos associados ao arquivo de origem atual.

#### sizes

- **Tipo**: `ManifestJsonChunkSizes`

Informações de tamanho dos artefatos de construção.

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

Tamanho do arquivo JS (em bytes).

#### css

- **Tipo**: `number`

Tamanho do arquivo CSS (em bytes).

#### resource

- **Tipo**: `number`

Tamanho do arquivo de recurso (em bytes).