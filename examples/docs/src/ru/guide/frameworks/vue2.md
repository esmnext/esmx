---
titleSuffix: Пример приложения Vue2 SSR на фреймворке Esmx
description: Пошаговое руководство по созданию приложения Vue2 SSR с использованием фреймворка Esmx. Включает инициализацию проекта, настройку Vue2 и конфигурацию входных файлов.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue2, SSR приложение, TypeScript конфигурация, инициализация проекта, серверный рендеринг, клиентское взаимодействие
---

# Vue2

В этом руководстве мы шаг за шагом создадим приложение Vue2 SSR с использованием фреймворка Esmx. Мы рассмотрим полный пример, демонстрирующий, как использовать фреймворк Esmx для создания приложения с серверным рендерингом.

## Структура проекта

Для начала рассмотрим базовую структуру проекта:

```bash
.
├── package.json         # Конфигурационный файл проекта, определяющий зависимости и команды
├── tsconfig.json        # Конфигурационный файл TypeScript, настройки компиляции
└── src                  # Директория с исходным кодом
    ├── app.vue          # Главный компонент приложения, определяющий структуру страницы и логику взаимодействия
    ├── create-app.ts    # Фабрика создания экземпляра Vue, отвечающая за инициализацию приложения
    ├── entry.client.ts  # Входной файл для клиента, обработка рендеринга на стороне браузера
    ├── entry.node.ts    # Входной файл для сервера Node.js, отвечающий за конфигурацию среды разработки и запуск сервера
    └── entry.server.ts  # Входной файл для сервера, обработка логики SSR рендеринга
```

## Конфигурация проекта

### package.json

Создайте файл `package.json` для настройки зависимостей и скриптов проекта:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
    "vue-tsc": "^2.1.6"
  }
}
```

После создания файла `package.json` установите зависимости проекта. Вы можете использовать одну из следующих команд для установки:
```bash
pnpm install
# или
yarn install
# или
npm install
```

Это установит все необходимые зависимости, включая Vue2, TypeScript и зависимости для SSR.

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
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Структура исходного кода

### app.vue

Создайте главный компонент приложения `src/app.vue`, используя синтаксис `<script setup>`:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Быстрый старт с Esmx</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Пример компонента
 * @description Демонстрация заголовка страницы с автоматически обновляемым временем, иллюстрирующая базовые функции фреймворка Esmx
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
 * @description Отвечает за создание и конфигурацию экземпляра приложения Vue
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
app.$mount('#app');
```

### entry.node.ts

Создайте файл `entry.node.ts` для конфигурации среды разработки и запуска сервера:

```ts title="src/entry.node.ts"
/**
 * @file Входной файл для сервера Node.js
 * @description Отвечает за конфигурацию среды разработки и запуск сервера, предоставляет среду выполнения для SSR
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Конфигурация создателя приложения для среды разработки
     * @description Создает и конфигурирует экземпляр приложения Rspack для сборки и горячей перезагрузки в среде разработки
     * @param esmx Экземпляр фреймворка Esmx, предоставляющий основные функции и интерфейсы конфигурации
     * @returns Возвращает сконфигурированный экземпляр приложения Rspack, поддерживающий HMR и предварительный просмотр в реальном времени
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx, {
                config(context) {
                    // Здесь можно настроить конфигурацию компиляции Rspack
                }
            })
        );
    },

    /**
     * Конфигурация и запуск HTTP сервера
     * @description Создает экземпляр HTTP сервера, интегрирует промежуточное ПО Esmx для обработки запросов SSR
     * @param esmx Экземпляр фреймворка Esmx, предоставляющий промежуточное ПО и функции рендеринга
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Использование промежуточного ПО Esmx для обработки запросов
            esmx.middleware(req, res, async () => {
                // Выполнение серверного рендеринга
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Сервер запущен: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

Этот файл является входным для конфигурации среды разработки и запуска сервера, содержащим две основные функции:

1. Функция `devApp`: отвечает за создание и конфигурацию экземпляра приложения Rspack для среды разработки, поддерживает горячую перезагрузку и предварительный просмотр в реальном времени. Здесь используется `createRspackVue2App` для создания экземпляра приложения Rspack, предназначенного для Vue2.
2. Функция `server`: отвечает за создание и конфигурацию HTTP сервера, интегрирует промежуточное ПО Esmx для обработки запросов SSR.

### entry.server.ts

Создайте входной файл для серверного рендеринга `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Входной файл для серверного рендеринга
 * @description Отвечает за процесс серверного рендеринга, генерацию HTML и инъекцию ресурсов
 */

import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Создание рендерера
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Создание экземпляра приложения Vue
    const { app } = createApp();

    // Использование renderToString для генерации содержимого страницы
    const html = await renderer.renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Фиксация сбора зависимостей, чтобы все необходимые ресурсы были загружены
    await rc.commit();

    // Генерация полной структуры HTML
    rc.html = `<!DOCTYPE html>
<html lang="ru">
<head>
    ${rc.preload()}
    <title>Быстрый старт с Esmx</title>
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

## Запуск проекта

После завершения настройки файлов вы можете использовать следующие команды для запуска проекта:

1. Режим разработки:
```bash
npm run dev
```

2. Сборка проекта:
```bash
npm run build
```

3. Запуск в производственной среде:
```bash
npm run start
```

Теперь вы успешно создали приложение Vue2 SSR с использованием фреймворка Esmx! Перейдите по адресу http://localhost:3000, чтобы увидеть результат.