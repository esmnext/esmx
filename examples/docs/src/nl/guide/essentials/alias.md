---
titleSuffix: Esmx Framework Gids voor Module Import Pad Mapping
description: Gedetailleerde uitleg over het pad alias mechanisme van het Esmx framework, inclusief vereenvoudiging van importpaden, vermijden van diepe nesting, typeveiligheid en module resolutie optimalisatie, om ontwikkelaars te helpen de onderhoudbaarheid van code te verbeteren.
head:
  - - meta
    - property: keywords
      content: Esmx, Pad Alias, Path Alias, TypeScript, Module Import, Pad Mapping, Code Onderhoudbaarheid
---

# Pad Alias

Pad alias (Path Alias) is een mechanisme voor het mappen van module importpaden, waarmee ontwikkelaars korte, semantische identificatoren kunnen gebruiken in plaats van volledige modulepaden. In Esmx biedt het pad alias mechanisme de volgende voordelen:

- **Vereenvoudiging van importpaden**: Gebruik semantische aliassen in plaats van lange relatieve paden, wat de leesbaarheid van de code verbetert
- **Vermijden van diepe nesting**: Elimineer onderhoudsproblemen veroorzaakt door meerdere directoryniveaus (bijv. `../../../../`)
- **Typeveiligheid**: Volledige integratie met het typesysteem van TypeScript, wat codecompletion en typecontrole biedt
- **Module resolutie optimalisatie**: Verbeter de module resolutieprestaties door vooraf gedefinieerde padmapping

## Standaard Alias Mechanisme

Esmx gebruikt een automatisch aliasmechanisme op basis van servicenaam (Service Name), waarbij conventie boven configuratie staat. Dit ontwerp heeft de volgende kenmerken:

- **Automatische configuratie**: Genereer automatisch aliassen op basis van het `name` veld in `package.json`, zonder handmatige configuratie
- **Uniforme normen**: Zorg ervoor dat alle servicemodules consistente naamgevings- en referentienormen volgen
- **Typeondersteuning**: Werk samen met het commando `npm run build:dts` om automatisch type declaratiebestanden te genereren, wat type-inferentie tussen services mogelijk maakt
- **Voorspelbaarheid**: Leid het referentiepad van de module af via de servicenaam, wat de onderhoudskosten verlaagt

## Configuratie Uitleg

### package.json Configuratie

Definieer in `package.json` de naam van de service via het `name` veld. Deze naam wordt gebruikt als het standaard aliasvoorvoegsel van de service:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json Configuratie

Om ervoor te zorgen dat TypeScript aliaspaden correct kan oplossen, moet je `paths` mapping configureren in `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Gebruiksvoorbeelden

### Importeren van Service Interne Modules

```ts
// Gebruik alias om te importeren
import { MyComponent } from 'your-app-name/src/components';

// Gelijkwaardige relatieve pad import
import { MyComponent } from '../components';
```

### Importeren van Andere Service Modules

```ts
// Importeer componenten van andere services
import { SharedComponent } from 'other-service/src/components';

// Importeer hulpfuncties van andere services
import { utils } from 'other-service/src/utils';
```

::: tip Beste Praktijken
- Gebruik bij voorkeur aliaspaden in plaats van relatieve paden
- Houd aliaspaden semantisch en consistent
- Vermijd te veel directoryniveaus in aliaspaden

:::

``` ts
// Importeer componenten
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importeer hulpfuncties
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importeer typedefinities
import type { UserInfo } from 'your-app-name/src/types';
```

### Importeren over Services

Wanneer module linking (Module Link) is geconfigureerd, kun je op dezelfde manier modules van andere services importeren:

```ts
// Importeer componenten van een externe service
import { Header } from 'remote-service/src/components';

// Importeer hulpfuncties van een externe service
import { logger } from 'remote-service/src/utils';
```

### Aangepaste Aliassen

Voor third-party packages of speciale scenario's kun je aangepaste aliassen configureren via het Esmx configuratiebestand:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configureer een specifieke build versie voor Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configureer korte aliassen voor veelgebruikte directories
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Belangrijke Opmerkingen
1. Voor bedrijfsmodules wordt aanbevolen om altijd het standaard aliasmechanisme te gebruiken om consistentie in het project te behouden
2. Aangepaste aliassen worden voornamelijk gebruikt voor speciale vereisten van third-party packages of om de ontwikkelervaring te optimaliseren
3. Overmatig gebruik van aangepaste aliassen kan de onderhoudbaarheid van de code en build optimalisatie beïnvloeden

:::