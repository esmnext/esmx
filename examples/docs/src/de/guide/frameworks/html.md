---
titleSuffix: Gez Framework HTML SSR Anwendungsbeispiel
description: Erstellen Sie eine HTML SSR-Anwendung mit Gez von Grund auf. Dieses Beispiel zeigt die grundlegende Verwendung des Frameworks, einschließlich Projektinitialisierung, HTML-Konfiguration und Einstiegspunktdateien.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, SSR-Anwendung, TypeScript-Konfiguration, Projektinitialisierung, Serverseitiges Rendering, Client-Interaktion
---

# HTML

Dieses Tutorial hilft Ihnen dabei, eine HTML SSR-Anwendung mit Gez von Grund auf zu erstellen. Wir werden anhand eines vollständigen Beispiels zeigen, wie Sie mit dem Gez-Framework eine serverseitig gerenderte Anwendung erstellen können.

## Projektstruktur

Zunächst lassen Sie uns die grundlegende Struktur des Projekts verstehen:

```bash
.
├── package.json         # Projektkonfigurationsdatei, definiert Abhängigkeiten und Skriptbefehle
├── tsconfig.json        # TypeScript-Konfigurationsdatei, setzt Compiler-Optionen
└── src                  # Quellcode-Verzeichnis
    ├── app.ts           # Hauptanwendungskomponente, definiert Seitenstruktur und Interaktionslogik
    ├── create-app.ts    # Anwendungsinstanz-Erstellungsfabrik, verantwortlich für die Initialisierung der Anwendung
    ├── entry.client.ts  # Client-Einstiegspunktdatei, verarbeitet das Rendering im Browser
    ├── entry.node.ts    # Node.js-Server-Einstiegspunktdatei, verantwortlich für die Entwicklungsumgebungskonfiguration und Serverstart
    └── entry.server.ts  # Server-Einstiegspunktdatei, verarbeitet das SSR-Rendering
```

## Projektkonfiguration

### package.json

Erstellen Sie die `package.json`-Datei, um Projektabhängigkeiten und Skripte zu konfigurieren:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
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

Dadurch werden alle erforderlichen Abhängigkeiten installiert, einschließlich TypeScript und SSR-bezogene Abhängigkeiten.

### tsconfig.json

Erstellen Sie die `tsconfig.json`-Datei, um die TypeScript-Compiler-Optionen zu konfigurieren:

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

## Quellcode-Struktur

### app.ts

Erstellen Sie die Hauptanwendungskomponente `src/app.ts`, um die Seitenstruktur und Interaktionslogik zu implementieren:

```ts title="src/app.ts"
/**
 * @file Beispielkomponente
 * @description Zeigt eine Seitenüberschrift mit automatisch aktualisierter Uhrzeit, um die grundlegenden Funktionen des Gez-Frameworks zu demonstrieren
 */

export default class App {
    /**
     * Aktuelle Zeit im ISO-Format
     * @type {string}
     */
    public time = '';

    /**
     * Erstellt eine Anwendungsinstanz
     * @param {SsrContext} [ssrContext] - Serverseitiger Kontext, enthält eine Sammlung von Import-Metadaten
     */
    public constructor(public ssrContext?: SsrContext) {
        // Keine zusätzliche Initialisierung im Konstruktor erforderlich
    }

    /**
     * Rendert den Seiteninhalt
     * @returns {string} Gibt die HTML-Struktur der Seite zurück
     */
    public render(): string {
        // Sicherstellen, dass Import-Metadaten im Serverkontext korrekt gesammelt werden
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Gez Schnellstart</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Client-Initialisierung
     * @throws {Error} Wirft einen Fehler, wenn das Zeitanzeigeelement nicht gefunden wird
     */
    public onClient(): void {
        // Zeitanzeigeelement abrufen
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Zeitanzeigeelement nicht gefunden');
        }

        // Timer einstellen, um die Zeit jede Sekunde zu aktualisieren
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Server-Initialisierung
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Serverseitiger Kontext
 * @interface
 */
export interface SsrContext {
    /**
     * Sammlung von Import-Metadaten
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Erstellen Sie die Datei `src/create-app.ts`, die für die Erstellung der Anwendungsinstanz verantwortlich ist:

```ts title="src/create-app.ts"
/**
 * @file Anwendungsinstanz-Erstellung
 * @description Verantwortlich für die Erstellung und Konfiguration der Anwendungsinstanz
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

Erstellen Sie die Client-Einstiegspunktdatei `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client-Einstiegspunktdatei
 * @description Verantwortlich für die Client-Interaktionslogik und dynamische Aktualisierung
 */

