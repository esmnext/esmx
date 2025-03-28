---
titleSuffix: Esempio di applicazione Preact+HTM SSR con il framework Esmx
description: Impara a creare un'applicazione Preact+HTM SSR basata su Esmx da zero. Questo tutorial mostra l'uso di base del framework, inclusa l'inizializzazione del progetto, la configurazione di Preact e l'impostazione dei file di ingresso.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, Applicazione SSR, Configurazione TypeScript, Inizializzazione progetto, Rendering lato server, Interazione lato client
---

# Preact+HTM

Questo tutorial ti guiderà nella creazione di un'applicazione Preact+HTM SSR basata su Esmx da zero. Attraverso un esempio completo, mostreremo come utilizzare il framework Esmx per creare un'applicazione con rendering lato server.

## Struttura del progetto

Iniziamo con la struttura di base del progetto:

```bash
.
├── package.json         # File di configurazione del progetto, definisce le dipendenze e gli script
├── tsconfig.json        # File di configurazione TypeScript, imposta le opzioni di compilazione
└── src                  # Directory del codice sorgente
    ├── app.ts           # Componente principale dell'applicazione, definisce la struttura della pagina e la logica di interazione
    ├── create-app.ts    # Factory per la creazione dell'istanza dell'applicazione, responsabile dell'inizializzazione
    ├── entry.client.ts  # File di ingresso lato client, gestisce il rendering nel browser
    ├── entry.node.ts    # File di ingresso per il server Node.js, configura l'ambiente di sviluppo e avvia il server
    └── entry.server.ts  # File di ingresso lato server, gestisce la logica di rendering SSR
```

## Configurazione del progetto

### package.json

Crea il file `package.json` per configurare le dipendenze e gli script del progetto:

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

Dopo aver creato il file `package.json`, installa le dipendenze del progetto. Puoi utilizzare uno dei seguenti comandi:
```bash
pnpm install
# oppure
yarn install
# oppure
npm install
```

Questo installerà tutti i pacchetti necessari, inclusi Preact, HTM, TypeScript e le dipendenze relative al SSR.

### tsconfig.json

Crea il file `tsconfig.json` per configurare le opzioni di compilazione TypeScript:

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

## Struttura del codice sorgente

### app.ts

Crea il componente principale dell'applicazione `src/app.ts`, utilizzando i componenti di classe di Preact e HTM:

```ts title="src/app.ts"
/**
 * @file Componente di esempio
 * @description Mostra un titolo di pagina con un orario aggiornato automaticamente, utilizzato per dimostrare le funzionalità di base del framework Esmx
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Guida rapida a Esmx</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Crea il file `src/create-app.ts`, responsabile della creazione dell'istanza dell'applicazione:

```ts title="src/create-app.ts"
/**
 * @file Creazione dell'istanza dell'applicazione
 * @description Responsabile della creazione e configurazione dell'istanza dell'applicazione
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

Crea il file di ingresso lato client `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file File di ingresso lato client
 * @description Gestisce la logica di interazione lato client e gli aggiornamenti dinamici
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Crea l'istanza dell'applicazione
const { app } = createApp();

// Monta l'istanza dell'applicazione
render(app, document.getElementById('app')!);
```

### entry.node.ts

Crea il file `entry.node.ts` per configurare l'ambiente di sviluppo e avviare il server:

```ts title="src/entry.node.ts"
/**
 * @file File di ingresso per il server Node.js
 * @description Configura l'ambiente di sviluppo e avvia il server, fornendo un ambiente di runtime per il SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configura il creatore dell'applicazione per l'ambiente di sviluppo
     * @description Crea e configura un'istanza dell'applicazione Rspack per la costruzione e l'aggiornamento in tempo reale nell'ambiente di sviluppo
     * @param esmx Istanza del framework Esmx, fornisce funzionalità di base e interfacce di configurazione
     * @returns Restituisce un'istanza configurata dell'applicazione Rspack, supporta HMR e anteprima in tempo reale
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Personalizza qui la configurazione di compilazione di Rspack
                }
            })
        );
    },

    /**
     * Configura e avvia il server HTTP
     * @description Crea un'istanza del server HTTP, integra i middleware di Esmx e gestisce le richieste SSR
     * @param esmx Istanza del framework Esmx, fornisce middleware e funzionalità di rendering
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Utilizza i middleware di Esmx per gestire le richieste
            esmx.middleware(req, res, async () => {
                // Esegue il rendering lato server
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server avviato: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Questo file è il punto di ingresso per la configurazione dell'ambiente di sviluppo e l'avvio del server, e include due funzionalità principali:

1. Funzione `devApp`: Responsabile della creazione e configurazione dell'istanza dell'applicazione Rspack per l'ambiente di sviluppo, supportando l'aggiornamento in tempo reale e l'anteprima. Qui viene utilizzato `createRspackHtmlApp` per creare un'istanza dell'applicazione Rspack specifica per Preact+HTM.
2. Funzione `server`: Responsabile della creazione e configurazione del server HTTP, integrando i middleware di Esmx per gestire le richieste SSR.

### entry.server.ts

Crea il file di ingresso per il rendering lato server `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file File di ingresso per il rendering lato server
 * @description Gestisce il processo di rendering lato server, la generazione dell'HTML e l'iniezione delle risorse
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Crea l'istanza dell'applicazione
    const { app } = createApp();

    // Utilizza renderToString di Preact per generare il contenuto della pagina
    const html = render(app);

    // Conferma la raccolta delle dipendenze, assicurando che tutte le risorse necessarie vengano caricate
    await rc.commit();

    // Genera la struttura HTML completa
    rc.html = `<!DOCTYPE html>
<html lang="it">
<head>
    ${rc.preload()}
    <title>Guida rapida a Esmx</title>
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

Dopo aver completato la configurazione dei file, puoi eseguire il progetto utilizzando i seguenti comandi:

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

Ora hai creato con successo un'applicazione Preact+HTM SSR basata su Esmx! Visita http://localhost:3000 per vedere il risultato.