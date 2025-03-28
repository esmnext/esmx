---
titleSuffix: "Des défis des micro-frontends à l'innovation ESM : L'évolution du framework Esmx"
description: Une exploration approfondie de l'évolution du framework Esmx, des défis de l'architecture traditionnelle des micro-frontends aux innovations basées sur ESM, partageant les expériences techniques en matière d'optimisation des performances, de gestion des dépendances et de choix d'outils de construction.
head:
  - - meta
    - property: keywords
      content: Esmx, framework de micro-frontends, ESM, Import Maps, Rspack, Module Federation, gestion des dépendances, optimisation des performances, évolution technique, rendu côté serveur
sidebar: false
---

# Du partage de composants à la modularité native : L'évolution du framework de micro-frontends Esmx

## Contexte du projet

Au cours des dernières années, l'architecture des micro-frontends a cherché à trouver la bonne voie. Cependant, nous avons été témoins de diverses solutions techniques complexes qui, à travers des couches d'emballage et d'isolation artificielle, tentent de simuler un monde idéal de micro-frontends. Ces solutions ont entraîné une lourde charge de performance, rendant le développement simple complexe et les processus standard obscurs.

### Limites des solutions traditionnelles

Dans la pratique de l'architecture des micro-frontends, nous avons profondément ressenti les nombreuses limitations des solutions traditionnelles :

- **Perte de performance** : L'injection de dépendances à l'exécution, le proxy du bac à sable JS, chaque opération consomme des performances précieuses.
- **Isolation fragile** : L'environnement de bac à sable artificiellement créé ne peut jamais atteindre la capacité d'isolation native du navigateur.
- **Complexité de construction** : Pour gérer les relations de dépendance, il a fallu modifier les outils de construction, rendant les projets simples difficiles à maintenir.
- **Règles de personnalisation** : Les stratégies de déploiement spéciales, le traitement à l'exécution, chaque étape s'écarte des processus de développement modernes standard.
- **Limites de l'écosystème** : Le couplage des frameworks, les API personnalisées, forcent le choix technologique à se lier à un écosystème spécifique.

Ces problèmes ont été particulièrement évidents dans un projet d'entreprise en 2019. À l'époque, un grand produit a été divisé en une dizaine de sous-systèmes métiers indépendants, qui devaient partager un ensemble de composants de base et de composants métiers. La solution initiale de partage de composants basée sur des paquets npm a révélé de graves problèmes d'efficacité de maintenance : lorsque les composants partagés étaient mis à jour, tous les sous-systèmes dépendant de ces composants devaient subir un processus complet de construction et de déploiement.

## Évolution technique

### v1.0 : Exploration des composants distants

Pour résoudre le problème d'efficacité du partage de composants, Esmx v1.0 a introduit un mécanisme de composants RemoteView basé sur le protocole HTTP. Cette solution a permis l'assemblage à la demande du code entre les services via des requêtes dynamiques à l'exécution, résolvant ainsi le problème de la chaîne de dépendances de construction trop longue. Cependant, en raison du manque de mécanisme de communication standardisé à l'exécution, la synchronisation des états et la transmission des événements entre les services restaient inefficaces.

### v2.0 : Tentative de Module Federation

