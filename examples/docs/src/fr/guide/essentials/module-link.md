---
titleSuffix: Mécanisme de partage de code entre services dans le framework Esmx
description: Détaille le mécanisme de liaison de modules du framework Esmx, y compris le partage de code entre services, la gestion des dépendances et l'implémentation de la spécification ESM, aidant les développeurs à construire des applications micro-frontend efficaces.
head:
  - - meta
    - property: keywords
      content: Esmx, liaison de modules, Module Link, ESM, partage de code, gestion des dépendances, micro-frontend
---

# Liaison de modules

Le framework Esmx fournit un mécanisme complet de liaison de modules pour gérer le partage de code et les dépendances entre services. Ce mécanisme est basé sur la spécification ESM (ECMAScript Module), supportant l'exportation et l'importation de modules au niveau du code source, ainsi qu'une gestion complète des dépendances.

### Concepts clés

#### Exportation de modules
L'exportation de modules est le processus d'exposition d'unités de code spécifiques (comme des composants, des fonctions utilitaires, etc.) d'un service au format ESM. Deux types d'exportation sont supportés :
- **Exportation de code source** : Exportation directe des fichiers de code source du projet
- **Exportation de dépendances** : Exportation des packages de dépendances tiers utilisés par le projet

#### Liaison de modules
L'importation de modules est le processus de référencement d'unités de code exportées par d'autres services dans un service. Plusieurs méthodes d'installation sont supportées :
- **Installation de code source** : Adaptée à l'environnement de développement, supporte les modifications en temps réel et la mise à jour à chaud
- **Installation de package** : Adaptée à l'environnement de production, utilise directement les artefacts de construction

## Exportation de modules

### Configuration

Configurez les modules à exporter dans `entry.node.ts` :

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // Exporter des fichiers de code source
            'root:src/components/button.vue',  // Composant Vue
            'root:src/utils/format.ts',        // Fonction utilitaire
            // Exporter des dépendances tiers
            'npm:vue',                         // Framework Vue
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

La configuration d'exportation supporte deux types :
- `root:*` : Exporter des fichiers de code source, chemin relatif à la racine du projet
- `npm:*` : Exporter des dépendances tiers, spécifiez directement le nom du package

## Importation de modules

### Configuration

Configurez les modules à importer dans `entry.node.ts` :

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Configuration des liens
        links: {
            // Installation de code source : pointe vers le répertoire des artefacts de construction
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Installation de package : pointe vers le répertoire du package
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Configuration des importations
        imports: {
            // Utiliser les dépendances du module distant
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

Explication des options de configuration :
1. **imports** : Configure le chemin local des modules distants
   - Installation de code source : pointe vers le répertoire des artefacts de construction (dist)
   - Installation de package : pointe directement vers le répertoire du package

2. **externals** : Configure les dépendances externes
   - Utilisé pour partager les dépendances des modules distants
   - Évite de dupliquer les mêmes dépendances
   - Supporte le partage de dépendances entre plusieurs modules

### Méthodes d'installation

#### Installation de code source
Adaptée à l'environnement de développement, supporte les modifications en temps réel et la mise à jour à chaud.

1. **Méthode Workspace**
Recommandé pour les projets Monorepo :
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Méthode Link**
Utilisé pour le débogage local :
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Installation de package
Adaptée à l'environnement de production, utilise directement les artefacts de construction.

1. **NPM Registry**
Installation via npm registry :
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Serveur statique**
Installation via le protocole HTTP/HTTPS :
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Construction de packages

### Configuration

Configurez les options de construction dans `entry.node.ts` :

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // Configuration d'exportation de modules
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Configuration de construction
    pack: {
        // Activer la construction
        enable: true,

        // Configuration des sorties
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Personnalisation de package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Pré-traitement avant construction
        onBefore: async (esmx, pkg) => {
            // Générer des déclarations de type
            // Exécuter des tests
            // Mettre à jour la documentation, etc.
        },

        // Post-traitement après construction
        onAfter: async (esmx, pkg, file) => {
            // Téléverser sur CDN
            // Publier sur le dépôt npm
            // Déployer sur l'environnement de test, etc.
        }
    }
} satisfies EsmxOptions;
```

### Artefacts de construction

```
your-app-name.tgz
├── package.json        # Informations du package
├── index.js            # Point d'entrée pour l'environnement de production
├── server/             # Ressources côté serveur
│   └── manifest.json   # Mappage des ressources côté serveur
├── node/               # Runtime Node.js
└── client/             # Ressources côté client
    └── manifest.json   # Mappage des ressources côté client
```

### Processus de publication

```bash
# 1. Construire la version de production
esmx build

# 2. Publier sur npm
npm publish dist/versions/your-app-name.tgz
```