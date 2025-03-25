---
titleSuffix: Gez Framework Vue3 SSR Applicatievoorbeeld
description: Leer hoe je een Vue3 SSR-applicatie bouwt met Gez vanaf nul. Dit voorbeeld demonstreert de basisgebruik van het framework, inclusief projectinitialisatie, Vue3-configuratie en instellingen voor toegangsbestanden.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, SSR-applicatie, TypeScript-configuratie, projectinitialisatie, server-side rendering, client-side interactie, Composition API
---

# Vue3

Deze tutorial helpt je bij het opzetten van een Vue3 SSR-applicatie met Gez vanaf nul. We gebruiken een compleet voorbeeld om te laten zien hoe je een server-side rendering applicatie maakt met het Gez-framework.

## Projectstructuur

Laten we eerst de basisstructuur van het project bekijken:

```bash
.
├── package.json         # Projectconfiguratiebestand, definieert afhankelijkheden en scriptcommando's
├── tsconfig.json        # TypeScript-configuratiebestand, stelt compilatieopties in
└── src                  # Broncode directory
    ├── app.vue          # Hoofdapplicatiecomponent, definieert paginastructuur en interactielogica
    ├── create-app.ts    # Vue-instantiecreatiefabriek, verantwoordelijk voor initialisatie van de applicatie
    ├── entry.client.ts  # Client-side toegangsbestand, behandelt rendering in de browser
    ├── entry.node.ts    # Node.js server toegangsbestand, verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart
    └── entry.server.ts  # Server-side toegangsbestand, behandelt SSR-renderinglogica
```

## Projectconfiguratie

### package.json

Maak het `package.json` bestand aan en configureer projectafhankelijkheden en scripts:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
  }
}
```

Nadat het `package.json` bestand is aangemaakt, moet je de projectafhankelijkheden installeren. Je kunt een van de volgende commando's gebruiken om te installeren:
```bash
pnpm install
# of
yarn install
# of
npm install
```

Hiermee worden alle benodigde afhankelijkheden geïnstalleerd, inclusief Vue3, TypeScript en SSR-gerelateerde afhankelijkheden.

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Broncodestructuur

### app.vue

Maak de hoofdapplicatiecomponent `src/app.vue` aan, gebruikmakend van Vue3's Composition API:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Gez Snel Starten</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Voorbeeldcomponent
 * @description Toont een paginatitel met automatisch bijgewerkte tijd, ter demonstratie van de basisfunctionaliteit van het Gez-framework
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

Maak het client-side toegangsbestand `src/entry.client.ts` aan:

```ts title="src/entry.client.ts"
/**
 * @file Client-side toegangsbestand
 * @description Verantwoordelijk voor client-side interactielogica en dynamische updates
 */

import { createApp } from './create-app';

// Creëer Vue-instantie
const { app } = createApp();

// Vue-instantie koppelen
app.mount('#app');
```

### entry.node.ts

Maak het `entry.node.ts` bestand aan, configureer de ontwikkelomgeving en serverstart:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server toegangsbestand
 * @description Verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart, biedt SSR-runtimeomgeving
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configureer de applicatiecreatie voor de ontwikkelomgeving
     * @description Creëert en configureert een Rspack-applicatie-instantie voor ontwikkelomgevingbouw en hot updates
     * @param gez Gez-frameworkinstantie, biedt kernfunctionaliteit en configuratie-interfaces
     * @returns Retourneert een geconfigureerde Rspack-applicatie-instantie, ondersteunt HMR en live preview
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
                config(context) {
                    // Pas hier de Rspack-compilatieconfiguratie aan
                }
            })
        );
    },

    /**
     * Configureer en start de HTTP-server
     * @description Creëert een HTTP-serverinstantie, integreert Gez-middleware, behandelt SSR-verzoeken
     * @param gez Gez-frameworkinstantie, biedt middleware en renderingfunctionaliteit
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Gebruik Gez-middleware om verzoeken te behandelen
            gez.middleware(req, res, async () => {
                // Voer server-side rendering uit
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server gestart: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Dit bestand is het toegangsbestand voor ontwikkelomgevingconfiguratie en serverstart, en bevat twee kernfunctionaliteiten:

1. `devApp` functie: Verantwoordelijk voor het creëren en configureren van de Rspack-applicatie-instantie voor de ontwikkelomgeving, ondersteunt hot updates en live preview-functionaliteit. Hier wordt `createRspackVue3App` gebruikt om een Rspack-applicatie-instantie specifiek voor Vue3 te creëren.
2. `server` functie: Verantwoordelijk voor het creëren en configureren van de HTTP-server, integreert Gez-middleware om SSR-verzoeken te behandelen.

### entry.server.ts

Maak het server-side rendering toegangsbestand `src/entry.server.ts` aan:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering toegangsbestand
 * @description Verantwoordelijk voor server-side renderingproces, HTML-generatie en resource-injectie
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Creëer Vue-applicatie-instantie
    const { app } = createApp();

    // Gebruik Vue's renderToString om pagina-inhoud te genereren
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit afhankelijkheidsverzameling, zorg ervoor dat alle benodigde resources worden geladen
    await rc.commit();

    // Genereer volledige HTML-structuur
    rc.html = `<!DOCTYPE html>
<html lang="nl">
<head>
    ${rc.preload()}
    <title>Gez Snel Starten</title>
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

## Project uitvoeren

Nadat je de bovenstaande bestanden hebt geconfigureerd, kun je de volgende commando's gebruiken om het project uit te voeren:

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

Nu heb je succesvol een Vue3 SSR-applicatie gemaakt met Gez! Bezoek http://localhost:3000 om het resultaat te zien.