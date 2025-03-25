---
titleSuffix: Przykład aplikacji Vue3 SSR w frameworku Gez
description: Tworzenie aplikacji Vue3 SSR opartej na Gez od podstaw, prezentujące podstawowe użycie frameworku, w tym inicjalizację projektu, konfigurację Vue3 i ustawienia plików wejściowych.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, aplikacja SSR, konfiguracja TypeScript, inicjalizacja projektu, renderowanie po stronie serwera, interakcja po stronie klienta, API kompozycyjne
---

# Vue3

Ten tutorial poprowadzi Cię przez proces tworzenia aplikacji Vue3 SSR opartej na Gez od podstaw. Przedstawimy pełny przykład, jak użyć frameworku Gez do stworzenia aplikacji z renderowaniem po stronie serwera.

## Struktura projektu

Najpierw zapoznajmy się z podstawową strukturą projektu:

```bash
.
├── package.json         # Plik konfiguracyjny projektu, definiuje zależności i skrypty
├── tsconfig.json        # Plik konfiguracyjny TypeScript, ustawia opcje kompilacji
└── src                  # Katalog z kodem źródłowym
    ├── app.vue          # Główny komponent aplikacji, definiuje strukturę strony i logikę interakcji
    ├── create-app.ts    # Fabryka tworzenia instancji Vue, odpowiedzialna za inicjalizację aplikacji
    ├── entry.client.ts  # Plik wejściowy klienta, obsługuje renderowanie po stronie przeglądarki
    ├── entry.node.ts    # Plik wejściowy serwera Node.js, odpowiedzialny za konfigurację środowiska deweloperskiego i uruchomienie serwera
    └── entry.server.ts  # Plik wejściowy serwera, obsługuje logikę renderowania SSR
```

## Konfiguracja projektu

### package.json

Utwórz plik `package.json`, aby skonfigurować zależności i skrypty projektu:

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

Po utworzeniu pliku `package.json`, zainstaluj zależności projektu. Możesz użyć jednego z poniższych poleceń:
```bash
pnpm install
# lub
yarn install
# lub
npm install
```

Spowoduje to zainstalowanie wszystkich wymaganych pakietów, w tym Vue3, TypeScript i zależności związanych z SSR.

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Struktura kodu źródłowego

### app.vue

Utwórz główny komponent aplikacji `src/app.vue`, używając API kompozycyjnego Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Szybki start z Gez</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Przykładowy komponent
 * @description Prezentuje nagłówek strony z automatycznie aktualizowanym czasem, demonstrując podstawowe funkcje frameworku Gez
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Aktualny czas, aktualizowany co sekundę
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

Utwórz plik `src/create-app.ts`, odpowiedzialny za tworzenie instancji aplikacji Vue:

```ts title="src/create-app.ts"
/**
 * @file Tworzenie instancji Vue
 * @description Odpowiedzialny za tworzenie i konfigurację instancji aplikacji Vue
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

Utwórz plik wejściowy klienta `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Plik wejściowy klienta
 * @description Odpowiedzialny za logikę interakcji klienta i dynamiczne aktualizacje
 */

import { createApp } from './create-app';

// Utwórz instancję Vue
const { app } = createApp();

// Zamontuj instancję Vue
app.mount('#app');
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
     * Konfiguruje kreatora aplikacji dla środowiska deweloperskiego
     * @description Tworzy i konfiguruje instancję aplikacji Rspack, używanej do budowania i aktualizacji na gorąco w środowisku deweloperskim
     * @param gez Instancja frameworku Gez, zapewniająca podstawowe funkcje i interfejsy konfiguracyjne
     * @returns Zwraca skonfigurowaną instancję aplikacji Rspack, wspierającą HMR i podgląd na żywo
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
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

Ten plik jest głównym plikiem konfiguracyjnym i uruchamiającym serwer w środowisku deweloperskim, zawierającym dwie główne funkcje:

1. Funkcja `devApp`: Odpowiedzialna za tworzenie i konfigurację instancji aplikacji Rspack dla środowiska deweloperskiego, wspierająca aktualizacje na gorąco i podgląd na żywo. Używa `createRspackVue3App` do stworzenia instancji aplikacji Rspack specjalnie dla Vue3.
2. Funkcja `server`: Odpowiedzialna za tworzenie i konfigurację serwera HTTP, integrując middleware Gez do obsługi żądań SSR.

### entry.server.ts

Utwórz plik wejściowy renderowania po stronie serwera `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Plik wejściowy renderowania po stronie serwera
 * @description Odpowiedzialny za proces renderowania SSR, generowanie HTML i wstrzykiwanie zasobów
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Utwórz instancję aplikacji Vue
    const { app } = createApp();

    // Użyj renderToString z Vue do wygenerowania zawartości strony
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Zatwierdź zbieranie zależności, aby zapewnić załadowanie wszystkich niezbędnych zasobów
    await rc.commit();

    // Wygeneruj pełną strukturę HTML
    rc.html = `<!DOCTYPE html>
<html lang="pl-PL">
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

Po skonfigurowaniu powyższych plików, możesz użyć poniższych poleceń do uruchomienia projektu:

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

Teraz pomyślnie stworzyłeś aplikację Vue3 SSR opartą na Gez! Odwiedź http://localhost:3000, aby zobaczyć efekt.