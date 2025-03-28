---
titleSuffix: Framework-Kernklassen-API-Referenz
description: Detaillierte Dokumentation der Kernklassen-API des Esmx-Frameworks, einschließlich Anwendungslebenszyklusverwaltung, statischer Ressourcenverarbeitung und serverseitiger Rendering-Fähigkeiten, um Entwicklern ein tieferes Verständnis der Kernfunktionen des Frameworks zu vermitteln.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Lebenszyklusverwaltung, statische Ressourcen, serverseitiges Rendering, Rspack, Web-Anwendungsframework
---

# Esmx

## Einführung

Esmx ist ein leistungsstarkes Web-Anwendungsframework, das auf Rspack basiert und eine vollständige Verwaltung des Anwendungslebenszyklus, die Verarbeitung statischer Ressourcen und serverseitige Rendering-Fähigkeiten bietet.

## Typdefinitionen

### RuntimeTarget

- **Typdefinition**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Typ der Laufzeitumgebung der Anwendung:
- `client`: Läuft in der Browserumgebung und unterstützt DOM-Operationen und Browser-APIs
- `server`: Läuft in der Node.js-Umgebung und unterstützt Dateisystem- und serverseitige Funktionen

### ImportMap

- **Typdefinition**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Typ der ES-Modul-Importzuordnung.

#### SpecifierMap

- **Typdefinition**:
```ts
type SpecifierMap = Record<string, string>
```

Typ der Modulbezeichnerzuordnung, der verwendet wird, um die Zuordnung von Modulimportpfaden zu definieren.

#### ScopesMap

- **Typdefinition**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Typ der Bereichszuordnung, der verwendet wird, um die Modulimportzuordnung in bestimmten Bereichen zu definieren.

### COMMAND

- **Typdefinition**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Enumeration der Befehlstypen:
- `dev`: Befehl für die Entwicklungsumgebung, startet den Entwicklungsserver und unterstützt Hot Reload
- `build`: Build-Befehl, erzeugt Build-Artefakte für die Produktionsumgebung
- `preview`: Vorschau-Befehl, startet den lokalen Vorschauserver
- `start`: Start-Befehl, führt den Produktionsserver aus

## Instanzoptionen

Definiert die Kernkonfigurationsoptionen des Esmx-Frameworks.

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
- **Standardwert**: `process.cwd()`

Pfad zum Projektstammverzeichnis. Kann ein absoluter oder relativer Pfad sein, relative Pfade werden basierend auf dem aktuellen Arbeitsverzeichnis aufgelöst.

#### isProd

- **Typ**: `boolean`
- **Standardwert**: `process.env.NODE_ENV === 'production'`

Umgebungsflag.
- `true`: Produktionsumgebung
- `false`: Entwicklungsumgebung

#### basePathPlaceholder

- **Typ**: `string | false`
- **Standardwert**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Konfiguration des Basis-Pfad-Platzhalters. Wird zur Laufzeit verwendet, um den Basis-Pfad von Ressourcen dynamisch zu ersetzen. Durch Setzen auf `false` kann diese Funktion deaktiviert werden.

#### modules

- **Typ**: `ModuleConfig`

Modulkonfigurationsoptionen. Wird verwendet, um die Modulauflösungsregeln des Projekts zu konfigurieren, einschließlich Modulaliase und externer Abhängigkeiten.

#### packs

- **Typ**: `PackConfig`

Build-Konfigurationsoptionen. Wird verwendet, um Build-Artefakte in standardmäßige npm .tgz-Pakete zu packen.

#### devApp

- **Typ**: `(esmx: Esmx) => Promise<App>`

