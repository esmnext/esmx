---
titleSuffix: Dokumentacja API klas rdzeniowych frameworka
description: Szczegółowy opis API klas rdzeniowych frameworka Esmx, obejmujący zarządzanie cyklem życia aplikacji, obsługę zasobów statycznych oraz możliwości renderowania po stronie serwera, pomagający programistom dogłębnie zrozumieć kluczowe funkcje frameworka.
head:
  - - meta
    - property: keywords
      content: Esmx, API, zarządzanie cyklem życia, zasoby statyczne, renderowanie po stronie serwera, Rspack, framework aplikacji webowych
---

# Esmx

## Wprowadzenie

Esmx to wysokowydajny framework aplikacji webowych oparty na Rspack, zapewniający kompleksowe zarządzanie cyklem życia aplikacji, obsługę zasobów statycznych oraz możliwości renderowania po stronie serwera.

## Definicje typów

### RuntimeTarget

- **Definicja typu**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Typ środowiska uruchomieniowego aplikacji:
- `client`: Działa w środowisku przeglądarki, obsługuje operacje na DOM i API przeglądarki
- `server`: Działa w środowisku Node.js, obsługuje system plików i funkcje serwerowe

### ImportMap

- **Definicja typu**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Typ mapowania importów modułów ES.

#### SpecifierMap

- **Definicja typu**:
```ts
type SpecifierMap = Record<string, string>
```

Typ mapowania identyfikatorów modułów, używany do definiowania mapowania ścieżek importu modułów.

#### ScopesMap

- **Definicja typu**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Typ mapowania zakresów, używany do definiowania mapowania importu modułów w określonych zakresach.

### COMMAND

- **Definicja typu**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Typ wyliczeniowy poleceń:
- `dev`: Polecenie środowiska deweloperskiego, uruchamia serwer deweloperski z obsługą hot-reload
- `build`: Polecenie budowania, generuje artefakty produkcyjne
- `preview`: Polecenie podglądu, uruchamia lokalny serwer podglądu
- `start`: Polecenie uruchomienia, uruchamia serwer produkcyjny

## Opcje instancji

Definiuje kluczowe opcje konfiguracyjne frameworka Esmx.

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **Typ**: `string`
- **Domyślna wartość**: `process.cwd()`

Ścieżka do katalogu głównego projektu. Może być ścieżką bezwzględną lub względną, względna ścieżka jest rozwiązywana względem bieżącego katalogu roboczego.

#### isProd

- **Typ**: `boolean`
- **Domyślna wartość**: `process.env.NODE_ENV === 'production'`

Identyfikator środowiska.
- `true`: Środowisko produkcyjne
- `false`: Środowisko deweloperskie

#### basePathPlaceholder

- **Typ**: `string | false`
- **Domyślna wartość**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Konfiguracja symbolu zastępczego ścieżki bazowej. Używany do dynamicznego zastępowania ścieżki bazowej zasobów w czasie wykonywania. Ustawienie na `false` wyłącza tę funkcję.

#### modules

- **Typ**: `ModuleConfig`

Opcje konfiguracyjne modułów. Używane do konfiguracji reguł rozwiązywania modułów w projekcie, w tym aliasów modułów, zależności zewnętrznych itp.

#### packs

- **Typ**: `PackConfig`

Opcje konfiguracyjne pakowania. Używane do pakowania artefaktów budowania w standardowe pakiety npm w formacie .tgz.

#### devApp

- **Typ**: `(esmx: Esmx) => Promise<App>`

