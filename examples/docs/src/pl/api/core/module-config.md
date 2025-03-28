---
titleSuffix: Dokumentacja API konfiguracji modułów frameworka Esmx
description: Szczegółowy opis interfejsu konfiguracji ModuleConfig frameworka Esmx, obejmujący reguły importu i eksportu modułów, konfigurację aliasów oraz zarządzanie zależnościami zewnętrznymi, pomagający programistom dogłębnie zrozumieć system modułowy frameworka.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, konfiguracja modułów, import i eksport modułów, zależności zewnętrzne, konfiguracja aliasów, zarządzanie zależnościami, framework aplikacji webowych
---

# ModuleConfig

ModuleConfig zapewnia funkcjonalność konfiguracji modułów w frameworku Esmx, służącą do definiowania reguł importu i eksportu modułów, konfiguracji aliasów oraz zależności zewnętrznych.

## Definicje typów

### PathType

- **Definicja typu**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enum typów ścieżek modułów:
- `npm`: oznacza zależność w node_modules
- `root`: oznacza plik w katalogu głównym projektu

### ModuleConfig

- **Definicja typu**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Interfejs konfiguracji modułów, służący do definiowania eksportu, importu i konfiguracji zależności zewnętrznych usług.

#### exports

Lista konfiguracji eksportu, która udostępnia określone jednostki kodu (np. komponenty, funkcje narzędziowe) w formacie ESM.

Obsługiwane są dwa typy:
- `root:*`: eksport plików źródłowych, np.: `root:src/components/button.vue`
- `npm:*`: eksport zależności zewnętrznych, np.: `npm:vue`

Każdy element eksportu zawiera następujące właściwości:
- `name`: oryginalna ścieżka eksportu, np.: `npm:vue` lub `root:src/components`
- `type`: typ ścieżki (`npm` lub `root`)
- `importName`: nazwa importu, format: `${serviceName}/${type}/${path}`
- `exportName`: ścieżka eksportu, względem katalogu głównego usługi
- `exportPath`: rzeczywista ścieżka pliku
- `externalName`: nazwa zależności zewnętrznej, używana jako identyfikator podczas importu tego modułu przez inne usługi

#### links

Mapa konfiguracji zależności usług, służąca do konfigurowania innych usług (lokalnych lub zdalnych) od których zależy bieżąca usługa oraz ich lokalnych ścieżek. Kluczem każdego elementu konfiguracji jest nazwa usługi, a wartością jest lokalna ścieżka tej usługi.

Konfiguracja różni się w zależności od sposobu instalacji:
- Instalacja ze źródeł (Workspace, Git): należy wskazać katalog dist, ponieważ wymagane jest użycie skompilowanych plików
- Instalacja pakietów (Link, serwer statyczny, prywatne repozytorium, File): bezpośrednie wskazanie katalogu pakietu, ponieważ pakiet zawiera już skompilowane pliki

#### imports

Mapa zależności zewnętrznych, konfigurująca zależności zewnętrzne, które mają być używane, zazwyczaj są to zależności z modułów zdalnych.

Każda zależność zawiera następujące właściwości:
- `match`: wyrażenie regularne używane do dopasowania instrukcji importu
- `import`: rzeczywista ścieżka modułu

**Przykład**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Konfiguracja eksportu
    exports: [
      'root:src/components/button.vue',  // Eksport pliku źródłowego
      'root:src/utils/format.ts',
      'npm:vue',  // Eksport zależności zewnętrznej
      'npm:vue-router'
    ],

    // Konfiguracja importu
    links: {
      // Instalacja ze źródeł: należy wskazać katalog dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Instalacja pakietów: bezpośrednie wskazanie katalogu pakietu
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Konfiguracja zależności zewnętrznych
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Definicja typu**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Nazwa pakietu
     */
    name: string
    /**
     * Katalog główny pakietu
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Skonwertowana konfiguracja modułów, przekształcająca oryginalną konfigurację modułów w ustandaryzowany format wewnętrzny:

#### name
Nazwa bieżącej usługi
- Służy do identyfikacji modułu i generowania ścieżek importu

#### root
Ścieżka katalogu głównego bieżącej usługi
- Służy do rozwiązywania ścieżek względnych i przechowywania wyników kompilacji

#### exports
Lista konfiguracji eksportu
- `name`: oryginalna ścieżka eksportu, np.: 'npm:vue' lub 'root:src/components'
- `type`: typ ścieżki (npm lub root)
- `importName`: nazwa importu, format: '${serviceName}/${type}/${path}'
- `exportName`: ścieżka eksportu, względem katalogu głównego usługi
- `exportPath`: rzeczywista ścieżka pliku
- `externalName`: nazwa zależności zewnętrznej, używana jako identyfikator podczas importu tego modułu przez inne usługi

#### links
Lista konfiguracji importu
- `name`: nazwa pakietu
- `root`: katalog główny pakietu

#### imports
Mapa zależności zewnętrznych
- Mapuje ścieżki importu modułów na rzeczywiste lokalizacje modułów
- `match`: wyrażenie regularne używane do dopasowania instrukcji importu
- `import`: rzeczywista ścieżka modułu