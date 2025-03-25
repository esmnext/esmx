---
titleSuffix: Пример HTML SSR приложения на фреймворке Gez
description: Пошаговое руководство по созданию HTML SSR приложения на основе Gez, включая инициализацию проекта, настройку HTML и конфигурацию входных файлов.
head:
  - - meta
    - property: keywords
      content: Gez, HTML, SSR приложение, конфигурация TypeScript, инициализация проекта, серверный рендеринг, клиентское взаимодействие
---

# HTML

В этом руководстве мы шаг за шагом создадим HTML SSR приложение на основе фреймворка Gez. Мы рассмотрим полный пример, демонстрирующий использование Gez для создания приложения с серверным рендерингом.

## Структура проекта

Для начала рассмотрим базовую структуру проекта:

```bash
.
├── package.json         # Конфигурационный файл проекта, определяющий зависимости и команды
├── tsconfig.json        # Конфигурационный файл TypeScript, настройки компиляции
└── src                  # Директория с исходным кодом
    ├── app.ts           # Главный компонент приложения, определяющий структуру страницы и логику взаимодействия
    ├── create-app.ts    # Фабрика создания экземпляра приложения, отвечающая за инициализацию
    ├── entry.client.ts  # Входной файл для клиента, обработка рендеринга на стороне браузера
    ├── entry.node.ts    # Входной файл для Node.js сервера, отвечающий за конфигурацию среды разработки и запуск сервера
    └── entry.server.ts  # Входной файл для сервера, обработка логики SSR рендеринга
```

## Конфигурация проекта

### package.json

Создайте файл `package.json` для настройки зависимостей и скриптов проекта:

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

После создания файла `package.json` установите зависимости проекта. Вы можете использовать одну из следующих команд для установки:
```bash
pnpm install
# или
yarn install
# или
npm install
```

Это установит все необходимые зависимости, включая TypeScript и зависимости для SSR.

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Структура исходного кода

### app.ts

Создайте главный компонент приложения `src/app.ts`, реализующий структуру страницы и логику взаимодействия:

```ts title="src/app.ts"
/**
 * @file Пример компонента
 * @description Демонстрирует заголовок страницы с автоматически обновляемым временем, показывая базовые возможности фреймворка Gez
 */

export default class App {
    /**
     * Текущее время в формате ISO
     * @type {string}
     */
    public time = '';

    /**
     * Создание экземпляра приложения
     * @param {SsrContext} [ssrContext] - Контекст сервера, содержащий набор метаданных импорта
     */
    public constructor(public ssrContext?: SsrContext) {
        // В конструкторе не требуется дополнительная инициализация
    }

    /**
     * Рендеринг содержимого страницы
     * @returns {string} Возвращает HTML структуру страницы
     */
    public render(): string {
        // Убедимся, что в серверной среде правильно собираются метаданные импорта
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Быстрый старт с Gez</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Инициализация на стороне клиента
     * @throws {Error} Ошибка, если не найден элемент отображения времени
     */
    public onClient(): void {
        // Получаем элемент отображения времени
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Элемент отображения времени не найден');
        }

        // Устанавливаем таймер для обновления времени каждую секунду
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Инициализация на стороне сервера
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Интерфейс контекста сервера
 * @interface
 */
export interface SsrContext {
    /**
     * Набор метаданных импорта
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Создайте файл `src/create-app.ts`, отвечающий за создание экземпляра приложения:

```ts title="src/create-app.ts"
/**
 * @file Создание экземпляра приложения
 * @description Отвечает за создание и конфигурацию экземпляра приложения
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

Создайте входной файл для клиента `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Входной файл для клиента
 * @description Отвечает за логику взаимодействия на стороне клиента и динамическое обновление
 */

import { createApp } from './create-app';

// Создаем экземпляр приложения и инициализируем
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Создайте файл `entry.node.ts` для конфигурации среды разработки и запуска сервера:

```ts title="src/entry.node.ts"
/**
 * @file Входной файл для Node.js сервера
 * @description Отвечает за конфигурацию среды разработки и запуск сервера, предоставляя среду выполнения SSR
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
     * Конфигурация и запуск HTTP сервера
     * @description Создает экземпляр HTTP сервера, интегрирует middleware Gez для обработки SSR запросов
     * @param gez Экземпляр фреймворка Gez, предоставляющий middleware и функции рендеринга
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Используем middleware Gez для обработки запросов
            gez.middleware(req, res, async () => {
                // Выполняем серверный рендеринг
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

Этот файл является входной точкой для конфигурации среды разработки и запуска сервера, содержащий две основные функции:

1. Функция `devApp`: отвечает за создание и конфигурацию экземпляра приложения Rspack для среды разработки, поддерживает горячую перезагрузку и live preview.
2. Функция `server`: отвечает за создание и конфигурацию HTTP сервера, интегрирует middleware Gez для обработки SSR запросов.

### entry.server.ts

Создайте входной файл для серверного рендеринга `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Входной файл для серверного рендеринга
 * @description Отвечает за процесс серверного рендеринга, генерацию HTML и инъекцию ресурсов
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Инкапсулируем логику генерации содержимого страницы
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Инжектируем контекст серверного рендеринга в экземпляр приложения
    app.ssrContext = ssrContext;
    // Инициализируем сервер
    app.onServer();

    // Генерируем содержимое страницы
    return app.render();
};

export default async (rc: RenderContext) => {
    // Создаем экземпляр приложения, возвращаем объект с экземпляром app
    const { app } = createApp();
    // Используем renderToString для генерации содержимого страницы
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Фиксируем сбор зависимостей, чтобы все необходимые ресурсы были загружены
    await rc.commit();

    // Генерируем полную HTML структуру
    rc.html = `<!DOCTYPE html>
<html lang="ru">
<head>
    ${rc.preload()}
    <title>Быстрый старт с Gez</title>
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

После завершения настройки файлов, вы можете использовать следующие команды для запуска проекта:

1. Режим разработки:
```bash
npm run dev
```

2. Сборка проекта:
```bash
npm run build
```

3. Запуск в production режиме:
```bash
npm run start
```

Теперь вы успешно создали HTML SSR приложение на основе фреймворка Gez! Перейдите по адресу http://localhost:3000, чтобы увидеть результат.