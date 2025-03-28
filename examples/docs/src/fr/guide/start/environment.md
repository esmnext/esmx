---
titleSuffix: Guide de compatibilité du framework Esmx
description: Détails sur les exigences environnementales du framework Esmx, y compris les versions requises de Node.js et les informations de compatibilité des navigateurs, pour aider les développeurs à configurer correctement leur environnement de développement.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Compatibilité des navigateurs, TypeScript, es-module-shims, Configuration de l'environnement
---

# Exigences environnementales

Ce document présente les exigences environnementales nécessaires pour utiliser ce framework, y compris l'environnement Node.js et la compatibilité des navigateurs.

## Environnement Node.js

Le framework nécessite une version de Node.js >= 22.6, principalement pour supporter l'importation de types TypeScript (via le flag `--experimental-strip-types`), sans étape de compilation supplémentaire.

## Compatibilité des navigateurs

Le framework est construit par défaut en mode de compatibilité pour supporter une large gamme de navigateurs. Cependant, pour une compatibilité complète des navigateurs, il est nécessaire d'ajouter manuellement la dépendance [es-module-shims](https://github.com/guybedford/es-module-shims).

### Mode de compatibilité (par défaut)
- 🌐 Chrome : >= 87
- 🔷 Edge : >= 88
- 🦊 Firefox : >= 78
- 🧭 Safari : >= 14

Selon les statistiques de [Can I Use](https://caniuse.com/?search=dynamic%20import), le taux de couverture des navigateurs en mode de compatibilité est de 96,81 %.

### Mode de support natif
- 🌐 Chrome : >= 89
- 🔷 Edge : >= 89
- 🦊 Firefox : >= 108
- 🧭 Safari : >= 16.4

Le mode de support natif offre les avantages suivants :
- Aucun surcoût d'exécution, pas besoin de chargeur de modules supplémentaire
- Analyse native par le navigateur, vitesse d'exécution plus rapide
- Meilleure capacité de découpage de code et de chargement à la demande

Selon les statistiques de [Can I Use](https://caniuse.com/?search=importmap), le taux de couverture des navigateurs en mode de support natif est de 93,5 %.

### Activation du support de compatibilité

::: warning Avertissement important
Bien que le framework soit construit par défaut en mode de compatibilité, pour un support complet des anciens navigateurs, vous devez ajouter la dépendance [es-module-shims](https://github.com/guybedford/es-module-shims) à votre projet.

:::

Ajoutez le script suivant dans votre fichier HTML :

```html
<!-- Environnement de développement -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Environnement de production -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Bonnes pratiques

1. Recommandations pour l'environnement de production :
   - Déployez es-module-shims sur votre propre serveur
   - Assurez la stabilité et la vitesse de chargement des ressources
   - Évitez les risques de sécurité potentiels
2. Considérations de performance :
   - Le mode de compatibilité entraîne un léger surcoût de performance
   - Vous pouvez décider de l'activer en fonction de la distribution des navigateurs de votre public cible

:::