Funktion zur Erstellung der Anwendung in der Entwicklungsumgebung. Wird nur in der Entwicklungsumgebung verwendet, um eine Anwendungsinstanz für den Entwicklungsserver zu erstellen.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Benutzerdefinierte Rspack-Konfiguration
        }
      })
    )
  }
}
```

#### server

- **Typ**: `(esmx: Esmx) => Promise<void>`

Funktion zur Konfiguration und zum Starten des HTTP-Servers. Wird verwendet, um den HTTP-Server zu konfigurieren und zu starten, sowohl in der Entwicklungsumgebung als auch in der Produktionsumgebung.

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

Funktion zur Nachbearbeitung nach dem Build. Wird nach Abschluss des Projektbuilds ausgeführt und kann verwendet werden für:
- Zusätzliche Ressourcenverarbeitung
- Bereitstellungsoperationen
- Generierung statischer Dateien
- Senden von Build-Benachrichtigungen

## Instanzeigenschaften

### name

- **Typ**: `string`
- **Schreibgeschützt**: `true`

Der Name des aktuellen Moduls, abgeleitet aus der Modulkonfiguration.

### varName

- **Typ**: `string`
- **Schreibgeschützt**: `true`

Ein gültiger JavaScript-Variablenname, der auf dem Modulnamen basiert.

### root

- **Typ**: `string`
- **Schreibgeschützt**: `true`

Der absolute Pfad zum Projektstammverzeichnis. Wenn der konfigurierte `root` ein relativer Pfad ist, wird er basierend auf dem aktuellen Arbeitsverzeichnis aufgelöst.

### isProd

- **Typ**: `boolean`
- **Schreibgeschützt**: `true`

Bestimmt, ob die aktuelle Umgebung eine Produktionsumgebung ist. Verwendet vorrangig die `isProd`-Konfigurationsoption, falls nicht konfiguriert, wird `process.env.NODE_ENV` verwendet.

### basePath

- **Typ**: `string`
- **Schreibgeschützt**: `true`
- **Wirft**: `NotReadyError` - Wenn das Framework nicht initialisiert ist

Ruft den Basis-Pfad des Moduls ab, der mit einem Schrägstrich beginnt und endet. Das Rückgabeformat ist `/${name}/`, wobei der Name aus der Modulkonfiguration stammt.

### basePathPlaceholder

- **Typ**: `string`
- **Schreibgeschützt**: `true`

Ruft den Platzhalter für den dynamischen Basis-Pfad ab, der zur Laufzeit ersetzt wird. Kann durch Konfiguration deaktiviert werden.

### middleware

- **Typ**: `Middleware`
- **Schreibgeschützt**: `true`

Ruft das Middleware für die Verarbeitung statischer Ressourcen ab. Bietet je nach Umgebung unterschiedliche Implementierungen:
- Entwicklungsumgebung: Unterstützt Echtzeit-Kompilierung und Hot Reload
- Produktionsumgebung: Unterstützt langfristiges Caching statischer Ressourcen

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
- **Schreibgeschützt**: `true`

Ruft die serverseitige Rendering-Funktion ab. Bietet je nach Umgebung unterschiedliche Implementierungen:
- Entwicklungsumgebung: Unterstützt Hot Reload und Echtzeit-Vorschau
- Produktionsumgebung: Bietet optimierte Rendering-Leistung

```ts
// Grundlegende Verwendung
const rc = await esmx.render({
  params: { url: req.url }
});

