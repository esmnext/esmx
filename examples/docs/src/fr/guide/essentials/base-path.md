---
titleSuffix: Guide de configuration des chemins des ressources statiques dans le framework Esmx
description: Détaille la configuration du chemin de base dans le framework Esmx, y compris le déploiement multi-environnements, la distribution CDN et la configuration des chemins d'accès aux ressources, aidant les développeurs à gérer de manière flexible les ressources statiques.
head:
  - - meta
    - property: keywords
      content: Esmx, chemin de base, Base Path, CDN, ressources statiques, déploiement multi-environnements, gestion des ressources
---

# Chemin de base

Le chemin de base (Base Path) est le préfixe du chemin d'accès aux ressources statiques (comme JavaScript, CSS, images, etc.) dans une application. Dans Esmx, une configuration appropriée du chemin de base est cruciale pour les scénarios suivants :

- **Déploiement multi-environnements** : supporte l'accès aux ressources dans différents environnements tels que développement, test et production
- **Déploiement multi-régions** : s'adapte aux besoins de déploiement en cluster dans différentes régions ou pays
- **Distribution CDN** : permet la distribution et l'accélération globales des ressources statiques

## Mécanisme de chemin par défaut

Esmx utilise un mécanisme de génération automatique de chemin basé sur le nom du service. Par défaut, le framework lit le champ `name` du fichier `package.json` du projet pour générer le chemin de base des ressources statiques : `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Cette conception basée sur la convention plutôt que la configuration présente les avantages suivants :

- **Cohérence** : garantit que toutes les ressources statiques utilisent un chemin d'accès uniforme
- **Prédictibilité** : permet de déduire le chemin d'accès des ressources à partir du champ `name` du fichier `package.json`
- **Maintenabilité** : ne nécessite aucune configuration supplémentaire, réduisant les coûts de maintenance

## Configuration dynamique du chemin

Dans les projets réels, nous devons souvent déployer le même code dans différents environnements ou régions. Esmx offre un support pour les chemins de base dynamiques, permettant à l'application de s'adapter à différents scénarios de déploiement.

### Cas d'utilisation

#### Déploiement dans un sous-répertoire
```
- example.com      -> site principal par défaut
- example.com/cn/  -> site en chinois
- example.com/en/  -> site en anglais
```

#### Déploiement sur des domaines indépendants
```
- example.com    -> site principal par défaut
- cn.example.com -> site en chinois
- en.example.com -> site en anglais
```

### Méthode de configuration

Grâce au paramètre `base` de la méthode `esmx.render()`, vous pouvez définir dynamiquement le chemin de base en fonction du contexte de la requête :

```ts
const render = await esmx.render({
    base: '/cn',  // définir le chemin de base
    params: {
        url: req.url
    }
});
```