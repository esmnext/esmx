---
titleSuffix: Esempio di applicazione Vue3 SSR con il framework Gez
description: Costruisci da zero un'applicazione Vue3 SSR basata su Gez. Questo tutorial mostra l'uso di base del framework, inclusa l'inizializzazione del progetto, la configurazione di Vue3 e l'impostazione dei file di ingresso.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, Applicazione SSR, Configurazione TypeScript, Inizializzazione progetto, Rendering lato server, Interazione lato client, API composizionale
---

# Vue3

Questo tutorial ti guiderà nella creazione di un'applicazione Vue3 SSR basata su Gez da zero. Attraverso un esempio completo, mostreremo come utilizzare il framework Gez per creare un'applicazione con rendering lato server.

## Struttura del progetto

Iniziamo con la struttura di base del progetto:

```bash
.
├── package.json         # File di configurazione del progetto, definisce dipendenze e comandi script
├── tsconfig.json        # File di configurazione TypeScript, imposta opzioni di compilazione
└── src                  # Directory del codice sorgente
    ├── app.vue          # Componente principale dell'applicazione, definisce struttura e logica interattiva della pagina
    ├── create-app.ts    # Fabbrica di creazione dell'istanza Vue, responsabile dell'inizializzazione dell'applicazione
    ├── entry.client.ts  # File di ingresso lato client, gestisce il rendering nel browser
    ├── entry.node.ts    # File di ingresso del server Node.js, responsabile della configurazione dell'ambiente di sviluppo e dell'avvio del server
    └── entry.server.ts  # File di ingresso lato server, gestisce la logica di rendering SSR
```

## Configurazione del progetto

### package.json

Crea il file `package.json` per configurare le dipendenze e gli script del progetto:

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

Dopo aver creato il file `package.json`, è necessario installare le dipendenze del progetto. Puoi utilizzare uno dei seguenti comandi per l'installazione:
```bash
pnpm install
# oppure
yarn install
# oppure
npm install
```

Questo installerà tutti i pacchetti necessari, inclusi Vue3, TypeScript e le dipendenze relative a SSR.

### tsconfig.json

Crea il file `tsconfig.json` per configurare le opzioni di compilazione TypeScript:

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

## Struttura del codice sorgente

### app.vue

Crea il componente principale dell'applicazione `src/app.vue`, utilizzando l'API composizionale di Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Guida rapida a Gez</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Componente di esempio
 * @description Mostra un titolo di pagina con un tempo aggiornato automaticamente, utilizzato per dimostrare le funzionalità di base del framework Gez
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Tempo corrente, aggiornato ogni secondo
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

Crea il file `src/create-app.ts`, responsabile della creazione dell'istanza Vue:

```ts title="src/create-app.ts"
/**
 * @file Creazione dell'istanza Vue
 * @description Responsabile della creazione e configurazione dell'istanza Vue
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

Crea il file di ingresso lato client `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file File di ingresso lato client
 * @description Responsabile della logica interattiva lato client e degli aggiornamenti dinamici
 */

import { createApp } from './create-app';

// Crea l'istanza Vue
const { app } = createApp();

// Monta l'istanza Vue
app.mount('#app');
```

### entry.node.ts

Crea il file `entry.node.ts` per configurare l'ambiente di sviluppo e l'avvio del server:

```ts title="src/entry.node.ts"
/**
 * @file File di ingresso del server Node.js
 * @description Responsabile della configurazione dell'ambiente di sviluppo e dell'avvio del server, fornisce l'ambiente di runtime SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configura il creatore dell'applicazione per l'ambiente di sviluppo
     * @description Crea e configura l'istanza dell'applicazione Rspack, utilizzata per la costruzione e l'aggiornamento in tempo reale nell'ambiente di sviluppo
     * @param gez Istanza del framework Gez, fornisce funzionalità di base e interfacce di configurazione
     * @returns Restituisce l'istanza configurata dell'applicazione Rspack, supporta HMR e anteprima in tempo reale
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
                config(context) {
                    // Personalizza qui la configurazione di compilazione Rspack
                }
            })
        );
    },

    /**
     * Configura e avvia il server HTTP
     * @description Crea un'istanza del server HTTP, integra il middleware Gez, gestisce le richieste SSR
     * @param gez Istanza del framework Gez, fornisce funzionalità middleware e di rendering
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Utilizza il middleware Gez per gestire le richieste
            gez.middleware(req, res, async () => {
                // Esegue il rendering lato server
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server avviato: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Questo file è il punto di ingresso per la configurazione dell'ambiente di sviluppo e l'avvio del server, contenente due funzionalità principali:

1. Funzione `devApp`: Responsabile della creazione e configurazione dell'istanza dell'applicazione Rspack per l'ambiente di sviluppo, supporta l'aggiornamento in tempo reale e l'anteprima. Qui viene utilizzato `createRspackVue3App` per creare un'istanza Rspack specifica per Vue3.
2. Funzione `server`: Responsabile della creazione e configurazione del server HTTP, integra il middleware Gez per gestire le richieste SSR.

### entry.server.ts

Crea il file di ingresso per il rendering lato server `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file File di ingresso per il rendering lato server
 * @description Responsabile del flusso di rendering lato server, generazione HTML e iniezione delle risorse
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Crea l'istanza Vue
    const { app } = createApp();

    // Utilizza renderToString di Vue per generare il contenuto della pagina
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Conferma la raccolta delle dipendenze, assicurando che tutte le risorse necessarie vengano caricate
    await rc.commit();

    // Genera la struttura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="it">
<head>
    ${rc.preload()}
    <title>Guida rapida a Gez</title>
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

## Esecuzione del progetto

Dopo aver completato la configurazione dei file, puoi utilizzare i seguenti comandi per eseguire il progetto:

1. Modalità di sviluppo:
```bash
npm run dev
```

2. Costruzione del progetto:
```bash
npm run build
```

3. Esecuzione in ambiente di produzione:
```bash
npm run start
```

Ora hai creato con successo un'applicazione Vue3 SSR basata su Gez! Visita http://localhost:3000 per vedere il risultato.