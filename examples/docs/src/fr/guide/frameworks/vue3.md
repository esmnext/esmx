---
titleSuffix: Exemple d'application Vue3 SSR avec le framework Esmx
description: Créez une application Vue3 SSR basée sur Esmx à partir de zéro. Ce guide pratique montre les utilisations de base du framework, y compris l'initialisation du projet, la configuration de Vue3 et la configuration des fichiers d'entrée.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue3, Application SSR, Configuration TypeScript, Initialisation de projet, Rendu côté serveur, Interaction côté client, API de composition
---

# Vue3

Ce tutoriel vous guidera dans la création d'une application Vue3 SSR basée sur Esmx à partir de zéro. Nous allons utiliser un exemple complet pour montrer comment créer une application de rendu côté serveur avec le framework Esmx.

## Structure du projet

Commençons par comprendre la structure de base du projet :

```bash
.
├── package.json         # Fichier de configuration du projet, définissant les dépendances et les scripts
├── tsconfig.json        # Fichier de configuration TypeScript, définissant les options de compilation
└── src                  # Répertoire du code source
    ├── app.vue          # Composant principal de l'application, définissant la structure et la logique d'interaction
    ├── create-app.ts    # Usine de création d'instance Vue, responsable de l'initialisation de l'application
    ├── entry.client.ts  # Fichier d'entrée côté client, gérant le rendu côté navigateur
    ├── entry.node.ts    # Fichier d'entrée Node.js, responsable de la configuration de l'environnement de développement et du démarrage du serveur
    └── entry.server.ts  # Fichier d'entrée côté serveur, gérant la logique de rendu SSR
```

## Configuration du projet

### package.json

Créez le fichier `package.json` pour configurer les dépendances et les scripts du projet :

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
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

Cela installera tous les packages nécessaires, y compris Vue3, TypeScript et les dépendances liées au SSR.

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Structure du code source

### app.vue

Créez le composant principal de l'application `src/app.vue`, en utilisant l'API de composition de Vue3 :

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Démarrage rapide avec Esmx</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Composant d'exemple
 * @description Affiche un titre de page avec une horloge mise à jour automatiquement, pour démontrer les fonctionnalités de base de Esmx
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Heure actuelle, mise à jour toutes les secondes
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

Créez le fichier `src/create-app.ts`, responsable de la création de l'instance Vue :

```ts title="src/create-app.ts"
/**
 * @file Création d'instance Vue
 * @description Responsable de la création et de la configuration de l'instance Vue
 */

import { createSSRApp } from 'vue';
import App from './app.vue';

export function createApp() {
    const app = createSSRApp(App);
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

// Créer l'instance Vue
const { app } = createApp();

// Monter l'instance Vue
app.mount('#app');
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
     * Configurer le créateur d'application pour l'environnement de développement
     * @description Crée et configure l'instance Rspack, utilisée pour la construction et la mise à jour en temps réel en environnement de développement
     * @param esmx Instance du framework Esmx, fournissant les fonctionnalités de base et les interfaces de configuration
     * @returns Retourne l'instance Rspack configurée, prenant en charge HMR et la prévisualisation en temps réel
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                config(context) {
                    // Personnaliser la configuration de compilation Rspack ici
                }
            })
        );
    },

    /**
     * Configurer et démarrer le serveur HTTP
     * @description Crée une instance de serveur HTTP, intègre le middleware Esmx, et gère les requêtes SSR
     * @param esmx Instance du framework Esmx, fournissant le middleware et les fonctionnalités de rendu
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Utiliser le middleware Esmx pour gérer les requêtes
            esmx.middleware(req, res, async () => {
                // Exécuter le rendu côté serveur
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

Ce fichier est le point d'entrée pour la configuration de l'environnement de développement et le démarrage du serveur, contenant deux fonctionnalités principales :

1. Fonction `devApp` : Responsable de la création et de la configuration de l'instance Rspack pour l'environnement de développement, prenant en charge la mise à jour en temps réel et la prévisualisation. Ici, `createRspackVue3App` est utilisé pour créer une instance Rspack spécifique à Vue3.
2. Fonction `server` : Responsable de la création et de la configuration du serveur HTTP, intégrant le middleware Esmx pour gérer les requêtes SSR.

### entry.server.ts

Créez le fichier d'entrée pour le rendu côté serveur `src/entry.server.ts` :

```ts title="src/entry.server.ts"
/**
 * @file Fichier d'entrée pour le rendu côté serveur
 * @description Responsable du processus de rendu côté serveur, de la génération HTML et de l'injection des ressources
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Créer l'instance Vue
    const { app } = createApp();

    // Utiliser renderToString de Vue pour générer le contenu de la page
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Valider la collecte des dépendances, s'assurer que toutes les ressources nécessaires sont chargées
    await rc.commit();

    // Générer la structure HTML complète
    rc.html = `<!DOCTYPE html>
<html lang="fr-FR">
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

Vous avez maintenant créé avec succès une application Vue3 SSR basée sur Esmx ! Visitez http://localhost:3000 pour voir le résultat.