---
titleSuffix: Gez Framework Modulkonfiguration API-Referenz
description: Detaillierte Beschreibung der ModuleConfig-Schnittstelle des Gez-Frameworks, einschließlich Modulimport- und Exportregeln, Alias-Konfiguration und externer Abhängigkeitsverwaltung, um Entwicklern ein tieferes Verständnis des modularen Systems des Frameworks zu vermitteln.
head:
  - - meta
    - property: keywords
      content: Gez, ModuleConfig, Modulkonfiguration, Modulimport und -export, Externe Abhängigkeiten, Alias-Konfiguration, Abhängigkeitsverwaltung, Web-Anwendungsframework
---

# ModuleConfig

ModuleConfig bietet die Modulkonfigurationsfunktionen des Gez-Frameworks, um Import- und Exportregeln, Alias-Konfigurationen und externe Abhängigkeiten zu definieren.

## Typdefinitionen

### PathType

- **Typdefinition**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enumeration der Modulpfadtypen:
- `npm`: Steht für Abhängigkeiten in node_modules
- `root`: Steht für Dateien im Projektstammverzeichnis

### ModuleConfig

- **Typdefinition**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Schnittstelle für die Modulkonfiguration, verwendet zur Definition von Export-, Import- und externen Abhängigkeitskonfigurationen für Dienste.

#### exports

Liste der Exportkonfigurationen, die spezifische Codeeinheiten (wie Komponenten, Utility-Funktionen usw.) im ESM-Format nach außen verfügbar machen.

Unterstützt zwei Typen:
- `root:*`: Exportiert Quellcodedateien, z.B.: `root:src/components/button.vue`
- `npm:*`: Exportiert Drittanbieterabhängigkeiten, z.B.: `npm:vue`

Jeder Exporteintrag enthält folgende Attribute:
- `name`: Ursprünglicher Exportpfad, z.B.: `npm:vue` oder `root:src/components`
- `type`: Pfadtyp (`npm` oder `root`)
- `importName`: Importname, Format: `${serviceName}/${type}/${path}`
- `exportName`: Exportpfad, relativ zum Dienststammverzeichnis
- `exportPath`: Tatsächlicher Dateipfad
- `externalName`: Name der externen Abhängigkeit, verwendet als Kennung beim Import dieses Moduls durch andere Dienste

#### links

Zuordnung der Dienstabhängigkeiten, verwendet zur Konfiguration von Abhängigkeiten des aktuellen Dienstes von anderen Diensten (lokal oder remote) und deren lokalen Pfaden. Der Schlüssel jedes Konfigurationseintrags ist der Dienstname, der Wert ist der lokale Pfad des Dienstes.

Die Konfiguration variiert je nach Installationsmethode:
- Quellcodeinstallation (Workspace, Git): Muss auf das dist-Verzeichnis verweisen, da die gebauten Dateien verwendet werden müssen
- Paketinstallation (Link, statischer Server, privater Mirror, File): Verweist direkt auf das Paketverzeichnis, da das Paket bereits die gebauten Dateien enthält

#### imports

Zuordnung externer Abhängigkeiten, konfiguriert die zu verwendenden externen Abhängigkeiten, typischerweise Abhängigkeiten aus Remote-Modulen.

Jeder Abhängigkeitseintrag enthält folgende Attribute:
- `match`: Regulärer Ausdruck zum Abgleichen von Importanweisungen
- `import`: Tatsächlicher Modulpfad

**Beispiel**:
```ts title="entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
  modules: {
    // Exportkonfiguration
    exports: [
      'root:src/components/button.vue',  // Exportiert Quellcodedatei
      'root:src/utils/format.ts',
      'npm:vue',  // Exportiert Drittanbieterabhängigkeit
      'npm:vue-router'
    ],

    // Importkonfiguration
    links: {
      // Quellcodeinstallation: Muss auf dist-Verzeichnis verweisen
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Paketinstallation: Verweist direkt auf Paketverzeichnis
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Externe Abhängigkeitskonfiguration
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies GezOptions;
```

### ParsedModuleConfig

- **Typdefinition**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Name des Softpakets
     */
    name: string
    /**
     * Stammverzeichnis des Softpakets
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

ParsedModuleConfig, die ursprüngliche Modulkonfiguration in ein standardisiertes internes Format umgewandelt:

#### name
Name des aktuellen Dienstes
- Wird zur Kennzeichnung von Modulen und zur Generierung von Importpfaden verwendet

#### root
Stammverzeichnispfad des aktuellen Dienstes
- Wird zur Auflösung relativer Pfade und zur Speicherung von Build-Artefakten verwendet

#### exports
Liste der Exportkonfigurationen
- `name`: Ursprünglicher Exportpfad, z.B.: 'npm:vue' oder 'root:src/components'
- `type`: Pfadtyp (npm oder root)
- `importName`: Importname, Format: '${serviceName}/${type}/${path}'
- `exportName`: Exportpfad, relativ zum Dienststammverzeichnis
- `exportPath`: Tatsächlicher Dateipfad
- `externalName`: Name der externen Abhängigkeit, verwendet als Kennung beim Import dieses Moduls durch andere Dienste

#### links
Liste der Importkonfigurationen
- `name`: Name des Softpakets
- `root`: Stammverzeichnis des Softpakets

#### imports
Zuordnung externer Abhängigkeiten
- Ordnet Modulimportpfade den tatsächlichen Modulpositionen zu
- `match`: Regulärer Ausdruck zum Abgleichen von Importanweisungen
- `import`: Tatsächlicher Modulpfad
```