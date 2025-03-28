---
titleSuffix: Esmx Framework Pack-Konfigurations-API-Referenz
description: Detaillierte Beschreibung der PackConfig-Konfigurationsschnittstelle des Esmx-Frameworks, einschließlich Paketverpackungsregeln, Ausgabekonfiguration und Lifecycle-Hooks, um Entwicklern bei der Implementierung standardisierter Build-Prozesse zu helfen.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, Paketverpackung, Build-Konfiguration, Lifecycle-Hooks, Verpackungskonfiguration, Web-Anwendungsframework
---

# PackConfig

`PackConfig` ist eine Schnittstelle zur Konfiguration der Paketverpackung, die verwendet wird, um die Build-Artefakte eines Dienstes in ein standardmäßiges npm .tgz-Format zu verpacken.

- **Standardisierung**: Verwendung des standardmäßigen npm .tgz-Verpackungsformats
- **Vollständigkeit**: Enthält alle notwendigen Dateien wie Modulquellcode, Typdeklarationen und Konfigurationsdateien
- **Kompatibilität**: Vollständige Kompatibilität mit dem npm-Ökosystem und Unterstützung des standardmäßigen Paketmanagement-Workflows

## Typdefinition

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

Aktiviert die Verpackungsfunktion. Wenn aktiviert, werden die Build-Artefakte in ein standardmäßiges npm .tgz-Format verpackt.

- Typ: `boolean`
- Standardwert: `false`

#### outputs

Gibt den Ausgabepfad der Paketdatei an. Unterstützt folgende Konfigurationsmöglichkeiten:
- `string`: Einzelner Ausgabepfad, z.B. 'dist/versions/my-app.tgz'
- `string[]`: Mehrere Ausgabepfade, um gleichzeitig mehrere Versionen zu generieren
- `boolean`: Bei true wird der Standardpfad 'dist/client/versions/latest.tgz' verwendet

#### packageJson

Eine Callback-Funktion zur Anpassung des package.json-Inhalts. Wird vor der Verpackung aufgerufen, um den Inhalt von package.json anzupassen.

- Parameter:
  - `esmx: Esmx` - Esmx-Instanz
  - `pkg: any` - Originaler package.json-Inhalt
- Rückgabewert: `Promise<any>` - Angepasster package.json-Inhalt

Häufige Anwendungsfälle:
- Ändern des Paketnamens und der Versionsnummer
- Hinzufügen oder Aktualisieren von Abhängigkeiten
- Hinzufügen benutzerdefinierter Felder
- Konfigurieren von Veröffentlichungsinformationen

Beispiel:
```ts
packageJson: async (esmx, pkg) => {
  // Paketinformationen setzen
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Meine Anwendung';

  // Abhängigkeiten hinzufügen
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Veröffentlichungskonfiguration hinzufügen
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Eine Callback-Funktion für Vorbereitungen vor der Verpackung.

- Parameter:
  - `esmx: Esmx` - Esmx-Instanz
  - `pkg: Record<string, any>` - package.json-Inhalt
- Rückgabewert: `Promise<void>`

Häufige Anwendungsfälle:
- Hinzufügen zusätzlicher Dateien (README, LICENSE usw.)
- Ausführen von Tests oder Build-Validierungen
- Generieren von Dokumentation oder Metadaten
- Bereinigen temporärer Dateien

Beispiel:
```ts
onBefore: async (esmx, pkg) => {
  // Dokumentation hinzufügen
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Tests ausführen
  await runTests();

  // Dokumentation generieren
  await generateDocs();

  // Temporäre Dateien bereinigen
  await cleanupTempFiles();
}
```

#### onAfter

Eine Callback-Funktion für die Nachbearbeitung nach der Verpackung. Wird nach der Generierung der .tgz-Datei aufgerufen, um die verpackten Artefakte zu verarbeiten.

- Parameter:
  - `esmx: Esmx` - Esmx-Instanz
  - `pkg: Record<string, any>` - package.json-Inhalt
  - `file: Buffer` - Inhalt der verpackten Datei
- Rückgabewert: `Promise<void>`

Häufige Anwendungsfälle:
- Veröffentlichen im npm-Repository (öffentlich oder privat)
- Hochladen auf einen statischen Ressourcenserver
- Versionsverwaltung durchführen
- CI/CD-Prozess auslösen

Beispiel:
```ts
onAfter: async (esmx, pkg, file) => {
  // Im privaten npm-Repository veröffentlichen
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Auf statischen Ressourcenserver hochladen
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Versions-Tag erstellen
  await createGitTag(pkg.version);

  // Bereitstellungsprozess auslösen
  await triggerDeploy(pkg.version);
}
```

## Verwendungsbeispiel

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Konfigurieren der zu exportierenden Module
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Verpackungskonfiguration
  pack: {
    // Verpackungsfunktion aktivieren
    enable: true,

    // Mehrere Versionen gleichzeitig ausgeben
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // package.json anpassen
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Vorbereitungen vor der Verpackung
    onBefore: async (esmx, pkg) => {
      // Notwendige Dateien hinzufügen
      await fs.writeFile('dist/README.md', '# Your App\n\nModul-Export-Beschreibung...');
      // Typüberprüfung durchführen
      await runTypeCheck();
    },

    // Nachbearbeitung nach der Verpackung
    onAfter: async (esmx, pkg, file) => {
      // Im privaten npm-Repository veröffentlichen
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Oder auf statischen Server bereitstellen
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```