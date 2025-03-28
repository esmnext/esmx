---
titleSuffix: Guide de structure et de normes du projet Esmx
description: Détaille la structure standard du projet Esmx, les normes des fichiers d'entrée et de configuration, aidant les développeurs à construire des applications SSR normalisées et maintenables.
head:
  - - meta
    - property: keywords
      content: Esmx, structure de projet, fichier d'entrée, normes de configuration, framework SSR, TypeScript, normes de projet, standards de développement
---

# Normes standards

Esmx est un framework SSR moderne qui adopte une structure de projet standardisée et un mécanisme de résolution de chemins pour garantir la cohérence et la maintenabilité du projet dans les environnements de développement et de production.

## Normes de structure de projet

### Structure de répertoire standard

```txt
root
│─ dist                  # Répertoire de sortie de compilation
│  ├─ package.json       # Configuration du package après compilation
│  ├─ server             # Sortie de compilation côté serveur
│  │  └─ manifest.json   # Sortie du manifeste de compilation, utilisé pour générer l'importmap
│  ├─ node               # Sortie de compilation du programme serveur Node
│  ├─ client             # Sortie de compilation côté client
│  │  ├─ versions        # Répertoire de stockage des versions
│  │  │  └─ latest.tgz   # Archive du répertoire dist, fournissant une distribution du package
│  │  └─ manifest.json   # Sortie du manifeste de compilation, utilisé pour générer l'importmap
│  └─ src                # Fichiers générés par tsc
├─ src
│  ├─ entry.server.ts    # Point d'entrée de l'application serveur
│  ├─ entry.client.ts    # Point d'entrée de l'application client
│  └─ entry.node.ts      # Point d'entrée du programme serveur Node
├─ tsconfig.json         # Configuration TypeScript
└─ package.json          # Configuration du package
```

::: tip Connaissances supplémentaires
- `esmx.name` provient du champ `name` dans `package.json`
- `dist/package.json` provient du `package.json` à la racine
- Le répertoire `dist` est archivé uniquement lorsque `packs.enable` est défini sur `true`

:::

## Normes des fichiers d'entrée

### entry.client.ts
Le fichier d'entrée client est responsable de :
- **Initialisation de l'application** : Configuration des paramètres de base de l'application client
- **Gestion des routes** : Gestion des routes et de la navigation côté client
- **Gestion d'état** : Stockage et mise à jour de l'état côté client
- **Gestion des interactions** : Gestion des événements utilisateurs et des interactions de l'interface

### entry.server.ts
Le fichier d'entrée serveur est responsable de :
- **Rendu côté serveur (SSR)** : Exécution du processus de rendu SSR
- **Génération HTML** : Construction de la structure initiale de la page
- **Pré-récupération des données** : Gestion de la récupération des données côté serveur
- **Injection d'état** : Transfert de l'état serveur au client
- **Optimisation SEO** : Assurance de l'optimisation pour les moteurs de recherche

### entry.node.ts
Le fichier d'entrée du serveur Node.js est responsable de :
- **Configuration du serveur** : Définition des paramètres du serveur HTTP
- **Gestion des routes** : Gestion des règles de routage côté serveur
- **Intégration des middlewares** : Configuration des middlewares du serveur
- **Gestion de l'environnement** : Gestion des variables d'environnement et des configurations
- **Gestion des requêtes/réponses** : Traitement des requêtes et réponses HTTP

## Normes des fichiers de configuration

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```