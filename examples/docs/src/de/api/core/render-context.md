---
titleSuffix: Esmx Framework Render Context API Referenz
description: Detaillierte Beschreibung der RenderContext-Kernklasse des Esmx-Frameworks, einschließlich Rendering-Steuerung, Ressourcenverwaltung, Zustandssynchronisierung und Routing-Kontrolle, um Entwicklern bei der Implementierung effizienter serverseitiger Rendering-Lösungen zu helfen.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Serverseitiges Rendering, Rendering-Kontext, Zustandssynchronisierung, Ressourcenverwaltung, Webanwendungsframework
---

# RenderContext

RenderContext ist die Kernklasse im Esmx-Framework und verantwortlich für die Verwaltung des gesamten Lebenszyklus des serverseitigen Renderings (SSR). Sie bietet eine umfassende API zur Handhabung von Rendering-Kontexten, Ressourcenverwaltung, Zustandssynchronisierung und anderen wichtigen Aufgaben:

- **Rendering-Steuerung**: Verwaltung des serverseitigen Rendering-Prozesses, Unterstützung für Mehrfach-Eintrags-Rendering, bedingtes Rendering usw.
- **Ressourcenverwaltung**: Intelligente Sammlung und Einbindung von statischen Ressourcen wie JS, CSS usw. zur Optimierung der Ladeleistung
- **Zustandssynchronisierung**: Handhabung der serverseitigen Zustandsserialisierung, um eine korrekte Client-Aktivierung (Hydration) sicherzustellen
- **Routing-Kontrolle**: Unterstützung für serverseitige Umleitungen, Statuscode-Einstellungen und andere erweiterte Funktionen

## Typdefinitionen

### ServerRenderHandle

Typdefinition für die serverseitige Rendering-Handler-Funktion.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

Die serverseitige Rendering-Handler-Funktion ist eine asynchrone oder synchrone Funktion, die eine RenderContext-Instanz als Parameter empfängt und zur Verarbeitung der serverseitigen Rendering-Logik verwendet wird.

```ts title="entry.node.ts"
// 1. Asynchrone Handler-Funktion
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Synchrone Handler-Funktion
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Typdefinition für die Liste der während des Renderings gesammelten Ressourcendateien.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Liste der JavaScript-Dateien
- **css**: Liste der Stylesheet-Dateien
- **modulepreload**: Liste der ESM-Module, die vorab geladen werden müssen
- **resources**: Liste anderer Ressourcendateien (Bilder, Schriftarten usw.)

```ts
// Beispiel für eine Ressourcendateiliste
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

Definiert den Generierungsmodus für Importmaps.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Der Importmap-Inhalt wird direkt in das HTML eingebettet, geeignet für folgende Szenarien:
  - Reduzierung der Anzahl der HTTP-Anfragen
  - Der Importmap-Inhalt ist klein
  - Hohe Anforderungen an die Ladeleistung der ersten Seite
- `js`: Der Importmap-Inhalt wird als separate JS-Datei generiert, geeignet für folgende Szenarien:
  - Der Importmap-Inhalt ist groß
  - Nutzung des Browser-Caching-Mechanismus
  - Mehrere Seiten teilen sich dieselbe Importmap

Rendering-Kontextklasse, verantwortlich für die Ressourcenverwaltung und HTML-Generierung während des serverseitigen Renderings (SSR).
## Instanzoptionen

Definiert die Konfigurationsoptionen für den Rendering-Kontext.

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
- **Standardwert**: `''`

Der Basispfad für statische Ressourcen.
- Alle statischen Ressourcen (JS, CSS, Bilder usw.) werden relativ zu diesem Pfad geladen
- Unterstützt dynamische Konfiguration zur Laufzeit, ohne Neubuild erforderlich
- Häufig verwendet in mehrsprachigen Websites, Micro-Frontend-Anwendungen usw.

#### entryName

- **Typ**: `string`
- **Standardwert**: `'default'`

Der Name der serverseitigen Rendering-Eintrittsfunktion. Wird verwendet, um die zu verwendende Rendering-Funktion anzugeben, wenn ein Modul mehrere Rendering-Funktionen exportiert.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Rendering-Logik für Mobilgeräte
};

