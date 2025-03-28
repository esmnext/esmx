---
titleSuffix: Mechanizmy renderowania po stronie serwera w frameworku Esmx
description: Szczegółowy opis mechanizmu kontekstu renderowania (RenderContext) w frameworku Esmx, obejmujący zarządzanie zasobami, generowanie HTML oraz system modułów ESM, pomagający programistom zrozumieć i wykorzystać funkcje renderowania po stronie serwera.
head:
  - - meta
    - property: keywords
      content: Esmx, kontekst renderowania, RenderContext, SSR, renderowanie po stronie serwera, ESM, zarządzanie zasobami
---

# Kontekst renderowania

RenderContext to klasa rdzeniowa w frameworku Esmx, odpowiedzialna głównie za zarządzanie zasobami i generowanie HTML podczas procesu renderowania po stronie serwera (SSR). Posiada następujące kluczowe cechy:

1. **System modułów oparty na ESM**
   - Wykorzystuje nowoczesny standard ECMAScript Modules
   - Obsługuje natywny import i eksport modułów
   - Zapewnia lepsze dzielenie kodu i ładowanie na żądanie

2. **Inteligentne zbieranie zależności**
   - Dynamiczne zbieranie zależności na podstawie rzeczywistej ścieżki renderowania
   - Unikanie niepotrzebnego ładowania zasobów
   - Obsługa komponentów asynchronicznych i dynamicznego importu

3. **Precyzyjne wstrzykiwanie zasobów**
   - Ścisła kontrola kolejności ładowania zasobów
   - Optymalizacja wydajności ładowania pierwszej strony
   - Zapewnienie niezawodności aktywacji po stronie klienta (Hydration)

4. **Elastyczny mechanizm konfiguracji**
   - Obsługa dynamicznej konfiguracji ścieżki bazowej
   - Dostępne różne tryby mapowania importu
   - Dostosowanie do różnych scenariuszy wdrożenia

## Sposób użycia

W frameworku Esmx programiści zazwyczaj nie muszą bezpośrednio tworzyć instancji RenderContext, lecz mogą uzyskać instancję poprzez metodę `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Obsługa plików statycznych
        esmx.middleware(req, res, async () => {
            // Uzyskanie instancji RenderContext poprzez esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Odpowiedź z zawartością HTML
            res.end(rc.html);
        });
    });
}
```

## Główne funkcje

### Zbieranie zależności

RenderContext implementuje inteligentny mechanizm zbierania zależności, który dynamicznie zbiera zależności na podstawie rzeczywiście renderowanych komponentów, zamiast wstępnego ładowania wszystkich potencjalnie potrzebnych zasobów:

#### Zbieranie na żądanie
- Automatyczne śledzenie i rejestrowanie zależności modułów podczas rzeczywistego renderowania komponentów
- Zbieranie tylko CSS, JavaScript i innych zasobów faktycznie używanych podczas renderowania bieżącej strony
- Precyzyjne rejestrowanie zależności modułów każdego komponentu poprzez `importMetaSet`
- Obsługa zbierania zależności dla komponentów asynchronicznych i dynamicznego importu

#### Automatyczne przetwarzanie
- Programiści nie muszą ręcznie zarządzać procesem zbierania zależności
- Framework automatycznie zbiera informacje o zależnościach podczas renderowania komponentów
- Przetwarzanie wszystkich zebranych zasobów poprzez metodę `commit()`
- Automatyczne rozwiązywanie problemów z zależnościami cyklicznymi i powtarzającymi się

#### Optymalizacja wydajności
- Unikanie ładowania nieużywanych modułów, znacząco skraca czas ładowania pierwszej strony
- Precyzyjna kontrola kolejności ładowania zasobów, optymalizacja wydajności renderowania strony
- Automatyczne generowanie optymalnego mapowania importu (Import Map)
- Obsługa strategii wstępnego ładowania i ładowania na żądanie zasobów

### Wstrzykiwanie zasobów

RenderContext oferuje wiele metod do wstrzykiwania różnych typów zasobów, z których każda została starannie zaprojektowana w celu optymalizacji wydajności ładowania zasobów:

- `preload()`: Wstępne ładowanie zasobów CSS i JS, z obsługą konfiguracji priorytetów
- `css()`: Wstrzykiwanie arkuszy stylów pierwszej strony, z obsługą ekstrakcji kluczowego CSS
- `importmap()`: Wstrzykiwanie mapowania importu modułów, z obsługą dynamicznego rozwiązywania ścieżek
- `moduleEntry()`: Wstrzykiwanie modułu wejściowego klienta, z obsługą konfiguracji wielu wejść
- `modulePreload()`: Wstępne ładowanie zależności modułów, z obsługą strategii ładowania na żądanie

### Kolejność wstrzykiwania zasobów

RenderContext ściśle kontroluje kolejność wstrzykiwania zasobów, która została zaprojektowana z uwzględnieniem działania przeglądarki i optymalizacji wydajności:

