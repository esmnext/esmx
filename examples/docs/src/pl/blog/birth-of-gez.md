---
titleSuffix: "Od wyzwań mikrofrontendów do innowacji ESM: Droga ewolucji frameworka Esmx"
description: Głęboka analiza ewolucji frameworka Esmx od tradycyjnych architektur mikrofrontendów do innowacji opartych na ESM, dzielenie się praktycznymi doświadczeniami w optymalizacji wydajności, zarządzaniu zależnościami i wyborze narzędzi budujących.
head:
  - - meta
    - property: keywords
      content: Esmx, framework mikrofrontendów, ESM, Import Maps, Rspack, federacja modułów, zarządzanie zależnościami, optymalizacja wydajności, ewolucja technologiczna, renderowanie po stronie serwera
sidebar: false
---

# Od współdzielenia komponentów do natywnej modularności: Droga ewolucji frameworka mikrofrontendów Esmx

## Tło projektu

W ciągu ostatnich kilku lat architektura mikrofrontendów szukała właściwej drogi. Jednak obserwowaliśmy różne skomplikowane rozwiązania techniczne, które poprzez warstwy opakowań i sztuczną izolację próbowały symulować idealny świat mikrofrontendów. Te rozwiązania przyniosły znaczące obciążenie wydajnościowe, komplikując prosty rozwój i zaciemniając standardowe procesy.

### Ograniczenia tradycyjnych rozwiązań

W praktyce architektury mikrofrontendów doświadczyliśmy wielu ograniczeń tradycyjnych rozwiązań:

- **Straty wydajności**: Wstrzykiwanie zależności w czasie wykonywania, proxy piaskownicy JS, każda operacja pochłania cenną wydajność
- **Krucha izolacja**: Sztucznie stworzone środowisko piaskownicy nigdy nie dorówna natywnej izolacji przeglądarki
- **Złożoność budowania**: Aby poradzić sobie z zależnościami, konieczne było modyfikowanie narzędzi budujących, co utrudniało utrzymanie prostych projektów
- **Niestandardowe reguły**: Specjalne strategie wdrażania, przetwarzanie w czasie wykonywania, każdy krok odbiegał od standardowych procesów współczesnego rozwoju
- **Ograniczenia ekosystemu**: Powiązanie z frameworkiem, niestandardowe API, co zmuszało do wiązania się z określonym ekosystemem

Te problemy były szczególnie widoczne w naszym projekcie korporacyjnym z 2019 roku. Wówczas duży produkt został podzielony na kilkanaście niezależnych podsystemów biznesowych, które musiały współdzielić zestaw podstawowych i biznesowych komponentów. Początkowo zastosowane rozwiązanie współdzielenia komponentów oparte na pakietach npm ujawniło poważne problemy z efektywnością utrzymania: gdy współdzielony komponent był aktualizowany, wszystkie podsystemy zależne od tego komponentu musiały przejść pełny proces budowania i wdrażania.

## Ewolucja technologiczna

### v1.0: Eksploracja zdalnych komponentów

Aby rozwiązać problem efektywności współdzielenia komponentów, Esmx v1.0 wprowadził mechanizm komponentów RemoteView oparty na protokole HTTP. To rozwiązanie, poprzez dynamiczne żądania w czasie wykonywania, umożliwiło składanie kodu między usługami na żądanie, skutecznie rozwiązując problem zbyt długiego łańcucha zależności budowania. Jednak ze względu na brak standaryzowanego mechanizmu komunikacji w czasie wykonywania, synchronizacja stanu i przekazywanie zdarzeń między usługami nadal miały wąskie gardła wydajnościowe.

### v2.0: Próba federacji modułów