Dans la version v2.0, nous avons adopté la technologie de [Module Federation](https://webpack.js.org/concepts/module-federation/) de [Webpack 5.0](https://webpack.js.org/). Cette technologie, grâce à un mécanisme de chargement de modules unifié et à un conteneur d'exécution, a considérablement amélioré l'efficacité de la collaboration entre les services. Cependant, dans la pratique à grande échelle, le mécanisme de mise en œuvre fermé de Module Federation a posé de nouveaux défis : il était difficile de gérer précisément les versions des dépendances, en particulier lors de l'unification des dépendances partagées entre plusieurs services, où des conflits de version et des anomalies d'exécution étaient fréquents.

## Embrasser l'ère nouvelle de l'ESM

Lors de la planification de la version v3.0, nous avons observé en profondeur les tendances de développement de l'écosystème frontend et constaté que les progrès des capacités natives des navigateurs offraient de nouvelles possibilités pour l'architecture des micro-frontends :

### Système de modules standardisé

Avec le support complet des [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) par les principaux navigateurs et la maturité de la spécification [Import Maps](https://github.com/WICG/import-maps), le développement frontend est entré dans une véritable ère de modularité. Selon les statistiques de [Can I Use](https://caniuse.com/?search=importmap), le taux de support natif de l'ESM par les principaux navigateurs (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) a atteint 93.5%, ce qui nous offre les avantages suivants :

- **Gestion des dépendances standardisée** : Import Maps fournit la capacité de résolution des dépendances de modules au niveau du navigateur, sans injection complexe à l'exécution.
- **Optimisation du chargement des ressources** : Le mécanisme de cache natif des modules du navigateur améliore considérablement l'efficacité du chargement des ressources.
- **Simplification du processus de construction** : Le mode de développement basé sur ESM rend les processus de construction des environnements de développement et de production plus cohérents.

En outre, grâce au support du mode de compatibilité (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), nous pouvons augmenter encore la couverture des navigateurs à 96.81%, ce qui nous permet de maintenir des performances élevées tout en ne sacrifiant pas le support des anciens navigateurs.

### Percées en matière de performance et d'isolation

Le système de modules natif apporte non seulement la standardisation, mais aussi une amélioration qualitative de la performance et de l'isolation :

- **Aucun surcoût à l'exécution** : Adieu au proxy de bac à sable JavaScript et à l'injection à l'exécution des solutions traditionnelles de micro-frontends.
- **Mécanisme d'isolation fiable** : La portée stricte des modules ESM fournit naturellement la capacité d'isolation la plus fiable.
- **Gestion précise des dépendances** : L'analyse statique des importations rend les relations de dépendance plus claires et le contrôle des versions plus précis.

### Choix des outils de construction

Dans la mise en œuvre de la solution technique, le choix des outils de construction a été un point de décision clé. Après près d'un an de recherche technique et de pratique, notre choix a évolué comme suit :

1. **Exploration de Vite**
   - Avantage : Serveur de développement basé sur ESM, offrant une expérience de développement ultime.
   - Défi : Les différences de construction entre les environnements de développement et de production introduisent une certaine incertitude.

2. **Établissement de [Rspack](https://www.rspack.dev/)**
   - Avantage de performance : Compilation haute performance basée sur [Rust](https://www.rust-lang.org/), améliorant considérablement la vitesse de construction.
   - Support de l'écosystème : Haute compatibilité avec l'écosystème Webpack, réduisant les coûts de migration.
   - Support ESM : La pratique du projet Rslib a validé sa fiabilité dans la construction ESM.

Cette décision nous a permis de maintenir une expérience de développement tout en obtenant un support plus stable pour l'environnement de production. Basé sur la combinaison d'ESM et de Rspack, nous avons finalement construit une solution de micro-frontends haute performance et peu intrusive.

## Perspectives futures

Dans le plan de développement futur, le framework Esmx se concentrera sur les trois directions suivantes :

### Optimisation approfondie d'Import Maps

- **Gestion dynamique des dépendances** : Mise en œuvre d'une planification intelligente des versions des dépendances à l'exécution, résolvant les conflits de dépendances entre plusieurs applications.
- **Stratégie de préchargement** : Préchargement intelligent basé sur l'analyse des routes, améliorant l'efficacité du chargement des ressources.
- **Optimisation de la construction** : Génération automatique de la configuration optimale d'Import Maps, réduisant les coûts de configuration manuelle pour les développeurs.

### Solution de routage indépendante du framework

- **Abstraction de routage unifiée** : Conception d'une interface de routage indépendante du framework, supportant Vue, React et d'autres frameworks populaires.
- **Routage des micro-applications** : Mise en œuvre de l'interaction des routes entre les applications, maintenant la cohérence entre l'URL et l'état de l'application.
- **Middleware de routage** : Fourniture d'un mécanisme de middleware extensible, supportant le contrôle des permissions, les transitions de page, etc.

### Meilleures pratiques de communication inter-frameworks

- **Application exemple** : Fourniture d'un exemple complet de communication inter-frameworks, couvrant Vue, React, Preact et d'autres frameworks populaires.
- **Synchronisation des états** : Solution légère de partage d'état basée sur ESM.
- **Bus d'événements** : Mécanisme de communication d'événements standardisé, supportant la communication découplée entre les applications.

Grâce à ces optimisations et extensions, nous espérons faire de Esmx une solution de micro-frontends plus complète et facile à utiliser, offrant aux développeurs une meilleure expérience de développement et une efficacité accrue.