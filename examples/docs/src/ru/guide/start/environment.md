---
titleSuffix: Руководство по совместимости фреймворка Esmx
description: Подробное описание требований к окружению для фреймворка Esmx, включая требования к версии Node.js и совместимость с браузерами, чтобы помочь разработчикам правильно настроить среду разработки.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, совместимость с браузерами, TypeScript, es-module-shims, настройка окружения
---

# Требования к окружению

В этом документе описаны требования к окружению, необходимые для использования данного фреймворка, включая окружение Node.js и совместимость с браузерами.

## Окружение Node.js

Фреймворк требует версию Node.js >= 22.6, в основном для поддержки импорта типов TypeScript (через флаг `--experimental-strip-types`), без необходимости дополнительных шагов компиляции.

## Совместимость с браузерами

Фреймворк по умолчанию использует режим совместимости для сборки, чтобы поддерживать более широкий спектр браузеров. Однако следует отметить, что для полной поддержки совместимости с браузерами необходимо вручную добавить зависимость [es-module-shims](https://github.com/guybedford/es-module-shims).

### Режим совместимости (по умолчанию)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Согласно статистике [Can I Use](https://caniuse.com/?search=dynamic%20import), охват браузеров в режиме совместимости составляет 96.81%.

### Режим нативной поддержки
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Режим нативной поддержки имеет следующие преимущества:
- Нулевые накладные расходы на выполнение, без необходимости дополнительного загрузчика модулей
- Нативный парсинг браузером, более высокая скорость выполнения
- Лучшие возможности разделения кода и загрузки по требованию

Согласно статистике [Can I Use](https://caniuse.com/?search=importmap), охват браузеров в режиме нативной поддержки составляет 93.5%.

### Включение поддержки совместимости

::: warning Важное замечание
Хотя фреймворк по умолчанию использует режим совместимости для сборки, для полной поддержки старых версий браузеров необходимо добавить зависимость [es-module-shims](https://github.com/guybedford/es-module-shims) в ваш проект.

:::

Добавьте следующий скрипт в HTML-файл:

```html
<!-- Для среды разработки -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Для производственной среды -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Рекомендации

1. Для производственной среды рекомендуется:
   - Разместить es-module-shims на собственном сервере
   - Обеспечить стабильность и скорость загрузки ресурсов
   - Избежать потенциальных рисков безопасности
2. Соображения производительности:
   - Режим совместимости может привести к небольшим накладным расходам на производительность
   - Можно решить, включать ли его, исходя из распределения браузеров среди целевой аудитории

:::