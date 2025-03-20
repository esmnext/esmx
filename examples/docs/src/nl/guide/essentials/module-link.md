```markdown
---
titleSuffix: Gez Framework Service Inter-Code Sharing Mechanism
description: Gedetailleerde uitleg over de module linking mechanisme van het Gez framework, inclusief service inter-code sharing, dependency management en ESM specificatie implementatie, om ontwikkelaars te helpen efficiënte micro-frontend applicaties te bouwen.
head:
  - - meta
    - property: keywords
      content: Gez, Module Linking, Module Link, ESM, Code Sharing, Dependency Management, Micro-frontend
---

# Module Linking

Het Gez framework biedt een compleet module linking mechanisme voor het beheren van code sharing en afhankelijkheden tussen services. Dit mechanisme is gebaseerd op de ESM (ECMAScript Module) specificatie en ondersteunt module export en import op broncode niveau, evenals volledige dependency management functionaliteit.

### Kernconcepten

#### Module Export
Module export is het proces waarbij specifieke code eenheden (zoals componenten, utility functies, etc.) vanuit een service worden blootgesteld in ESM formaat. Er worden twee export types ondersteund:
- **Broncode Export**: Directe export van broncode bestanden uit het project
- **Dependency Export**: Export van gebruikte third-party dependency packages

#### Module Linking
Module import is het proces waarbij code eenheden die door andere services zijn geëxporteerd, worden geïmporteerd in een service. Er worden meerdere installatiemethoden ondersteund:
- **Broncode Installatie**: Geschikt voor ontwikkelomgevingen, ondersteunt real-time wijzigingen en hot updates
- **Package Installatie**: Geschikt voor productieomgevingen, maakt direct gebruik van build artifacts

## Module Export

### Configuratie Uitleg

Configureer de te exporteren modules in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Exporteer broncode bestanden
            'root:src/components/button.vue',  // Vue component
            'root:src/utils/format.ts',        // Utility functie
            // Exporteer third-party dependencies
            'npm:vue',                         // Vue framework
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

Export configuratie ondersteunt twee types:
- `root:*`: Exporteer broncode bestanden, pad relatief ten opzichte van de project root directory
- `npm:*`: Exporteer third-party dependencies, specificeer direct de package naam

## Module Import

### Configuratie Uitleg

Configureer de te importeren modules in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Link configuratie
        links: {
            // Broncode installatie: wijs naar de build artifact directory
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Package installatie: wijs naar de package directory
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Import mapping instellingen
        imports: {
            // Gebruik dependencies van remote modules
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Configuratie uitleg:
1. **imports**: Configureer lokale paden voor remote modules
   - Broncode installatie: wijs naar de build artifact directory (dist)
   - Package installatie: wijs direct naar de package directory

2. **externals**: Configureer externe dependencies
   - Gebruikt voor het delen van dependencies tussen remote modules
   - Voorkomt dubbele bundeling van dezelfde dependencies
   - Ondersteunt het delen van dependencies tussen meerdere modules

### Installatie Methoden

#### Broncode Installatie
Geschikt voor ontwikkelomgevingen, ondersteunt real-time wijzigingen en hot updates.

1. **Workspace Methode**
Aanbevolen voor gebruik in Monorepo projecten:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link Methode**
Gebruikt voor lokale ontwikkeling en debugging:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Package Installatie
Geschikt voor productieomgevingen, maakt direct gebruik van build artifacts.

1. **NPM Registry**
Installatie via npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Statische Server**
Installatie via HTTP/HTTPS protocol:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Package Bouwen

### Configuratie Uitleg

Configureer de build opties in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // Module export configuratie
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Build configuratie
    pack: {
        // Schakel build in
        enable: true,

        // Output configuratie
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Aangepaste package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Pre-build verwerking
        onBefore: async (gez, pkg) => {
            // Genereer type declaraties
            // Voer test cases uit
            // Update documentatie, etc.
        },

        // Post-build verwerking
        onAfter: async (gez, pkg, file) => {
            // Upload naar CDN
            // Publiceer naar npm repository
            // Deploy naar testomgeving, etc.
        }
    }
} satisfies GezOptions;
```

### Build Artifacts

```
your-app-name.tgz
├── package.json        # Package informatie
├── index.js            # Productie omgeving entry
├── server/             # Server resources
│   └── manifest.json   # Server resource mapping
├── node/               # Node.js runtime
└── client/             # Client resources
    └── manifest.json   # Client resource mapping
```

### Publicatie Proces

```bash
# 1. Bouw productie versie
gez build

# 2. Publiceer naar npm
npm publish dist/versions/your-app-name.tgz
```
```