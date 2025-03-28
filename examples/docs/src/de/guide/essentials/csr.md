---
titleSuffix: Esmx Framework Client-Side Rendering Implementierungsleitfaden
description: Detaillierte Erläuterung des Client-Side Rendering-Mechanismus im Esmx Framework, einschließlich statischer Builds, Bereitstellungsstrategien und Best Practices, um Entwicklern zu helfen, effizientes Frontend-Rendering in serverlosen Umgebungen zu realisieren.
head:
  - - meta
    - property: keywords
      content: Esmx, Client-Side Rendering, CSR, Statischer Build, Frontend-Rendering, Serverlose Bereitstellung, Leistungsoptimierung
---

# Client-Side Rendering

Client-Side Rendering (CSR) ist eine Technik, bei der das Rendering der Seite im Browser stattfindet. In Esmx können Sie, wenn Ihre Anwendung keine Node.js-Serverinstanz bereitstellen kann, während des Build-Prozesses eine statische `index.html`-Datei generieren, um reines Client-Side Rendering zu ermöglichen.

## Anwendungsfälle

Die folgenden Szenarien empfehlen die Verwendung von Client-Side Rendering:

- **Statische Hosting-Umgebungen**: Wie GitHub Pages, CDN usw., die kein Server-Side Rendering unterstützen
- **Einfache Anwendungen**: Kleine Anwendungen, bei denen die Ladegeschwindigkeit der ersten Seite und SEO-Anforderungen nicht hoch sind
- **Entwicklungsumgebung**: Schnelle Vorschau und Debugging der Anwendung während der Entwicklungsphase

## Konfigurationsbeschreibung

### HTML-Vorlagenkonfiguration

Im Client-Side Rendering-Modus müssen Sie eine allgemeine HTML-Vorlage konfigurieren. Diese Vorlage dient als Container für Ihre Anwendung und enthält die notwendigen Ressourcenreferenzen und Mount-Punkte.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Abhängigkeitssammlung abschließen
    await rc.commit();
    
    // HTML-Vorlage konfigurieren
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Ressourcen vorladen
    <title>Esmx</title>
    ${rc.css()}               // Stile einfügen
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Import-Mapping
    ${rc.moduleEntry()}       // Einstiegsmodul
    ${rc.modulePreload()}     // Modul vorladen
</body>
</html>
`;
};
```

### Statische HTML-Generierung

Um Client-Side Rendering in der Produktionsumgebung zu verwenden, müssen Sie während des Build-Prozesses eine statische HTML-Datei generieren. Esmx bietet eine `postBuild`-Hook-Funktion, um diese Funktionalität zu implementieren:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Statische HTML-Datei generieren
        const rc = await esmx.render();
        // HTML-Datei schreiben
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```