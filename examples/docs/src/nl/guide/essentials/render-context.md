---
titleSuffix: Esmx Framework Server-Side Rendering Kernmechanisme
description: Gedetailleerde uitleg over het RenderContext-mechanisme van het Esmx-framework, inclusief resourcebeheer, HTML-generatie en het ESM-modulesysteem, om ontwikkelaars te helpen bij het begrijpen en gebruiken van server-side rendering-functionaliteit.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Server-Side Rendering, ESM, Resourcebeheer
---

# RenderContext

RenderContext is een kernklasse in het Esmx-framework die voornamelijk verantwoordelijk is voor resourcebeheer en HTML-generatie tijdens het server-side rendering (SSR) proces. Het heeft de volgende kernkenmerken:

1. **Op ESM gebaseerd modulesysteem**
   - Gebruikt de moderne ECMAScript Modules-standaard
   - Ondersteunt native module-import en -export
   - Biedt betere code-splitsing en lazy loading

2. **Intelligente afhankelijkheidsverzameling**
   - Verzamelt dynamisch afhankelijkheden op basis van het daadwerkelijke renderpad
   - Voorkomt onnodige resource-loading
   - Ondersteunt asynchrone componenten en dynamische import

3. **Precieze resource-injectie**
   - Beheert strikt de volgorde van resource-loading
   - Optimaliseert de prestaties van de eerste paginaweergave
   - Zorgt voor betrouwbare client-side hydratatie

4. **Flexibel configuratiemechanisme**
   - Ondersteunt dynamische basispadconfiguratie
   - Biedt meerdere import mapping-modussen
   - Past zich aan verschillende implementatiescenario's aan

## Gebruikswijze

In het Esmx-framework hoeven ontwikkelaars meestal geen RenderContext-instantie direct aan te maken, maar kunnen ze deze verkrijgen via de `esmx.render()`-methode:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Statische bestandsverwerking
        esmx.middleware(req, res, async () => {
            // Verkrijg RenderContext-instantie via esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Reageer met HTML-inhoud
            res.end(rc.html);
        });
    });
}
```

## Belangrijkste functionaliteiten

### Afhankelijkheidsverzameling

RenderContext implementeert een intelligent afhankelijkheidsverzamelingsmechanisme dat afhankelijkheden dynamisch verzamelt op basis van de daadwerkelijk gerenderde componenten, in plaats van simpelweg alle mogelijke resources vooraf te laden:

#### Op aanvraag verzamelen
- Volgt en registreert automatisch module-afhankelijkheden tijdens het renderen van componenten
- Verzamelt alleen CSS, JavaScript en andere resources die daadwerkelijk worden gebruikt tijdens het renderen van de huidige pagina
- Registreert nauwkeurig de module-afhankelijkheden van elke component via `importMetaSet`
- Ondersteunt afhankelijkheidsverzameling voor asynchrone componenten en dynamische import

#### Automatische verwerking
- Ontwikkelaars hoeven het afhankelijkheidsverzamelingsproces niet handmatig te beheren
- Het framework verzamelt automatisch afhankelijkheidsinformatie tijdens het renderen van componenten
- Verwerkt alle verzamelde resources via de `commit()`-methode
- Behandelt automatisch circulaire en dubbele afhankelijkheden

#### Prestatieoptimalisatie
- Voorkomt het laden van ongebruikte modules, wat de laadtijd van de eerste pagina aanzienlijk vermindert
- Beheert nauwkeurig de volgorde van resource-loading om de paginaweergaveprestaties te optimaliseren
- Genereert automatisch optimale import mapping (Import Map)
- Ondersteunt resource-preloading en lazy loading-strategieën

### Resource-injectie

RenderContext biedt meerdere methoden om verschillende soorten resources te injecteren, elk ontworpen om de resource-loadingprestaties te optimaliseren:

- `preload()`: Preload CSS- en JS-resources, ondersteunt prioriteitsconfiguratie
- `css()`: Injecteer eerste scherm-stylesheets, ondersteunt kritieke CSS-extractie
- `importmap()`: Injecteer module-import mapping, ondersteunt dynamische padresolutie
- `moduleEntry()`: Injecteer client-side entry-module, ondersteunt meerdere entry-configuraties
- `modulePreload()`: Preload module-afhankelijkheden, ondersteunt lazy loading-strategieën

### Resource-injectievolgorde

RenderContext beheert strikt de volgorde van resource-injectie, een ontwerp dat is gebaseerd op de werking van browsers en prestatieoverwegingen:

1. head-gedeelte:
   - `preload()`: Preload CSS- en JS-resources, zodat de browser deze zo vroeg mogelijk kan ontdekken en laden
   - `css()`: Injecteer eerste scherm-stylesheets, zorg ervoor dat de paginastijlen klaar zijn wanneer de inhoud wordt weergegeven

2. body-gedeelte:
   - `importmap()`: Injecteer module-import mapping, definieer padresolutie-regels voor ESM-modules
   - `moduleEntry()`: Injecteer client-side entry-module, moet na importmap worden uitgevoerd
   - `modulePreload()`: Preload module-afhankelijkheden, moet na importmap worden uitgevoerd

## Volledig renderproces

Een typisch RenderContext-gebruiksproces ziet er als volgt uit:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Render pagina-inhoud en verzamel afhankelijkheden
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Commit afhankelijkheidsverzameling
    await rc.commit();
    
    // 3. Genereer volledige HTML
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
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
};
```

