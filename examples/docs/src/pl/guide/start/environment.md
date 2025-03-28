---
titleSuffix: Przewodnik zgodności frameworka Esmx
description: Szczegółowy opis wymagań środowiskowych frameworka Esmx, w tym wymagań dotyczących wersji Node.js i kompatybilności przeglądarek, aby pomóc programistom w prawidłowej konfiguracji środowiska deweloperskiego.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, kompatybilność przeglądarek, TypeScript, es-module-shims, konfiguracja środowiska
---

# Wymagania środowiskowe

Ten dokument opisuje wymagania środowiskowe niezbędne do korzystania z tego frameworka, w tym środowisko Node.js i kompatybilność przeglądarek.

## Środowisko Node.js

Framework wymaga wersji Node.js >= 22.6, głównie w celu obsługi importu typów TypeScript (poprzez flagę `--experimental-strip-types`), bez konieczności dodatkowych kroków kompilacji.

## Kompatybilność przeglądarek

Framework domyślnie jest budowany w trybie kompatybilności, aby obsługiwać szerszy zakres przeglądarek. Należy jednak pamiętać, że aby uzyskać pełne wsparcie kompatybilności przeglądarek, należy ręcznie dodać zależność [es-module-shims](https://github.com/guybedford/es-module-shims).

### Tryb kompatybilności (domyślny)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Zgodnie z danymi z [Can I Use](https://caniuse.com/?search=dynamic%20import), pokrycie przeglądarek w trybie kompatybilności wynosi 96,81%.

### Tryb natywnego wsparcia
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Tryb natywnego wsparcia oferuje następujące korzyści:
- Zero narzutu czasu wykonania, bez dodatkowego modułu ładującego
- Natywne parsowanie przez przeglądarkę, szybsza wydajność
- Lepsze możliwości podziału kodu i ładowania na żądanie

Zgodnie z danymi z [Can I Use](https://caniuse.com/?search=importmap), pokrycie przeglądarek w trybie natywnego wsparcia wynosi 93,5%.

### Włączanie wsparcia kompatybilności

::: warning Ważna uwaga
Chociaż framework domyślnie jest budowany w trybie kompatybilności, aby uzyskać pełne wsparcie dla starszych przeglądarek, należy dodać zależność [es-module-shims](https://github.com/guybedford/es-module-shims) do projektu.

:::

Dodaj następujący skrypt do pliku HTML:

```html
<!-- Środowisko deweloperskie -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Środowisko produkcyjne -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Najlepsze praktyki

1. Zalecenia dla środowiska produkcyjnego:
   - Wdróż es-module-shims na własnym serwerze
   - Zapewnij stabilność i szybkość ładowania zasobów
   - Unikaj potencjalnych zagrożeń bezpieczeństwa
2. Rozważania dotyczące wydajności:
   - Tryb kompatybilności wprowadza niewielki narzut wydajności
   - Można zdecydować o włączeniu na podstawie rozkładu przeglądarek wśród docelowych użytkowników

:::