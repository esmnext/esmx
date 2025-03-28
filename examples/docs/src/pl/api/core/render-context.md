---
titleSuffix: Dokumentacja API kontekstu renderowania frameworka Esmx
description: Szczegółowy opis klasy RenderContext, rdzenia frameworka Esmx, obejmujący kontrolę renderowania, zarządzanie zasobami, synchronizację stanu i kontrolę routingu, pomagający programistom w efektywnym renderowaniu po stronie serwera.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, renderowanie po stronie serwera, kontekst renderowania, synchronizacja stanu, zarządzanie zasobami, framework aplikacji webowych
---

# RenderContext

RenderContext to główna klasa w frameworku Esmx, odpowiedzialna za zarządzanie pełnym cyklem życia renderowania po stronie serwera (SSR). Dostarcza kompleksowy zestaw API do obsługi kontekstu renderowania, zarządzania zasobami, synchronizacji stanu i innych kluczowych zadań:

- **Kontrola renderowania**: Zarządzanie procesem renderowania po stronie serwera, wsparcie dla wielu punktów wejścia, renderowanie warunkowe itp.
- **Zarządzanie zasobami**: Inteligentne zbieranie i wstrzykiwanie zasobów statycznych, takich jak JS, CSS, w celu optymalizacji wydajności ładowania.
- **Synchronizacja stanu**: Obsługa serializacji stanu po stronie serwera, zapewnienie poprawnej hydratacji po stronie klienta.
- **Kontrola routingu**: Wsparcie dla przekierowań po stronie serwera, ustawianie kodów statusu HTTP i innych zaawansowanych funkcji.

## Definicje typów

### ServerRenderHandle

Definicja typu funkcji obsługującej renderowanie po stronie serwera.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

Funkcja obsługująca renderowanie po stronie serwera to funkcja asynchroniczna lub synchroniczna, która przyjmuje instancję RenderContext jako parametr i służy do obsługi logiki renderowania po stronie serwera.

```ts title="entry.node.ts"
// 1. Funkcja asynchroniczna
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Funkcja synchroniczna
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Definicja typu listy plików zasobów zebranych podczas procesu renderowania.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Lista plików JavaScript
- **css**: Lista arkuszy stylów
- **modulepreload**: Lista modułów ESM do wstępnego załadowania
- **resources**: Lista innych zasobów (obrazy, czcionki itp.)

```ts
// Przykład listy plików zasobów
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

Definicja trybu generowania importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Wstawia zawartość importmap bezpośrednio do HTML, odpowiednie w następujących scenariuszach:
  - Konieczność zmniejszenia liczby żądań HTTP
  - Zawartość importmap jest mała
  - Wysokie wymagania dotyczące wydajności ładowania pierwszej strony
- `js`: Generuje zawartość importmap jako osobny plik JS, odpowiednie w następujących scenariuszach:
  - Zawartość importmap jest duża
  - Konieczność wykorzystania mechanizmu cache przeglądarki
  - Wiele stron współdzieli ten sam importmap

Klasa kontekstu renderowania, odpowiedzialna za zarządzanie zasobami i generowanie HTML podczas renderowania po stronie serwera (SSR).
## Opcje instancji

Definicja opcji konfiguracyjnych kontekstu renderowania.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Typ**: `string`
- **Domyślna wartość**: `''`

Podstawowa ścieżka zasobów statycznych.
- Wszystkie zasoby statyczne (JS, CSS, obrazy itp.) są ładowane względem tej ścieżki
- Obsługa dynamicznej konfiguracji w czasie wykonywania, bez konieczności ponownego budowania
- Często używane w witrynach wielojęzycznych, aplikacjach mikrofrontendowych itp.

#### entryName

- **Typ**: `string`
- **Domyślna wartość**: `'default'`

Nazwa funkcji wejściowej renderowania po stronie serwera. Służy do określenia funkcji wejściowej używanej podczas renderowania po stronie serwera, gdy moduł eksportuje wiele funkcji renderowania.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Logika renderowania dla urządzeń mobilnych
};

