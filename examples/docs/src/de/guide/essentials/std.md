---
titleSuffix: Esmx Framework - Projektstruktur und Richtlinien
description: Detaillierte Beschreibung der standardisierten Projektstruktur, Einstiegsdateien und Konfigurationsdateien des Esmx Frameworks, um Entwicklern beim Aufbau von standardisierten und wartbaren SSR-Anwendungen zu helfen.
head:
  - - meta
    - property: keywords
      content: Esmx, Projektstruktur, Einstiegsdateien, Konfigurationsrichtlinien, SSR-Framework, TypeScript, Projektrichtlinien, Entwicklungsstandards
---

# Standardrichtlinien

Esmx ist ein modernes SSR-Framework (Server-Side Rendering), das eine standardisierte Projektstruktur und Pfadauflösungsmechanismen verwendet, um Konsistenz und Wartbarkeit in Entwicklungs- und Produktionsumgebungen zu gewährleisten.

## Projektstrukturrichtlinien

### Standardverzeichnisstruktur

```txt
root
│─ dist                  # Verzeichnis für kompilierte Ausgaben
│  ├─ package.json       # Paketkonfiguration nach der Kompilierung
│  ├─ server             # Server-seitige kompilierte Ausgaben
│  │  └─ manifest.json   # Kompilierungsmanifest, verwendet zur Generierung von importmap
│  ├─ node               # Kompilierte Ausgaben für Node.js-Server
│  ├─ client             # Client-seitige kompilierte Ausgaben
│  │  ├─ versions        # Verzeichnis für Versionen
│  │  │  └─ latest.tgz   # Archiv des dist-Verzeichnisses für die Paketverteilung
│  │  └─ manifest.json   # Kompilierungsmanifest, verwendet zur Generierung von importmap
│  └─ src                # Mit tsc generierte Dateitypen
├─ src
│  ├─ entry.server.ts    # Einstiegsdatei für die Server-Anwendung
│  ├─ entry.client.ts    # Einstiegsdatei für die Client-Anwendung
│  └─ entry.node.ts      # Einstiegsdatei für die Node.js-Server-Anwendung
├─ tsconfig.json         # TypeScript-Konfiguration
└─ package.json          # Paketkonfiguration
```

::: tip Erweiterte Informationen
- `esmx.name` stammt aus dem `name`-Feld in `package.json`
- `dist/package.json` stammt aus der `package.json` im Stammverzeichnis
- Das `dist`-Verzeichnis wird nur archiviert, wenn `packs.enable` auf `true` gesetzt ist

:::

## Richtlinien für Einstiegsdateien

### entry.client.ts
Die Client-Einstiegsdatei ist verantwortlich für:
- **Initialisierung der Anwendung**: Konfiguration der grundlegenden Einstellungen der Client-Anwendung
- **Routing-Management**: Handhabung von Client-Routing und Navigation
- **Zustandsmanagement**: Speicherung und Aktualisierung des Client-Zustands
- **Interaktionsverarbeitung**: Verwaltung von Benutzerereignissen und Oberflächeninteraktionen

### entry.server.ts
Die Server-Einstiegsdatei ist verantwortlich für:
- **Server-Side Rendering (SSR)**: Ausführung des SSR-Rendering-Prozesses
- **HTML-Generierung**: Erstellung der initialen Seitenstruktur
- **Datenvorabruf**: Verarbeitung des Server-seitigen Datenabrufs
- **Zustandsinjektion**: Übergabe des Server-Zustands an den Client
- **SEO-Optimierung**: Sicherstellung der Suchmaschinenoptimierung der Seite

### entry.node.ts
Die Node.js-Server-Einstiegsdatei ist verantwortlich für:
- **Server-Konfiguration**: Festlegung der HTTP-Server-Parameter
- **Routing-Verarbeitung**: Verwaltung der Server-seitigen Routing-Regeln
- **Middleware-Integration**: Konfiguration der Server-Middleware
- **Umgebungsmanagement**: Handhabung von Umgebungsvariablen und Konfigurationen
- **Anfrage-Antwort-Verarbeitung**: Verarbeitung von HTTP-Anfragen und -Antworten

## Richtlinien für Konfigurationsdateien

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```