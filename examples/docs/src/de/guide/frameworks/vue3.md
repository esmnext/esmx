---
titleSuffix: Gez Framework Vue3 SSR Anwendungsbeispiel
description: Erstellen Sie eine Vue3 SSR-Anwendung mit Gez von Grund auf. Dieses Beispiel zeigt die grundlegende Verwendung des Frameworks, einschließlich Projektinitialisierung, Vue3-Konfiguration und Einstiegspunktdateien.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, SSR-Anwendung, TypeScript-Konfiguration, Projektinitialisierung, Serverseitiges Rendering, Client-Interaktion, Composition API
---

# Vue3

Dieses Tutorial hilft Ihnen dabei, eine Vue3 SSR-Anwendung mit Gez von Grund auf zu erstellen. Wir werden anhand eines vollständigen Beispiels zeigen, wie Sie mit dem Gez-Framework eine serverseitig gerenderte Anwendung erstellen können.

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

Nachdem Sie die `package.json`-Datei erstellt haben, müssen Sie die Projektabhängigkeiten installieren. Sie können einen der folgenden Befehle verwenden:

```bash
pnpm install
# oder
yarn install
# oder
npm install
```

Dadurch werden alle erforderlichen Pakete installiert, einschließlich Vue3, TypeScript und SSR-bezogene Abhängigkeiten.

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Quellcode-Struktur

### app.vue

Erstellen Sie die Hauptanwendungskomponente `src/app.vue` und verwenden Sie die Composition API von Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Gez Schnellstart</a></h1>
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
app.mount('#app');
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
            m.createRspackVue3App(gez, {
                config(context) {
                    // Hier können Sie die Rspack-Kompilierungskonfiguration anpassen
                }
            })
        );
    },

    /**
     * Konfiguriert und startet den HTTP-Server
     * @description Erstellt die HTTP-Serverinstanz, integriert Gez-Middleware und verarbeitet SSR-Anfragen
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

1. `devApp`-Funktion: Verantwortlich für die Erstellung und Konfiguration der Rspack-Anwendungsinstanz für die Entwicklungsumgebung, unterstützt Hot Module Replacement (HMR) und Live-Vorschau. Hier wird `createRspackVue3App` verwendet, um eine speziell für Vue3 entwickelte Rspack-Anwendungsinstanz zu erstellen.
2. `server`-Funktion: Verantwortlich für die Erstellung und Konfiguration des HTTP-Servers, integriert Gez-Middleware zur Verarbeitung von SSR-Anfragen.

### entry.server.ts

Erstellen Sie die Server-Rendering-Einstiegspunktdatei `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Rendering-Einstiegspunktdatei
 * @description Verantwortlich für den Server-Rendering-Prozess, HTML-Generierung und Ressourceneinbindung
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Vue-Anwendungsinstanz erstellen
    const { app } = createApp();

    // Verwendet Vue's renderToString, um den Seiteninhalt zu generieren
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Führt die Abhängigkeitssammlung aus, um sicherzustellen, dass alle notwendigen Ressourcen geladen werden
    await rc.commit();

    // Generiert die vollständige HTML-Struktur
    rc.html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    ${rc.preload()}
    <title>Gez Schnellstart</title>
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

Jetzt haben Sie erfolgreich eine Vue3 SSR-Anwendung mit Gez erstellt! Besuchen Sie http://localhost:3000, um das Ergebnis zu sehen.