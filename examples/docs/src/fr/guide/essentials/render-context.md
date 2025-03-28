---
titleSuffix: Mécanisme de rendu côté serveur du framework Esmx
description: Détails sur le mécanisme de contexte de rendu (RenderContext) du framework Esmx, incluant la gestion des ressources, la génération de HTML et le système de modules ESM, pour aider les développeurs à comprendre et utiliser la fonctionnalité de rendu côté serveur.
head:
  - - meta
    - property: keywords
      content: Esmx, contexte de rendu, RenderContext, SSR, rendu côté serveur, ESM, gestion des ressources
---

# Contexte de rendu

RenderContext est une classe centrale du framework Esmx, principalement responsable de la gestion des ressources et de la génération de HTML pendant le processus de rendu côté serveur (SSR). Il possède les caractéristiques principales suivantes :

1. **Système de modules basé sur ESM**
   - Utilise la norme moderne ECMAScript Modules
   - Prend en charge l'importation et l'exportation natives de modules
   - Permet une meilleure division du code et un chargement à la demande

2. **Collecte intelligente des dépendances**
   - Collecte dynamiquement les dépendances en fonction du chemin de rendu réel
   - Évite le chargement inutile de ressources
   - Prend en charge les composants asynchrones et l'importation dynamique

3. **Injection précise des ressources**
   - Contrôle strict de l'ordre de chargement des ressources
   - Optimise les performances de chargement de la première page
   - Assure la fiabilité de l'activation côté client (Hydration)

4. **Mécanisme de configuration flexible**
   - Prend en charge la configuration dynamique du chemin de base
   - Fournit plusieurs modes de mappage d'importation
   - S'adapte à différents scénarios de déploiement

## Mode d'utilisation

Dans le framework Esmx, les développeurs n'ont généralement pas besoin de créer directement une instance de RenderContext, mais peuvent obtenir une instance via la méthode `esmx.render()` :

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Traitement des fichiers statiques
        esmx.middleware(req, res, async () => {
            // Obtention d'une instance de RenderContext via esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Réponse avec le contenu HTML
            res.end(rc.html);
        });
    });
}
```

## Fonctionnalités principales

### Collecte des dépendances

RenderContext implémente un mécanisme intelligent de collecte des dépendances, basé sur les composants réellement rendus pour collecter dynamiquement les dépendances, plutôt que de précharger simplement toutes les ressources potentielles :

#### Collecte à la demande
- Suit et enregistre automatiquement les dépendances des modules pendant le rendu des composants
- Ne collecte que les ressources CSS, JavaScript, etc., réellement utilisées lors du rendu de la page actuelle
- Enregistre avec précision les relations de dépendance des modules de chaque composant via `importMetaSet`
- Prend en charge la collecte des dépendances pour les composants asynchrones et l'importation dynamique

#### Traitement automatisé
- Les développeurs n'ont pas besoin de gérer manuellement le processus de collecte des dépendances
- Le framework collecte automatiquement les informations de dépendance lors du rendu des composants
- Traite toutes les ressources collectées via la méthode `commit()`
- Gère automatiquement les problèmes de dépendances circulaires et redondantes

#### Optimisation des performances
- Évite le chargement de modules inutilisés, réduisant significativement le temps de chargement de la première page
- Contrôle précis de l'ordre de chargement des ressources, optimisant les performances de rendu de la page
- Génère automatiquement un mappage d'importation (Import Map) optimal
- Prend en charge les stratégies de préchargement et de chargement à la demande des ressources

### Injection des ressources

RenderContext fournit plusieurs méthodes pour injecter différents types de ressources, chaque méthode étant conçue pour optimiser les performances de chargement des ressources :

- `preload()` : Préchage des ressources CSS et JS, avec prise en charge de la configuration des priorités
- `css()` : Injection des feuilles de style pour la première page, avec prise en charge de l'extraction des CSS critiques
- `importmap()` : Injection du mappage d'importation des modules, avec prise en charge de la résolution dynamique des chemins
- `moduleEntry()` : Injection du module d'entrée côté client, avec prise en charge de la configuration multi-entrées
- `modulePreload()` : Préchargement des dépendances des modules, avec prise en charge des stratégies de chargement à la demande

### Ordre d'injection des ressources

RenderContext contrôle strictement l'ordre d'injection des ressources, cet ordre étant conçu en fonction du fonctionnement des navigateurs et des considérations d'optimisation des performances :

1. Partie head :
   - `preload()` : Préchage des ressources CSS et JS, permettant au navigateur de découvrir et de commencer à charger ces ressources dès que possible
   - `css()` : Injection des feuilles de style pour la première page, assurant que les styles de la page sont en place lors du rendu du contenu

2. Partie body :
   - `importmap()` : Injection du mappage d'importation des modules, définissant les règles de résolution des chemins pour les modules ESM
   - `moduleEntry()` : Injection du module d'entrée côté client, doit être exécuté après importmap
   - `modulePreload()` : Préchargement des dépendances des modules, doit être exécuté après importmap

## Processus de rendu complet

Un processus typique d'utilisation de RenderContext est le suivant :

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Rendu du contenu de la page et collecte des dépendances
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Soumission de la collecte des dépendances
    await rc.commit();
    
    // 3. Génération du HTML complet
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
            ${rc.css()}
        </head>
        <body>
            ${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
```