export const desktop = async (rc: RenderContext) => {
  // Logika renderowania dla urządzeń stacjonarnych
};
```

#### params

- **Typ**: `Record<string, any>`
- **Domyślna wartość**: `{}`

Parametry renderowania. Można przekazać parametry dowolnego typu do funkcji renderowania, często używane do przekazywania informacji o żądaniu (URL, parametry zapytania itp.).

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **Typ**: `'inline' | 'js'`
- **Domyślna wartość**: `'inline'`

Tryb generowania mapy importów (Import Map):
- `inline`: Wstawia zawartość importmap bezpośrednio do HTML
- `js`: Generuje zawartość importmap jako osobny plik JS


## Właściwości instancji

### esmx

- **Typ**: `Esmx`
- **Tylko do odczytu**: `true`

Referencja do instancji Esmx. Służy do dostępu do podstawowych funkcji i informacji konfiguracyjnych frameworka.

### redirect

- **Typ**: `string | null`
- **Domyślna wartość**: `null`

Adres przekierowania. Po ustawieniu serwer może wykonać przekierowanie HTTP na podstawie tej wartości, często używane w scenariuszach weryfikacji logowania, kontroli uprawnień itp.

```ts title="entry.node.ts"
// Przykład weryfikacji logowania
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Kontynuacja renderowania strony...
};

// Przykład kontroli uprawnień
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Kontynuacja renderowania strony...
};
```

### status

- **Typ**: `number | null`
- **Domyślna wartość**: `null`

Kod statusu HTTP odpowiedzi. Można ustawić dowolny prawidłowy kod statusu HTTP, często używany w scenariuszach obsługi błędów, przekierowań itp.

```ts title="entry.node.ts"
// Przykład obsługi błędu 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Renderowanie strony 404...
    return;
  }
  // Kontynuacja renderowania strony...
};

// Przykład tymczasowego przekierowania
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Tymczasowe przekierowanie, zachowanie metody żądania
    return;
  }
  // Kontynuacja renderowania strony...
};
```

### html

- **Typ**: `string`
- **Domyślna wartość**: `''`

Zawartość HTML. Służy do ustawiania i pobierania ostatecznie wygenerowanej zawartości HTML, automatycznie obsługuje symbole zastępcze podstawowej ścieżki.

```ts title="entry.node.ts"
// Podstawowe użycie
export default async (rc: RenderContext) => {
  // Ustawienie zawartości HTML
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// Dynamiczna podstawowa ścieżka
const rc = await esmx.render({
  base: '/app',  // Ustawienie podstawowej ścieżki
  params: { url: req.url }
});

// Symbole zastępcze w HTML są automatycznie zastępowane:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Zastąpione przez:
// /app/your-app-name/css/style.css
```

### base

- **Typ**: `string`
- **Tylko do odczytu**: `true`
- **Domyślna wartość**: `''`

Podstawowa ścieżka zasobów statycznych. Wszystkie zasoby statyczne (JS, CSS, obrazy itp.) są ładowane względem tej ścieżki, obsługa dynamicznej konfiguracji w czasie wykonywania.

```ts
// Podstawowe użycie
const rc = await esmx.render({
  base: '/esmx',  // Ustawienie podstawowej ścieżki
  params: { url: req.url }
});

// Przykład witryny wielojęzycznej
const rc = await esmx.render({
  base: '/cn',  // Witryna chińska
  params: { lang: 'zh-CN' }
});

// Przykład aplikacji mikrofrontendowej
const rc = await esmx.render({
  base: '/app1',  // Podrzędna aplikacja 1
  params: { appId: 1 }
});
```

### entryName

- **Typ**: `string`
- **Tylko do odczytu**: `true`
- **Domyślna wartość**: `'default'`

Nazwa funkcji wejściowej renderowania po stronie serwera. Służy do wyboru funkcji renderowania z pliku entry.server.ts.

```ts title="entry.node.ts"
// Domyślna funkcja wejściowa
export default async (rc: RenderContext) => {
  // Domyślna logika renderowania
};

// Wiele funkcji wejściowych
export const mobile = async (rc: RenderContext) => {
  // Logika renderowania dla urządzeń mobilnych
};

export const desktop = async (rc: RenderContext) => {
  // Logika renderowania dla urządzeń stacjonarnych
};

// Wybór funkcji wejściowej na podstawie typu urządzenia
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Typ**: `Record<string, any>`
- **Tylko do odczytu**: `true`
- **Domyślna wartość**: `{}`

Parametry renderowania. Można przekazywać i uzyskiwać dostęp do parametrów podczas renderowania po stronie serwera, często używane do przekazywania informacji o żądaniu, konfiguracji strony itp.

```ts
// Podstawowe użycie - przekazywanie URL i ustawień języka
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Konfiguracja strony - ustawienie motywu i układu
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Konfiguracja środowiska - wstrzyknięcie adresu API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Typ**: `Set<ImportMeta>`

Zbiór zależności modułów. Automatycznie śledzi i rejestruje zależności modułów podczas renderowania komponentów, zbiera tylko zasoby faktycznie używane podczas renderowania bieżącej strony.

```ts
// Podstawowe użycie
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Automatyczne zbieranie zależności modułów podczas renderowania
  // Framework automatycznie wywołuje context.importMetaSet.add(import.meta) podczas renderowania komponentów
  // Programiści nie muszą ręcznie obsługiwać zbierania zależności
  return '<div id="app">Hello World</div>';
};

