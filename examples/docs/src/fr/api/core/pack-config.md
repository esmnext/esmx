---
titleSuffix: Référence de l'API de configuration de packaging du framework Esmx
description: Documentation détaillée de l'interface de configuration PackConfig du framework Esmx, incluant les règles de packaging des paquets, la configuration de sortie et les hooks de cycle de vie, pour aider les développeurs à mettre en œuvre des processus de construction standardisés.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, packaging de paquets, configuration de build, hooks de cycle de vie, configuration de packaging, framework d'application Web
---

# PackConfig

`PackConfig` est une interface de configuration de packaging de paquets, utilisée pour empaqueter les artefacts de construction d'un service dans un format de paquet npm standard .tgz.

- **Standardisation** : Utilisation du format de packaging .tgz standard de npm
- **Intégrité** : Inclut tous les fichiers nécessaires tels que le code source du module, les déclarations de types et les fichiers de configuration
- **Compatibilité** : Complètement compatible avec l'écosystème npm, supporte les workflows standard de gestion de paquets

## Définition de type

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Active ou désactive la fonctionnalité de packaging. Lorsqu'elle est activée, les artefacts de construction sont empaquetés dans un format de paquet npm standard .tgz.

- Type : `boolean`
- Valeur par défaut : `false`

#### outputs

Spécifie le chemin de sortie du fichier de paquet. Supporte les configurations suivantes :
- `string` : Un seul chemin de sortie, par exemple 'dist/versions/my-app.tgz'
- `string[]` : Plusieurs chemins de sortie, pour générer plusieurs versions simultanément
- `boolean` : true pour utiliser le chemin par défaut 'dist/client/versions/latest.tgz'

#### packageJson

Fonction de rappel pour personnaliser le contenu de package.json. Appelée avant le packaging pour personnaliser le contenu de package.json.

- Paramètres :
  - `esmx: Esmx` - Instance de Esmx
  - `pkg: any` - Contenu original de package.json
- Valeur de retour : `Promise<any>` - Contenu modifié de package.json

Utilisations courantes :
- Modifier le nom et la version du paquet
- Ajouter ou mettre à jour des dépendances
- Ajouter des champs personnalisés
- Configurer les informations de publication

Exemple :
```ts
packageJson: async (esmx, pkg) => {
  // Définir les informations du paquet
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Mon application';

  // Ajouter des dépendances
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Ajouter la configuration de publication
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Fonction de rappel pour les préparatifs avant le packaging.

- Paramètres :
  - `esmx: Esmx` - Instance de Esmx
  - `pkg: Record<string, any>` - Contenu de package.json
- Valeur de retour : `Promise<void>`

Utilisations courantes :
- Ajouter des fichiers supplémentaires (README, LICENSE, etc.)
- Exécuter des tests ou des validations de construction
- Générer de la documentation ou des métadonnées
- Nettoyer les fichiers temporaires

Exemple :
```ts
onBefore: async (esmx, pkg) => {
  // Ajouter de la documentation
  await fs.writeFile('dist/README.md', '# Mon application');
  await fs.writeFile('dist/LICENSE', 'Licence MIT');

  // Exécuter des tests
  await runTests();

  // Générer de la documentation
  await generateDocs();

  // Nettoyer les fichiers temporaires
  await cleanupTempFiles();
}
```

#### onAfter

Fonction de rappel pour le traitement après le packaging. Appelée après la génération du fichier .tgz, pour traiter les artefacts de packaging.

- Paramètres :
  - `esmx: Esmx` - Instance de Esmx
  - `pkg: Record<string, any>` - Contenu de package.json
  - `file: Buffer` - Contenu du fichier empaqueté
- Valeur de retour : `Promise<void>`

Utilisations courantes :
- Publier sur un registre npm (public ou privé)
- Téléverser sur un serveur de ressources statiques
- Gérer les versions
- Déclencher des processus CI/CD

Exemple :
```ts
onAfter: async (esmx, pkg, file) => {
  // Publier sur un registre npm privé
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Téléverser sur un serveur de ressources statiques
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Créer un tag de version
  await createGitTag(pkg.version);

  // Déclencher le processus de déploiement
  await triggerDeploy(pkg.version);
}
```

## Exemple d'utilisation

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configurer les modules à exporter
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Configuration de packaging
  pack: {
    // Activer la fonctionnalité de packaging
    enable: true,

    // Sortir plusieurs versions simultanément
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Personnaliser package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Préparatifs avant le packaging
    onBefore: async (esmx, pkg) => {
      // Ajouter des fichiers nécessaires
      await fs.writeFile('dist/README.md', '# Votre application\n\nDescription des modules exportés...');
      // Exécuter une vérification de type
      await runTypeCheck();
    },

    // Traitement après le packaging
    onAfter: async (esmx, pkg, file) => {
      // Publier sur un registre npm privé
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Ou déployer sur un serveur statique
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```