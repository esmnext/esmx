---
titleSuffix: Référence de l'API de configuration des modules du framework Gez
description: Documentation détaillée de l'interface de configuration ModuleConfig du framework Gez, incluant les règles d'import/export de modules, la configuration des alias et la gestion des dépendances externes, pour aider les développeurs à comprendre en profondeur le système de modularité du framework.
head:
  - - meta
    - property: keywords
      content: Gez, ModuleConfig, configuration de modules, import/export de modules, dépendances externes, configuration d'alias, gestion des dépendances, framework d'application Web
---

# ModuleConfig

ModuleConfig fournit les fonctionnalités de configuration des modules du framework Gez, permettant de définir les règles d'import/export de modules, la configuration des alias et les dépendances externes.

## Définitions de types

### PathType

- **Définition de type**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Énumération des types de chemins de modules :
- `npm`: représente une dépendance dans node_modules
- `root`: représente un fichier à la racine du projet

### ModuleConfig

- **Définition de type**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Interface de configuration des modules, utilisée pour définir l'export, l'import et la configuration des dépendances externes d'un service.

#### exports

Liste de configuration des exports, exposant des unités de code spécifiques (comme des composants, des fonctions utilitaires, etc.) d'un service au format ESM.

Deux types sont supportés :
- `root:*`: exporte un fichier source, par exemple : `root:src/components/button.vue`
- `npm:*`: exporte une dépendance tierce, par exemple : `npm:vue`

Chaque élément d'export contient les propriétés suivantes :
- `name`: chemin d'export original, par exemple : `npm:vue` ou `root:src/components`
- `type`: type de chemin (`npm` ou `root`)
- `importName`: nom d'import, format : `${serviceName}/${type}/${path}`
- `exportName`: chemin d'export, relatif à la racine du service
- `exportPath`: chemin réel du fichier
- `externalName`: nom de la dépendance externe, utilisé comme identifiant lors de l'import de ce module par d'autres services

#### links

Mappage de configuration des dépendances de service, utilisé pour configurer les autres services (locaux ou distants) dont dépend le service actuel et leurs chemins locaux. La clé de chaque élément de configuration est le nom du service, et la valeur est le chemin local de ce service.

La configuration varie selon le mode d'installation :
- Installation à partir du code source (Workspace, Git) : doit pointer vers le répertoire dist, car les fichiers construits sont nécessaires
- Installation via paquet (Link, serveur statique, miroir privé, File) : pointe directement vers le répertoire du paquet, car celui-ci contient déjà les fichiers construits

#### imports

Mappage des dépendances externes, configurant les dépendances externes à utiliser, généralement des dépendances provenant de modules distants.

Chaque dépendance contient les propriétés suivantes :
- `match`: expression régulière utilisée pour faire correspondre les instructions d'import
- `import`: chemin réel du module

**Exemple** :
```ts title="entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
  modules: {
    // Configuration des exports
    exports: [
      'root:src/components/button.vue',  // Exporte un fichier source
      'root:src/utils/format.ts',
      'npm:vue',  // Exporte une dépendance tierce
      'npm:vue-router'
    ],

    // Configuration des imports
    links: {
      // Mode d'installation à partir du code source : doit pointer vers le répertoire dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Mode d'installation via paquet : pointe directement vers le répertoire du paquet
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Configuration des dépendances externes
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies GezOptions;
```

### ParsedModuleConfig

- **Définition de type**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Nom du paquet
     */
    name: string
    /**
     * Répertoire racine du paquet
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Configuration de module analysée, convertissant la configuration de module originale en un format interne standardisé :

#### name
Nom du service actuel
- Utilisé pour identifier le module et générer les chemins d'import

#### root
Chemin du répertoire racine du service actuel
- Utilisé pour résoudre les chemins relatifs et le stockage des artefacts de construction

#### exports
Liste de configuration des exports
- `name`: chemin d'export original, par exemple : 'npm:vue' ou 'root:src/components'
- `type`: type de chemin (npm ou root)
- `importName`: nom d'import, format : '${serviceName}/${type}/${path}'
- `exportName`: chemin d'export, relatif à la racine du service
- `exportPath`: chemin réel du fichier
- `externalName`: nom de la dépendance externe, utilisé comme identifiant lors de l'import de ce module par d'autres services

#### links
Liste de configuration des imports
- `name`: nom du paquet
- `root`: répertoire racine du paquet

#### imports
Mappage des dépendances externes
- Mappe les chemins d'import des modules vers leur emplacement réel
- `match`: expression régulière utilisée pour faire correspondre les instructions d'import
- `import`: chemin réel du module
```