Funkcja tworzenia aplikacji dla środowiska deweloperskiego. Używana tylko w środowisku deweloperskim do tworzenia instancji aplikacji serwera deweloperskiego.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Niestandardowa konfiguracja Rspack
        }
      })
    )
  }
}
```

#### server

- **Typ**: `(esmx: Esmx) => Promise<void>`

Funkcja konfiguracji i uruchamiania serwera HTTP. Używana do konfiguracji i uruchamiania serwera HTTP, dostępna zarówno w środowisku deweloperskim, jak i produkcyjnym.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **Typ**: `(esmx: Esmx) => Promise<void>`

Funkcja przetwarzania po budowaniu. Wykonywana po zakończeniu budowania projektu, może być używana do:
- Wykonywania dodatkowego przetwarzania zasobów
- Operacji wdrażania
- Generowania plików statycznych
- Wysyłania powiadomień o budowaniu

## Właściwości instancji

### name

- **Typ**: `string`
- **Tylko do odczytu**: `true`

Nazwa bieżącego modułu, pochodząca z konfiguracji modułu.

### varName

- **Typ**: `string`
- **Tylko do odczytu**: `true`

Prawidłowa nazwa zmiennej JavaScript wygenerowana na podstawie nazwy modułu.

### root

- **Typ**: `string`
- **Tylko do odczytu**: `true`

Bezwzględna ścieżka do katalogu głównego projektu. Jeśli skonfigurowany `root` jest ścieżką względną, jest rozwiązywany względem bieżącego katalogu roboczego.

### isProd

- **Typ**: `boolean`
- **Tylko do odczytu**: `true`

Określa, czy bieżące środowisko jest produkcyjne. Priorytetowo używana jest opcja `isProd` z konfiguracji, jeśli nie jest skonfigurowana, jest określane na podstawie `process.env.NODE_ENV`.

### basePath

- **Typ**: `string`
- **Tylko do odczytu**: `true`
- **Rzuca**: `NotReadyError` - gdy framework nie jest zainicjalizowany

Pobiera ścieżkę bazową modułu rozpoczynającą się i kończącą się ukośnikiem. Zwraca format `/${name}/`, gdzie name pochodzi z konfiguracji modułu.

### basePathPlaceholder

- **Typ**: `string`
- **Tylko do odczytu**: `true`

Pobiera symbol zastępczy ścieżki bazowej używany do dynamicznego zastępowania w czasie wykonywania. Może być wyłączony przez konfigurację.

### middleware

- **Typ**: `Middleware`
- **Tylko do odczytu**: `true`

Pobiera middleware do obsługi zasobów statycznych. Dostarcza różne implementacje w zależności od środowiska:
- Środowisko deweloperskie: Obsługa kompilacji w locie i hot-reload
- Środowisko produkcyjne: Obsługa długotrwałego buforowania zasobów statycznych

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Typ**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Tylko do odczytu**: `true`

Pobiera funkcję renderowania po stronie serwera. Dostarcza różne implementacje w zależności od środowiska:
- Środowisko deweloperskie: Obsługa hot-reload i podglądu w locie
- Środowisko produkcyjne: Zapewnia zoptymalizowaną wydajność renderowania

```ts
// Podstawowe użycie
const rc = await esmx.render({
  params: { url: req.url }
});

