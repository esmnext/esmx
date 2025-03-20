```markdown
---
titleSuffix: Gez Framework - Code-Sharing-Mechanismus zwischen Diensten
description: Detaillierte Erläuterung des Modul-Linking-Mechanismus im Gez Framework, einschließlich Code-Sharing zwischen Diensten, Abhängigkeitsmanagement und Implementierung der ESM-Spezifikation, um Entwicklern beim Aufbau effizienter Micro-Frontend-Anwendungen zu helfen.
head:
  - - meta
    - property: keywords
      content: Gez, Modul-Linking, Module Link, ESM, Code-Sharing, Abhängigkeitsmanagement, Micro-Frontend
---

# Modul-Linking

Das Gez Framework bietet einen umfassenden Modul-Linking-Mechanismus zur Verwaltung des Code-Sharings und der Abhängigkeiten zwischen Diensten. Dieser Mechanismus basiert auf der ESM-Spezifikation (ECMAScript Module) und unterstützt das Exportieren und Importieren von Modulen auf Quellcode-Ebene sowie vollständige Abhängigkeitsverwaltung.

### Kernkonzepte

#### Modul-Export
Der Modul-Export ist der Prozess, bei dem spezifische Code-Einheiten (z.B. Komponenten, Utility-Funktionen) eines Dienstes im ESM-Format nach außen verfügbar gemacht werden. Es werden zwei Exporttypen unterstützt:
- **Quellcode-Export**: Direktes Exportieren von Quellcode-Dateien aus dem Projekt
- **Abhängigkeits-Export**: Exportieren von verwendeten Drittanbieter-Abhängigkeiten

#### Modul-Linking
Der Modul-Import ist der Prozess, bei dem Code-Einheiten, die von anderen Diensten exportiert wurden, in einem Dienst referenziert werden. Es werden mehrere Installationsmethoden unterstützt:
- **Quellcode-Installation**: Geeignet für Entwicklungsumgebungen, unterstützt Echtzeitänderungen und Hot-Reload
- **Paket-Installation**: Geeignet für Produktionsumgebungen, verwendet direkt die Build-Artefakte

## Modul-Export

### Konfigurationsbeschreibung

Konfigurieren Sie die zu exportierenden Module in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Exportieren von Quellcode-Dateien
            'root:src/components/button.vue',  // Vue-Komponente
            'root:src/utils/format.ts',        // Utility-Funktion
            // Exportieren von Drittanbieter-Abhängigkeiten
            'npm:vue',                         // Vue-Framework
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

Die Exportkonfiguration unterstützt zwei Typen:
- `root:*`: Exportiert Quellcode-Dateien, der Pfad ist relativ zum Projektstammverzeichnis
- `npm:*`: Exportiert Drittanbieter-Abhängigkeiten, direkt durch Angabe des Paketnamens

## Modul-Import

### Konfigurationsbeschreibung

Konfigurieren Sie die zu importierenden Module in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Link-Konfiguration
        links: {
            // Quellcode-Installation: Verweis auf das Build-Artefakt-Verzeichnis
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Paket-Installation: Verweis auf das Paketverzeichnis
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Import-Mapping-Einstellungen
        imports: {
            // Verwenden von Abhängigkeiten aus Remote-Modulen
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Konfigurationsoptionen:
1. **imports**: Konfiguriert den lokalen Pfad für Remote-Module
   - Quellcode-Installation: Verweis auf das Build-Artefakt-Verzeichnis (dist)
   - Paket-Installation: Direkter Verweis auf das Paketverzeichnis

2. **externals**: Konfiguriert externe Abhängigkeiten
   - Zum Teilen von Abhängigkeiten aus Remote-Modulen
   - Vermeidet das wiederholte Packen gleicher Abhängigkeiten
   - Unterstützt das Teilen von Abhängigkeiten zwischen mehreren Modulen

### Installationsmethoden

#### Quellcode-Installation
Geeignet für Entwicklungsumgebungen, unterstützt Echtzeitänderungen und Hot-Reload.

1. **Workspace-Methode**
Empfohlen für die Verwendung in Monorepo-Projekten:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link-Methode**
Für lokale Entwicklungs- und Debugging-Zwecke:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Paket-Installation
Geeignet für Produktionsumgebungen, verwendet direkt die Build-Artefakte.

1. **NPM Registry**
Installation über npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Statischer Server**
Installation über HTTP/HTTPS-Protokoll:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Paket-Build

### Konfigurationsbeschreibung

Konfigurieren Sie die Build-Optionen in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // Modul-Export-Konfiguration
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Build-Konfiguration
    pack: {
        // Build aktivieren
        enable: true,

        // Ausgabekonfiguration
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Benutzerdefinierte package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Vor-Build-Verarbeitung
        onBefore: async (gez, pkg) => {
            // Generieren von Typdeklarationen
            // Ausführen von Testfällen
            // Aktualisieren von Dokumentationen usw.
        },

        // Nach-Build-Verarbeitung
        onAfter: async (gez, pkg, file) => {
            // Hochladen auf CDN
            // Veröffentlichen im npm-Repository
            // Bereitstellung in der Testumgebung usw.
        }
    }
} satisfies GezOptions;
```

### Build-Artefakte

```
your-app-name.tgz
├── package.json        # Paketinformationen
├── index.js            # Produktionsumgebungseinstieg
├── server/             # Server-Ressourcen
│   └── manifest.json   # Server-Ressourcen-Mapping
├── node/               # Node.js-Laufzeit
└── client/             # Client-Ressourcen
    └── manifest.json   # Client-Ressourcen-Mapping
```

### Veröffentlichungsprozess

```bash
# 1. Produktionsversion erstellen
gez build

# 2. Auf npm veröffentlichen
npm publish dist/versions/your-app-name.tgz
```
```