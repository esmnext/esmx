---
titleSuffix: Esmx Framework Vue2 SSR Applicatievoorbeeld
description: Leer hoe je een Vue2 SSR-applicatie bouwt met Esmx vanaf nul. Dit voorbeeld demonstreert de basisgebruik van het framework, inclusief projectinitialisatie, Vue2-configuratie en instellingen voor toegangsbestanden.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue2, SSR-applicatie, TypeScript-configuratie, projectinitialisatie, server-side rendering, client-side interactie
---

# Vue2

Deze tutorial helpt je bij het opzetten van een Vue2 SSR-applicatie met Esmx vanaf nul. We gebruiken een compleet voorbeeld om te laten zien hoe je een server-side rendering applicatie maakt met het Esmx-framework.

## Projectstructuur

Laten we eerst de basisstructuur van het project bekijken:

```bash
.
├── package.json         # Projectconfiguratiebestand, definieert afhankelijkheden en scriptcommando's
├── tsconfig.json        # TypeScript-configuratiebestand, stelt compilatieopties in
└── src                  # Broncode directory
    ├── app.vue          # Hoofdapplicatiecomponent, definieert paginastructuur en interactielogica
    ├── create-app.ts    # Vue-instantiecreatiefabriek, verantwoordelijk voor initialisatie van de applicatie
    ├── entry.client.ts  # Client-side toegangsbestand, verwerkt rendering in de browser
    ├── entry.node.ts    # Node.js server toegangsbestand, verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart
    └── entry.server.ts  # Server-side toegangsbestand, verwerkt SSR-renderinglogica
```

## Projectconfiguratie

### package.json

Maak het `package.json` bestand aan en configureer projectafhankelijkheden en scripts:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
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
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
  }
}
```

Na het aanmaken van het `package.json` bestand, moet je de projectafhankelijkheden installeren. Je kunt een van de volgende commando's gebruiken om te installeren:
```bash
pnpm install
# of
yarn install
# of
npm install
```

Hiermee worden alle benodigde afhankelijkheden geïnstalleerd, inclusief Vue2, TypeScript en SSR-gerelateerde afhankelijkheden.

### tsconfig.json

Maak het `tsconfig.json` bestand aan en configureer TypeScript-compilatieopties:

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
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Broncodestructuur

### app.vue

Maak de hoofdapplicatiecomponent `src/app.vue` aan, gebruikmakend van `<script setup>` syntax:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Esmx Snel Starten</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Voorbeeldcomponent
 * @description Toont een paginatitel met automatisch bijgewerkte tijd, ter demonstratie van de basisfunctionaliteit van het Esmx-framework
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Huidige tijd, wordt elke seconde bijgewerkt
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

Maak het `src/create-app.ts` bestand aan, verantwoordelijk voor het creëren van de Vue-applicatie-instantie:

```ts title="src/create-app.ts"
/**
 * @file Vue-instantiecreatie
 * @description Verantwoordelijk voor het creëren en configureren van de Vue-applicatie-instantie
 */

import Vue from 'vue';
import App from './app.vue';

export function createApp() {
    const app = new Vue({
        render: (h) => h(App)
    });
    return {
        app
    };
}
```

### entry.client.ts

Maak het client-side toegangsbestand `src/entry.client.ts` aan:

```ts title="src/entry.client.ts"
/**
 * @file Client-side toegangsbestand
 * @description Verantwoordelijk voor client-side interactielogica en dynamische updates
 */

import { createApp } from './create-app';

// Creëer Vue-instantie
const { app } = createApp();

// Mount Vue-instantie
app.$mount('#app');
```

### entry.node.ts

Maak het `entry.node.ts` bestand aan, configureer de ontwikkelomgeving en serverstart:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server toegangsbestand
 * @description Verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart, biedt SSR-runtimeomgeving
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configureer de applicatiecreatie voor de ontwikkelomgeving
     * @description Creëert en configureert Rspack-applicatie-instantie, gebruikt voor build en hot updates in de ontwikkelomgeving
     * @param esmx Esmx-frameworkinstantie, biedt kernfunctionaliteit en configuratie-interfaces
     * @returns Retourneert geconfigureerde Rspack-applicatie-instantie, ondersteunt HMR en live preview
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // Pas hier Rspack-compilatieconfiguratie aan
                }
            })
        );
    },

    /**
     * Configureer en start HTTP-server
     * @description Creëert HTTP-serverinstantie, integreert Esmx-middleware, verwerkt SSR-verzoeken
     * @param esmx Esmx-frameworkinstantie, biedt middleware en renderingfunctionaliteit
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Gebruik Esmx-middleware om verzoeken te verwerken
            esmx.middleware(req, res, async () => {
                // Voer server-side rendering uit
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server gestart: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Dit bestand is het toegangsbestand voor ontwikkelomgevingconfiguratie en serverstart, en bevat twee kernfunctionaliteiten:

1. `devApp` functie: Verantwoordelijk voor het creëren en configureren van de Rspack-applicatie-instantie voor de ontwikkelomgeving, ondersteunt hot updates en live preview-functionaliteit. Hier wordt `createRspackVue2App` gebruikt om een Rspack-applicatie-instantie specifiek voor Vue2 te creëren.
2. `server` functie: Verantwoordelijk voor het creëren en configureren van de HTTP-server, integreert Esmx-middleware om SSR-verzoeken te verwerken.

### entry.server.ts

Maak het server-side rendering toegangsbestand `src/entry.server.ts` aan:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering toegangsbestand
 * @description Verantwoordelijk voor server-side renderingproces, HTML-generatie en resource-injectie
 */

import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Creëer renderer
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Creëer Vue-applicatie-instantie
    const { app } = createApp();

    // Gebruik Vue's renderToString om pagina-inhoud te genereren
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit afhankelijkheidsverzameling, zorg ervoor dat alle benodigde resources worden geladen
    await rc.commit();

    // Genereer complete HTML-structuur
    rc.html = `<!DOCTYPE html>
<html lang="nl-NL">
<head>
    ${rc.preload()}
    <title>Esmx Snel Starten</title>
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

## Project uitvoeren

Na het voltooien van de bovenstaande bestandsconfiguraties, kun je de volgende commando's gebruiken om het project uit te voeren:

1. Ontwikkelmodus:
```bash
npm run dev
```

2. Project bouwen:
```bash
npm run build
```

3. Productieomgeving uitvoeren:
```bash
npm run start
```

Nu heb je succesvol een Vue2 SSR-applicatie met Esmx gemaakt! Bezoek http://localhost:3000 om het resultaat te zien.