export const desktop = async (rc: RenderContext) => {
  // Rendering-Logik für Desktop-Geräte
};
```

#### params

- **Typ**: `Record<string, any>`
- **Standardwert**: `{}`

Rendering-Parameter. Kann beliebige Parameter an die Rendering-Funktion übergeben, häufig verwendet für die Übergabe von Anfrageinformationen (URL, Query-Parameter usw.).

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
- **Standardwert**: `'inline'`

Generierungsmodus für Import Maps:
- `inline`: Der Importmap-Inhalt wird direkt in das HTML eingebettet
- `js`: Der Importmap-Inhalt wird als separate JS-Datei generiert


## Instanzeigenschaften

### esmx

- **Typ**: `Esmx`
- **Nur Lesen**: `true`

Referenz auf die Esmx-Instanz. Wird verwendet, um auf Kernfunktionen und Konfigurationsinformationen des Frameworks zuzugreifen.

### redirect

- **Typ**: `string | null`
- **Standardwert**: `null`

Umleitungsadresse. Nach der Festlegung kann der Server basierend auf diesem Wert eine HTTP-Umleitung durchführen, häufig verwendet für Login-Validierung, Berechtigungskontrolle usw.

```ts title="entry.node.ts"
// Beispiel für Login-Validierung
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Weiteres Rendering der Seite...
};

// Beispiel für Berechtigungskontrolle
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Weiteres Rendering der Seite...
};
```

### status

- **Typ**: `number | null`
- **Standardwert**: `null`

HTTP-Antwortstatuscode. Kann beliebige gültige HTTP-Statuscodes festlegen, häufig verwendet für Fehlerbehandlung, Umleitungen usw.

```ts title="entry.node.ts"
// Beispiel für 404-Fehlerbehandlung
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Rendering der 404-Seite...
    return;
  }
  // Weiteres Rendering der Seite...
};

// Beispiel für temporäre Umleitung
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Temporäre Umleitung, behält die Anfragemethode bei
    return;
  }
  // Weiteres Rendering der Seite...
};
```

### html

- **Typ**: `string`
- **Standardwert**: `''`

HTML-Inhalt. Wird verwendet, um den final generierten HTML-Inhalt festzulegen und abzurufen, wobei Platzhalter für den Basispfad automatisch verarbeitet werden.

```ts title="entry.node.ts"
// Grundlegende Verwendung
export default async (rc: RenderContext) => {
  // Festlegen des HTML-Inhalts
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

// Dynamischer Basispfad
const rc = await esmx.render({
  base: '/app',  // Festlegen des Basispfads
  params: { url: req.url }
});

// Platzhalter im HTML werden automatisch ersetzt:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Wird ersetzt durch:
// /app/your-app-name/css/style.css
```

### base

- **Typ**: `string`
- **Nur Lesen**: `true`
- **Standardwert**: `''`

Der Basispfad für statische Ressourcen. Alle statischen Ressourcen (JS, CSS, Bilder usw.) werden relativ zu diesem Pfad geladen, unterstützt dynamische Konfiguration zur Laufzeit.

```ts
// Grundlegende Verwendung
const rc = await esmx.render({
  base: '/esmx',  // Festlegen des Basispfads
  params: { url: req.url }
});

// Beispiel für mehrsprachige Websites
const rc = await esmx.render({
  base: '/cn',  // Chinesische Website
  params: { lang: 'zh-CN' }
});

// Beispiel für Micro-Frontend-Anwendungen
const rc = await esmx.render({
  base: '/app1',  // Unteranwendung 1
  params: { appId: 1 }
});
```

### entryName

- **Typ**: `string`
- **Nur Lesen**: `true`
- **Standardwert**: `'default'`

Der Name der serverseitigen Rendering-Eintrittsfunktion. Wird verwendet, um die zu verwendende Rendering-Funktion aus entry.server.ts auszuwählen.

```ts title="entry.node.ts"
// Standard-Eintrittsfunktion
export default async (rc: RenderContext) => {
  // Standard-Rendering-Logik
};

// Mehrere Eintrittsfunktionen
export const mobile = async (rc: RenderContext) => {
  // Rendering-Logik für Mobilgeräte
};

export const desktop = async (rc: RenderContext) => {
  // Rendering-Logik für Desktop-Geräte
};

// Auswahl der Eintrittsfunktion basierend auf dem Gerätetyp
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Typ**: `Record<string, any>`
- **Nur Lesen**: `true`
- **Standardwert**: `{}`

Rendering-Parameter. Kann während des serverseitigen Renderings übergeben und abgerufen werden, häufig verwendet für die Übergabe von Anfrageinformationen, Seitenkonfigurationen usw.

```ts
// Grundlegende Verwendung - Übergabe von URL und Spracheinstellungen
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Seitenkonfiguration - Festlegen von Thema und Layout
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Umgebungskonfiguration - Einbindung der API-Adresse
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Typ**: `Set<ImportMeta>`

Sammlung von Modulabhängigkeiten. Während des Komponenten-Renderings werden automatisch Modulabhängigkeiten verfolgt und aufesmxeichnet, wobei nur die tatsächlich verwendeten Ressourcen gesammelt werden.

```ts
// Grundlegende Verwendung
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Automatische Sammlung von Modulabhängigkeiten während des Renderings
  // Das Framework ruft automatisch context.importMetaSet.add(import.meta) während des Komponenten-Renderings auf
  // Entwickler müssen die Abhängigkeitssammlung nicht manuell behandeln
  return '<div id="app">Hello World</div>';
};

