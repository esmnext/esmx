---
titleSuffix: Przegląd frameworka Esmx i innowacje technologiczne
description: Poznaj tło projektu, ewolucję technologiczną i kluczowe zalety frameworka Esmx, rozwiązania do nowoczesnego renderowania po stronie serwera opartego na ESM.
head:
  - - meta
    - property: keywords
      content: Esmx, mikrofrontendy, ESM, renderowanie po stronie serwera, SSR, innowacje technologiczne, federacja modułów
---

# Wprowadzenie

## Tło projektu
Esmx to nowoczesny framework mikrofrontendowy oparty na ECMAScript Modules (ESM), skupiający się na budowaniu wydajnych i skalowalnych aplikacji z renderowaniem po stronie serwera (SSR). Jako trzecia generacja projektu Genesis, Esmx stale wprowadza innowacje w procesie ewolucji technologicznej:

- **v1.0**: Implementacja ładowania komponentów zdalnych na żądanie za pomocą żądań HTTP
- **v2.0**: Integracja aplikacji za pomocą Webpack Module Federation
- **v3.0**: Przeprojektowanie systemu [łączenia modułów](/guide/essentials/module-link) w oparciu o natywny ESM w przeglądarce

## Tło technologiczne
W trakcie rozwoju architektury mikrofrontendowej tradycyjne rozwiązania napotkały następujące ograniczenia:

### Wyzwania istniejących rozwiązań
- **Wąskie gardła wydajnościowe**: Wstrzykiwanie zależności w czasie wykonywania i proxy piaskownicy JavaScript powodują znaczne obciążenie wydajnościowe
- **Mechanizmy izolacji**: Własne środowiska piaskownicowe nie dorównują natywnym możliwościom izolacji modułów w przeglądarce
- **Złożoność budowania**: Modyfikacje narzędzi do budowania w celu udostępniania zależności zwiększają koszty utrzymania projektu
- **Odchylenie od standardów**: Specjalne strategie wdrażania i mechanizmy przetwarzania w czasie wykonywania odbiegają od współczesnych standardów rozwoju webowego
- **Ograniczenia ekosystemu**: Powiązanie z frameworkiem i niestandardowe API ograniczają wybór stosu technologicznego

### Innowacje technologiczne
Esmx, oparty na współczesnych standardach webowych, oferuje nowe rozwiązania:

- **Natywny system modułów**: Wykorzystanie natywnego ESM i Import Maps w przeglądarce do zarządzania zależnościami, zapewniając szybsze parsowanie i wykonywanie
- **Standardowe mechanizmy izolacji**: Niezawodna izolacja aplikacji oparta na zakresie modułów ECMAScript
- **Otwarty stos technologiczny**: Obsługa bezproblemowej integracji z dowolnym nowoczesnym frameworkiem frontendowym
- **Optymalizacja doświadczenia developerskiego**: Intuicyjne modele programistyczne i pełne możliwości debugowania
- **Ekstremalna optymalizacja wydajności**: Zerowy narzut w czasie wykonywania dzięki wykorzystaniu natywnych możliwości, w połączeniu z inteligentnymi strategiami buforowania

:::tip
Esmx koncentruje się na budowaniu wysokowydajnej i łatwo skalowalnej infrastruktury mikrofrontendowej, szczególnie odpowiedniej dla aplikacji z renderowaniem po stronie serwera na dużą skalę.
:::

## Specyfikacja techniczna

### Wymagania środowiskowe
Zapoznaj się z dokumentacją [wymagań środowiskowych](/guide/start/environment), aby poznać szczegółowe wymagania dotyczące przeglądarki i środowiska Node.js.

### Kluczowy stos technologiczny
- **Zarządzanie zależnościami**: Wykorzystanie [Import Maps](https://caniuse.com/?search=import%20map) do mapowania modułów, z obsługą zgodności zapewnianą przez [es-module-shims](https://github.com/guybedford/es-module-shims)
- **System budowania**: Przetwarzanie zależności zewnętrznych za pomocą [module-import](https://rspack.dev/config/externals#externalstypemodule-import) opartego na Rspack
- **Łańcuch narzędzi developerskich**: Obsługa gorącego przeładowania ESM i natywnego wykonywania TypeScript

## Pozycjonowanie frameworka
Esmx różni się od [Next.js](https://nextjs.org) czy [Nuxt.js](https://nuxt.com/), koncentrując się na dostarczaniu infrastruktury mikrofrontendowej:

- **System łączenia modułów**: Efektywne i niezawodne importowanie i eksportowanie modułów
- **Renderowanie po stronie serwera**: Elastyczne mechanizmy implementacji SSR
- **Obsługa systemu typów**: Pełna integracja z definicjami typów TypeScript
- **Niezależność od frameworka**: Obsługa integracji z głównymi frameworkami frontendowymi

## Projekt architektoniczny

### Centralizowane zarządzanie zależnościami
- **Ujednolicone źródło zależności**: Centralizowane zarządzanie zależnościami stron trzecich
- **Automatyczna dystrybucja**: Globalna automatyczna synchronizacja aktualizacji zależności
- **Spójność wersji**: Precyzyjna kontrola wersji zależności

### Projekt modułowy
- **Rozdzielenie obowiązków**: Oddzielenie logiki biznesowej od infrastruktury
- **Mechanizm wtyczek**: Obsługa elastycznego łączenia i wymiany modułów
- **Standardowe interfejsy**: Znormalizowane protokoły komunikacji między modułami

### Optymalizacja wydajności
- **Zasada zerowego narzutu**: Maksymalne wykorzystanie natywnych możliwości przeglądarki
- **Inteligentne buforowanie**: Precyzyjne strategie buforowania oparte na skrótach zawartości
- **Ładowanie na żądanie**: Szczegółowe dzielenie kodu i zarządzanie zależnościami

## Dojrzałość projektu
Esmx, po prawie 5 latach iteracyjnego rozwoju (od v1.0 do v3.0), został kompleksowo zweryfikowany w środowiskach korporacyjnych. Obecnie wspiera stabilne działanie dziesiątek projektów biznesowych i stale napędza modernizację stosu technologicznego. Stabilność, niezawodność i zalety wydajnościowe frameworka zostały w pełni potwierdzone w praktyce, zapewniając solidne podstawy technologiczne do tworzenia aplikacji na dużą skalę.