// Erweiterte Konfiguration
const rc = await esmx.render({
  base: '',                    // Basis-Pfad
  importmapMode: 'inline',     // Importzuordnungsmodus
  entryName: 'default',        // Rendering-Einstiegspunkt
  params: {
    url: req.url,
    state: { user: 'admin' }   // Zustandsdaten
  }
});
```

### COMMAND

- **Typ**: `typeof COMMAND`
- **Schreibgeschützt**: `true`

Ruft die Enumeration der Befehlstypen ab.

### moduleConfig

- **Typ**: `ParsedModuleConfig`
- **Schreibgeschützt**: `true`
- **Wirft**: `NotReadyError` - Wenn das Framework nicht initialisiert ist

Ruft die vollständige Konfigurationsinformation des aktuellen Moduls ab, einschließlich Modulauflösungsregeln und Alias-Konfigurationen.

### packConfig

- **Typ**: `ParsedPackConfig`
- **Schreibgeschützt**: `true`
- **Wirft**: `NotReadyError` - Wenn das Framework nicht initialisiert ist

Ruft die Build-bezogenen Konfigurationen des aktuellen Moduls ab, einschließlich Ausgabepfad und package.json-Verarbeitung.

## Instanzmethoden

### constructor()

- **Parameter**: 
  - `options?: EsmxOptions` - Framework-Konfigurationsoptionen
- **Rückgabewert**: `Esmx`

Erstellt eine Esmx-Framework-Instanz.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parameter**: `command: COMMAND`
- **Rückgabewert**: `Promise<boolean>`
- **Wirft**:
  - `Error`: Bei wiederholter Initialisierung
  - `NotReadyError`: Beim Zugriff auf eine nicht initialisierte Instanz

Initialisiert die Esmx-Framework-Instanz. Führt die folgenden Kerninitialisierungsprozesse aus:

1. Projektkonfiguration analysieren (package.json, Modulkonfiguration, Build-Konfiguration usw.)
2. Anwendungsinstanz erstellen (Entwicklungsumgebung oder Produktionsumgebung)
3. Entsprechende Lebenszyklusmethoden basierend auf dem Befehl ausführen

::: warning Hinweis
- Bei wiederholter Initialisierung wird ein Fehler geworfen
- Beim Zugriff auf eine nicht initialisierte Instanz wird `NotReadyError` geworfen

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Rückgabewert**: `Promise<boolean>`

Zerstört die Esmx-Framework-Instanz und führt Ressourcenbereinigung und Verbindungsschließung durch. Wird hauptsächlich verwendet für:
- Schließen des Entwicklungsservers
- Bereinigung temporärer Dateien und Caches
- Freigabe von Systemressourcen

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Rückgabewert**: `Promise<boolean>`

Führt den Build-Prozess der Anwendung aus, einschließlich:
- Kompilierung des Quellcodes
- Generierung von Build-Artefakten für die Produktionsumgebung
- Optimierung und Komprimierung des Codes
- Generierung von Ressourcenlisten

::: warning Hinweis
Beim Aufruf auf eine nicht initialisierte Framework-Instanz wird `NotReadyError` geworfen
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Generierung statischer HTML-Dateien nach dem Build
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

- **Rückgabewert**: `Promise<void>`
- **Wirft**: `NotReadyError` - Wenn das Framework nicht initialisiert ist

Startet den HTTP-Server und konfiguriert die Serverinstanz. Wird in den folgenden Lebenszyklen aufgerufen:
- Entwicklungsumgebung (dev): Startet den Entwicklungsserver und bietet Hot Reload
- Produktionsumgebung (start): Startet den Produktionsserver und bietet Produktionsleistung

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Verarbeitung statischer Ressourcen
      esmx.middleware(req, res, async () => {
        // Serverseitiges Rendering
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Rückgabewert**: `Promise<boolean>`

Führt die Nachbearbeitungslogik nach dem Build aus, verwendet für:
- Generierung statischer HTML-Dateien
- Verarbeitung von Build-Artefakten
- Ausführung von Bereitstellungsaufgaben
- Senden von Build-Benachrichtigungen

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Generierung statischer HTML-Dateien für mehrere Seiten
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

Löst Projektpfade auf und konvertiert relative Pfade in absolute Pfade.

- **Parameter**:
  - `projectPath: ProjectPath` - Projektpfadtyp
  - `...args: string[]` - Pfadsegmente
- **Rückgabewert**: `string` - Der aufgelöste absolute Pfad

- **Beispiel**:
```ts
// Auflösen des Pfads zu statischen Ressourcen
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Schreibt Dateiinhalte synchron.

- **Parameter**:
  - `filepath`: `string` - Der absolute Pfad zur Datei
  - `data`: `any` - Die zu schreibenden Daten, können String, Buffer oder Objekt sein
- **Rückgabewert**: `boolean` - Gibt an, ob das Schreiben erfolgreich war

- **Beispiel**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Liest und analysiert eine JSON-Datei synchron.

- **Parameter**:
  - `filename`: `string` - Der absolute Pfad zur JSON-Datei

- **Rückgabewert**: `any` - Das analysierte JSON-Objekt
- **Ausnahmen**: Wirft eine Ausnahme, wenn die Datei nicht existiert oder das JSON-Format ungültig ist

- **Beispiel**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Verwendung des Manifest-Objekts
}
```

### readJson()

Liest und analysiert eine JSON-Datei asynchron.

- **Parameter**:
  - `filename`: `string` - Der absolute Pfad zur JSON-Datei

- **Rückgabewert**: `Promise<any>` - Das analysierte JSON-Objekt
- **Ausnahmen**: Wirft eine Ausnahme, wenn die Datei nicht existiert oder das JSON-Format ungültig ist

- **Beispiel**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Verwendung des Manifest-Objekts
}
```

### getManifestList()

Ruft die Liste der Build-Manifeste ab.

- **Parameter**:
  - `target`: `RuntimeTarget` - Der Zielumgebungstyp
    - `'client'`: Client-Umgebung
    - `'server'`: Server-Umgebung

- **Rückgabewert**: `Promise<readonly ManifestJson[]>` - Eine schreibgeschützte Liste der Build-Manifeste
- **Ausnahmen**: Wirft `NotReadyError`, wenn die Framework-Instanz nicht initialisiert ist

Diese Methode wird verwendet, um die Liste der Build-Manifeste für die angegebene Zielumgebung abzurufen und bietet folgende Funktion