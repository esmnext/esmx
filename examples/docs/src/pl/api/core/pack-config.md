---
titleSuffix: Dokumentacja API konfiguracji pakowania frameworku Esmx
description: Szczegółowy opis interfejsu konfiguracyjnego PackConfig frameworku Esmx, obejmujący reguły pakowania pakietów, konfigurację wyjściową i hooki cyklu życia, pomagający programistom w implementacji standardowych procesów budowania.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, pakowanie pakietów, konfiguracja budowania, hooki cyklu życia, konfiguracja pakowania, framework aplikacji webowych
---

# PackConfig

`PackConfig` to interfejs konfiguracji pakowania pakietów, służący do pakowania wyników budowania usługi w standardowy format pakietu npm .tgz.

- **Standaryzacja**: Używa standardowego formatu pakowania npm .tgz
- **Kompletność**: Zawiera wszystkie niezbędne pliki, takie jak kod źródłowy modułu, deklaracje typów i pliki konfiguracyjne
- **Kompatybilność**: W pełni kompatybilny z ekosystemem npm, wspiera standardowe przepływy pracy zarządzania pakietami

## Definicja typów

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Określa, czy funkcja pakowania jest włączona. Po włączeniu wyniki budowania zostaną spakowane w standardowy format pakietu npm .tgz.

- Typ: `boolean`
- Wartość domyślna: `false`

#### outputs

Określa ścieżkę wyjściową pliku pakietu. Obsługiwane są następujące sposoby konfiguracji:
- `string`: Pojedyncza ścieżka wyjściowa, np. 'dist/versions/my-app.tgz'
- `string[]`: Wiele ścieżek wyjściowych, służących do jednoczesnego generowania wielu wersji
- `boolean`: true - używa domyślnej ścieżki 'dist/client/versions/latest.tgz'

#### packageJson

Funkcja zwrotna do dostosowywania zawartości pliku package.json. Wywoływana przed pakowaniem, służy do dostosowywania zawartości pliku package.json.

- Parametry:
  - `esmx: Esmx` - Instancja Esmx
  - `pkg: any` - Oryginalna zawartość pliku package.json
- Wartość zwracana: `Promise<any>` - Zmodyfikowana zawartość pliku package.json

Typowe zastosowania:
- Modyfikacja nazwy pakietu i numeru wersji
- Dodawanie lub aktualizacja zależności
- Dodawanie niestandardowych pól
- Konfiguracja informacji związanych z publikacją

Przykład:
```ts
packageJson: async (esmx, pkg) => {
  // Ustawienie informacji o pakiecie
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Moja aplikacja';

  // Dodanie zależności
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Dodanie konfiguracji publikacji
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Funkcja zwrotna do przygotowań przed pakowaniem.

- Parametry:
  - `esmx: Esmx` - Instancja Esmx
  - `pkg: Record<string, any>` - Zawartość pliku package.json
- Wartość zwracana: `Promise<void>`

Typowe zastosowania:
- Dodawanie dodatkowych plików (README, LICENSE itp.)
- Wykonywanie testów lub weryfikacji budowania
- Generowanie dokumentacji lub metadanych
- Czyszczenie plików tymczasowych

Przykład:
```ts
onBefore: async (esmx, pkg) => {
  // Dodanie dokumentacji
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Wykonanie testów
  await runTests();

  // Generowanie dokumentacji
  await generateDocs();

  // Czyszczenie plików tymczasowych
  await cleanupTempFiles();
}
```

#### onAfter

Funkcja zwrotna do przetwarzania po zakończeniu pakowania. Wywoływana po wygenerowaniu pliku .tgz, służy do przetwarzania wyników pakowania.

- Parametry:
  - `esmx: Esmx` - Instancja Esmx
  - `pkg: Record<string, any>` - Zawartość pliku package.json
  - `file: Buffer` - Zawartość spakowanego pliku
- Wartość zwracana: `Promise<void>`

Typowe zastosowania:
- Publikacja do repozytorium npm (publicznego lub prywatnego)
- Przesyłanie do serwera zasobów statycznych
- Zarządzanie wersjami
- Wyzwalanie procesów CI/CD

Przykład:
```ts
onAfter: async (esmx, pkg, file) => {
  // Publikacja do prywatnego repozytorium npm
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Przesyłanie do serwera zasobów statycznych
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Tworzenie etykiety wersji
  await createGitTag(pkg.version);

  // Wyzwalanie procesu wdrażania
  await triggerDeploy(pkg.version);
}
```

## Przykład użycia

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Konfiguracja modułów do eksportu
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Konfiguracja pakowania
  pack: {
    // Włączenie funkcji pakowania
    enable: true,

    // Jednoczesne wygenerowanie wielu wersji
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Dostosowanie pliku package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Przygotowanie przed pakowaniem
    onBefore: async (esmx, pkg) => {
      // Dodanie niezbędnych plików
      await fs.writeFile('dist/README.md', '# Your App\n\nOpis eksportu modułów...');
      // Wykonanie sprawdzania typów
      await runTypeCheck();
    },

    // Przetwarzanie po pakowaniu
    onAfter: async (esmx, pkg, file) => {
      // Publikacja do prywatnego repozytorium npm
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Lub wdrożenie na serwer statyczny
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```