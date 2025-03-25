---
titleSuffix: Gez Framework Vue2 SSR Anwendungsbeispiel
description: Erstellen Sie eine Vue2 SSR-Anwendung mit Gez von Grund auf. Dieses Beispiel zeigt die grundlegende Verwendung des Frameworks, einschließlich Projektinitialisierung, Vue2-Konfiguration und Einstiegspunktdateien.
head:
  - - meta
    - property: keywords
      content: Gez, Vue2, SSR-Anwendung, TypeScript-Konfiguration, Projektinitialisierung, Serverseitiges Rendering, Client-Interaktion
---

# Vue2

Dieses Tutorial hilft Ihnen dabei, eine Vue2 SSR-Anwendung mit Gez von Grund auf zu erstellen. Wir werden anhand eines vollständigen Beispiels zeigen, wie Sie mit dem Gez-Framework eine serverseitig gerenderte Anwendung erstellen können.

## Projektstruktur

Zunächst werfen wir einen Blick auf die grundlegende Projektstruktur:

```bash
.
├── package.json         # Projektkonfigurationsdatei, definiert Abhängigkeiten und Skriptbefehle
├── tsconfig.json        # TypeScript-Konfigurationsdatei, legt Compiler-Optionen fest
└── src                  # Quellcode-Verzeichnis
    ├── app.vue          # Hauptanwendungskomponente, definiert Seitenstruktur und Interaktionslogik
    ├── create-app.ts    # Vue-Instanz-Erstellungsfabrik, verantwortlich für die Initialisierung der Anwendung
    ├── entry.client.ts  # Client-Einstiegspunktdatei, verarbeitet das Rendering im Browser
    ├── entry.node.ts    # Node.js-Server-Einstiegspunktdatei, verantwortlich für die Entwicklungsumgebungskonfiguration und Serverstart
    └── entry.server.ts  # Server-Einstiegspunktdatei, verarbeitet das SSR-Rendering
```

## Projektkonfiguration

### package.json

Erstellen Sie die `package.json`-Datei und konfigurieren Sie die Projektabhängigkeiten und Skripte:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
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
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
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

Dadurch werden alle erforderlichen Pakete installiert, einschließlich Vue2, TypeScript und SSR-bezogene Abhängigkeiten.

### tsconfig.json

Erstellen Sie die `tsconfig.json`-Datei und konfigurieren Sie die TypeScript-Compiler-Optionen:

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

## Quellcodestruktur

### app.vue

Erstellen Sie die Hauptanwendungskomponente `src/app.vue` mit der `<script setup>`-Syntax:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Gez Schnellstart</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Beispielkomponente
 * @description Zeigt eine Seitenüberschrift mit automatisch aktualisierter Uhrzeit, um die grundlegenden Funktionen des Gez-Frameworks zu demonstrieren
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Aktuelle Zeit, wird jede Sekunde aktualisiert
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

Erstellen Sie die Datei `src/create-app.ts`, die für die Erstellung der Vue-Anwendungsinstanz verantwortlich ist:

```ts title="src/create-app.ts"
/**
 * @file Vue-Instanz-Erstellung
 * @description Verantwortlich für die Erstellung und Konfiguration der Vue-Anwendungsinstanz
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

Erstellen Sie die Client-Einstiegspunktdatei `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client-Einstiegspunktdatei
 * @description Verantwortlich für die Client-Interaktionslogik und dynamische Aktualisierung
 */

import { createApp } from './create-app';

// Vue-Instanz erstellen
const { app } = createApp();

// Vue-Instanz mounten
app.$mount('#app');
```

### entry.node.ts

Erstellen Sie die Datei `entry.node.ts`, die die Entwicklungsumgebung und den Serverstart konfiguriert:

```ts title="src/entry.node.ts"
/**
 * @file Node.js-Server-Einstiegspunktdatei
 * @description Verantwortlich für die Entwicklungsumgebungskonfiguration und den Serverstart, bietet die SSR-Laufzeitumgebung
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Konfiguriert den Anwendungsersteller für die Entwicklungsumgebung
     * @description Erstellt und konfiguriert die Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt HMR und Live-Vorschau
     * @param gez Gez-Framework-Instanz, bietet Kernfunktionen und Konfigurationsschnittstellen
     * @returns Gibt die konfigurierte Rspack-Anwendungsinstanz zurück, unterstützt HMR und Live-Vorschau
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue2App(gez, {
                config(context) {
                    // Hier können Sie die Rspack-Kompilierungskonfiguration anpassen
                }
            })
        );
    },

    /**
     * Konfiguriert und startet den HTTP-Server
     * @description Erstellt die HTTP-Serverinstanz, integriert Gez-Middleware, verarbeitet SSR-Anfragen
     * @param gez Gez-Framework-Instanz, bietet Middleware und Rendering-Funktionen
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Verwendet Gez-Middleware zur Anfrageverarbeitung
            gez.middleware(req, res, async () => {
                // Führt das serverseitige Rendering aus
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

1. `devApp`-Funktion: Verantwortlich für die Erstellung und Konfiguration der Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt Hot Module Replacement (HMR) und Live-Vorschau. Hier wird `createRspackVue2App` verwendet, um eine speziell für Vue2 entwickelte Rspack-Anwendungsinstanz zu erstellen.
2. `server`-Funktion: Verantwortlich für die Erstellung und Konfiguration des HTTP-Servers, integriert Gez-Middleware zur Verarbeitung von SSR-Anfragen.

### entry.server.ts

Erstellen Sie die Server-Rendering-Einstiegspunktdatei `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Rendering-Einstiegspunktdatei
 * @description Verantwortlich für den Server-Rendering-Prozess, HTML-Generierung und Ressourceneinbindung
 */

import type { RenderContext } from '@gez/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Renderer erstellen
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Vue-Anwendungsinstanz erstellen
    const { app } = createApp();

    // Verwenden Sie Vue's renderToString, um den Seiteninhalt zu generieren
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Abhängigkeitssammlung abschließen, um sicherzustellen, dass alle notwendigen Ressourcen geladen werden
    await rc.commit();

    // Vollständige HTML-Struktur generieren
    rc.html = `<!DOCTYPE html>
<html lang="de-DE">
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

Jetzt haben Sie erfolgreich eine Vue2 SSR-Anwendung mit Gez erstellt! Besuchen Sie http://localhost:3000, um das Ergebnis zu sehen.