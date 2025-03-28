---
titleSuffix: Esempio di applicazione HTML SSR con il framework Esmx
description: Costruisci da zero un'applicazione HTML SSR basata su Esmx, dimostrando l'uso di base del framework attraverso un esempio pratico, inclusa l'inizializzazione del progetto, la configurazione HTML e l'impostazione dei file di ingresso.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, Applicazione SSR, Configurazione TypeScript, Inizializzazione progetto, Rendering lato server, Interazione lato client
---

# HTML

Questo tutorial ti guiderà nella creazione di un'applicazione HTML SSR basata su Esmx da zero. Attraverso un esempio completo, dimostreremo come utilizzare il framework Esmx per creare un'applicazione con rendering lato server.

## Struttura del progetto

Iniziamo comprendendo la struttura di base del progetto:

```bash
.
├── package.json         # File di configurazione del progetto, definisce le dipendenze e i comandi di script
├── tsconfig.json        # File di configurazione TypeScript, imposta le opzioni di compilazione
└── src                  # Directory del codice sorgente
    ├── app.ts           # Componente principale dell'applicazione, definisce la struttura della pagina e la logica di interazione
    ├── create-app.ts    # Factory per la creazione dell'istanza dell'applicazione, responsabile dell'inizializzazione dell'app
    ├── entry.client.ts  # File di ingresso lato client, gestisce il rendering nel browser
    ├── entry.node.ts    # File di ingresso del server Node.js, responsabile della configurazione dell'ambiente di sviluppo e dell'avvio del server
    └── entry.server.ts  # File di ingresso lato server, gestisce la logica di rendering SSR
```

## Configurazione del progetto

### package.json

Crea il file `package.json` per configurare le dipendenze e gli script del progetto:

```json title="package.json"
{
  "name": "ssr-demo-html",
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
    "typescript": "^5.7.3"
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

Questo installerà tutti i pacchetti necessari, inclusi TypeScript e le dipendenze relative a SSR.

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Struttura del codice sorgente

### app.ts

Crea il componente principale dell'applicazione `src/app.ts`, implementando la struttura della pagina e la logica di interazione:

```ts title="src/app.ts"
/**
 * @file Componente di esempio
 * @description Mostra un titolo di pagina con un tempo aggiornato automaticamente, per dimostrare le funzionalità di base del framework Esmx
 */

export default class App {
    /**
     * Tempo corrente, in formato ISO
     * @type {string}
     */
    public time = '';

    /**
     * Crea un'istanza dell'applicazione
     * @param {SsrContext} [ssrContext] - Contesto lato server, contiene una raccolta di metadati di importazione
     */
    public constructor(public ssrContext?: SsrContext) {
        // Non è necessaria alcuna inizializzazione aggiuntiva nel costruttore
    }

    /**
     * Renderizza il contenuto della pagina
     * @returns {string} Restituisce la struttura HTML della pagina
     */
    public render(): string {
        // Assicura che i metadati di importazione vengano raccolti correttamente in ambiente server
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Guida rapida a Esmx</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Inizializzazione lato client
     * @throws {Error} Lancia un errore se non trova l'elemento di visualizzazione del tempo
     */
    public onClient(): void {
        // Ottiene l'elemento di visualizzazione del tempo
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Elemento di visualizzazione del tempo non trovato');
        }

        // Imposta un timer per aggiornare il tempo ogni secondo
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Inizializzazione lato server
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Interfaccia del contesto lato server
 * @interface
 */
export interface SsrContext {
    /**
     * Raccolta di metadati di importazione
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Crea il file `src/create-app.ts`, responsabile della creazione dell'istanza dell'applicazione:

```ts title="src/create-app.ts"
/**
 * @file Creazione dell'istanza dell'applicazione
 * @description Responsabile della creazione e configurazione dell'istanza dell'applicazione
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

Crea il file di ingresso lato client `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file File di ingresso lato client
 * @description Responsabile della logica di interazione e aggiornamento dinamico lato client
 */

import { createApp } from './create-app';

// Crea un'istanza dell'applicazione e la inizializza
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Crea il file `entry.node.ts`, responsabile della configurazione dell'ambiente di sviluppo e dell'avvio del server:

```ts title="src/entry.node.ts"
/**
 * @file File di ingresso del server Node.js
 * @description Responsabile della configurazione dell'ambiente di sviluppo e dell'avvio del server, fornendo un ambiente di runtime per SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configura il creatore dell'applicazione per l'ambiente di sviluppo
     * @description Crea e configura un'istanza dell'applicazione Rspack, utilizzata per la costruzione e l'aggiornamento in tempo reale nell'ambiente di sviluppo
     * @param esmx Istanza del framework Esmx, fornisce funzionalità di base e interfacce di configurazione
     * @returns Restituisce un'istanza configurata dell'applicazione Rspack, supporta HMR e anteprima in tempo reale
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Personalizza qui la configurazione di compilazione Rspack
                }
            })
        );
    },

    /**
     * Configura e avvia il server HTTP
     * @description Crea un'istanza del server HTTP, integra il middleware Esmx e gestisce le richieste SSR
     * @param esmx Istanza del framework Esmx, fornisce funzionalità di middleware e rendering
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Utilizza il middleware Esmx per gestire le richieste
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

Questo file è il punto di ingresso per la configurazione dell'ambiente di sviluppo e l'avvio del server, contenente due funzionalità principali:

1. Funzione `devApp`: responsabile della creazione e configurazione dell'istanza dell'applicazione Rspack per l'ambiente di sviluppo, supportando l'aggiornamento in tempo reale e l'anteprima.
2. Funzione `server`: responsabile della creazione e configurazione del server HTTP, integrando il middleware Esmx per gestire le richieste SSR.

### entry.server.ts

Crea il file di ingresso per il rendering lato server `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file File di ingresso per il rendering lato server
 * @description Responsabile del flusso di rendering lato server, generazione HTML e iniezione delle risorse
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Incapsula la logica di generazione del contenuto della pagina
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Inietta il contesto di rendering lato server nell'istanza dell'applicazione
    app.ssrContext = ssrContext;
    // Inizializza il lato server
    app.onServer();

    // Genera il contenuto della pagina
    return app.render();
};

export default async (rc: RenderContext) => {
    // Crea un'istanza dell'applicazione, restituisce un oggetto contenente l'istanza app
    const { app } = createApp();
    // Utilizza renderToString per generare il contenuto della pagina
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

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
    ${html}
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

Ora hai creato con successo un'applicazione HTML SSR basata su Esmx! Visita http://localhost:3000 per vedere il risultato.