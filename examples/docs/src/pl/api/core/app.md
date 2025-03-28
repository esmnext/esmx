---
titleSuffix: Abstrakcyjny interfejs aplikacji frameworku Esmx
description: Szczegółowy opis interfejsu App frameworku Esmx, obejmujący zarządzanie cyklem życia aplikacji, obsługę zasobów statycznych oraz renderowanie po stronie serwera, pomagający programistom zrozumieć i wykorzystać kluczowe funkcje aplikacji.
head:
  - - meta
    - property: keywords
      content: Esmx, App, abstrakcja aplikacji, cykl życia, zasoby statyczne, renderowanie po stronie serwera, API
---

# App

`App` to abstrakcja aplikacji w frameworku Esmx, która zapewnia ujednolicony interfejs do zarządzania cyklem życia aplikacji, zasobami statycznymi oraz renderowaniem po stronie serwera.

```ts title="entry.node.ts"
export default {
  // Konfiguracja środowiska deweloperskiego
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Niestandardowa konfiguracja Rspack
        }
      })
    );
  }
}
```

## Definicje typów
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Typ**: `Middleware`

Middleware do obsługi zasobów statycznych.

Środowisko deweloperskie:
- Obsługuje żądania zasobów statycznych z kodu źródłowego
- Obsługuje kompilację w czasie rzeczywistym i gorącą aktualizację
- Używa strategii cache bez buforowania (no-cache)

Środowisko produkcyjne:
- Obsługuje zasoby statyczne po zbudowaniu
- Obsługuje długotrwałe buforowanie niezmiennych plików (.final.xxx)
- Zoptymalizowana strategia ładowania zasobów

```ts
server.use(esmx.middleware);
```

#### render

- **Typ**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Funkcja renderowania po stronie serwera. Zapewnia różne implementacje w zależności od środowiska:
- Środowisko produkcyjne (start): Ładuje zbudowany plik wejściowy serwera (entry.server) i wykonuje renderowanie
- Środowisko deweloperskie (dev): Ładuje plik wejściowy serwera z kodu źródłowego i wykonuje renderowanie

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Typ**: `() => Promise<boolean>`

Funkcja budowania dla środowiska produkcyjnego. Służy do pakowania i optymalizacji zasobów. Zwraca true w przypadku powodzenia budowania, false w przypadku niepowodzenia.

#### destroy

- **Typ**: `() => Promise<boolean>`

Funkcja czyszczenia zasobów. Służy do zamykania serwera, rozłączania połączeń itp. Zwraca true w przypadku powodzenia czyszczenia, false w przypadku niepowodzenia.