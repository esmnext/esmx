---
titleSuffix: Przykład aplikacji HTML SSR w frameworku Gez
description: Przewodnik krok po kroku dotyczący tworzenia aplikacji HTML SSR opartej na Gez, prezentujący podstawowe użycie frameworku, w tym inicjalizację projektu, konfigurację HTML i ustawienia plików wejściowych.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, Aplikacja SSR, Konfiguracja TypeScript, Inicjalizacja projektu, Renderowanie po stronie serwera, Interakcja po stronie klienta
---

# HTML

Ten tutorial poprowadzi Cię przez proces tworzenia aplikacji HTML SSR opartej na Gez od podstaw. Przedstawimy kompleksowy przykład, jak użyć frameworku Gez do stworzenia aplikacji z renderowaniem po stronie serwera.

## Struktura projektu

Najpierw zapoznajmy się z podstawową strukturą projektu:

```bash
.
├── package.json         # Plik konfiguracyjny projektu, definiujący zależności i skrypty
├── tsconfig.json        # Plik konfiguracyjny TypeScript, ustawiający opcje kompilacji
└── src                  # Katalog z kodem źródłowym
    ├── app.ts           # Główny komponent aplikacji, definiujący strukturę strony i logikę interakcji
    ├── create-app.ts    # Fabryka tworząca instancję aplikacji, odpowiedzialna za inicjalizację aplikacji
    ├── entry.client.ts  # Plik wejściowy dla klienta, obsługujący renderowanie po stronie przeglądarki
    ├── entry.node.ts    # Plik wejściowy dla serwera Node.js, odpowiedzialny za konfigurację środowiska deweloperskiego i uruchomienie serwera
    └── entry.server.ts  # Plik wejściowy dla serwera, obsługujący logikę renderowania SSR
```

## Konfiguracja projektu

### package.json

Utwórz plik `package.json`, aby skonfigurować zależności i skrypty projektu:

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

Po utworzeniu pliku `package.json` należy zainstalować zależności projektu. Możesz użyć jednego z poniższych poleceń:

```bash
pnpm install
# lub
yarn install
# lub
npm install
```

Spowoduje to zainstalowanie wszystkich wymaganych pakietów, w tym TypeScript i zależności związanych z SSR.

### tsconfig.json

Utwórz plik `tsconfig.json`, aby skonfigurować opcje kompilacji TypeScript:

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

## Struktura kodu źródłowego

### app.ts

Utwórz główny komponent aplikacji `src/app.ts`, implementujący strukturę strony i logikę interakcji:

```ts title="src/app.ts"
/**
 * @file Przykładowy komponent
 * @description Prezentuje nagłówek strony z automatycznie aktualizowanym czasem, demonstrujący podstawowe funkcje frameworku Gez
 */

export default class App {
    /**
     * Aktualny czas w formacie ISO
     * @type {string}
     */
    public time = '';

    /**
     * Tworzy instancję aplikacji
     * @param {SsrContext} [ssrContext] - Kontekst SSR, zawierający zbiór metadanych importu
     */
    public constructor(public ssrContext?: SsrContext) {
        // W konstruktorze nie jest wymagana dodatkowa inicjalizacja
    }

    /**
     * Renderuje zawartość strony
     * @returns {string} Zwraca strukturę HTML strony
     */
    public render(): string {
        // Upewnij się, że metadane importu są poprawnie zbierane w środowisku serwera
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Szybki start z Gez</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Inicjalizacja po stronie klienta
     * @throws {Error} Rzuca błąd, jeśli nie można znaleźć elementu wyświetlającego czas
     */
    public onClient(): void {
        // Pobierz element wyświetlający czas
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Nie znaleziono elementu wyświetlającego czas');
        }

        // Ustaw timer, aby aktualizować czas co sekundę
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Inicjalizacja po stronie serwera
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Interfejs kontekstu SSR
 * @interface
 */
export interface SsrContext {
    /**
     * Zbiór metadanych importu
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Utwórz plik `src/create-app.ts`, odpowiedzialny za tworzenie instancji aplikacji:

```ts title="src/create-app.ts"
/**
 * @file Tworzenie instancji aplikacji
 * @description Odpowiedzialny za tworzenie i konfigurację instancji aplikacji
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

Utwórz plik wejściowy dla klienta `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Plik wejściowy dla klienta
 * @description Odpowiedzialny za logikę interakcji po stronie klienta i dynamiczne aktualizacje
 */

import { createApp } from './create-app';

// Utwórz instancję aplikacji i zainicjalizuj
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Utwórz plik `entry.node.ts`, aby skonfigurować środowisko deweloperskie i uruchomić serwer:

```ts title="src/entry.node.ts"
/**
 * @file Plik wejściowy dla serwera Node.js
 * @description Odpowiedzialny za konfigurację środowiska deweloperskiego i uruchomienie serwera, zapewniający środowisko wykonawcze SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Konfiguruje kreator aplikacji dla środowiska deweloperskiego
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
            // Użyj middleware Gez do obsługi żądania
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

Ten plik jest głównym plikiem wejściowym dla konfiguracji środowiska deweloperskiego i uruchomienia serwera, zawierającym dwie główne funkcje:

1. Funkcja `devApp`: Odpowiedzialna za tworzenie i konfigurację instancji aplikacji Rspack dla środowiska deweloperskiego, wspierająca aktualizacje na gorąco i podgląd na żywo.
2. Funkcja `server`: Odpowiedzialna za tworzenie i konfigurację serwera HTTP, integrująca middleware Gez do obsługi żądań SSR.

### entry.server.ts

Utwórz plik wejściowy dla renderowania po stronie serwera `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Plik wejściowy dla renderowania po stronie serwera
 * @description Odpowiedzialny za proces renderowania SSR, generowanie HTML i wstrzykiwanie zasobów
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Hermetyzuje logikę generowania zawartości strony
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Wstrzyknij kontekst SSR do instancji aplikacji
    app.ssrContext = ssrContext;
    // Inicjalizuj po stronie serwera
    app.onServer();

    // Wygeneruj zawartość strony
    return app.render();
};

export default async (rc: RenderContext) => {
    // Utwórz instancję aplikacji, zwracając obiekt zawierający instancję app
    const { app } = createApp();
    // Użyj renderToString do wygenerowania zawartości strony
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Zatwierdź zbieranie zależności, aby upewnić się, że wszystkie wymagane zasoby zostały załadowane
    await rc.commit();

    // Wygeneruj kompletną strukturę HTML
    rc.html = `<!DOCTYPE html>
<html lang="pl-PL">
<head>
    ${rc.preload()}
    <title>Szybki start z Gez</title>
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

Teraz pomyślnie utworzyłeś aplikację HTML SSR opartą na Gez! Odwiedź http://localhost:3000, aby zobaczyć efekt.