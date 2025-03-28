---
titleSuffix: Przewodnik po mapowaniu ścieżek importu modułów w Esmx
description: Szczegółowy opis mechanizmu aliasów ścieżek w Esmx, w tym uproszczenie ścieżek importu, unikanie głębokiego zagnieżdżenia, bezpieczeństwo typów i optymalizacja rozpoznawania modułów, aby pomóc programistom w poprawie utrzymywalności kodu.
head:
  - - meta
    - property: keywords
      content: Esmx, aliasy ścieżek, Path Alias, TypeScript, import modułów, mapowanie ścieżek, utrzymywalność kodu
---

# Aliasy ścieżek

Alias ścieżki (Path Alias) to mechanizm mapowania ścieżek importu modułów, który pozwala programistom używać krótkich, semantycznych identyfikatorów zamiast pełnych ścieżek modułów. W Esmx mechanizm aliasów ścieżek oferuje następujące korzyści:

- **Uproszczenie ścieżek importu**: Używanie semantycznych aliasów zamiast długich ścieżek względnych, co zwiększa czytelność kodu
- **Unikanie głębokiego zagnieżdżenia**: Eliminacja trudności w utrzymaniu wynikających z wielopoziomowych odwołań do katalogów (np. `../../../../`)
- **Bezpieczeństwo typów**: Pełna integracja z systemem typów TypeScript, zapewniająca uzupełnianie kodu i sprawdzanie typów
- **Optymalizacja rozpoznawania modułów**: Poprawa wydajności rozpoznawania modułów dzięki wstępnie zdefiniowanym mapowaniom ścieżek

## Domyślny mechanizm aliasów

Esmx wykorzystuje automatyczny mechanizm aliasów oparty na nazwie usługi (Service Name), który charakteryzuje się następującymi cechami:

- **Automatyczna konfiguracja**: Aliasy są generowane automatycznie na podstawie pola `name` w `package.json`, bez konieczności ręcznej konfiguracji
- **Jednolita konwencja**: Zapewnienie spójnej konwencji nazewnictwa i odwołań dla wszystkich modułów usług
- **Wsparcie typów**: W połączeniu z poleceniem `npm run build:dts` automatycznie generowane są pliki deklaracji typów, umożliwiając wnioskowanie typów między usługami
- **Przewidywalność**: Możliwość wnioskowania ścieżki odwołania do modułu na podstawie nazwy usługi, co zmniejsza koszty utrzymania

## Konfiguracja

### Konfiguracja w package.json

W `package.json` nazwa usługi jest definiowana za pomocą pola `name`, które będzie używane jako domyślny prefiks aliasu:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Konfiguracja w tsconfig.json

Aby TypeScript mógł poprawnie rozpoznawać ścieżki aliasów, należy skonfigurować mapowanie `paths` w `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Przykłady użycia

### Importowanie modułów wewnętrznych usługi

```ts
// Użycie aliasu do importu
import { MyComponent } from 'your-app-name/src/components';

// Równoważny import ze ścieżką względną
import { MyComponent } from '../components';
```

### Importowanie modułów innych usług

```ts
// Importowanie komponentu z innej usługi
import { SharedComponent } from 'other-service/src/components';

// Importowanie funkcji narzędziowej z innej usługi
import { utils } from 'other-service/src/utils';
```

::: tip Najlepsze praktyki
- Preferuj używanie ścieżek aliasów zamiast ścieżek względnych
- Zachowaj semantyczność i spójność ścieżek aliasów
- Unikaj zbyt wielu poziomów katalogów w ścieżkach aliasów

:::

``` ts
// Importowanie komponentów
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importowanie funkcji narzędziowych
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importowanie definicji typów
import type { UserInfo } from 'your-app-name/src/types';
```

### Importowanie między usługami

Po skonfigurowaniu łączenia modułów (Module Link) można użyć tej samej metody do importowania modułów z innych usług:

```ts
// Importowanie komponentu z usługi zdalnej
import { Header } from 'remote-service/src/components';

// Importowanie funkcji narzędziowej z usługi zdalnej
import { logger } from 'remote-service/src/utils';
```

### Niestandardowe aliasy

W przypadku pakietów stron trzecich lub specjalnych scenariuszy można skonfigurować niestandardowe aliasy za pomocą pliku konfiguracyjnego Esmx:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Konfiguracja określonej wersji budowania dla Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Konfiguracja krótkich aliasów dla często używanych katalogów
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Uwagi
1. Dla modułów biznesowych zaleca się zawsze używanie domyślnego mechanizmu aliasów, aby zachować spójność projektu
2. Niestandardowe aliasy są głównie używane do obsługi specjalnych wymagań pakietów stron trzecich lub optymalizacji doświadczenia programistycznego
3. Nadmierne używanie niestandardowych aliasów może wpłynąć na utrzymywalność kodu i optymalizację budowania

:::