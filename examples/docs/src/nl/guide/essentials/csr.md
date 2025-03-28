---
titleSuffix: Handleiding voor client-side rendering in het Esmx-framework
description: Gedetailleerde uitleg over het client-side rendering-mechanisme van het Esmx-framework, inclusief statische bouw, implementatiestrategieën en best practices, om ontwikkelaars te helpen efficiënte front-end rendering te realiseren in een serverloze omgeving.
head:
  - - meta
    - property: keywords
      content: Esmx, client-side rendering, CSR, statische bouw, front-end rendering, serverloze implementatie, prestatieoptimalisatie
---

# Client-side rendering

Client-side rendering (CSR) is een techniek waarbij de rendering van pagina's in de browser plaatsvindt. In Esmx kun je, wanneer je applicatie niet op een Node.js-server kan worden geïmplementeerd, kiezen voor het genereren van een statisch `index.html` bestand tijdens de bouwfase, waardoor pure client-side rendering mogelijk wordt.

## Gebruiksscenario's

De volgende scenario's zijn geschikt voor client-side rendering:

- **Statische hostingomgevingen**: zoals GitHub Pages, CDN's en andere hostingdiensten die server-side rendering niet ondersteunen
- **Eenvoudige applicaties**: kleine applicaties waarbij de laadsnelheid van de eerste pagina en SEO niet cruciaal zijn
- **Ontwikkelomgeving**: voor snelle preview en debugging tijdens de ontwikkelingsfase

## Configuratie-uitleg

### HTML-sjabloonconfiguratie

In de client-side rendering-modus moet je een algemeen HTML-sjabloon configureren. Dit sjabloon dient als container voor de applicatie en bevat de nodige resource-referenties en mount-points.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Verzamel afhankelijkheden
    await rc.commit();
    
    // Configureer HTML-sjabloon
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Preload resources
    <title>Esmx</title>
    ${rc.css()}               // Injecteer stijlen
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Importmap
    ${rc.moduleEntry()}       // Ingangsmodule
    ${rc.modulePreload()}     // Module preload
</body>
</html>
`;
};
```

### Statische HTML-generatie

Om client-side rendering in een productieomgeving te gebruiken, moet je tijdens de bouwfase een statisch HTML-bestand genereren. Esmx biedt een `postBuild` hook-functie om deze functionaliteit te realiseren:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Genereer statisch HTML-bestand
        const rc = await esmx.render();
        // Schrijf HTML-bestand
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```