---
titleSuffix: Guide d'implémentation du rendu côté client avec le framework Esmx
description: Détaille le mécanisme de rendu côté client du framework Esmx, incluant la construction statique, les stratégies de déploiement et les meilleures pratiques, pour aider les développeurs à réaliser un rendu front-end efficace dans un environnement sans serveur.
head:
  - - meta
    - property: keywords
      content: Esmx, rendu côté client, CSR, construction statique, rendu front-end, déploiement sans serveur, optimisation des performances
---

# Rendu côté client

Le rendu côté client (Client-Side Rendering, CSR) est une technique d'exécution du rendu des pages côté navigateur. Avec Esmx, lorsque votre application ne peut pas déployer une instance de serveur Node.js, vous pouvez choisir de générer un fichier `index.html` statique lors de la phase de construction, pour réaliser un rendu purement côté client.

## Cas d'utilisation

Les scénarios suivants recommandent l'utilisation du rendu côté client :

- **Environnements d'hébergement statique** : tels que GitHub Pages, CDN, etc., qui ne supportent pas le rendu côté serveur
- **Applications simples** : petites applications où la vitesse de chargement initiale et le SEO ne sont pas des priorités
- **Environnement de développement** : pour prévisualiser et déboguer rapidement l'application pendant le développement

## Configuration

### Configuration du modèle HTML

En mode rendu côté client, vous devez configurer un modèle HTML générique. Ce modèle servira de conteneur pour l'application, incluant les références nécessaires aux ressources et le point de montage.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Soumission de la collecte des dépendances
    await rc.commit();
    
    // Configuration du modèle HTML
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Préchargement des ressources
    <title>Esmx</title>
    ${rc.css()}               // Injection des styles
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Mappage des imports
    ${rc.moduleEntry()}       // Module d'entrée
    ${rc.modulePreload()}     // Préchargement des modules
</body>
</html>
`;
};
```

### Génération de HTML statique

Pour utiliser le rendu côté client en production, il est nécessaire de générer un fichier HTML statique lors de la phase de construction. Esmx fournit une fonction de rappel `postBuild` pour réaliser cette fonctionnalité :

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Génération du fichier HTML statique
        const rc = await esmx.render();
        // Écriture du fichier HTML
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```