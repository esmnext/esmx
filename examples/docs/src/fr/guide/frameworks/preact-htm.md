---
titleSuffix: Exemple d'application SSR Preact+HTM avec le framework Esmx
description: Créez une application SSR Preact+HTM basée sur Esmx à partir de zéro. Ce tutoriel vous guide à travers l'initialisation du projet, la configuration de Preact et la mise en place des fichiers d'entrée.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, application SSR, configuration TypeScript, initialisation de projet, rendu côté serveur, interaction côté client
---

# Preact+HTM

Ce tutoriel vous guidera dans la création d'une application SSR Preact+HTM basée sur Esmx à partir de zéro. Nous allons utiliser un exemple complet pour montrer comment utiliser le framework Esmx pour créer une application avec rendu côté serveur.

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
    ├── entry.node.ts    # Fichier d'entrée Node.js, responsable de la configuration de l'environnement de développement et du démarrage du serveur
    └── entry.server.ts  # Fichier d'entrée côté serveur, gérant la logique de rendu SSR
```

## Configuration du projet

### package.json

Créez le fichier `package.json` pour configurer les dépendances et les scripts du projet :

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
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

Cela installera tous les packages nécessaires, y compris Preact, HTM, TypeScript et les dépendances liées au SSR.

### tsconfig.json

Créez le fichier `tsconfig.json` pour configurer les options de compilation TypeScript :

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Structure du code source

### app.ts

Créez le composant principal de l'application `src/app.ts`, en utilisant les composants de classe de Preact et HTM :

```ts title="src/app.ts"
/**
 * @file Composant d'exemple
 * @description Affiche un titre de page avec une mise à jour automatique de l'heure, pour démontrer les fonctionnalités de base du framework Esmx
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Démarrage rapide avec Esmx</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Créez le fichier `src/create-app.ts`, responsable de la création de l'instance de l'application :

```ts title="src/create-app.ts"
/**
 * @file Création de l'instance de l'application
 * @description Responsable de la création et de la configuration de l'instance de l'application
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
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

import { render } from 'preact';
import { createApp } from './create-app';

// Créez l'instance de l'application
const { app } = createApp();

// Montez l'instance de l'application
render(app, document.getElementById('app')!);
```

### entry.node.ts

Créez le fichier `entry.node.ts`, configurant l'environnement de développement et le démarrage du serveur :

```ts title="src/entry.node.ts"
/**
 * @file Fichier d'entrée Node.js
 * @description Responsable de la configuration de l'environnement de développement et du démarrage du serveur, fournissant l'environnement d'exécution SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configure le créateur d'application pour l'environnement de développement
     * @description Crée et configure l'instance d'application Rspack pour la construction et la mise à jour en temps réel
     * @param esmx Instance du framework Esmx, fournissant les fonctionnalités de base et les interfaces de configuration
     * @returns Retourne l'instance d'application Rspack configurée, prenant en charge HMR et la prévisualisation en temps réel
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Personnalisez ici la configuration de compilation Rspack
                }
            })
        );
    },

    /**
     * Configure et démarre le serveur HTTP
     * @description Crée une instance de serveur HTTP, intègre le middleware Esmx, et gère les requêtes SSR
     * @param esmx Instance du framework Esmx, fournissant le middleware et les fonctionnalités de rendu
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Utilisez le middleware Esmx pour traiter les requêtes
            esmx.middleware(req, res, async () => {
                // Exécutez le rendu côté serveur
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Serveur démarré : http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Ce fichier est le point d'entrée pour la configuration de l'environnement de développement et le démarrage du serveur. Il contient deux fonctionnalités principales :

1. La fonction `devApp` : responsable de la création et de la configuration de l'instance d'application Rspack pour l'environnement de développement, prenant en charge la mise à jour en temps réel et la prévisualisation. Ici, `createRspackHtmlApp` est utilisé pour créer une instance d'application Rspack spécifique à Preact+HTM.
2. La fonction `server` : responsable de la création et de la configuration du serveur HTTP, intégrant le middleware Esmx pour traiter les requêtes SSR.

### entry.server.ts

Créez le fichier d'entrée pour le rendu côté serveur `src/entry.server.ts` :

```ts title="src/entry.server.ts"
/**
 * @file Fichier d'entrée pour le rendu côté serveur
 * @description Responsable du processus de rendu côté serveur, de la génération du HTML et de l'injection des ressources
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Créez l'instance de l'application
    const { app } = createApp();

    // Utilisez renderToString de Preact pour générer le contenu de la page
    const html = render(app);

    // Soumettez la collecte des dépendances pour garantir que toutes les ressources nécessaires sont chargées
    await rc.commit();

    // Générez la structure HTML complète
    rc.html = `<!DOCTYPE html>
<html lang="fr">
<head>
    ${rc.preload()}
    <title>Démarrage rapide avec Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
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

Vous avez maintenant créé avec succès une application SSR Preact+HTM basée sur Esmx ! Visitez http://localhost:3000 pour voir le résultat.