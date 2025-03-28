---
titleSuffix: Справочник API конфигурации сборки Esmx
description: Подробное описание интерфейса конфигурации PackConfig в рамках Esmx, включая правила упаковки пакетов, настройки вывода и хуки жизненного цикла, чтобы помочь разработчикам реализовать стандартизированные процессы сборки.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, упаковка пакетов, конфигурация сборки, хуки жизненного цикла, конфигурация упаковки, фреймворк для веб-приложений
---

# PackConfig

`PackConfig` — это интерфейс конфигурации упаковки пакетов, используемый для упаковки артефактов сборки сервиса в стандартный формат npm .tgz.

- **Стандартизация**: Использует стандартный формат упаковки npm .tgz
- **Полнота**: Включает все необходимые файлы, такие как исходный код модуля, объявления типов и конфигурационные файлы
- **Совместимость**: Полностью совместим с экосистемой npm, поддерживает стандартные рабочие процессы управления пакетами

## Определение типа

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Включает или отключает функцию упаковки. При включении артефакты сборки будут упакованы в стандартный формат npm .tgz.

- Тип: `boolean`
- Значение по умолчанию: `false`

#### outputs

Указывает путь к выходному файлу пакета. Поддерживаются следующие варианты конфигурации:
- `string`: Один выходной путь, например, 'dist/versions/my-app.tgz'
- `string[]`: Несколько выходных путей для одновременного создания нескольких версий
- `boolean`: При значении true используется путь по умолчанию 'dist/client/versions/latest.tgz'

#### packageJson

Функция обратного вызова для настройки содержимого package.json. Вызывается перед упаковкой для изменения содержимого package.json.

- Параметры:
  - `esmx: Esmx` — экземпляр Esmx
  - `pkg: any` — исходное содержимое package.json
- Возвращаемое значение: `Promise<any>` — измененное содержимое package.json

Типичные применения:
- Изменение имени пакета и версии
- Добавление или обновление зависимостей
- Добавление пользовательских полей
- Настройка информации о публикации

Пример:
```ts
packageJson: async (esmx, pkg) => {
  // Установка информации о пакете
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Мое приложение';

  // Добавление зависимостей
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Добавление конфигурации публикации
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Функция обратного вызова для подготовки перед упаковкой.

- Параметры:
  - `esmx: Esmx` — экземпляр Esmx
  - `pkg: Record<string, any>` — содержимое package.json
- Возвращаемое значение: `Promise<void>`

Типичные применения:
- Добавление дополнительных файлов (README, LICENSE и т.д.)
- Выполнение тестов или проверка сборки
- Генерация документации или метаданных
- Очистка временных файлов

Пример:
```ts
onBefore: async (esmx, pkg) => {
  // Добавление документации
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Выполнение тестов
  await runTests();

  // Генерация документации
  await generateDocs();

  // Очистка временных файлов
  await cleanupTempFiles();
}
```

#### onAfter

Функция обратного вызова для обработки после завершения упаковки. Вызывается после создания файла .tgz для обработки результатов упаковки.

- Параметры:
  - `esmx: Esmx` — экземпляр Esmx
  - `pkg: Record<string, any>` — содержимое package.json
  - `file: Buffer` — содержимое упакованного файла
- Возвращаемое значение: `Promise<void>`

Типичные применения:
- Публикация в npm-репозиторий (публичный или приватный)
- Загрузка на сервер статических ресурсов
- Управление версиями
- Запуск CI/CD-процессов

Пример:
```ts
onAfter: async (esmx, pkg, file) => {
  // Публикация в приватный npm-репозиторий
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Загрузка на сервер статических ресурсов
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Создание тега версии в Git
  await createGitTag(pkg.version);

  // Запуск процесса развертывания
  await triggerDeploy(pkg.version);
}
```

## Пример использования

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Настройка модулей для экспорта
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Конфигурация упаковки
  pack: {
    // Включение функции упаковки
    enable: true,

    // Одновременный вывод нескольких версий
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Настройка package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Подготовка перед упаковкой
    onBefore: async (esmx, pkg) => {
      // Добавление необходимых файлов
      await fs.writeFile('dist/README.md', '# Your App\n\nОписание экспорта модулей...');
      // Выполнение проверки типов
      await runTypeCheck();
    },

    // Обработка после упаковки
    onAfter: async (esmx, pkg, file) => {
      // Публикация в приватный npm-репозиторий
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Или загрузка на сервер статических ресурсов
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```