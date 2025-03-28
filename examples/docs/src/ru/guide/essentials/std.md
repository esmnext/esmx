---
titleSuffix: Руководство по структуре и стандартам проекта Esmx
description: Подробное описание стандартной структуры проекта, спецификаций входных файлов и конфигурационных файлов фреймворка Esmx, помогающее разработчикам создавать стандартизированные и поддерживаемые SSR-приложения.
head:
  - - meta
    - property: keywords
      content: Esmx, структура проекта, входные файлы, конфигурационные стандарты, SSR-фреймворк, TypeScript, стандарты проекта, стандарты разработки
---

# Стандартные нормы

Esmx — это современный SSR-фреймворк, использующий стандартизированную структуру проекта и механизмы разрешения путей для обеспечения согласованности и поддерживаемости проекта в средах разработки и производства.

## Нормы структуры проекта

### Стандартная структура каталогов

```txt
root
│─ dist                  # Каталог для скомпилированных файлов
│  ├─ package.json       # Конфигурация пакета после компиляции
│  ├─ server             # Скомпилированные файлы сервера
│  │  └─ manifest.json   # Выходной файл манифеста компиляции, используется для создания importmap
│  ├─ node               # Скомпилированные файлы Node-сервера
│  ├─ client             # Скомпилированные файлы клиента
│  │  ├─ versions        # Каталог для хранения версий
│  │  │  └─ latest.tgz   # Архив каталога dist для распространения пакета
│  │  └─ manifest.json   # Выходной файл манифеста компиляции, используется для создания importmap
│  └─ src                # Файлы, сгенерированные с помощью tsc
├─ src
│  ├─ entry.server.ts    # Входной файл серверного приложения
│  ├─ entry.client.ts    # Входной файл клиентского приложения
│  └─ entry.node.ts      # Входной файл Node-серверного приложения
├─ tsconfig.json         # Конфигурация TypeScript
└─ package.json          # Конфигурация пакета
```

::: tip Дополнительная информация
- `esmx.name` берется из поля `name` в `package.json`
- `dist/package.json` берется из `package.json` в корневом каталоге
- Архивация каталога `dist` происходит только при установке `packs.enable` в `true`

:::

## Нормы входных файлов

### entry.client.ts
Клиентский входной файл отвечает за:
- **Инициализацию приложения**: настройка базовых параметров клиентского приложения
- **Управление маршрутизацией**: обработка клиентских маршрутов и навигации
- **Управление состоянием**: реализация хранения и обновления состояния клиента
- **Обработку взаимодействий**: управление пользовательскими событиями и взаимодействиями с интерфейсом

### entry.server.ts
Серверный входной файл отвечает за:
- **Серверный рендеринг**: выполнение процесса SSR-рендеринга
- **Генерацию HTML**: построение начальной структуры страницы
- **Предварительное получение данных**: обработка получения данных на сервере
- **Инъекцию состояния**: передача состояния сервера клиенту
- **Оптимизацию SEO**: обеспечение оптимизации для поисковых систем

### entry.node.ts
Входной файл Node.js-сервера отвечает за:
- **Конфигурацию сервера**: настройка параметров HTTP-сервера
- **Обработку маршрутов**: управление правилами маршрутизации на сервере
- **Интеграцию промежуточного ПО**: настройка промежуточного ПО сервера
- **Управление окружением**: обработка переменных окружения и конфигураций
- **Обработку запросов и ответов**: обработка HTTP-запросов и ответов

## Нормы конфигурационных файлов

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```