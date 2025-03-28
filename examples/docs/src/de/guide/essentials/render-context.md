---
titleSuffix: Esmx Framework Server-Side Rendering Kernmechanismus
description: Detaillierte Erläuterung des RenderContext-Mechanismus im Esmx Framework, einschließlich Ressourcenverwaltung, HTML-Generierung und ESM-Modulsystem, um Entwicklern das Verständnis und die Nutzung der Server-Side Rendering-Funktionalität zu erleichtern.
head:
  - - meta
    - property: keywords
      content: Esmx, Renderkontext, RenderContext, SSR, Server-Side Rendering, ESM, Ressourcenverwaltung
---

# Renderkontext

RenderContext ist eine Kernklasse im Esmx Framework, die hauptsächlich für die Ressourcenverwaltung und HTML-Generierung während des Server-Side Renderings (SSR) verantwortlich ist. Es verfügt über die folgenden Kernmerkmale:

1. **ESM-basiertes Modulsystem**
   - Verwendet den modernen ECMAScript Modules-Standard
   - Unterstützt native Modulimporte und -exporte
   - Ermöglicht bessere Code-Splitting und bedarfsgerechtes Laden

2. **Intelligente Abhängigkeitssammlung**
   - Dynamische Sammlung von Abhängigkeiten basierend auf dem tatsächlichen Rendering-Pfad
   - Vermeidet unnötiges Laden von Ressourcen
   - Unterstützt asynchrone Komponenten und dynamische Importe

3. **Präzise Ressourceneinbindung**
   - Strikte Kontrolle der Ressourcenlade-Reihenfolge
   - Optimiert die Ladeleistung der ersten Seite
   - Gewährleistet die Zuverlässigkeit der Client-seitigen Aktivierung (Hydration)

4. **Flexible Konfigurationsmechanismen**
   - Unterstützt dynamische Basis-Pfad-Konfiguration
   - Bietet verschiedene Import-Mapping-Modi
   - Passt sich verschiedenen Bereitstellungsszenarien an

## Verwendung

Im Esmx Framework müssen Entwickler normalerweise keine RenderContext-Instanz direkt erstellen, sondern erhalten eine Instanz über die Methode `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Statische Dateiverarbeitung
        esmx.middleware(req, res, async () => {
            // RenderContext-Instanz über esmx.render() erhalten
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // HTML-Inhalt senden
            res.end(rc.html);
        });
    });
}
```

## Hauptfunktionen

### Abhängigkeitssammlung

RenderContext implementiert einen intelligenten Mechanismus zur Abhängigkeitssammlung, der basierend auf den tatsächlich gerenderten Komponenten dynamisch Abhängigkeiten sammelt, anstatt einfach alle möglichen Ressourcen vorab zu laden:

#### Bedarfsgerechte Sammlung
- Automatische Verfolgung und Aufzeichnung von Modulabhängigkeiten während des Rendering-Prozesses
- Sammelt nur CSS-, JavaScript- und andere Ressourcen, die tatsächlich für die aktuelle Seite verwendet werden
- Verwendet `importMetaSet`, um die Modulabhängigkeiten jeder Komponente genau zu erfassen
- Unterstützt die Abhängigkeitssammlung für asynchrone Komponenten und dynamische Importe

#### Automatisierte Verarbeitung
- Entwickler müssen den Abhängigkeitssammelprozess nicht manuell verwalten
- Das Framework sammelt automatisch Abhängigkeitsinformationen während des Rendering-Prozesses
- Verarbeitet alle gesammelten Ressourcen über die Methode `commit()`
- Behandelt automatisch zirkuläre und doppelte Abhängigkeiten

#### Leistungsoptimierung
- Vermeidet das Laden ungenutzter Module und reduziert deutlich die Ladezeit der ersten Seite
- Kontrolliert präzise die Ressourcenlade-Reihenfolge, um die Rendering-Leistung zu optimieren
- Generiert automatisch optimale Import-Mappings (Import Map)
- Unterstützt Ressourcen-Preloading und bedarfsgerechte Lade-Strategien

### Ressourceneinbindung

RenderContext bietet mehrere Methoden zur Einbindung verschiedener Ressourcentypen, die alle sorgfältig entworfen wurden, um die Ladeleistung zu optimieren:

- `preload()`: Lädt CSS- und JS-Ressourcen vor, unterstützt Prioritätskonfiguration
- `css()`: Bindet Stylesheets für die erste Seite ein, unterstützt die Extraktion von kritischem CSS
- `importmap()`: Bindet Modul-Import-Mappings ein, unterstützt dynamische Pfadauflösung
- `moduleEntry()`: Bindet Client-seitige Einstiegsmodule ein, unterstützt Mehrfacheinstiegskonfiguration
- `modulePreload()`: Lädt Modulabhängigkeiten vor, unterstützt bedarfsgerechte Lade-Strategien

### Ressourceneinbindungsreihenfolge

RenderContext kontrolliert strikt die Reihenfolge der Ressourceneinbindung, die auf der Funktionsweise des Browsers und Leistungsoptimierungen basiert:

