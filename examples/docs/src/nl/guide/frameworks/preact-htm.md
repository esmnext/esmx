---
titleSuffix: Esmx Framework Preact+HTM SSR Applicatievoorbeeld
description: Leer hoe je een Preact+HTM SSR-applicatie bouwt met het Esmx-framework vanaf nul. Dit voorbeeld demonstreert de basisgebruik van het framework, inclusief projectinitialisatie, Preact-configuratie en instellingen voor het invoerbestand.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, SSR-applicatie, TypeScript-configuratie, projectinitialisatie, server-side rendering, client-side interactie
---

# Preact+HTM

Deze tutorial helpt je bij het opzetten van een Preact+HTM SSR-applicatie met het Esmx-framework vanaf nul. We zullen een volledig voorbeeld gebruiken om te laten zien hoe je een server-side rendering applicatie kunt maken met het Esmx-framework.

## Projectstructuur

Laten we eerst de basisstructuur van het project bekijken:

```bash
.
├── package.json         # Projectconfiguratiebestand, definieert afhankelijkheden en scriptcommando's
├── tsconfig.json        # TypeScript-configuratiebestand, stelt compilatieopties in
└── src                  # Broncode directory
    ├── app.ts           # Hoofdapplicatiecomponent, definieert paginastructuur en interactielogica
    ├── create-app.ts    # Applicatie-instantiecreatiefabriek, verantwoordelijk voor initialisatie van de applicatie
    ├── entry.client.ts  # Client-side invoerbestand, verwerkt rendering in de browser
    ├── entry.node.ts    # Node.js server invoerbestand, verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart
    └── entry.server.ts  # Server-side invoerbestand, verwerkt SSR-renderinglogica
```

## Projectconfiguratie

### package.json

Maak het `package.json`-bestand aan en configureer projectafhankelijkheden en scripts:

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

Nadat het `package.json`-bestand is aangemaakt, moet je de projectafhankelijkheden installeren. Je kunt een van de volgende commando's gebruiken om te installeren:
```bash
pnpm install
# of
yarn install
# of
npm install
```

Hiermee worden alle benodigde afhankelijkheden geïnstalleerd, inclusief Preact, HTM, TypeScript en SSR-gerelateerde afhankelijkheden.

### tsconfig.json

Maak het `tsconfig.json`-bestand aan en configureer TypeScript-compilatieopties:

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

## Broncodestructuur

### app.ts

Maak de hoofdapplicatiecomponent `src/app.ts` aan, gebruikmakend van Preact's klassecomponenten en HTM:

```ts title="src/app.ts"
/**
 * @file Voorbeeldcomponent
 * @description Toont een paginatitel met automatisch bijgewerkte tijd, ter demonstratie van de basisfunctionaliteit van het Esmx-framework
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Esmx Snel Starten</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Maak het `src/create-app.ts`-bestand aan, verantwoordelijk voor het creëren van de applicatie-instantie:

```ts title="src/create-app.ts"
/**
 * @file Applicatie-instantiecreatie
 * @description Verantwoordelijk voor het creëren en configureren van de applicatie-instantie
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

Maak het client-side invoerbestand `src/entry.client.ts` aan:

```ts title="src/entry.client.ts"
/**
 * @file Client-side invoerbestand
 * @description Verantwoordelijk voor client-side interactielogica en dynamische updates
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Creëer applicatie-instantie
const { app } = createApp();

// Mount applicatie-instantie
render(app, document.getElementById('app')!);
```

### entry.node.ts

Maak het `entry.node.ts`-bestand aan, configureer de ontwikkelomgeving en start de server:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server invoerbestand
 * @description Verantwoordelijk voor ontwikkelomgevingconfiguratie en serverstart, biedt SSR-runtimeomgeving
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configureer de applicatiecreatie voor de ontwikkelomgeving
     * @description Creëert en configureert een Rspack-applicatie-instantie voor ontwikkelomgevingbouw en hot updates
     * @param esmx Esmx-frameworkinstantie, biedt kernfunctionaliteit en configuratie-interfaces
     * @returns Retourneert een geconfigureerde Rspack-applicatie-instantie, ondersteunt HMR en live preview
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Pas hier de Rspack-compilatieconfiguratie aan
                }
            })
        );
    },

    /**
     * Configureer en start de HTTP-server
     * @description Creëert een HTTP-serverinstantie, integreert Esmx-middleware, verwerkt SSR-verzoeken
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

Dit bestand is het invoerbestand voor de ontwikkelomgevingconfiguratie en serverstart, en bevat twee kernfunctionaliteiten:

1. `devApp`-functie: Verantwoordelijk voor het creëren en configureren van de Rspack-applicatie-instantie voor de ontwikkelomgeving, ondersteunt hot updates en live preview-functionaliteit. Hier wordt `createRspackHtmlApp` gebruikt om een specifieke Rspack-applicatie-instantie voor Preact+HTM te creëren.
2. `server`-functie: Verantwoordelijk voor het creëren en configureren van de HTTP-server, integreert Esmx-middleware om SSR-verzoeken te verwerken.

### entry.server.ts

Maak het server-side rendering invoerbestand `src/entry.server.ts` aan:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering invoerbestand
 * @description Verantwoordelijk voor het server-side renderingproces, HTML-generatie en resource-injectie
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Creëer applicatie-instantie
    const { app } = createApp();

    // Gebruik Preact's renderToString om pagina-inhoud te genereren
    const html = render(app);

    // Commit afhankelijkheidsverzameling, zorg ervoor dat alle benodigde resources worden geladen
    await rc.commit();

    // Genereer volledige HTML-structuur
    rc.html = `<!DOCTYPE html>
<html lang="nl-NL">
<head>
    ${rc.preload()}
    <title>Esmx Snel Starten</title>
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

Nu heb je succesvol een Preact+HTM SSR-applicatie gemaakt met het Esmx-framework! Bezoek http://localhost:3000 om het resultaat te zien.