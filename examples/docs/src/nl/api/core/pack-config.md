---
titleSuffix: Esmx Framework Verpakkingsconfiguratie API Referentie
description: Gedetailleerde uitleg over de PackConfig configuratie-interface van het Esmx framework, inclusief softwarepakketverpakkingsregels, uitvoerconfiguratie en levenscyclushooks, om ontwikkelaars te helpen gestandaardiseerde bouwprocessen te implementeren.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, softwarepakketverpakking, bouwconfiguratie, levenscyclushooks, verpakkingsconfiguratie, webapplicatieframework
---

# PackConfig

`PackConfig` is een interface voor het configureren van softwarepakketverpakking, gebruikt om de bouwresultaten van een service te verpakken in een standaard npm .tgz-formaat softwarepakket.

- **Standaardisatie**: Gebruikt het standaard npm .tgz-verpakkingsformaat
- **Volledigheid**: Bevat alle benodigde bestanden, zoals broncode, typeverklaringen en configuratiebestanden
- **Compatibiliteit**: Volledig compatibel met het npm-ecosysteem, ondersteunt standaard pakketbeheerwerkstromen

## Type Definitie

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

Geeft aan of de verpakkingsfunctie is ingeschakeld. Indien ingeschakeld, worden de bouwresultaten verpakt in een standaard npm .tgz-formaat softwarepakket.

- Type: `boolean`
- Standaardwaarde: `false`

#### outputs

Specificeert het uitvoerpad van het softwarepakketbestand. Ondersteunt de volgende configuratiemethoden:
- `string`: Een enkel uitvoerpad, bijvoorbeeld 'dist/versions/my-app.tgz'
- `string[]`: Meerdere uitvoerpaden, gebruikt om meerdere versies tegelijkertijd te genereren
- `boolean`: true gebruikt het standaardpad 'dist/client/versions/latest.tgz'

#### packageJson

Een callback-functie voor het aanpassen van de inhoud van package.json. Wordt aangeroepen vóór het verpakken, om de inhoud van package.json aan te passen.

- Parameters:
  - `esmx: Esmx` - Esmx instantie
  - `pkg: any` - Originele package.json inhoud
- Retourwaarde: `Promise<any>` - Aangepaste package.json inhoud

Veelvoorkomende toepassingen:
- Aanpassen van pakketnaam en versienummer
- Toevoegen of bijwerken van afhankelijkheden
- Toevoegen van aangepaste velden
- Configureren van publicatiegerelateerde informatie

Voorbeeld:
```ts
packageJson: async (esmx, pkg) => {
  // Stel pakketinformatie in
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'Mijn applicatie';

  // Voeg afhankelijkheden toe
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Voeg publicatieconfiguratie toe
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Een callback-functie voor voorbereidende werkzaamheden vóór het verpakken.

- Parameters:
  - `esmx: Esmx` - Esmx instantie
  - `pkg: Record<string, any>` - package.json inhoud
- Retourwaarde: `Promise<void>`

Veelvoorkomende toepassingen:
- Toevoegen van extra bestanden (README, LICENSE, etc.)
- Uitvoeren van tests of bouwvalidatie
- Genereren van documentatie of metadata
- Opruimen van tijdelijke bestanden

Voorbeeld:
```ts
onBefore: async (esmx, pkg) => {
  // Voeg documentatie toe
  await fs.writeFile('dist/README.md', '# Mijn App');
  await fs.writeFile('dist/LICENSE', 'MIT Licentie');

  // Voer tests uit
  await runTests();

  // Genereer documentatie
  await generateDocs();

  // Ruim tijdelijke bestanden op
  await cleanupTempFiles();
}
```

#### onAfter

Een callback-functie voor afhandeling na het verpakken. Wordt aangeroepen nadat het .tgz-bestand is gegenereerd, om het verpakkingsresultaat te verwerken.

- Parameters:
  - `esmx: Esmx` - Esmx instantie
  - `pkg: Record<string, any>` - package.json inhoud
  - `file: Buffer` - Inhoud van het verpakte bestand
- Retourwaarde: `Promise<void>`

Veelvoorkomende toepassingen:
- Publiceren naar een npm-repository (publiek of privé)
- Uploaden naar een statische bestandsserver
- Uitvoeren van versiebeheer
- Triggeren van CI/CD-processen

Voorbeeld:
```ts
onAfter: async (esmx, pkg, file) => {
  // Publiceer naar een privé npm-repository
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Upload naar een statische bestandsserver
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Maak een Git-tag aan
  await createGitTag(pkg.version);

  // Trigger een implementatieproces
  await triggerDeploy(pkg.version);
}
```

## Gebruiksvoorbeeld

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configureer de te exporteren modules
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Verpakkingsconfiguratie
  pack: {
    // Schakel verpakking in
    enable: true,

    // Voer meerdere versies tegelijkertijd uit
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Pas package.json aan
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Voorbereiding vóór verpakking
    onBefore: async (esmx, pkg) => {
      // Voeg benodigde bestanden toe
      await fs.writeFile('dist/README.md', '# Jouw App\n\nModule export uitleg...');
      // Voer typecontrole uit
      await runTypeCheck();
    },

    // Afhandeling na verpakking
    onAfter: async (esmx, pkg, file) => {
      // Publiceer naar een privé npm-mirror
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Of implementeer naar een statische server
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```