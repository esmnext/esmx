---
titleSuffix: Mechanizm udostępniania kodu między usługami w frameworku Esmx
description: Szczegółowy opis mechanizmu łączenia modułów w frameworku Esmx, obejmujący udostępnianie kodu między usługami, zarządzanie zależnościami oraz implementację specyfikacji ESM, pomagający programistom w budowaniu wydajnych aplikacji mikrofrontendowych.
head:
  - - meta
    - property: keywords
      content: Esmx, łączenie modułów, Module Link, ESM, udostępnianie kodu, zarządzanie zależnościami, mikrofrontendy
---

# Łączenie modułów

Framework Esmx zapewnia kompleksowy mechanizm łączenia modułów, służący do zarządzania udostępnianiem kodu i zależnościami między usługami. Mechanizm ten jest oparty na specyfikacji ESM (ECMAScript Module) i obsługuje eksportowanie oraz importowanie modułów na poziomie kodu źródłowego, a także pełne zarządzanie zależnościami.

### Kluczowe pojęcia

#### Eksportowanie modułów
Eksportowanie modułów to proces udostępniania określonych jednostek kodu (np. komponentów, funkcji narzędziowych) z usługi w formacie ESM. Obsługiwane są dwa typy eksportu:
- **Eksport kodu źródłowego**: bezpośrednie eksportowanie plików źródłowych z projektu
- **Eksport zależności**: eksportowanie pakietów zależności używanych w projekcie

#### Łączenie modułów
Importowanie modułów to proces odwoływania się do jednostek kodu eksportowanych przez inne usługi. Obsługiwane są różne metody instalacji:
- **Instalacja kodu źródłowego**: przeznaczona dla środowisk deweloperskich, obsługuje modyfikacje w czasie rzeczywistym i gorącą aktualizację
- **Instalacja pakietów**: przeznaczona dla środowisk produkcyjnych, korzysta bezpośrednio z wyników budowania

## Eksportowanie modułów

### Konfiguracja

W pliku `entry.node.ts` należy skonfigurować moduły do eksportu:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // Eksportowanie plików źródłowych
            'root:src/components/button.vue',  // Komponent Vue
            'root:src/utils/format.ts',        // Funkcja narzędziowa
            // Eksportowanie zależności
            'npm:vue',                         // Framework Vue
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

Konfiguracja eksportu obsługuje dwa typy:
- `root:*`: eksportowanie plików źródłowych, ścieżka względem katalogu głównego projektu
- `npm:*`: eksportowanie zależności, bezpośrednie określenie nazwy pakietu

## Importowanie modułów

### Konfiguracja

W pliku `entry.node.ts` należy skonfigurować moduły do importu:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Konfiguracja łączenia
        links: {
            // Instalacja kodu źródłowego: wskazuje na katalog wyników budowania
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Instalacja pakietów: wskazuje na katalog pakietu
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Konfiguracja mapowania importów
        imports: {
            // Używanie zależności z modułów zdalnych
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

Opis konfiguracji:
1. **imports**: konfiguracja lokalnych ścieżek do modułów zdalnych
   - Instalacja kodu źródłowego: wskazuje na katalog wyników budowania (dist)
   - Instalacja pakietów: bezpośrednio wskazuje na katalog pakietu

2. **externals**: konfiguracja zależności zewnętrznych
   - Służy do udostępniania zależności z modułów zdalnych
   - Zapobiega wielokrotnemu pakowaniu tych samych zależności
   - Obsługuje udostępnianie zależności przez wiele modułów

### Metody instalacji

#### Instalacja kodu źródłowego
Przeznaczona dla środowisk deweloperskich, obsługuje modyfikacje w czasie rzeczywistym i gorącą aktualizację.

1. **Sposób Workspace**
Zalecany w projektach Monorepo:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Sposób Link**
Używany do lokalnego debugowania:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Instalacja pakietów
Przeznaczona dla środowisk produkcyjnych, korzysta bezpośrednio z wyników budowania.

1. **Rejestr NPM**
Instalacja przez rejestr npm:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Serwer statyczny**
Instalacja przez protokół HTTP/HTTPS:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Budowanie pakietów

### Konfiguracja

W pliku `entry.node.ts` należy skonfigurować opcje budowania:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // Konfiguracja eksportu modułów
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Konfiguracja budowania
    pack: {
        // Włączenie budowania
        enable: true,

        // Konfiguracja wyjścia
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Niestandardowy package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Przetwarzanie przed budowaniem
        onBefore: async (esmx, pkg) => {
            // Generowanie deklaracji typów
            // Uruchamianie testów
            // Aktualizacja dokumentacji itp.
        },

        // Przetwarzanie po budowaniu
        onAfter: async (esmx, pkg, file) => {
            // Przesyłanie do CDN
            // Publikowanie w repozytorium npm
            // Wdrażanie w środowisku testowym itp.
        }
    }
} satisfies EsmxOptions;
```

### Wyniki budowania

```
your-app-name.tgz
├── package.json        # Informacje o pakiecie
├── index.js            # Wejście dla środowiska produkcyjnego
├── server/             # Zasoby serwerowe
│   └── manifest.json   # Mapowanie zasobów serwerowych
├── node/               # Środowisko uruchomieniowe Node.js
└── client/             # Zasoby klienckie
    └── manifest.json   # Mapowanie zasobów klienckich
```

### Proces publikacji

```bash
# 1. Budowanie wersji produkcyjnej
esmx build

# 2. Publikowanie w npm
npm publish dist/versions/your-app-name.tgz
```