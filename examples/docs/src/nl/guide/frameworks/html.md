---
titleSuffix: Esmx Framework HTML SSR Applicatie Voorbeeld
description: Leer hoe je een HTML SSR applicatie bouwt met Esmx vanaf nul. Dit voorbeeld demonstreert de basisgebruik van het framework, inclusief projectinitialisatie, HTML configuratie en instellingen van het ingangsbestand.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR applicatie, TypeScript configuratie, projectinitialisatie, server-side rendering, client-side interactie
---

# HTML

Deze tutorial helpt je om vanaf nul een HTML SSR applicatie te bouwen met Esmx. We zullen een volledig voorbeeld gebruiken om te laten zien hoe je een server-side rendering applicatie kunt maken met het Esmx framework.

## Projectstructuur

Laten we eerst de basisstructuur van het project bekijken:

```bash
.
├── package.json         # Projectconfiguratiebestand, definieert afhankelijkheden en scriptcommando's
├── tsconfig.json        # TypeScript configuratiebestand, stelt compilatieopties in
└── src                  # Broncode directory
    ├── app.ts           # Hoofdapplicatiecomponent, definieert paginastructuur en interactielogica
    ├── create-app.ts    # Applicatie-instantiecreatie factory, verantwoordelijk voor initialisatie van de applicatie
    ├── entry.client.ts  # Client-side ingangsbestand, verwerkt rendering in de browser
    ├── entry.node.ts    # Node.js server ingangsbestand, verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart
    └── entry.server.ts  # Server-side ingangsbestand, verwerkt SSR rendering logica
```

## Projectconfiguratie

### package.json

Maak het `package.json` bestand aan en configureer projectafhankelijkheden en scripts:

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

Nadat het `package.json` bestand is aangemaakt, moet je de projectafhankelijkheden installeren. Je kunt een van de volgende commando's gebruiken om te installeren:
```bash
pnpm install
# of
yarn install
# of
npm install
```

Dit installeert alle benodigde afhankelijkheden, inclusief TypeScript en SSR gerelateerde afhankelijkheden.

### tsconfig.json

Maak het `tsconfig.json` bestand aan en configureer TypeScript compilatieopties:

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

## Broncodestructuur

### app.ts

Maak de hoofdapplicatiecomponent `src/app.ts` aan, implementeer paginastructuur en interactielogica:

```ts title="src/app.ts"
/**
 * @file Voorbeeldcomponent
 * @description Toont een paginatitel met automatisch bijgewerkte tijd, ter demonstratie van de basisfunctionaliteit van het Esmx framework
 */

export default class App {
    /**
     * Huidige tijd, in ISO formaat
     * @type {string}
     */
    public time = '';

    /**
     * Creëer een applicatie-instantie
     * @param {SsrContext} [ssrContext] - Server-side context, bevat import metadata verzameling
     */
    public constructor(public ssrContext?: SsrContext) {
        // Geen extra initialisatie nodig in de constructor
    }

    /**
     * Render de pagina-inhoud
     * @returns {string} Retourneert de HTML structuur van de pagina
     */
    public render(): string {
        // Zorg ervoor dat import metadata correct wordt verzameld in een server-side omgeving
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx Snel Starten</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Client-side initialisatie
     * @throws {Error} Gooit een foutmelding als het tijdweergave-element niet gevonden wordt
     */
    public onClient(): void {
        // Haal het tijdweergave-element op
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Tijdweergave-element niet gevonden');
        }

        // Stel een timer in om de tijd elke seconde bij te werken
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Server-side initialisatie
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Server-side context interface
 * @interface
 */
export interface SsrContext {
    /**
     * Import metadata verzameling
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Maak het `src/create-app.ts` bestand aan, verantwoordelijk voor het creëren van de applicatie-instantie:

```ts title="src/create-app.ts"
/**
 * @file Applicatie-instantiecreatie
 * @description Verantwoordelijk voor het creëren en configureren van de applicatie-instantie
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

Maak het client-side ingangsbestand `src/entry.client.ts` aan:

```ts title="src/entry.client.ts"
/**
 * @file Client-side ingangsbestand
 * @description Verantwoordelijk voor client-side interactielogica en dynamische updates
 */

import { createApp } from './create-app';

// Creëer en initialiseer de applicatie-instantie
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Maak het `entry.node.ts` bestand aan, configureer de ontwikkelomgeving en serverstart:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server ingangsbestand
 * @description Verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart, biedt SSR runtime omgeving
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configureer de applicatiecreatie voor de ontwikkelomgeving
     * @description Creëer en configureer een Rspack applicatie-instantie voor ontwikkelomgeving builds en hot updates
     * @param esmx Esmx framework instantie, biedt kernfunctionaliteit en configuratie-interfaces
     * @returns Retourneert een geconfigureerde Rspack applicatie-instantie, ondersteunt HMR en live preview
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Pas hier de Rspack compilatieconfiguratie aan
                }
            })
        );
    },

    /**
     * Configureer en start de HTTP server
     * @description Creëer een HTTP server-instantie, integreer Esmx middleware, verwerk SSR verzoeken
     * @param esmx Esmx framework instantie, biedt middleware en rendering functionaliteit
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Gebruik Esmx middleware om verzoeken te verwerken
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

Dit bestand is het ingangsbestand voor ontwikkelomgevingconfiguratie en serverstart, en bevat twee kernfunctionaliteiten:

1. `devApp` functie: Verantwoordelijk voor het creëren en configureren van de Rspack applicatie-instantie voor de ontwikkelomgeving, ondersteunt hot updates en live preview functionaliteit.
2. `server` functie: Verantwoordelijk voor het creëren en configureren van de HTTP server, integreert Esmx middleware om SSR verzoeken te verwerken.

### entry.server.ts

Maak het server-side rendering ingangsbestand `src/entry.server.ts` aan:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering ingangsbestand
 * @description Verantwoordelijk voor server-side rendering proces, HTML generatie en resource injectie
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Encapsuleer de pagina-inhoud generatie logica
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Injecteer de server-side rendering context in de applicatie-instantie
    app.ssrContext = ssrContext;
    // Initialiseer de server-side
    app.onServer();

    // Genereer de pagina-inhoud
    return app.render();
};

export default async (rc: RenderContext) => {
    // Creëer de applicatie-instantie, retourneer een object met de app instantie
    const { app } = createApp();
    // Gebruik renderToString om de pagina-inhoud te genereren
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit de afhankelijkheidsverzameling, zorg ervoor dat alle benodigde resources worden geladen
    await rc.commit();

    // Genereer de volledige HTML structuur
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

Nu heb je succesvol een HTML SSR applicatie gebouwd met Esmx! Bezoek http://localhost:3000 om het resultaat te zien.