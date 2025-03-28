---
titleSuffix: Esmx Framework Preact+HTM SSR Anwendungsbeispiel
description: Erstellen Sie eine Preact+HTM SSR-Anwendung mit Esmx von Grund auf. Dieses Beispiel zeigt die grundlegende Verwendung des Frameworks, einschließlich Projektinitialisierung, Preact-Konfiguration und Einstiegspunktdateien.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, SSR-Anwendung, TypeScript-Konfiguration, Projektinitialisierung, Serverseitiges Rendering, Client-Interaktion
---

# Preact+HTM

Dieses Tutorial hilft Ihnen dabei, eine Preact+HTM SSR-Anwendung mit Esmx von Grund auf zu erstellen. Wir werden anhand eines vollständigen Beispiels zeigen, wie Sie mit dem Esmx-Framework eine serverseitig gerenderte Anwendung erstellen können.

## Projektstruktur

Zunächst werfen wir einen Blick auf die grundlegende Projektstruktur:

```bash
.
├── package.json         # Projektkonfigurationsdatei, definiert Abhängigkeiten und Skriptbefehle
├── tsconfig.json        # TypeScript-Konfigurationsdatei, legt Compiler-Optionen fest
└── src                  # Quellcode-Verzeichnis
    ├── app.ts           # Hauptanwendungskomponente, definiert Seitenstruktur und Interaktionslogik
    ├── create-app.ts    # Anwendungsinstanz-Erstellungsfabrik, verantwortlich für die Initialisierung der Anwendung
    ├── entry.client.ts  # Client-Einstiegspunktdatei, behandelt das Rendering im Browser
    ├── entry.node.ts    # Node.js-Server-Einstiegspunktdatei, verantwortlich für die Entwicklungsumgebungskonfiguration und Serverstart
    └── entry.server.ts  # Server-Einstiegspunktdatei, behandelt das SSR-Rendering
```

## Projektkonfiguration

### package.json

Erstellen Sie die `package.json`-Datei und konfigurieren Sie die Projektabhängigkeiten und Skripte:

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

Nachdem Sie die `package.json`-Datei erstellt haben, müssen Sie die Projektabhängigkeiten installieren. Sie können einen der folgenden Befehle verwenden:

```bash
pnpm install
# oder
yarn install
# oder
npm install
```

Dadurch werden alle erforderlichen Abhängigkeiten installiert, einschließlich Preact, HTM, TypeScript und SSR-bezogene Abhängigkeiten.

### tsconfig.json

Erstellen Sie die `tsconfig.json`-Datei und konfigurieren Sie die TypeScript-Compiler-Optionen:

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

## Quellcode-Struktur

### app.ts

Erstellen Sie die Hauptanwendungskomponente `src/app.ts` mit Preact-Klassenkomponenten und HTM:

```ts title="src/app.ts"
/**
 * @file Beispielkomponente
 * @description Zeigt eine Seitenüberschrift mit automatisch aktualisierter Uhrzeit, um die grundlegenden Funktionen des Esmx-Frameworks zu demonstrieren
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Esmx Schnellstart</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Erstellen Sie die Datei `src/create-app.ts`, die für die Erstellung der Anwendungsinstanz verantwortlich ist:

```ts title="src/create-app.ts"
/**
 * @file Anwendungsinstanz-Erstellung
 * @description Verantwortlich für die Erstellung und Konfiguration der Anwendungsinstanz
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

Erstellen Sie die Client-Einstiegspunktdatei `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client-Einstiegspunktdatei
 * @description Verantwortlich für die Client-Interaktionslogik und dynamische Aktualisierung
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Anwendungsinstanz erstellen
const { app } = createApp();

// Anwendungsinstanz einbinden
render(app, document.getElementById('app')!);
```

### entry.node.ts

Erstellen Sie die Datei `entry.node.ts`, die für die Entwicklungsumgebungskonfiguration und den Serverstart verantwortlich ist:

```ts title="src/entry.node.ts"
/**
 * @file Node.js-Server-Einstiegspunktdatei
 * @description Verantwortlich für die Entwicklungsumgebungskonfiguration und den Serverstart, bietet eine SSR-Laufzeitumgebung
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Konfiguriert den Anwendungsersteller für die Entwicklungsumgebung
     * @description Erstellt und konfiguriert eine Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt HMR und Live-Vorschau
     * @param esmx Esmx-Framework-Instanz, bietet Kernfunktionen und Konfigurationsschnittstellen
     * @returns Gibt die konfigurierte Rspack-Anwendungsinstanz zurück, unterstützt HMR und Live-Vorschau
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Hier können Sie die Rspack-Kompilierungskonfiguration anpassen
                }
            })
        );
    },

    /**
     * Konfiguriert und startet den HTTP-Server
     * @description Erstellt eine HTTP-Serverinstanz, integriert Esmx-Middleware und verarbeitet SSR-Anfragen
     * @param esmx Esmx-Framework-Instanz, bietet Middleware und Rendering-Funktionen
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Verwendet Esmx-Middleware zur Anfrageverarbeitung
            esmx.middleware(req, res, async () => {
                // Führt serverseitiges Rendering durch
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server gestartet: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Diese Datei ist der Einstiegspunkt für die Entwicklungsumgebungskonfiguration und den Serverstart und enthält zwei Kernfunktionen:

1. `devApp`-Funktion: Verantwortlich für die Erstellung und Konfiguration der Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt Hot Module Replacement (HMR) und Live-Vorschau. Hier wird `createRspackHtmlApp` verwendet, um eine speziell für Preact+HTM entwickelte Rspack-Anwendungsinstanz zu erstellen.
2. `server`-Funktion: Verantwortlich für die Erstellung und Konfiguration des HTTP-Servers, integriert Esmx-Middleware zur Verarbeitung von SSR-Anfragen.

### entry.server.ts

Erstellen Sie die Server-Rendering-Einstiegspunktdatei `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Rendering-Einstiegspunktdatei
 * @description Verantwortlich für den Server-Rendering-Prozess, HTML-Generierung und Ressourceneinbindung
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Anwendungsinstanz erstellen
    const { app } = createApp();

    // Verwendet Preacts renderToString, um den Seiteninhalt zu generieren
    const html = render(app);

    // Führt die Abhängigkeitssammlung aus, um sicherzustellen, dass alle notwendigen Ressourcen geladen werden
    await rc.commit();

    // Generiert die vollständige HTML-Struktur
    rc.html = `<!DOCTYPE html>
<html lang="de-DE">
<head>
    ${rc.preload()}
    <title>Esmx Schnellstart</title>
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

## Projekt ausführen

Nachdem Sie die oben genannten Dateien konfiguriert haben, können Sie das Projekt mit den folgenden Befehlen ausführen:

1. Entwicklungsmodus:
```bash
npm run dev
```

2. Projekt erstellen:
```bash
npm run build
```

3. Produktionsumgebung ausführen:
```bash
npm run start
```

Jetzt haben Sie erfolgreich eine Preact+HTM SSR-Anwendung mit Esmx erstellt! Besuchen Sie http://localhost:3000, um das Ergebnis zu sehen.