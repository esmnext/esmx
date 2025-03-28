---
titleSuffix: Przewodnik konfiguracji ścieżek zasobów statycznych w frameworku Esmx
description: Szczegółowy opis konfiguracji ścieżki bazowej w frameworku Esmx, obejmujący wdrożenie w wielu środowiskach, dystrybucję CDN oraz ustawienia ścieżek dostępu do zasobów, pomagający programistom w elastycznym zarządzaniu zasobami statycznymi.
head:
  - - meta
    - property: keywords
      content: Esmx, Ścieżka bazowa, Base Path, CDN, Zasoby statyczne, Wdrożenie w wielu środowiskach, Zarządzanie zasobami
---

# Ścieżka bazowa

Ścieżka bazowa (Base Path) to prefiks ścieżki dostępu do zasobów statycznych (takich jak JavaScript, CSS, obrazy itp.) w aplikacji. W Esmx odpowiednia konfiguracja ścieżki bazowej jest kluczowa w następujących scenariuszach:

- **Wdrożenie w wielu środowiskach**: Obsługa dostępu do zasobów w różnych środowiskach, takich jak środowisko deweloperskie, testowe i produkcyjne
- **Wdrożenie w wielu regionach**: Dostosowanie do wymagań wdrożenia klastrów w różnych regionach lub krajach
- **Dystrybucja CDN**: Realizacja globalnej dystrybucji i przyspieszenia zasobów statycznych

## Mechanizm domyślnej ścieżki

Esmx wykorzystuje automatyczny mechanizm generowania ścieżek oparty na nazwie usługi. Domyślnie framework odczytuje pole `name` z pliku `package.json` projektu, aby wygenerować ścieżkę bazową dla zasobów statycznych: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Ten projekt oparty na konwencji ma następujące zalety:

- **Spójność**: Zapewnia jednolity dostęp do wszystkich zasobów statycznych
- **Przewidywalność**: Ścieżka dostępu do zasobów może być wywnioskowana na podstawie pola `name` w pliku `package.json`
- **Łatwość utrzymania**: Brak konieczności dodatkowej konfiguracji, co zmniejsza koszty utrzymania

## Konfiguracja dynamicznej ścieżki

W rzeczywistych projektach często musimy wdrożyć ten sam kod w różnych środowiskach lub regionach. Esmx zapewnia wsparcie dla dynamicznej ścieżki bazowej, co pozwala aplikacji dostosować się do różnych scenariuszy wdrożenia.

### Scenariusze użycia

#### Wdrożenie w podkatalogach
```
- example.com      -> Strona główna domyślna
- example.com/cn/  -> Strona chińska
- example.com/en/  -> Strona angielska
```

#### Wdrożenie na niezależnych domenach
```
- example.com    -> Strona główna domyślna
- cn.example.com -> Strona chińska
- en.example.com -> Strona angielska
```

### Metoda konfiguracji

Poprzez parametr `base` metody `esmx.render()` można dynamicznie ustawić ścieżkę bazową na podstawie kontekstu żądania:

```ts
const render = await esmx.render({
    base: '/cn',  // Ustawienie ścieżki bazowej
    params: {
        url: req.url
    }
});
```