// Verwendungsbeispiel
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Typ**: `RenderFiles`

Liste der Ressourcendateien:
- js: Liste der JavaScript-Dateien
- css: Liste der Stylesheet-Dateien
- modulepreload: Liste der ESM-Module, die vorab geladen werden müssen
- resources: Liste anderer Ressourcendateien (Bilder, Schriftarten usw.)

```ts
// Ressourcensammlung
await rc.commit();

// Ressourceneinbindung
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Vorab geladene Ressourcen -->
    ${rc.preload()}
    <!-- Einbindung von Stylesheets -->
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
- **Standardwert**: `'inline'`

Generierungsmodus für Import Maps:
- `inline`: Der Importmap-Inhalt wird direkt in das HTML eingebettet
- `js`: Der Importmap-Inhalt wird als separate JS-Datei generiert


## Instanzmethoden

### serialize()

- **Parameter**: 
  - `input: any` - Die zu serialisierenden Daten
  - `options?: serialize.SerializeJSOptions` - Serialisierungsoptionen
- **Rückgabewert**: `string`

Serialisiert ein JavaScript-Objekt zu einem String. Wird verwendet, um Zustandsdaten während des serverseitigen Renderings zu serialisieren und sicher in das HTML einzubetten.

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

- **Parameter**: 
  - `varName: string` - Variablenname
  - `data: Record<string, any>` - Zustandsdaten
- **Rückgabewert**: `string`

Serialisiert Zustandsdaten und bindet sie in das HTML ein. Verwendet sichere Serialisierungsmethoden für die Datenverarbeitung und unterstützt komplexe Datenstrukturen.

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

- **Rückgabewert**: `Promise<void>`

Übergibt die Abhängigkeitssammlung und aktualisiert die Ressourcenliste. Sammelt alle verwendeten Module aus importMetaSet und analysiert die spezifischen Ressourcen jedes Moduls basierend auf der Manifest-Datei.

```ts
// Rendering und Übergabe der Abhängigkeiten
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Übergabe der Abhängigkeitssammlung
await rc.commit();
```

### preload()

- **Rückgabewert**: `string`

Generiert Ressourcen-Vorlade-Tags. Wird verwendet, um CSS- und JavaScript-Ressourcen vorab zu laden, unterstützt Prioritätskonfiguration und verarbeitet automatisch den Basispfad.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Einbindung von Stylesheets -->
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

### css()

- **Rückgabewert**: `string`

Generiert CSS-Stylesheet-Tags. Bindet die gesammelten CSS-Dateien ein und stellt sicher, dass die Stylesheets in der richtigen Reihenfolge geladen werden.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Einbindung aller gesammelten Stylesheets -->
  </head>
`;
```

### importmap()

- **Rückgabewert**: `string`

Generiert Import-Map-Tags. Generiert die Import-Map basierend auf der importmapMode-Konfiguration.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Einbindung der Import-Map -->
 