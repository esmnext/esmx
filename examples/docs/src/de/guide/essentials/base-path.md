---
titleSuffix: Leitfaden zur Konfiguration statischer Ressourcenpfade im Esmx-Framework
description: Detaillierte Anleitung zur Konfiguration von Basis-Pfaden im Esmx-Framework, einschließlich Multi-Umgebungs-Bereitstellung, CDN-Verteilung und Ressourcenzugriffspfade, um Entwicklern bei der flexiblen Verwaltung statischer Ressourcen zu helfen.
head:
  - - meta
    - property: keywords
      content: Esmx, Basis-Pfad, Base Path, CDN, statische Ressourcen, Multi-Umgebungs-Bereitstellung, Ressourcenverwaltung
---

# Basis-Pfad

Der Basis-Pfad (Base Path) bezieht sich auf das Präfix des Zugriffspfads für statische Ressourcen (wie JavaScript, CSS, Bilder usw.) in einer Anwendung. In Esmx ist die korrekte Konfiguration des Basis-Pfads für folgende Szenarien entscheidend:

- **Multi-Umgebungs-Bereitstellung**: Unterstützung des Ressourcenzugriffs in verschiedenen Umgebungen wie Entwicklung, Test und Produktion
- **Multi-Regionen-Bereitstellung**: Anpassung an die Bereitstellungsanforderungen in verschiedenen Regionen oder Ländern
- **CDN-Verteilung**: Globale Verteilung und Beschleunigung statischer Ressourcen

## Standardpfad-Mechanismus

Esmx verwendet einen automatischen Pfadgenerierungsmechanismus basierend auf dem Dienstnamen. Standardmäßig liest das Framework das `name`-Feld in der `package.json` des Projekts, um den Basis-Pfad für statische Ressourcen zu generieren: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Dieses Design, das Konvention über Konfiguration stellt, bietet folgende Vorteile:

- **Konsistenz**: Sicherstellung, dass alle statischen Ressourcen einen einheitlichen Zugriffspfad verwenden
- **Vorhersagbarkeit**: Der Ressourcenzugriffspfad kann anhand des `name`-Felds in der `package.json` abgeleitet werden
- **Wartbarkeit**: Keine zusätzliche Konfiguration erforderlich, was die Wartungskosten senkt

## Dynamische Pfadkonfiguration

In realen Projekten müssen wir oft denselben Code in verschiedenen Umgebungen oder Regionen bereitstellen. Esmx bietet Unterstützung für dynamische Basis-Pfade, sodass Anwendungen sich an verschiedene Bereitstellungsszenarien anpassen können.

### Anwendungsfälle

#### Bereitstellung in Unterverzeichnissen
```
- example.com      -> Standard-Hauptseite
- example.com/cn/  -> Chinesische Seite
- example.com/en/  -> Englische Seite
```

#### Bereitstellung unter separaten Domains
```
- example.com    -> Standard-Hauptseite
- cn.example.com -> Chinesische Seite
- en.example.com -> Englische Seite
```

### Konfigurationsmethode

Über den `base`-Parameter der `esmx.render()`-Methode können Sie den Basis-Pfad basierend auf dem Anfragekontext dynamisch festlegen:

```ts
const render = await esmx.render({
    base: '/cn',  // Basis-Pfad festlegen
    params: {
        url: req.url
    }
});
```