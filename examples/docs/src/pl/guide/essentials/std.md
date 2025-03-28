---
titleSuffix: Przewodnik po strukturze i standardach projektu frameworku Esmx
description: Szczegółowy opis standardowej struktury projektu, specyfikacji plików wejściowych i konfiguracji frameworku Esmx, pomagający programistom w budowaniu znormalizowanych i łatwych w utrzymaniu aplikacji SSR.
head:
  - - meta
    - property: keywords
      content: Esmx, struktura projektu, plik wejściowy, specyfikacja konfiguracji, framework SSR, TypeScript, standardy projektu, standardy rozwoju
---

# Standardy

Esmx to nowoczesny framework SSR, który wykorzystuje znormalizowaną strukturę projektu i mechanizmy rozwiązywania ścieżek, aby zapewnić spójność i łatwość utrzymania projektu zarówno w środowiskach deweloperskich, jak i produkcyjnych.

## Standardy struktury projektu

### Standardowa struktura katalogów

```txt
root
│─ dist                  # Katalog wyjściowy kompilacji
│  ├─ package.json       # Konfiguracja pakietu po kompilacji
│  ├─ server             # Wyjście kompilacji serwera
│  │  └─ manifest.json   # Wyjście manifestu kompilacji, używane do generowania importmap
│  ├─ node               # Wyjście kompilacji programu serwera Node
│  ├─ client             # Wyjście kompilacji klienta
│  │  ├─ versions        # Katalog przechowywania wersji
│  │  │  └─ latest.tgz   # Archiwizacja katalogu dist, udostępnianie pakietów do dystrybucji
│  │  └─ manifest.json   # Wyjście manifestu kompilacji, używane do generowania importmap
│  └─ src                # Pliki generowane przez tsc
├─ src
│  ├─ entry.server.ts    # Wejście aplikacji serwerowej
│  ├─ entry.client.ts    # Wejście aplikacji klienckiej
│  └─ entry.node.ts      # Wejście aplikacji serwera Node
├─ tsconfig.json         # Konfiguracja TypeScript
└─ package.json          # Konfiguracja pakietu
```

::: tip Wiedza dodatkowa
- `esmx.name` pochodzi z pola `name` w `package.json`
- `dist/package.json` pochodzi z `package.json` w katalogu głównym
- Katalog `dist` jest archiwizowany tylko wtedy, gdy `packs.enable` jest ustawione na `true`

:::

## Standardy plików wejściowych

### entry.client.ts
Plik wejściowy klienta odpowiada za:
- **Inicjalizację aplikacji**: Konfiguracja podstawowych ustawień aplikacji klienckiej
- **Zarządzanie routingiem**: Obsługa routingu i nawigacji klienta
- **Zarządzanie stanem**: Implementacja przechowywania i aktualizacji stanu klienta
- **Obsługa interakcji**: Zarządzanie zdarzeniami użytkownika i interakcjami interfejsu

### entry.server.ts
Plik wejściowy serwera odpowiada za:
- **Renderowanie po stronie serwera**: Wykonanie procesu renderowania SSR
- **Generowanie HTML**: Budowanie struktury początkowej strony
- **Pobieranie danych**: Obsługa pobierania danych po stronie serwera
- **Wstrzykiwanie stanu**: Przekazywanie stanu serwera do klienta
- **Optymalizacja SEO**: Zapewnienie optymalizacji pod kątem wyszukiwarek

### entry.node.ts
Plik wejściowy serwera Node.js odpowiada za:
- **Konfigurację serwera**: Ustawianie parametrów serwera HTTP
- **Obsługę routingu**: Zarządzanie regułami routingu serwera
- **Integrację middleware**: Konfiguracja middleware serwera
- **Zarządzanie środowiskiem**: Obsługa zmiennych środowiskowych i konfiguracji
- **Obsługę żądań i odpowiedzi**: Obsługa żądań i odpowiedzi HTTP

## Standardy plików konfiguracyjnych

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