W wersji v2.0 zastosowaliśmy technologię [federacji modułów (Module Federation)](https://webpack.js.org/concepts/module-federation/) z [Webpack 5.0](https://webpack.js.org/). Ta technologia, poprzez ujednolicony mechanizm ładowania modułów i kontenery w czasie wykonywania, znacząco poprawiła efektywność współpracy między usługami. Jednak w praktyce na dużą skalę, zamknięty mechanizm implementacji federacji modułów przyniósł nowe wyzwania: trudności w precyzyjnym zarządzaniu wersjami zależności, szczególnie przy ujednolicaniu współdzielonych zależności wielu usług, często napotykaliśmy konflikty wersji i wyjątki w czasie wykonywania.

## Wkraczanie w nową erę ESM

Planując wersję v3.0, dokładnie obserwowaliśmy trendy rozwoju ekosystemu frontendu i zauważyliśmy, że postęp w natywnych możliwościach przeglądarek otworzył nowe możliwości dla architektury mikrofrontendów:

### Standaryzowany system modułów

Wraz z pełnym wsparciem głównych przeglądarek dla [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) oraz dojrzałością specyfikacji [Import Maps](https://github.com/WICG/import-maps), rozwój frontendu wkroczył w prawdziwą erę modularności. Według statystyk [Can I Use](https://caniuse.com/?search=importmap), obecnie główne przeglądarki (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) osiągnęły 93.5% natywnego wsparcia dla ESM, co zapewnia nam następujące korzyści:

- **Standaryzacja zarządzania zależnościami**: Import Maps zapewnia możliwość rozwiązywania zależności modułów na poziomie przeglądarki, bez potrzeby skomplikowanego wstrzykiwania w czasie wykonywania
- **Optymalizacja ładowania zasobów**: Natywny mechanizm buforowania modułów w przeglądarce znacząco poprawia efektywność ładowania zasobów
- **Uproszczenie procesu budowania**: Tryb rozwoju oparty na ESM sprawia, że procesy budowania środowisk deweloperskich i produkcyjnych są bardziej spójne

Jednocześnie, dzięki wsparciu trybu kompatybilności (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), możemy zwiększyć zasięg przeglądarek do 96.81%, co pozwala nam zachować wysoką wydajność bez rezygnacji z wsparcia dla starszych przeglądarek.

### Przełom w wydajności i izolacji

Natywny system modułów przyniósł nie tylko standaryzację, ale także znaczącą poprawę wydajności i izolacji:

- **Zero narzutu w czasie wykonywania**: Pożegnanie z proxy piaskownicy JavaScript i wstrzykiwaniem w czasie wykonywania w tradycyjnych rozwiązaniach mikrofrontendów
- **Niezawodny mechanizm izolacji**: Ścisły zakres modułów ESM naturalnie zapewnia najbardziej niezawodną izolację
- **Precyzyjne zarządzanie zależnościami**: Statyczna analiza importu sprawia, że zależności są bardziej przejrzyste, a kontrola wersji bardziej precyzyjna

### Wybór narzędzi budujących

W procesie wdrażania rozwiązania technologicznego, wybór narzędzi budujących był kluczową decyzją. Po prawie rocznych badaniach i praktyce, nasz wybór przeszedł następującą ewolucję:

1. **Eksploracja Vite**
   - Zalety: Serwer deweloperski oparty na ESM, zapewniający doskonałe doświadczenie deweloperskie
   - Wyzwania: Różnice w budowaniu środowisk deweloperskich i produkcyjnych wprowadzały pewną niepewność

2. **Ustalenie [Rspack](https://www.rspack.dev/)**
   - Zalety wydajnościowe: Wysokowydajna kompilacja oparta na [Rust](https://www.rust-lang.org/), znacząco poprawiająca szybkość budowania
   - Wsparcie ekosystemu: Wysoka kompatybilność z ekosystemem Webpack, obniżająca koszty migracji
   - Wsparcie ESM: Praktyka projektu Rslib potwierdziła niezawodność w budowaniu ESM

Ta decyzja pozwoliła nam zachować doświadczenie deweloperskie, jednocześnie zapewniając bardziej stabilne wsparcie dla środowiska produkcyjnego. Dzięki kombinacji ESM i Rspack, ostatecznie zbudowaliśmy wysokowydajne, mało inwazyjne rozwiązanie mikrofrontendów.

## Perspektywy na przyszłość

W przyszłych planach rozwoju framework Esmx skupi się na następujących trzech kierunkach:

### Głęboka optymalizacja Import Maps

- **Dynamiczne zarządzanie zależnościami**: Inteligentne planowanie wersji zależności w czasie wykonywania, rozwiązujące konflikty zależności między wieloma aplikacjami
- **Strategie preładowania**: Inteligentne preładowanie oparte na analizie routingu, poprawiające efektywność ładowania zasobów
- **Optymalizacja budowania**: Automatyczne generowanie optymalnej konfiguracji Import Maps, redukujące koszty ręcznej konfiguracji przez deweloperów

### Niezależne od frameworka rozwiązanie routingu

- **Abstrakcja ujednoliconego routingu**: Projektowanie interfejsów routingu niezależnych od frameworka, wspierających główne frameworki takie jak Vue, React
- **Routing mikroaplikacji**: Implementacja powiązań routingu między aplikacjami, utrzymująca spójność URL i stanu aplikacji
- **Middleware routingu**: Zapewnienie rozszerzalnego mechanizmu middleware, wspierającego kontrolę dostępu, przejścia między stronami itp.

### Najlepsze praktyki komunikacji między frameworkami

- **Przykładowe aplikacje**: Dostarczenie kompletnych przykładów komunikacji między frameworkami, obejmujących główne frameworki takie jak Vue, React, Preact
- **Synchronizacja stanu**: Lekkie rozwiązanie współdzielenia stanu oparte na ESM
- **Szyna zdarzeń**: Standaryzowany mechanizm komunikacji zdarzeń, wspierający odłączoną komunikację między aplikacjami

Dzięki tym optymalizacjom i rozszerzeniom, oczekujemy, że Esmx stanie się bardziej kompletnym i łatwym w użyciu rozwiązaniem mikrofrontendów, zapewniającym deweloperom lepsze doświadczenie i wyższą efektywność rozwoju.