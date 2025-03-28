---
titleSuffix: Vue d'ensemble du framework Esmx et innovations technologiques
description: Découvrez en profondeur le contexte du projet, l'évolution technologique et les avantages clés du framework de micro-frontend Esmx, et explorez une solution moderne de rendu côté serveur basée sur ESM.
head:
  - - meta
    - property: keywords
      content: Esmx, micro-frontend, ESM, rendu côté serveur, SSR, innovation technologique, module federation
---

# Introduction

## Contexte du projet
Esmx est un framework moderne de micro-frontend basé sur ECMAScript Modules (ESM), axé sur la construction d'applications de rendu côté serveur (SSR) hautes performances et extensibles. En tant que troisième génération du projet Genesis, Esmx a continuellement innové au cours de son évolution technologique :

- **v1.0** : Chargement à la demande de composants distants basé sur des requêtes HTTP
- **v2.0** : Intégration d'applications basée sur Webpack Module Federation
- **v3.0** : Redesign du système de [liaison de modules](/guide/essentials/module-link) basé sur ESM natif du navigateur

## Contexte technologique
Dans le développement de l'architecture de micro-frontend, les solutions traditionnelles présentent principalement les limites suivantes :

### Défis des solutions existantes
- **Goulot d'étranglement de performance** : L'injection de dépendances à l'exécution et le proxy de sandbox JavaScript entraînent des surcoûts de performance significatifs
- **Mécanisme d'isolation** : Les environnements de sandbox maison ont du mal à égaler les capacités d'isolation de modules natifs du navigateur
- **Complexité de construction** : Les modifications des outils de construction pour partager les dépendances augmentent les coûts de maintenance du projet
- **Déviation des standards** : Les stratégies de déploiement spéciales et les mécanismes de traitement à l'exécution s'écartent des standards modernes de développement Web
- **Limites de l'écosystème** : Le couplage des frameworks et les API personnalisées limitent le choix de la pile technologique

### Innovations technologiques
Esmx propose une nouvelle solution basée sur les standards Web modernes :

- **Système de modules natif** : Utilisation d'ESM natif du navigateur et d'Import Maps pour la gestion des dépendances, offrant une vitesse d'analyse et d'exécution plus rapide
- **Mécanisme d'isolation standard** : Isolation fiable des applications basée sur la portée des modules ECMAScript
- **Pile technologique ouverte** : Support de l'intégration transparente de n'importe quel framework frontend moderne
- **Optimisation de l'expérience de développement** : Fournit un mode de développement intuitif et des capacités de débogage complètes
- **Optimisation des performances extrêmes** : Réalisation de zéro surcoût à l'exécution grâce aux capacités natives, avec une stratégie de cache intelligente

:::tip
Esmx se concentre sur la création d'une infrastructure de micro-frontend haute performance et facilement extensible, particulièrement adaptée aux scénarios d'applications de rendu côté serveur à grande échelle.
:::

## Spécifications techniques

### Dépendances environnementales
Veuillez consulter le document [Exigences environnementales](/guide/start/environment) pour connaître les exigences détaillées du navigateur et de l'environnement Node.js.

### Pile technologique principale
- **Gestion des dépendances** : Utilisation d'[Import Maps](https://caniuse.com/?search=import%20map) pour le mappage des modules, avec [es-module-shims](https://github.com/guybedford/es-module-shims) pour la compatibilité
- **Système de construction** : Traitement des dépendances externes basé sur [module-import](https://rspack.dev/config/externals#externalstypemodule-import) de Rspack
- **Chaîne d'outils de développement** : Support de la mise à jour à chaud ESM et de l'exécution native de TypeScript

## Positionnement du framework
Esmx diffère de [Next.js](https://nextjs.org) ou [Nuxt.js](https://nuxt.com/), en se concentrant sur la fourniture d'une infrastructure de micro-frontend :

- **Système de liaison de modules** : Réalisation d'une importation/exportation de modules efficace et fiable
- **Rendu côté serveur** : Fournit un mécanisme de mise en œuvre flexible du SSR
- **Support du système de types** : Intégration de définitions de types TypeScript complètes
- **Neutralité du framework** : Support de l'intégration des principaux frameworks frontend

## Conception de l'architecture

### Gestion centralisée des dépendances
- **Source de dépendances unifiée** : Gestion centralisée des dépendances tierces
- **Distribution automatique** : Synchronisation globale automatique des mises à jour des dépendances
- **Cohérence des versions** : Contrôle précis des versions des dépendances

### Conception modulaire
- **Séparation des responsabilités** : Découplage de la logique métier et de l'infrastructure
- **Mécanisme de plugins** : Support de la combinaison et du remplacement flexibles des modules
- **Interface standardisée** : Protocole de communication normalisé entre les modules

### Optimisation des performances
- **Principe de zéro surcoût** : Maximisation de l'utilisation des capacités natives du navigateur
- **Cache intelligent** : Stratégie de cache précise basée sur le hachage du contenu
- **Chargement à la demande** : Gestion fine de la segmentation du code et des dépendances

## Maturité du projet
Esmx, à travers près de 5 ans d'itérations et d'évolutions (de v1.0 à v3.0), a été largement validé dans des environnements d'entreprise. Il supporte actuellement des dizaines de projets métiers en fonctionnement stable et continue de promouvoir la modernisation de la pile technologique. La stabilité, la fiabilité et les avantages en termes de performance du framework ont été pleinement vérifiés dans la pratique, fournissant une base technologique fiable pour le développement d'applications à grande échelle.