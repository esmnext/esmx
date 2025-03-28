---
titleSuffix: Moteur de construction haute performance du framework Esmx
description: Une analyse approfondie du système de construction Rspack du framework Esmx, incluant des fonctionnalités clés telles que la compilation haute performance, la construction multi-environnements, l'optimisation des ressources, etc., pour aider les développeurs à construire des applications Web modernes efficaces et fiables.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, système de construction, compilation haute performance, mise à jour à chaud, construction multi-environnements, Tree Shaking, découpage de code, SSR, optimisation des ressources, efficacité de développement, outils de construction
---

# Rspack

Esmx est basé sur le système de construction [Rspack](https://rspack.dev/), exploitant pleinement les capacités de construction haute performance de Rspack. Ce document présente le positionnement et les fonctionnalités clés de Rspack dans le framework Esmx.

## Fonctionnalités

Rspack est le système de construction central du framework Esmx, offrant les fonctionnalités clés suivantes :

- **Construction haute performance** : Moteur de construction implémenté en Rust, offrant des performances de compilation extrêmement rapides, améliorant significativement la vitesse de construction des projets de grande envergure.
- **Optimisation de l'expérience de développement** : Prend en charge des fonctionnalités modernes de développement telles que la mise à jour à chaud (HMR) et la compilation incrémentale, offrant une expérience de développement fluide.
- **Construction multi-environnements** : Configuration de construction unifiée prenant en charge les environnements client (client), serveur (server) et Node.js (node), simplifiant le processus de développement multi-plateformes.
- **Optimisation des ressources** : Capacités intégrées de traitement et d'optimisation des ressources, prenant en charge le découpage de code, Tree Shaking, la compression des ressources, etc.

## Construction d'applications

Le système de construction Rspack de Esmx est conçu de manière modulaire, comprenant principalement les modules suivants :

### @esmx/rspack

Module de construction de base, offrant les capacités suivantes :

- **Configuration de construction unifiée** : Fournit une gestion standardisée de la configuration de construction, prenant en charge les configurations multi-environnements.
- **Traitement des ressources** : Capacités intégrées de traitement des ressources telles que TypeScript, CSS, images, etc.
- **Optimisation de la construction** : Fournit des fonctionnalités d'optimisation des performances telles que le découpage de code et Tree Shaking.
- **Serveur de développement** : Intègre un serveur de développement haute performance, prenant en charge HMR.

### @esmx/rspack-vue

Module de construction dédié au framework Vue, offrant :

- **Compilation des composants Vue** : Prend en charge la compilation efficace des composants Vue 2/3.
- **Optimisation SSR** : Optimisations spécifiques pour les scénarios de rendu côté serveur.
- **Améliorations du développement** : Fonctionnalités spécifiques pour l'environnement de développement Vue.

## Processus de construction

Le processus de construction de Esmx se décompose principalement en les étapes suivantes :

1. **Initialisation de la configuration**
   - Chargement de la configuration du projet
   - Fusion des configurations par défaut et utilisateur
   - Ajustement de la configuration en fonction des variables d'environnement

2. **Compilation des ressources**
   - Analyse des dépendances du code source
   - Transformation des différentes ressources (TypeScript, CSS, etc.)
   - Gestion des importations et exportations de modules

3. **Traitement d'optimisation**
   - Exécution du découpage de code
   - Application de Tree Shaking
   - Compression du code et des ressources

4. **Génération de la sortie**
   - Génération des fichiers cibles
   - Sortie des mappages de ressources
   - Génération du rapport de construction

## Bonnes pratiques

### Optimisation de l'environnement de développement

- **Configuration de la compilation incrémentale** : Configurer correctement l'option `cache` pour accélérer la vitesse de construction grâce au cache.
- **Optimisation HMR** : Configurer de manière ciblée la portée de la mise à jour à chaud pour éviter les mises à jour inutiles de modules.
- **Optimisation du traitement des ressources** : Utiliser des configurations de loader appropriées pour éviter les traitements répétés.

### Optimisation de l'environnement de production

- **Stratégie de découpage de code** : Configurer correctement `splitChunks` pour optimiser le chargement des ressources.
- **Compression des ressources** : Activer des configurations de compression appropriées pour équilibrer le temps de construction et la taille des artefacts.
- **Optimisation du cache** : Utiliser des stratégies de hachage de contenu et de cache à long terme pour améliorer les performances de chargement.

## Exemple de configuration

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Configuration de construction personnalisée
                config({ config }) {
                    // Ajouter ici des configurations Rspack personnalisées
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Pour plus de détails sur les API et les options de configuration, veuillez consulter la [documentation de l'API Rspack](/api/app/rspack.html).
:::