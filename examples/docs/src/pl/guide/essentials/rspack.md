---
titleSuffix: Esmx Framework - Wysokowydajny silnik budowania
description: Szczegółowa analiza systemu budowania Rspack w frameworku Esmx, obejmująca kluczowe funkcje takie jak wysokowydajna kompilacja, budowanie w wielu środowiskach, optymalizacja zasobów, które pomagają programistom tworzyć wydajne i niezawodne nowoczesne aplikacje webowe.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, system budowania, wysokowydajna kompilacja, hot reload, budowanie w wielu środowiskach, Tree Shaking, podział kodu, SSR, optymalizacja zasobów, efektywność programistyczna, narzędzia budowania
---

# Rspack

Esmx opiera się na systemie budowania [Rspack](https://rspack.dev/), w pełni wykorzystując jego wysokowydajne możliwości budowania. Ten dokument przedstawia rolę i kluczowe funkcje Rspack w frameworku Esmx.

## Funkcje

Rspack jest podstawowym systemem budowania frameworku Esmx, oferując następujące kluczowe funkcje:

- **Wysokowydajne budowanie**: Silnik budowania oparty na Rust, zapewniający błyskawiczną kompilację, znacząco przyspieszając budowanie dużych projektów
- **Optymalizacja doświadczenia programistycznego**: Obsługa hot reload (HMR), kompilacja przyrostowa i inne nowoczesne funkcje programistyczne, zapewniając płynne doświadczenie programistyczne
- **Budowanie w wielu środowiskach**: Ujednolicone konfiguracje budowania obsługujące środowiska klienckie (client), serwerowe (server) i Node.js (node), upraszczając proces rozwoju wieloplatformowego
- **Optymalizacja zasobów**: Wbudowane możliwości przetwarzania i optymalizacji zasobów, obsługa podziału kodu, Tree Shaking, kompresji zasobów i innych funkcji

## Budowanie aplikacji

System budowania Rspack w Esmx ma modułową strukturę i obejmuje następujące kluczowe moduły:

### @esmx/rspack

Podstawowy moduł budowania, zapewniający następujące kluczowe możliwości:

- **Ujednolicone konfiguracje budowania**: Zapewnia standaryzowane zarządzanie konfiguracjami budowania, obsługujące konfiguracje dla wielu środowisk
- **Przetwarzanie zasobów**: Wbudowane możliwości przetwarzania zasobów takich jak TypeScript, CSS, obrazy itp.
- **Optymalizacja budowania**: Zapewnia funkcje optymalizacji wydajności, takie jak podział kodu i Tree Shaking
- **Serwer programistyczny**: Zintegrowany wysokowydajny serwer programistyczny z obsługą HMR

### @esmx/rspack-vue

Specjalny moduł budowania dla frameworku Vue, zapewniający:

- **Kompilacja komponentów Vue**: Obsługa wydajnej kompilacji komponentów Vue 2/3
- **Optymalizacja SSR**: Specyficzne optymalizacje dla scenariuszy renderowania po stronie serwera
- **Rozszerzenia programistyczne**: Specyficzne funkcje rozszerzające środowisko programistyczne Vue

## Proces budowania

Proces budowania w Esmx składa się z następujących etapów:

1. **Inicjalizacja konfiguracji**
   - Ładowanie konfiguracji projektu
   - Scalanie konfiguracji domyślnych i użytkownika
   - Dostosowanie konfiguracji na podstawie zmiennych środowiskowych

2. **Kompilacja zasobów**
   - Analiza zależności kodu źródłowego
   - Transformacja różnych zasobów (TypeScript, CSS itp.)
   - Przetwarzanie importów i eksportów modułów

3. **Przetwarzanie optymalizacji**
   - Wykonanie podziału kodu
   - Zastosowanie Tree Shaking
   - Kompresja kodu i zasobów

4. **Generowanie wyników**
   - Generowanie plików docelowych
   - Generowanie map zasobów
   - Generowanie raportu budowania

## Najlepsze praktyki

### Optymalizacja środowiska programistycznego

- **Konfiguracja kompilacji przyrostowej**: Właściwa konfiguracja opcji `cache`, wykorzystanie pamięci podręcznej do przyspieszenia budowania
- **Optymalizacja HMR**: Celowa konfiguracja zakresu hot reload, unikanie niepotrzebnych aktualizacji modułów
- **Optymalizacja przetwarzania zasobów**: Używanie odpowiednich konfiguracji loaderów, unikanie powtarzającego się przetwarzania

### Optymalizacja środowiska produkcyjnego

- **Strategia podziału kodu**: Właściwa konfiguracja `splitChunks`, optymalizacja ładowania zasobów
- **Kompresja zasobów**: Włączenie odpowiednich konfiguracji kompresji, równoważenie czasu budowania i rozmiaru wyników
- **Optymalizacja pamięci podręcznej**: Wykorzystanie skrótów zawartości i strategii długoterminowego buforowania, poprawa wydajności ładowania

## Przykład konfiguracji

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Niestandardowa konfiguracja budowania
                config({ config }) {
                    // Dodaj niestandardowe konfiguracje Rspack tutaj
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Więcej szczegółowych informacji na temat API i opcji konfiguracji można znaleźć w [dokumentacji API Rspack](/api/app/rspack.html).
:::