1. head-Bereich:
   - `preload()`: Lädt CSS- und JS-Ressourcen vor, damit der Browser diese Ressourcen frühzeitig entdeckt und zu laden beginnt
   - `css()`: Bindet Stylesheets für die erste Seite ein, um sicherzustellen, dass die Seitenstile beim Rendering des Inhalts vorhanden sind

2. body-Bereich:
   - `importmap()`: Bindet Modul-Import-Mappings ein, definiert Pfadauflösungsregeln für ESM-Module
   - `moduleEntry()`: Bindet Client-seitige Einstiegsmodule ein, muss nach importmap ausgeführt werden
   - `modulePreload()`: Lädt Modulabhängigkeiten vor, muss nach importmap ausgeführt werden

## Vollständiger Rendering-Prozess

Ein typischer RenderContext-Verwendungsprozess sieht wie folgt aus:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Seiteninhalt rendern und Abhängigkeiten sammeln
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Abhängigkeitssammlung abschließen
    await rc.commit();
    
    // 3. Vollständiges HTML generieren
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

## Erweiterte Funktionen

### Basis-Pfad-Konfiguration

RenderContext bietet einen flexiblen Mechanismus zur dynamischen Konfiguration des Basis-Pfads, der es ermöglicht, den Basis-Pfad für statische Ressourcen zur Laufzeit dynamisch festzulegen:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Basis-Pfad festlegen
    params: {
        url: req.url
    }
});
```

Dieser Mechanismus ist besonders nützlich in den folgenden Szenarien:

1. **Mehrsprachige Seitenbereitstellung**
   ```
   hauptdomain.com      → Standardsprache
   hauptdomain.com/cn/  → Chinesische Seite
   hauptdomain.com/en/  → Englische Seite
   ```

2. **Micro-Frontend-Anwendungen**
   - Unterstützt die flexible Bereitstellung von Sub-Anwendungen unter verschiedenen Pfaden
   - Erleichtert die Integration in verschiedene Hauptanwendungen

### Import-Mapping-Modi

RenderContext bietet zwei Import-Mapping-Modi (Import Map):

1. **Inline-Modus** (Standard)
   - Bindet Import-Mappings direkt in das HTML ein
   - Geeignet für kleine Anwendungen, reduziert zusätzliche Netzwerkanfragen
   - Sofort verfügbar beim Laden der Seite

2. **JS-Modus**
   - Lädt Import-Mappings über eine externe JavaScript-Datei
   - Geeignet für große Anwendungen, kann den Browser-Cache-Mechanismus nutzen
   - Unterstützt die dynamische Aktualisierung von Mapping-Inhalten

Der gewünschte Modus kann über die Konfiguration ausgewählt werden:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Einstiegsfunktionskonfiguration

RenderContext unterstützt die Konfiguration von `entryName`, um die Einstiegsfunktion für das Server-Side Rendering festzulegen:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Einstiegsfunktion für Mobilgeräte festlegen
    params: {
        url: req.url
    }
});
```

Dieser Mechanismus ist besonders nützlich in den folgenden Szenarien:

1. **Mehrfach-Template-Rendering**
   ```ts title="src/entry.server.ts"
   // Einstiegsfunktion für Mobilgeräte
   export const mobile = async (rc: RenderContext) => {
       // Mobilgeräte-spezifische Rendering-Logik
   };

   // Einstiegsfunktion für Desktop-Geräte
   export const desktop = async (rc: RenderContext) => {
       // Desktop-spezifische Rendering-Logik
   };
   ```

2. **A/B-Tests**
   - Unterstützt die Verwendung verschiedener Rendering-Logiken für dieselbe Seite
   - Erleichtert Benutzererfahrungsexperimente
   - Flexibles Umschalten zwischen verschiedenen Rendering-Strategien

3. **Spezielle Rendering-Anforderungen**
   - Unterstützt benutzerdefinierte Rendering-Prozesse für bestimmte Seiten
   - Passt sich den Leistungsoptimierungsanforderungen verschiedener Szenarien an
   - Ermöglicht eine feinere Kontrolle über das Rendering

## Best Practices

1. **RenderContext-Instanz erhalten**
   - Immer über die Methode `esmx.render()` eine Instanz erhalten
   - Bei Bedarf geeignete Parameter übergeben
   - Vermeiden Sie die manuelle Erstellung von Instanzen

2. **Abhängigkeitssammlung**
   - Sicherstellen, dass alle Module korrekt `importMetaSet.add(import.meta)` aufrufen
   - Sofort nach dem Rendering die Methode `commit()` aufrufen
   - Asynchrone Komponenten und dynamische Importe sinnvoll nutzen, um die Ladeleistung der ersten Seite zu optimieren

3. **Ressourceneinbindung**
   - Strikte Einhaltung der Ressourceneinbindungsreihenfolge
   - Keine CSS-Einbindung im body-Bereich
   - Sicherstellen, dass importmap vor moduleEntry ausgeführt wird

4. **Leistungsoptimierung**
   - Preloading für kritische Ressourcen verwenden
   - modulePreload sinnvoll nutzen, um das Modulladen zu optimieren
   - Vermeiden Sie unnötiges Laden von Ressourcen
   - Browser-Cache-Mechanismen zur Optimierung der Ladeleistung nutzen
```