1. Część head:
   - `preload()`: Wstępne ładowanie zasobów CSS i JS, aby przeglądarka mogła jak najwcześniej je wykryć i rozpocząć ładowanie
   - `css()`: Wstrzykiwanie arkuszy stylów pierwszej strony, aby style były gotowe podczas renderowania zawartości

2. Część body:
   - `importmap()`: Wstrzykiwanie mapowania importu modułów, definiowanie reguł rozwiązywania ścieżek dla modułów ESM
   - `moduleEntry()`: Wstrzykiwanie modułu wejściowego klienta, musi być wykonane po importmap
   - `modulePreload()`: Wstępne ładowanie zależności modułów, musi być wykonane po importmap

## Pełny proces renderowania

Typowy proces użycia RenderContext wygląda następująco:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Renderowanie zawartości strony i zbieranie zależności
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Zatwierdzanie zebranych zależności
    await rc.commit();
    
    // 3. Generowanie pełnego HTML
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
            ${rc.css()}
        </head>
        <body>
            ${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
```

## Zaawansowane funkcje

### Konfiguracja ścieżki bazowej

RenderContext zapewnia elastyczny mechanizm dynamicznej konfiguracji ścieżki bazowej, umożliwiający dynamiczne ustawienie ścieżki bazowej dla zasobów statycznych w czasie wykonywania:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Ustawienie ścieżki bazowej
    params: {
        url: req.url
    }
});
```

Ten mechanizm jest szczególnie przydatny w następujących scenariuszach:

1. **Wdrożenie witryny wielojęzycznej**
   ```
   domena.com      → język domyślny
   domena.com/cn/  → witryna chińska
   domena.com/en/  → witryna angielska
   ```

2. **Aplikacje mikrofrontendowe**
   - Obsługa elastycznego wdrażania podaplikacji pod różnymi ścieżkami
   - Ułatwienie integracji z różnymi aplikacjami głównymi

### Tryby mapowania importu

RenderContext oferuje dwa tryby mapowania importu (Import Map):

1. **Tryb Inline** (domyślny)
   - Mapowanie importu jest bezpośrednio wstawiane do HTML
   - Odpowiedni dla małych aplikacji, redukuje dodatkowe żądania sieciowe
   - Natychmiastowa dostępność podczas ładowania strony

2. **Tryb JS**
   - Mapowanie importu jest ładowane poprzez zewnętrzny plik JavaScript
   - Odpowiedni dla dużych aplikacji, pozwala wykorzystać mechanizm cache przeglądarki
   - Obsługa dynamicznej aktualizacji zawartości mapowania

Można wybrać odpowiedni tryb poprzez konfigurację:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Konfiguracja funkcji wejściowej

RenderContext obsługuje konfigurację `entryName` w celu określenia funkcji wejściowej dla renderowania po stronie serwera:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Określenie użycia funkcji wejściowej dla urządzeń mobilnych
    params: {
        url: req.url
    }
});
```

Ten mechanizm jest szczególnie przydatny w następujących scenariuszach:

1. **Renderowanie wielu szablonów**
   ```ts title="src/entry.server.ts"
   // Funkcja wejściowa dla urządzeń mobilnych
   export const mobile = async (rc: RenderContext) => {
       // Specyficzna logika renderowania dla urządzeń mobilnych
   };

   // Funkcja wejściowa dla urządzeń stacjonarnych
   export const desktop = async (rc: RenderContext) => {
       // Specyficzna logika renderowania dla urządzeń stacjonarnych
   };
   ```

2. **Testy A/B**
   - Obsługa różnych logik renderowania dla tej samej strony
   - Ułatwienie eksperymentów z doświadczeniem użytkownika
   - Elastyczne przełączanie między różnymi strategiami renderowania

3. **Specjalne wymagania renderowania**
   - Obsługa niestandardowych procesów renderowania dla niektórych stron
   - Dostosowanie do różnych scenariuszy optymalizacji wydajności
   - Realizacja bardziej precyzyjnej kontroli renderowania

## Najlepsze praktyki

1. **Uzyskiwanie instancji RenderContext**
   - Zawsze uzyskuj instancję poprzez metodę `esmx.render()`
   - Przekazuj odpowiednie parametry w zależności od potrzeb
   - Unikaj ręcznego tworzenia instancji

2. **Zbieranie zależności**
   - Upewnij się, że wszystkie moduły poprawnie wywołują `importMetaSet.add(import.meta)`
   - Natychmiast wywołuj metodę `commit()` po zakończeniu renderowania
   - Rozsądnie używaj komponentów asynchronicznych i dynamicznego importu do optymalizacji ładowania pierwszej strony

3. **Wstrzykiwanie zasobów**
   - Ściśle przestrzegaj kolejności wstrzykiwania zasobów
   - Nie wstrzykuj CSS w części body
   - Upewnij się, że importmap jest przed moduleEntry

4. **Optymalizacja wydajności**
   - Używaj preload do wstępnego ładowania kluczowych zasobów
   - Rozsądnie używaj modulePreload do optymalizacji ładowania modułów
   - Unikaj niepotrzebnego ładowania zasobów
   - Wykorzystuj mechanizm cache przeglądarki do optymalizacji wydajności ładowania