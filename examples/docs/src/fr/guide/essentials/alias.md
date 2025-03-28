---
titleSuffix: Guide de mappage des chemins d'importation des modules du framework Esmx
description: Détaille le mécanisme d'alias de chemin du framework Esmx, y compris la simplification des chemins d'importation, l'évitement des imbrications profondes, la sécurité des types et l'optimisation de la résolution des modules, aidant les développeurs à améliorer la maintenabilité du code.
head:
  - - meta
    - property: keywords
      content: Esmx, Alias de chemin, Path Alias, TypeScript, Importation de modules, Mappage de chemin, Maintenabilité du code
---

# Alias de chemin

L'alias de chemin (Path Alias) est un mécanisme de mappage des chemins d'importation des modules qui permet aux développeurs d'utiliser des identifiants courts et sémantiques pour remplacer les chemins de module complets. Dans Esmx, le mécanisme d'alias de chemin offre les avantages suivants :

- **Simplification des chemins d'importation** : Utilisation d'alias sémantiques pour remplacer les chemins relatifs longs, améliorant la lisibilité du code
- **Évitement des imbrications profondes** : Élimination des difficultés de maintenance causées par les références à des répertoires multi-niveaux (par exemple `../../../../`)
- **Sécurité des types** : Intégration complète avec le système de types de TypeScript, fournissant la complétion de code et la vérification des types
- **Optimisation de la résolution des modules** : Amélioration des performances de résolution des modules grâce à des mappages de chemins prédéfinis

## Mécanisme d'alias par défaut

Esmx utilise un mécanisme d'alias automatique basé sur le nom du service (Service Name). Cette conception basée sur des conventions plutôt que sur la configuration présente les caractéristiques suivantes :

- **Configuration automatique** : Génération automatique d'alias basée sur le champ `name` dans `package.json`, sans configuration manuelle
- **Uniformité des normes** : Assure que tous les modules de service suivent une norme de nommage et de référence cohérente
- **Support des types** : En combinaison avec la commande `npm run build:dts`, génère automatiquement des fichiers de déclaration de types, permettant une inférence de types entre services
- **Prédictibilité** : Permet de déduire le chemin de référence d'un module à partir du nom du service, réduisant les coûts de maintenance

## Configuration

### Configuration de package.json

Dans `package.json`, définissez le nom du service via le champ `name`. Ce nom servira de préfixe d'alias par défaut pour le service :

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Configuration de tsconfig.json

Pour que TypeScript puisse correctement résoudre les chemins d'alias, il est nécessaire de configurer le mappage `paths` dans `tsconfig.json` :

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Exemples d'utilisation

### Importation de modules internes au service

```ts
// Utilisation d'un alias pour l'importation
import { MyComponent } from 'your-app-name/src/components';

// Importation équivalente avec un chemin relatif
import { MyComponent } from '../components';
```

### Importation de modules d'autres services

```ts
// Importation d'un composant d'un autre service
import { SharedComponent } from 'other-service/src/components';

// Importation d'une fonction utilitaire d'un autre service
import { utils } from 'other-service/src/utils';
```

::: tip Bonnes pratiques
- Privilégiez les chemins d'alias plutôt que les chemins relatifs
- Maintenez la sémantique et la cohérence des chemins d'alias
- Évitez d'utiliser trop de niveaux de répertoires dans les chemins d'alias

:::

``` ts
// Importation de composants
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importation de fonctions utilitaires
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importation de définitions de types
import type { UserInfo } from 'your-app-name/src/types';
```

### Importation inter-services

Lorsque la liaison de modules (Module Link) est configurée, vous pouvez importer des modules d'autres services de la même manière :

```ts
// Importation d'un composant d'un service distant
import { Header } from 'remote-service/src/components';

// Importation d'une fonction utilitaire d'un service distant
import { logger } from 'remote-service/src/utils';
```

### Alias personnalisés

Pour les packages tiers ou des scénarios spécifiques, vous pouvez personnaliser les alias via le fichier de configuration de Esmx :

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configuration d'une version spécifique de Vue pour la construction
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configuration d'alias courts pour des répertoires fréquemment utilisés
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Remarques
1. Pour les modules métier, il est recommandé de toujours utiliser le mécanisme d'alias par défaut pour maintenir la cohérence du projet
2. Les alias personnalisés sont principalement utilisés pour gérer des besoins spécifiques de packages tiers ou pour optimiser l'expérience de développement
3. Une utilisation excessive d'alias personnalisés peut affecter la maintenabilité du code et l'optimisation de la construction

:::