## Geavanceerde functies

### Basispadconfiguratie

RenderContext biedt een flexibel mechanisme voor dynamische basispadconfiguratie, dat ondersteuning biedt voor het dynamisch instellen van het basispad voor statische resources tijdens runtime:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Stel basispad in
    params: {
        url: req.url
    }
});
```

Dit mechanisme is vooral nuttig in de volgende scenario's:

1. **Implementatie van meertalige sites**
   ```
   hoofddomein.com      → Standaardtaal
   hoofddomein.com/nl/  → Nederlandse site
   hoofddomein.com/en/  → Engelse site
   ```

2. **Microfrontend-toepassingen**
   - Ondersteunt flexibele implementatie van subtoepassingen onder verschillende paden
   - Maakt integratie in verschillende hoofdtoepassingen eenvoudig

### Import mapping-modus

RenderContext biedt twee import mapping (Import Map)-modi:

1. **Inline-modus** (standaard)
   - Plaatst import mapping direct inline in de HTML
   - Geschikt voor kleine toepassingen, vermindert extra netwerkverzoeken
   - Direct beschikbaar bij het laden van de pagina

2. **JS-modus**
   - Laadt import mapping via een extern JavaScript-bestand
   - Geschikt voor grote toepassingen, maakt gebruik van browsercaching
   - Ondersteunt dynamische updates van mapping-inhoud

De gewenste modus kan worden geselecteerd via configuratie:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Entry-functieconfiguratie

RenderContext ondersteunt configuratie via `entryName` om de server-side rendering entry-functie aan te geven:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Geef mobiele entry-functie aan
    params: {
        url: req.url
    }
});
```

Dit mechanisme is vooral nuttig in de volgende scenario's:

1. **Meerdere sjabloonrenders**
   ```ts title="src/entry.server.ts"
   // Mobiele entry-functie
   export const mobile = async (rc: RenderContext) => {
       // Mobiel-specifieke renderlogica
   };

   // Desktop entry-functie
   export const desktop = async (rc: RenderContext) => {
       // Desktop-specifieke renderlogica
   };
   ```

2. **A/B-testen**
   - Ondersteunt het gebruik van verschillende renderlogica voor dezelfde pagina
   - Maakt gebruikerservaringsexperimenten eenvoudig
   - Flexibele overschakeling tussen verschillende renderstrategieën

3. **Speciale renderbehoeften**
   - Ondersteunt aangepaste renderprocessen voor bepaalde pagina's
   - Past zich aan prestatieoptimalisatiebehoeften voor verschillende scenario's aan
   - Biedt fijnmazige rendercontrole

## Best Practices

1. **Verkrijg RenderContext-instantie**
   - Verkrijg altijd instanties via de `esmx.render()`-methode
   - Geef indien nodig de juiste parameters door
   - Vermijd handmatige instantiecreatie

2. **Afhankelijkheidsverzameling**
   - Zorg ervoor dat alle modules correct `importMetaSet.add(import.meta)` aanroepen
   - Roep de `commit()`-methode direct na het renderen aan
   - Gebruik asynchrone componenten en dynamische import om de eerste paginaweergave te optimaliseren

3. **Resource-injectie**
   - Volg strikt de resource-injectievolgorde
   - Injecteer geen CSS in de body
   - Zorg ervoor dat importmap voor moduleEntry komt

4. **Prestatieoptimalisatie**
   - Gebruik preload om kritieke resources vooraf te laden
   - Gebruik modulePreload verstandig om module-loading te optimaliseren
   - Vermijd onnodige resource-loading
   - Maak gebruik van browsercaching om de laadprestaties te optimaliseren
```