## Fonctionnalités avancées

### Configuration du chemin de base

RenderContext fournit un mécanisme flexible de configuration dynamique du chemin de base, permettant de définir dynamiquement le chemin de base des ressources statiques lors de l'exécution :

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Définition du chemin de base
    params: {
        url: req.url
    }
});
```

Ce mécanisme est particulièrement utile dans les scénarios suivants :

1. **Déploiement de sites multilingues**
   ```
   domaine.com      → Langue par défaut
   domaine.com/cn/  → Site en chinois
   domaine.com/en/  → Site en anglais
   ```

2. **Applications micro-frontend**
   - Prend en charge le déploiement flexible des sous-applications à différents chemins
   - Facilite l'intégration dans différentes applications principales

### Modes de mappage d'importation

RenderContext propose deux modes de mappage d'importation (Import Map) :

1. **Mode Inline** (par défaut)
   - Intègre directement le mappage d'importation dans le HTML
   - Convient aux petites applications, réduisant les requêtes réseau supplémentaires
   - Disponible immédiatement lors du chargement de la page

2. **Mode JS**
   - Charge le mappage d'importation via un fichier JavaScript externe
   - Convient aux grandes applications, permettant d'utiliser le mécanisme de cache du navigateur
   - Prend en charge la mise à jour dynamique du contenu du mappage

Il est possible de choisir le mode approprié via la configuration :

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Configuration de la fonction d'entrée

RenderContext prend en charge la configuration de la fonction d'entrée pour le rendu côté serveur via `entryName` :

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Spécification de la fonction d'entrée pour mobile
    params: {
        url: req.url
    }
});
```

Ce mécanisme est particulièrement utile dans les scénarios suivants :

1. **Rendu multi-modèles**
   ```ts title="src/entry.server.ts"
   // Fonction d'entrée pour mobile
   export const mobile = async (rc: RenderContext) => {
       // Logique de rendu spécifique au mobile
   };

   // Fonction d'entrée pour desktop
   export const desktop = async (rc: RenderContext) => {
       // Logique de rendu spécifique au desktop
   };
   ```

2. **Tests A/B**
   - Prend en charge l'utilisation de différentes logiques de rendu pour la même page
   - Facilite les expériences utilisateur
   - Permet de basculer facilement entre différentes stratégies de rendu

3. **Besoins de rendu spécifiques**
   - Prend en charge l'utilisation de flux de rendu personnalisés pour certaines pages
   - S'adapte aux besoins d'optimisation des performances pour différents scénarios
   - Permet un contrôle plus fin du rendu

## Bonnes pratiques

1. **Obtention d'une instance de RenderContext**
   - Toujours obtenir une instance via la méthode `esmx.render()`
   - Passer les paramètres appropriés selon les besoins
   - Éviter de créer manuellement des instances

2. **Collecte des dépendances**
   - S'assurer que tous les modules appellent correctement `importMetaSet.add(import.meta)`
   - Appeler immédiatement la méthode `commit()` après le rendu
   - Utiliser judicieusement les composants asynchrones et l'importation dynamique pour optimiser le chargement de la première page

3. **Injection des ressources**
   - Suivre strictement l'ordre d'injection des ressources
   - Ne pas injecter de CSS dans le body
   - S'assurer que importmap est exécuté avant moduleEntry

4. **Optimisation des performances**
   - Utiliser preload pour précharger les ressources critiques
   - Utiliser judicieusement modulePreload pour optimiser le chargement des modules
   - Éviter le chargement inutile de ressources
   - Tirer parti du mécanisme de cache du navigateur pour optimiser les performances de chargement
```