---
titleSuffix: Exemple d'application HTML SSR avec le framework Gez
description: Créez une application HTML SSR basée sur Gez à partir de zéro. Ce tutoriel montre les bases du framework à travers un exemple complet, incluant l'initialisation du projet, la configuration HTML et la configuration des fichiers d'entrée.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, Application SSR, Configuration TypeScript, Initialisation de projet, Rendu côté serveur, Interaction côté client
---

# HTML

Ce tutoriel vous guidera dans la création d'une application HTML SSR basée sur Gez à partir de zéro. Nous allons utiliser un exemple complet pour montrer comment utiliser le framework Gez pour créer une application avec rendu côté serveur.

## Structure du projet

Commençons par comprendre la structure de base du projet :

```bash
.
├── package.json         # Fichier de configuration du projet, définissant les dépendances et les scripts
├── tsconfig.json        # Fichier de configuration TypeScript, définissant les options de compilation
└── src                  # Répertoire des sources
    ├── app.ts           # Composant principal de l'application, définissant la structure de la page et la logique d'interaction
    ├── create-app.ts    # Factory de création d'instance d'application, responsable de l'initialisation de l'application
    ├── entry.client.ts  # Fichier d'entrée côté client, gérant le rendu côté navigateur
    ├── entry.node.ts    # Fichier d'entrée du serveur Node.js, responsable de la configuration de l'environnement de développement et du démarrage du serveur
    └── entry.server.ts  # Fichier d'entrée côté serveur, gérant la logique de rendu SSR
```

## Configuration du projet

### package.json

Créez le fichier `package.json` pour configurer les dépendances et les scripts du projet :

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

Après avoir créé le fichier `package.json`, vous devez installer les dépendances du projet. Vous pouvez utiliser l'une des commandes suivantes pour l'installation :
```bash
pnpm install
# ou
yarn install
# ou
npm install
```

Cela installera tous les paquets nécessaires, y compris TypeScript et les dépendances liées au SSR.

### tsconfig.json

Créez le fichier `tsconfig.json` pour configurer les options de compilation TypeScript :

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Structure des sources

### app.ts

Créez le composant principal de l'application `src/app.ts`, implémentant la structure de la page et la logique d'interaction :

```ts title="src/app.ts"
/**
 * @file Composant d'exemple
 * @description Affiche un titre de page avec une mise à jour automatique de l'heure, pour démontrer les fonctionnalités de base du framework Gez
 */

export default class App {
    /**
     * Heure actuelle, au format ISO
     * @type {string}
     */
    public time = '';

    /**
     * Crée une instance de l'application
     * @param {SsrContext} [ssrContext] - Contexte côté serveur, contenant un ensemble de métadonnées d'importation
     */
    public constructor(public ssrContext?: SsrContext) {
        // Aucune initialisation supplémentaire nécessaire dans le constructeur
    }

    /**
     * Rend le contenu de la page
     * @returns {string} Retourne la structure HTML de la page
     */
    public render(): string {
        // Assurez-vous de collecter correctement les métadonnées d'importation dans un environnement côté serveur
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Démarrage rapide avec Gez</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Initialisation côté client
     * @throws {Error} Lance une erreur si l'élément d'affichage de l'heure est introuvable
     */
    public onClient(): void {
        // Récupère l'élément d'affichage de l'heure
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Élément d\'affichage de l\'heure introuvable');
        }

        // Définit un minuteur pour mettre à jour l'heure chaque seconde
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Initialisation côté serveur
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Interface de contexte côté serveur
 * @interface
 */
export interface SsrContext {
    /**
     * Ensemble de métadonnées d'importation
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Créez le fichier `src/create-app.ts`, responsable de la création de l'instance de l'application :

```ts title="src/create-app.ts"
/**
 * @file Création d'instance d'application
 * @description Responsable de la création et de la configuration de l'instance de l'application
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

Créez le fichier d'entrée côté client `src/entry.client.ts` :

```ts title="src/entry.client.ts"
/**
 * @file Fichier d'entrée côté client
 * @description Responsable de la logique d'interaction côté client et des mises à jour dynamiques
 */

import { createApp } from './create-app';

// Crée une instance de l'application et l'initialise
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Créez le fichier `entry.node.ts`, configurant l'environnement de développement et le démarrage du serveur :

```ts title="src/entry.node.ts"
/**
 * @file Fichier d'entrée du serveur Node.js
 * @description Responsable de la configuration de l'environnement de développement et du démarrage du serveur, fournissant un environnement d'exécution SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configure le créateur d'application pour l'environnement de développement
     * @description Crée et configure une instance d'application Rspack pour la construction et la mise à jour en temps réel dans l'environnement de développement
     * @param gez Instance du framework Gez, fournissant des fonctionnalités de base et des interfaces de configuration
     * @returns Retourne une instance d'application Rspack configurée, prenant en charge HMR et la prévisualisation en temps réel
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Personnalisez ici la configuration de compilation Rspack
                }
            })
        );
    },

    /**
     * Configure et démarre le serveur HTTP
     * @description Crée une instance de serveur HTTP, intègre le middleware Gez, et traite les requêtes SSR
     * @param gez Instance du framework Gez, fournissant des fonctionnalités de middleware et de rendu
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Utilise le middleware Gez pour traiter les requêtes
            gez.middleware(req, res, async () => {
                // Exécute le rendu côté serveur
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Serveur démarré : http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Ce fichier est le point d'entrée pour la configuration de l'environnement de développement et le démarrage du serveur, contenant deux fonctionnalités principales :

1. Fonction `devApp` : Responsable de la création et de la configuration de l'instance d'application Rspack pour l'environnement de développement, prenant en charge la mise à jour en temps réel et la prévisualisation.
2. Fonction `server` : Responsable de la création et de la configuration du serveur HTTP, intégrant le middleware Gez pour traiter les requêtes SSR.

### entry.server.ts

Créez le fichier d'entrée pour le rendu côté serveur `src/entry.server.ts` :

```ts title="src/entry.server.ts"
/**
 * @file Fichier d'entrée pour le rendu côté serveur
 * @description Responsable du processus de rendu côté serveur, de la génération HTML et de l'injection des ressources
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Encapsule la logique de génération du contenu de la page
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Injecte le contexte de rendu côté serveur dans l'instance de l'application
    app.ssrContext = ssrContext;
    // Initialise le côté serveur
    app.onServer();

    // Génère le contenu de la page
    return app.render();
};

export default async (rc: RenderContext) => {
    // Crée une instance de l'application, retourne un objet contenant l'instance app
    const { app } = createApp();
    // Utilise renderToString pour générer le contenu de la page
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Soumet la collecte des dépendances, assurant que toutes les ressources nécessaires sont chargées
    await rc.commit();

    // Génère la structure HTML complète
    rc.html = `<!DOCTYPE html>
<html lang="fr">
<head>
    ${rc.preload()}
    <title>Démarrage rapide avec Gez</title>
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

## Exécution du projet

Après avoir configuré les fichiers ci-dessus, vous pouvez utiliser les commandes suivantes pour exécuter le projet :

1. Mode développement :
```bash
npm run dev
```

2. Construction du projet :
```bash
npm run build
```

3. Exécution en production :
```bash
npm run start
```

Vous avez maintenant créé avec succès une application HTML SSR basée sur Gez ! Visitez http://localhost:3000 pour voir le résultat.