// Przykład użycia
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Typ**: `RenderFiles`

Lista plików zasobów:
- js: Lista plików JavaScript
- css: Lista arkuszy stylów
- modulepreload: Lista modułów ESM do wstępnego załadowania
- resources: Lista innych zasobów (obrazy, czcionki itp.)

```ts
// Zbieranie zasobów
await rc.commit();

// Wstrzykiwanie zasobów
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Wstępne ładowanie zasobów -->
    ${rc.preload()}
    <!-- Wstrzykiwanie arkuszy stylów -->
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
```

### importmapMode

- **Typ**: `'inline' | 'js'`
- **Domyślna wartość**: `'inline'`

Tryb generowania mapy importów:
- `inline`: Wstawia zawartość importmap bezpośrednio do HTML
- `js`: Generuje zawartość importmap jako osobny plik JS


## Metody instancji

### serialize()

- **Parametry**: 
  - `input: any` - Dane do serializacji
  - `options?: serialize.SerializeJSOptions` - Opcje serializacji
- **Zwraca**: `string`

Serializuje obiekt JavaScript do ciągu znaków. Służy do serializacji danych stanu podczas renderowania po stronie serwera, zapewniając bezpieczne osadzenie danych w HTML.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **Parametry**: 
  - `varName: string` - Nazwa zmiennej
  - `data: Record<string, any>` - Dane stanu
- **Zwraca**: `string`

Serializuje dane stanu i wstrzykuje je do HTML. Używa bezpiecznych metod serializacji danych, obsługuje złożone struktury danych.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **Zwraca**: `Promise<void>`

Zatwierdza zbieranie zależności i aktualizuje listę zasobów. Zbiera wszystkie używane moduły z importMetaSet, analizuje konkretne zasoby każdego modułu na podstawie pliku manifest.

```ts
// Renderowanie i zatwierdzanie zależności
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Zatwierdzanie zbierania zależności
await rc.commit();
```

### preload()

- **Zwraca**: `string`

Generuje znaczniki wstępnego ładowania zasobów. Służy do wstępnego ładowania zasobów CSS i JavaScript, obsługuje konfigurację priorytetów, automatycznie obsługuje podstawową ścieżkę.

```ts
rc.html = `
  <!DOCTYPE html>
