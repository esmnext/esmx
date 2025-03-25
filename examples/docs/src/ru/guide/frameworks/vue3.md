---
titleSuffix: Пример SSR-приложения на Vue3 с использованием фреймворка Gez
description: Пошаговое руководство по созданию SSR-приложения на Vue3 с использованием фреймворка Gez. Включает инициализацию проекта, настройку Vue3 и конфигурацию входных файлов.
head:
  - - meta
    - property: keywords
      content: Gez, Vue3, SSR-приложение, TypeScript, инициализация проекта, серверный рендеринг, клиентское взаимодействие, Composition API
---

# Vue3

В этом руководстве мы шаг за шагом создадим SSR-приложение на Vue3 с использованием фреймворка Gez. Мы рассмотрим полный пример, демонстрирующий, как использовать Gez для создания приложения с серверным рендерингом.

## Структура проекта

Для начала рассмотрим базовую структуру проекта:

```bash
.
├── package.json         # Конфигурационный файл проекта, определяющий зависимости и команды
├── tsconfig.json        # Конфигурационный файл TypeScript, настройки компиляции
└── src                  # Директория с исходным кодом
    ├── app.vue          # Главный компонент приложения, определяющий структуру страницы и логику взаимодействия
    ├── create-app.ts    # Фабрика создания экземпляра Vue, отвечающая за инициализацию приложения
    ├── entry.client.ts  # Входной файл для клиента, обрабатывающий рендеринг на стороне браузера
    ├── entry.node.ts    # Входной файл для Node.js, отвечающий за конфигурацию среды разработки и запуск сервера
    └── entry.server.ts  # Входной файл для сервера, обрабатывающий логику SSR-рендеринга
```

## Конфигурация проекта

### package.json

Создайте файл `package.json` для настройки зависимостей и скриптов проекта:

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

После создания файла `package.json` установите зависимости проекта. Вы можете использовать одну из следующих команд:

```bash
pnpm install
# или
yarn install
# или
npm install
```

Это установит все необходимые зависимости, включая Vue3, TypeScript и зависимости для SSR.

### tsconfig.json

Создайте файл `tsconfig.json` для настройки параметров компиляции TypeScript:

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

## Структура исходного кода

### app.vue

Создайте главный компонент приложения `src/app.vue`, используя Composition API Vue3:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Быстрый старт с Gez</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Пример компонента
 * @description Демонстрирует заголовок страницы с автоматически обновляемым временем, чтобы показать базовые возможности фреймворка Gez
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Текущее время, обновляется каждую секунду
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

Создайте файл `src/create-app.ts`, отвечающий за создание экземпляра Vue:

```ts title="src/create-app.ts"
/**
 * @file Создание экземпляра Vue
 * @description Отвечает за создание и настройку экземпляра приложения Vue
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

Создайте входной файл для клиента `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Входной файл для клиента
 * @description Отвечает за логику взаимодействия на стороне клиента и динамическое обновление
 */

import { createApp } from './create-app';

// Создание экземпляра Vue
const { app } = createApp();

// Монтирование экземпляра Vue
app.mount('#app');
```

### entry.node.ts

Создайте файл `entry.node.ts` для настройки среды разработки и запуска сервера:

```ts title="src/entry.node.ts"
/**
 * @file Входной файл для Node.js
 * @description Отвечает за конфигурацию среды разработки и запуск сервера, предоставляя среду выполнения для SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Конфигурация приложения для среды разработки
     * @description Создает и настраивает экземпляр приложения Rspack для сборки и горячей перезагрузки в среде разработки
     * @param gez Экземпляр фреймворка Gez, предоставляющий основные функции и интерфейсы конфигурации
     * @returns Возвращает настроенный экземпляр приложения Rspack с поддержкой HMR и live preview
     */
    async devApp(gez) {
        return import('@gez/rspack-vue').then((m) =>
            m.createRspackVue3App(gez, {
                config(context) {
                    // Здесь можно настроить конфигурацию компиляции Rspack
                }
            })
        );
    },

    /**
     * Конфигурация и запуск HTTP-сервера
     * @description Создает экземпляр HTTP-сервера, интегрирует middleware Gez для обработки SSR-запросов
     * @param gez Экземпляр фреймворка Gez, предоставляющий middleware и функции рендеринга
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Использование middleware Gez для обработки запросов
            gez.middleware(req, res, async () => {
                // Выполнение серверного рендеринга
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Сервер запущен: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

Этот файл является входной точкой для конфигурации среды разработки и запуска сервера. Он содержит две основные функции:

1. `devApp`: отвечает за создание и настройку экземпляра приложения Rspack для среды разработки с поддержкой горячей перезагрузки и live preview. Здесь используется `createRspackVue3App` для создания экземпляра приложения Rspack, оптимизированного для Vue3.
2. `server`: отвечает за создание и настройку HTTP-сервера, интегрируя middleware Gez для обработки SSR-запросов.

### entry.server.ts

Создайте входной файл для серверного рендеринга `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Входной файл для серверного рендеринга
 * @description Отвечает за процесс серверного рендеринга, генерацию HTML и инъекцию ресурсов
 */

import type { RenderContext } from '@gez/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Создание экземпляра приложения Vue
    const { app } = createApp();

    // Использование renderToString для генерации содержимого страницы
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Фиксация сбора зависимостей, чтобы убедиться, что все необходимые ресурсы загружены
    await rc.commit();

    // Генерация полной HTML-структуры
    rc.html = `<!DOCTYPE html>
<html lang="ru">
<head>
    ${rc.preload()}
    <title>Быстрый старт с Gez</title>
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

## Запуск проекта

После завершения настройки файлов вы можете запустить проект с помощью следующих команд:

1. Режим разработки:
```bash
npm run dev
```

2. Сборка проекта:
```bash
npm run build
```

3. Запуск в production-режиме:
```bash
npm run start
```

Теперь вы успешно создали SSR-приложение на Vue3 с использованием фреймворка Gez! Перейдите по адресу http://localhost:3000, чтобы увидеть результат.