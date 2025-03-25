---
titleSuffix: Пример SSR-приложения на Gez с использованием Preact+HTM
description: Пошаговое руководство по созданию SSR-приложения на основе Gez с использованием Preact и HTM. Включает инициализацию проекта, настройку Preact и конфигурацию входных файлов.
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, SSR-приложение, конфигурация TypeScript, инициализация проекта, серверный рендеринг, клиентское взаимодействие
---

# Preact+HTM

Это руководство поможет вам с нуля создать SSR-приложение на основе Gez с использованием Preact и HTM. Мы рассмотрим полный пример, демонстрирующий, как использовать фреймворк Gez для создания приложения с серверным рендерингом.

## Структура проекта

Для начала давайте рассмотрим базовую структуру проекта:

```bash
.
├── package.json         # Конфигурационный файл проекта, определяющий зависимости и команды
├── tsconfig.json        # Конфигурационный файл TypeScript, настройки компиляции
└── src                  # Директория с исходным кодом
    ├── app.ts           # Главный компонент приложения, определяющий структуру страницы и логику взаимодействия
    ├── create-app.ts    # Фабрика создания экземпляра приложения, отвечающая за инициализацию приложения
    ├── entry.client.ts  # Входной файл для клиента, обрабатывающий рендеринг на стороне браузера
    ├── entry.node.ts    # Входной файл для Node.js сервера, отвечающий за конфигурацию среды разработки и запуск сервера
    └── entry.server.ts  # Входной файл для сервера, обрабатывающий логику SSR-рендеринга
```

## Конфигурация проекта

### package.json

Создайте файл `package.json` для настройки зависимостей и скриптов проекта:

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

После создания файла `package.json` установите зависимости проекта. Вы можете использовать одну из следующих команд для установки:
```bash
pnpm install
# или
yarn install
# или
npm install
```

Это установит все необходимые зависимости, включая Preact, HTM, TypeScript и зависимости для SSR.

### tsconfig.json

Создайте файл `tsconfig.json` для настройки параметров компиляции TypeScript:

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

## Структура исходного кода

### app.ts

Создайте главный компонент приложения `src/app.ts`, используя классовый компонент Preact и HTM:

```ts title="src/app.ts"
/**
 * @file Пример компонента
 * @description Демонстрирует заголовок страницы с автоматически обновляемым временем, чтобы показать базовые возможности фреймворка Gez
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Быстрый старт с Gez</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Создайте файл `src/create-app.ts`, отвечающий за создание экземпляра приложения:

```ts title="src/create-app.ts"
/**
 * @file Создание экземпляра приложения
 * @description Отвечает за создание и конфигурацию экземпляра приложения
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

Создайте входной файл для клиента `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Входной файл для клиента
 * @description Отвечает за логику взаимодействия на стороне клиента и динамическое обновление
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Создание экземпляра приложения
const { app } = createApp();

// Монтирование экземпляра приложения
render(app, document.getElementById('app')!);
```

### entry.node.ts

Создайте файл `entry.node.ts` для конфигурации среды разработки и запуска сервера:

```ts title="src/entry.node.ts"
/**
 * @file Входной файл для Node.js сервера
 * @description Отвечает за конфигурацию среды разработки и запуск сервера, предоставляя среду выполнения для SSR
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Конфигурация создателя приложения для среды разработки
     * @description Создает и конфигурирует экземпляр приложения Rspack для сборки и горячей перезагрузки в среде разработки
     * @param gez Экземпляр фреймворка Gez, предоставляющий основные функции и интерфейсы конфигурации
     * @returns Возвращает сконфигурированный экземпляр приложения Rspack с поддержкой HMR и live preview
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
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

Этот файл является входным для конфигурации среды разработки и запуска сервера. Он содержит две основные функции:

1. `devApp`: отвечает за создание и конфигурацию экземпляра приложения Rspack для среды разработки с поддержкой горячей перезагрузки и live preview. Здесь используется `createRspackHtmlApp` для создания экземпляра приложения Rspack, предназначенного для Preact+HTM.
2. `server`: отвечает за создание и конфигурацию HTTP-сервера, интегрируя middleware Gez для обработки SSR-запросов.

### entry.server.ts

Создайте входной файл для серверного рендеринга `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Входной файл для серверного рендеринга
 * @description Отвечает за процесс серверного рендеринга, генерацию HTML и инъекцию ресурсов
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Создание экземпляра приложения
    const { app } = createApp();

    // Использование renderToString из Preact для генерации содержимого страницы
    const html = render(app);

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

После завершения настройки файлов вы можете использовать следующие команды для запуска проекта:

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

Теперь вы успешно создали SSR-приложение на основе Gez с использованием Preact и HTM! Перейдите по адресу http://localhost:3000, чтобы увидеть результат.