// Zaawansowana konfiguracja
const rc = await esmx.render({
  base: '',                    // Ścieżka bazowa
  importmapMode: 'inline',     // Tryb mapowania importów
  entryName: 'default',        // Punkt wejścia renderowania
  params: {
    url: req.url,
    state: { user: 'admin' }   // Dane stanu
  }
});
```

### COMMAND

- **Typ**: `typeof COMMAND`
- **Tylko do odczytu**: `true`

Pobiera definicję typu wyliczeniowego poleceń.

### moduleConfig

- **Typ**: `ParsedModuleConfig`
- **Tylko do odczytu**: `true`
- **Rzuca**: `NotReadyError` - gdy framework nie jest zainicjalizowany

Pobiera pełną konfigurację bieżącego modułu, w tym reguły rozwiązywania modułów, konfigurację aliasów itp.

### packConfig

- **Typ**: `ParsedPackConfig`
- **Tylko do odczytu**: `true`
- **Rzuca**: `NotReadyError` - gdy framework nie jest zainicjalizowany

Pobiera konfigurację związaną z pakowaniem bieżącego modułu, w tym ścieżkę wyjściową, przetwarzanie package.json itp.

## Metody instancji

### constructor()

- **Parametry**: 
  - `options?: EsmxOptions` - Opcje konfiguracyjne frameworka
- **Zwraca**: `Esmx`

Tworzy instancję frameworka Esmx.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parametry**: `command: COMMAND`
- **Zwraca**: `Promise<boolean>`
- **Rzuca**:
  - `Error`: Przy ponownej inicjalizacji
  - `NotReadyError`: Przy dostępie do nieinicjalizowanej instancji

Inicjalizuje instancję frameworka Esmx. Wykonuje następujące kluczowe kroki inicjalizacji:

1. Parsuje konfigurację projektu (package.json, konfiguracja modułów, konfiguracja pakowania itp.)
2. Tworzy instancję aplikacji (środowisko deweloperskie lub produkcyjne)
3. Wykonuje odpowiednie metody cyklu życia w zależności od polecenia

::: warning Uwaga
- Ponowna inicjalizacja rzuca błąd
- Dostęp do nieinicjalizowanej instancji rzuca `NotReadyError`

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Zwraca**: `Promise<boolean>`

Niszczy instancję frameworka Esmx, wykonując czyszczenie zasobów i zamykanie połączeń. Głównie używane do:
- Zamykania serwera deweloperskiego
- Czyszczenia plików tymczasowych i pamięci podręcznej
- Zwolnienia zasobów systemowych

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Zwraca**: `Promise<boolean>`

Wykonuje proces budowania aplikacji, w tym:
- Kompilację kodu źródłowego
- Generowanie artefaktów produkcyjnych
- Optymalizację i kompresję kodu
- Generowanie manifestu zasobów

::: warning Uwaga
Wywołanie przed inicjalizacją instancji frameworka rzuca `NotReadyError`
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Generowanie statycznego HTML po zakończeniu budowania
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **Zwraca**: `Promise<void>`
- **Rzuca**: `NotReadyError` - gdy framework nie jest zainicjalizowany

Uruchamia serwer HTTP i konfiguruje instancję serwera. Wywoływane w następujących cyklach życia:
- Środowisko deweloperskie (dev): Uruchamia serwer deweloperski z obsługą hot-reload
- Środowisko produkcyjne (start): Uruchamia serwer produkcyjny z wydajnością produkcyjną

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Obsługa zasobów statycznych
      esmx.middleware(req, res, async () => {
        // Renderowanie po stronie serwera
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Serwer działa na http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Zwraca**: `Promise<boolean>`

Wykonuje logikę przetwarzania po budowaniu, używana do:
- Generowania statycznych plików HTML
- Przetwarzania artefaktów budowania
- Wykonywania zadań wdrażania
- Wysyłania powiadomień o budowaniu

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Generowanie statycznego HTML dla wielu stron
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

Rozwiązuje ścieżkę projektu, konwertując ścieżkę względną na bezwzględną.

- **Parametry**:
  - `projectPath: ProjectPath` - Typ ścieżki projektu
  - `...args: string[]` - Fragmenty ścieżki
- **Zwraca**: `string` - Rozwiązana ścieżka bezwzględna

- **Przykład**:
```ts
// Rozwiązanie ścieżki do zasobów statycznych
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Synchroniczne zapisywanie zawartości do pliku.

- **Parametry**:
  - `filepath`: `string` - Bezwzględna ścieżka do pliku
  - `data`: `any` - Dane do zapisania, mogą być ciągiem znaków, Bufferem lub obiektem
- **Zwraca**: `boolean` - Czy zapis się powiódł

- **Przykład**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Synchroniczne odczytywanie i parsowanie pliku JSON.

- **Parametry**:
  - `filename`: `string` - Bezwzględna ścieżka do pliku JSON

- **Zwraca**: `any` - Sparsowany obiekt JSON
- **Wyjątki**: Rzuca wyjątek, gdy plik nie istnieje lub format JSON jest nieprawidłowy

- **Przykład**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Użycie obiektu manifest
}
```

### readJson()

Asynchroniczne odczytywanie i parsowanie pliku JSON.

- **Param