---
titleSuffix: Przykład aplikacji Preact+HTM SSR w frameworku Gez
description: Tworzenie aplikacji Preact+HTM SSR od podstaw z wykorzystaniem frameworku Gez. Przykład pokazuje podstawowe użycie frameworku, w tym inicjalizację projektu, konfigurację Preact i ustawienia plików wejściowych.
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, aplikacja SSR, konfiguracja TypeScript, inicjalizacja projektu, renderowanie po stronie serwera, interakcja po stronie klienta
---

# Preact+HTM

Ten tutorial pomoże Ci od podstaw zbudować aplikację Preact+HTM SSR opartą na frameworku Gez. Przedstawimy kompletny przykład, jak użyć frameworku Gez do stworzenia aplikacji z renderowaniem po stronie serwera.

## Struktura projektu

Najpierw zapoznajmy się z podstawową strukturą projektu:

```bash
.
├── package.json         # Plik konfiguracyjny projektu, definiuje zależności i skrypty
├── tsconfig.json        # Plik konfiguracyjny TypeScript, ustawia opcje kompilacji
└── src                  # Katalog z kodem źródłowym
    ├── app.ts           # Główny komponent aplikacji, definiuje strukturę strony i logikę interakcji
    ├── create-app.ts    # Fabryka tworząca instancję aplikacji, odpowiedzialna za inicjalizację aplikacji
    ├── entry.client.ts  # Plik wejściowy klienta, obsługuje renderowanie po stronie przeglądarki
    ├── entry.node.ts    # Plik wejściowy serwera Node.js, odpowiedzialny za konfigurację środowiska deweloperskiego i uruchomienie serwera
    └── entry.server.ts  # Plik wejściowy serwera, obsługuje logikę renderowania SSR
```

## Konfiguracja projektu

### package.json

Utwórz plik `package.json`, aby skonfigurować zależności i skrypty projektu:

```json title="package.json"
{
  "name": "ssr-demo-preact-htm",
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
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

Po utworzeniu pliku `package.json` należy zainstalować zależności projektu. Możesz użyć jednego z poniższych poleceń:
```bash
pnpm install
# lub
yarn install
# lub
npm install
```

Spowoduje to zainstalowanie wszystkich wymaganych pakietów, w tym Preact, HTM, TypeScript i zależności związanych z SSR.

### tsconfig.json

Utwórz plik `tsconfig.json`, aby skonfigurować opcje kompilacji TypeScript:

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

## Struktura kodu źródłowego

### app.ts

Utwórz główny komponent aplikacji `src/app.ts`, używając komponentów klasowych Preact i HTM:

```ts title="src/app.ts"
/**
 * @file Przykładowy komponent
 * @description Pokazuje tytuł strony z automatycznie aktualizowanym czasem, demonstrując podstawowe funkcje frameworku Gez
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Szybki start z Gez</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Utwórz plik `src/create-app.ts`, odpowiedzialny za tworzenie instancji aplikacji:

```ts title="src/create-app.ts"
/**
 * @file Tworzenie instancji aplikacji
 * @description Odpowiedzialny za tworzenie i konfigurację instancji aplikacji
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

Utwórz plik wejściowy klienta `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Plik wejściowy klienta
 * @description Odpowiedzialny za logikę interakcji po stronie klienta i dynamiczne aktualizacje
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Utwórz instancję aplikacji
const { app } = createApp();

// Zamontuj instancję aplikacji
render(app, document.getElementById('app')!);
```

### entry.node.ts

Utwórz plik `entry.node.ts`, aby skonfigurować środowisko deweloperskie i uruchomić serwer:

```ts title="src/entry.node.ts"
/**
 * @file Plik wejściowy serwera Node.js
 * @description Odpowiedzialny za konfigurację środowiska deweloperskiego i uruchomienie serwera, zapewniając środowisko wykonawcze SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Konfiguruje twórcę aplikacji dla środowiska deweloperskiego
     * @description Tworzy i konfiguruje instancję aplikacji Rspack, używanej do budowania i aktualizacji na gorąco w środowisku deweloperskim
     * @param gez Instancja frameworku Gez, zapewniająca podstawowe funkcje i interfejsy konfiguracyjne
     * @returns Zwraca skonfigurowaną instancję aplikacji Rspack, wspierającą HMR i podgląd na żywo
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Tutaj można dostosować konfigurację kompilacji Rspack
                }
            })
        );
    },

    /**
     * Konfiguruje i uruchamia serwer HTTP
     * @description Tworzy instancję serwera HTTP, integrując middleware Gez, obsługujący żądania SSR
     * @param gez Instancja frameworku Gez, zapewniająca middleware i funkcje renderowania
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Użyj middleware Gez do obsługi żądań
            gez.middleware(req, res, async () => {
                // Wykonaj renderowanie po stronie serwera
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Serwer uruchomiony: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Ten plik jest głównym plikiem konfiguracyjnym środowiska deweloperskiego i uruchomienia serwera, zawierającym dwie główne funkcje:

1. Funkcja `devApp`: Odpowiedzialna za tworzenie i konfigurację instancji aplikacji Rspack dla środowiska deweloperskiego, wspierająca aktualizacje na gorąco i podgląd na żywo. Używa `createRspackHtmlApp` do stworzenia specjalnej instancji aplikacji Rspack dla Preact+HTM.
2. Funkcja `server`: Odpowiedzialna za tworzenie i konfigurację serwera HTTP, integrując middleware Gez do obsługi żądań SSR.

### entry.server.ts

Utwórz plik wejściowy renderowania po stronie serwera `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Plik wejściowy renderowania po stronie serwera
 * @description Odpowiedzialny za proces renderowania SSR, generowanie HTML i wstrzykiwanie zasobów
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Utwórz instancję aplikacji
    const { app } = createApp();

    // Użyj renderToString z Preact do wygenerowania zawartości strony
    const html = render(app);

    // Zatwierdź zbieranie zależności, aby upewnić się, że wszystkie niezbędne zasoby zostały załadowane
    await rc.commit();

    // Wygeneruj pełną strukturę HTML
    rc.html = `<!DOCTYPE html>
<html lang="pl">
<head>
    ${rc.preload()}
    <title>Szybki start z Gez</title>
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

## Uruchomienie projektu

Po skonfigurowaniu powyższych plików możesz użyć następujących poleceń do uruchomienia projektu:

1. Tryb deweloperski:
```bash
npm run dev
```

2. Budowanie projektu:
```bash
npm run build
```

3. Uruchomienie w środowisku produkcyjnym:
```bash
npm run start
```

Teraz pomyślnie stworzyłeś aplikację Preact+HTM SSR opartą na frameworku Gez! Odwiedź http://localhost:3000, aby zobaczyć efekt.