import { createApp } from './create-app';

// Anwendungsinstanz erstellen und initialisieren
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Erstellen Sie die Datei `entry.node.ts`, um die Entwicklungsumgebung und den Serverstart zu konfigurieren:

```ts title="src/entry.node.ts"
/**
 * @file Node.js-Server-Einstiegspunktdatei
 * @description Verantwortlich für die Entwicklungsumgebungskonfiguration und den Serverstart, bietet eine SSR-Laufzeitumgebung
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Konfiguriert den Anwendungsersteller für die Entwicklungsumgebung
     * @description Erstellt und konfiguriert eine Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt HMR und Live-Vorschau
     * @param gez Gez-Framework-Instanz, bietet Kernfunktionen und Konfigurationsschnittstellen
     * @returns Gibt die konfigurierte Rspack-Anwendungsinstanz zurück, unterstützt HMR und Live-Vorschau
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Hier können Sie die Rspack-Kompilierungskonfiguration anpassen
                }
            })
        );
    },

    /**
     * Konfiguriert und startet den HTTP-Server
     * @description Erstellt eine HTTP-Serverinstanz, integriert Gez-Middleware und verarbeitet SSR-Anfragen
     * @param gez Gez-Framework-Instanz, bietet Middleware und Rendering-Funktionen
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Gez-Middleware zur Anfrageverarbeitung verwenden
            gez.middleware(req, res, async () => {
                // Serverseitiges Rendering durchführen
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server gestartet: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Diese Datei ist der Einstiegspunkt für die Entwicklungsumgebungskonfiguration und den Serverstart und enthält zwei Kernfunktionen:

1. `devApp`-Funktion: Verantwortlich für die Erstellung und Konfiguration der Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt Hot Module Replacement (HMR) und Live-Vorschau.
2. `server`-Funktion: Verantwortlich für die Erstellung und Konfiguration des HTTP-Servers, integriert Gez-Middleware zur Verarbeitung von SSR-Anfragen.

### entry.server.ts

Erstellen Sie die Server-Rendering-Einstiegspunktdatei `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Rendering-Einstiegspunktdatei
 * @description Verantwortlich für den Server-Rendering-Prozess, die HTML-Generierung und die Ressourceneinbindung
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Kapselt die Logik zur Generierung des Seiteninhalts
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Serverseitigen Rendering-Kontext in die Anwendungsinstanz einfügen
    app.ssrContext = ssrContext;
    // Serverseitige Initialisierung durchführen
    app.onServer();

    // Seiteninhalt generieren
    return app.render();
};

export default async (rc: RenderContext) => {
    // Anwendungsinstanz erstellen, gibt ein Objekt mit der app-Instanz zurück
    const { app } = createApp();
    // renderToString verwenden, um den Seiteninhalt zu generieren
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Abhängigkeitssammlung abschließen, um sicherzustellen, dass alle notwendigen Ressourcen geladen werden
    await rc.commit();

    // Vollständige HTML-Struktur generieren
    rc.html = `<!DOCTYPE html>
<html lang="de">
<head>
    ${rc.preload()}
    <title>Gez Schnellstart</title>
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

Jetzt haben Sie erfolgreich eine HTML SSR-Anwendung mit Gez erstellt! Besuchen Sie http://localhost:3000, um das Ergebnis zu sehen.