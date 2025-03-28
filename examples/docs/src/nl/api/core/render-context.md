---
titleSuffix: Esmx Framework Render Context API Referentie
description: Gedetailleerde uitleg over de RenderContext kernklasse van het Esmx framework, inclusief rendercontrole, resourcebeheer, statussynchronisatie en routeringscontrole, om ontwikkelaars te helpen efficiënte server-side rendering te realiseren.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, server-side rendering, render context, statussynchronisatie, resourcebeheer, webapplicatieframework
---

# RenderContext

RenderContext is de kernklasse in het Esmx framework, verantwoordelijk voor het beheren van de volledige levenscyclus van server-side rendering (SSR). Het biedt een complete API voor het afhandelen van rendercontext, resourcebeheer, statussynchronisatie en andere cruciale taken:

- **Rendercontrole**: Beheert het server-side renderingproces, ondersteunt meerdere ingangen, conditionele rendering en andere scenario's
- **Resourcebeheer**: Verzamelt en injecteert intelligent JS, CSS en andere statische resources om de laadprestaties te optimaliseren
- **Statussynchronisatie**: Verwerkt de serialisatie van serverstatus, zorgt voor correcte client-side activering (hydration)
- **Routeringscontrole**: Ondersteunt server-side omleidingen, statuscode-instellingen en andere geavanceerde functies

## Type Definitie

### ServerRenderHandle

Type definitie voor de server-side rendering verwerkingsfunctie.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

De server-side rendering verwerkingsfunctie is een asynchrone of synchrone functie die een RenderContext instantie als parameter ontvangt, gebruikt voor het afhandelen van server-side rendering logica.

```ts title="entry.node.ts"
// 1. Asynchrone verwerkingsfunctie
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Synchrone verwerkingsfunctie
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Type definitie voor de lijst van resourcebestanden die tijdens het renderen worden verzameld.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript bestandenlijst
- **css**: Stylesheet bestandenlijst
- **modulepreload**: Lijst van ESM modules die moeten worden vooraf geladen
- **resources**: Lijst van andere resourcebestanden (afbeeldingen, lettertypen, etc.)

```ts
// Voorbeeld van resourcebestandenlijst
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

Definieert de generatiemodus van importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Plaatst de importmap inhoud direct inline in de HTML, geschikt voor de volgende scenario's:
  - Vermindering van HTTP-verzoeken
  - Importmap inhoud is klein
  - Hoge eisen aan laadprestaties van de eerste pagina
- `js`: Genereert de importmap inhoud als een apart JS-bestand, geschikt voor de volgende scenario's:
  - Importmap inhoud is groot
  - Gebruik van browser caching mechanisme
  - Meerdere pagina's delen dezelfde importmap

Render context klasse, verantwoordelijk voor resourcebeheer en HTML-generatie tijdens server-side rendering (SSR).
## Instantie Opties

Definieert de configuratieopties voor de render context.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Type**: `string`
- **Standaardwaarde**: `''`

Basispad voor statische resources.
- Alle statische resources (JS, CSS, afbeeldingen, etc.) worden geladen op basis van dit pad
- Ondersteunt dynamische configuratie tijdens runtime, geen herbouw nodig
- Vaak gebruikt in meertalige sites, microfrontend applicaties, etc.

#### entryName

- **Type**: `string`
- **Standaardwaarde**: `'default'`

Naam van de server-side rendering ingangsfunctie. Gebruikt om de ingangsfunctie te specificeren die wordt gebruikt tijdens server-side rendering, wanneer een module meerdere renderfuncties exporteert.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Mobiele renderlogica
};

export const desktop = async (rc: RenderContext) => {
  // Desktop renderlogica
};
```

#### params

- **Type**: `Record<string, any>`
- **Standaardwaarde**: `{}`

Renderparameters. Kan willekeurige type parameters doorgeven aan de renderfunctie, vaak gebruikt om verzoekinformatie (URL, query parameters, etc.) door te geven.

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

- **Type**: `'inline' | 'js'`
- **Standaardwaarde**: `'inline'`

Generatiemodus van import map:
- `inline`: Plaatst de importmap inhoud direct inline in de HTML
- `js`: Genereert de importmap inhoud als een apart JS-bestand


## Instantie Eigenschappen

### esmx

- **Type**: `Esmx`
- **Alleen-lezen**: `true`

Referentie naar Esmx instantie. Gebruikt om toegang te krijgen tot kernfunctionaliteiten en configuratie-informatie van het framework.

### redirect

- **Type**: `string | null`
- **Standaardwaarde**: `null`

Omleidingsadres. Indien ingesteld, kan de server een HTTP-omleiding uitvoeren op basis van deze waarde, vaak gebruikt voor inlogvalidatie, toegangscontrole, etc.

```ts title="entry.node.ts"
// Voorbeeld van inlogvalidatie
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Ga door met het renderen van de pagina...
};

// Voorbeeld van toegangscontrole
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Ga door met het renderen van de pagina...
};
```

### status

- **Type**: `number | null`
- **Standaardwaarde**: `null`

HTTP-responsstatuscode. Kan elke geldige HTTP-statuscode instellen, vaak gebruikt voor foutafhandeling, omleidingen, etc.

```ts title="entry.node.ts"
// Voorbeeld van 404 foutafhandeling
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Render 404 pagina...
    return;
  }
  // Ga door met het renderen van de pagina...
};

// Voorbeeld van tijdelijke omleiding
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Tijdelijke omleiding, behoud verzoekmethode
    return;
  }
  // Ga door met het renderen van de pagina...
};
```

### html

- **Type**: `string`
- **Standaardwaarde**: `''`

HTML-inhoud. Gebruikt om de uiteindelijk gegenereerde HTML-inhoud in te stellen en op te halen, automatisch verwerkt basispad placeholders bij instelling.

```ts title="entry.node.ts"
// Basisgebruik
export default async (rc: RenderContext) => {
  // Stel HTML-inhoud in
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

// Dynamisch basispad
const rc = await esmx.render({
  base: '/app',  // Stel basispad in
  params: { url: req.url }
});

// Placeholders in HTML worden automatisch vervangen:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Vervangen door:
// /app/your-app-name/css/style.css
```

### base

- **Type**: `string`
- **Alleen-lezen**: `true`
- **Standaardwaarde**: `''`

Basispad voor statische resources. Alle statische resources (JS, CSS, afbeeldingen, etc.) worden geladen op basis van dit pad, ondersteunt dynamische configuratie tijdens runtime.

```ts
// Basisgebruik
const rc = await esmx.render({
  base: '/esmx',  // Stel basispad in
  params: { url: req.url }
});

// Voorbeeld van meertalige site
const rc = await esmx.render({
  base: '/nl',  // Nederlandse site
  params: { lang: 'nl-NL' }
});

// Voorbeeld van microfrontend applicatie
const rc = await esmx.render({
  base: '/app1',  // Subapplicatie 1
  params: { appId: 1 }
});
```

### entryName

- **Type**: `string`
- **Alleen-lezen**: `true`
- **Standaardwaarde**: `'default'`

Naam van de server-side rendering ingangsfunctie. Gebruikt om de renderfunctie te selecteren die moet worden gebruikt vanuit entry.server.ts.

```ts title="entry.node.ts"
// Standaard ingangsfunctie
export default async (rc: RenderContext) => {
  // Standaard renderlogica
};

// Meerdere ingangsfuncties
export const mobile = async (rc: RenderContext) => {
  // Mobiele renderlogica
};

export const desktop = async (rc: RenderContext) => {
  // Desktop renderlogica
};

// Selecteer ingangsfunctie op basis van apparaattype
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Type**: `Record<string, any>`
- **Alleen-lezen**: `true`
- **Standaardwaarde**: `{}`

Renderparameters. Kan worden doorgegeven en benaderd tijdens het server-side renderingproces, vaak gebruikt om verzoekinformatie, pagina-configuratie, etc. door te geven.

```ts
// Basisgebruik - Doorgeven van URL en taalinstelling
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'nl-NL'
  }
});

// Pagina-configuratie - Instellen van thema en lay-out
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Omgevingsconfiguratie - Injecteren van API-adres
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Type**: `Set<ImportMeta>`

Verzamelingsset voor moduleafhankelijkheden. Tijdens het renderen van componenten worden moduleafhankelijkheden automatisch getraceerd en geregistreerd, alleen resources die daadwerkelijk worden gebruikt tijdens het renderen van de huidige pagina worden verzameld.

```ts
// Basisgebruik
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Tijdens het renderen worden moduleafhankelijkheden automatisch verzameld
  // Het framework roept automatisch context.importMetaSet.add(import.meta) aan tijdens het renderen van componenten
  // Ontwikkelaars hoeven afhankelijkheidsverzameling niet handmatig te verwerken
  return '<div id="app">Hello World</div>';
};

// Gebruiksvoorbeeld
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Type**: `RenderFiles`

Lijst van resourcebestanden:
- js: JavaScript bestandenlijst
- css: Stylesheet bestandenlijst
- modulepreload: Lijst van ESM modules die moeten worden vooraf geladen
- resources: Lijst van andere resourcebestanden (afbeeldingen, lettertypen, etc.)

```ts
// Resourceverzameling
await rc.commit();

// Resource-injectie
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Vooraf laden van resources -->
    ${rc.preload()}
    <!-- Injecteren van stylesheets -->
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

- **Type**: `'inline' | 'js'`
- **Standaardwaarde**: `'inline'`

Generatiemodus van import map:
- `inline`: Plaatst de importmap inhoud direct inline in de HTML
- `js`: Genereert de importmap inhoud als een apart JS-bestand


## Instantie Methoden

### serialize()

- **Parameters**: 
  - `input: any` - Te serialiseren data
  - `options?: serialize.SerializeJSOptions` - Serialisatieopties
- **Retourwaarde**: `string`

Serialiseert een JavaScript object naar een string. Gebruikt om statusdata te serialiseren tijdens server-side rendering, zorgt ervoor dat data veilig kan worden ingebed in HTML.

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

- **Parameters**: 
  - `varName: string` - Variabelenaam
  - `data: Record<string, any>` - Statusdata
- **Retourwaarde**: `string`

Serialiseert statusdata en injecteert deze in HTML. Gebruikt veilige serialisatiemethoden voor data, ondersteunt complexe datastructuren.

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

- **Retourwaarde**: `Promise<void>`

Dient afhankelijkheidsverzameling in en werkt de resource lijst bij. Verzamelt alle gebruikte modules vanuit importMetaSet, parseert de specifieke resources van elke module op basis van het manifestbestand.

```ts
// Render en dien afhankelijkheden in
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Dien afhankelijkheidsverzameling in
await rc.commit();
```

### preload()

- **Retourwaarde**: `string`

Genereert resource preload tags. Gebruikt om CSS en JavaScript resources vooraf te laden, ondersteunt prioriteitsconfiguratie, verwerkt automatisch basispad.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Injecteer stylesheets -->
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

- **Retourwaarde**: `string`

Genereert CSS stylesheet tags. Injecteert verzamelde CSS-bestanden, zorgt ervoor dat stylesheets in de juiste volgorde worden geladen.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Injecteer alle verzamelde stylesheets -->
  </head>
`;
```

### importmap()

- **Retourwaarde**: `string`

Genereert import map tags. Genereert inline of externe import map op basis van importmapMode configuratie.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Injecteer import map -->
  </head>
`;
```

### moduleEntry()

- **Retourwaarde**: `string`

Genereert client-side ingangsmodule tags. Injecteert client-side ingangsmodule, moet worden uitgevoerd na importmap.

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}  <!-- Injecteer client-side ingangsmodule -->
  </body>
`;
```

### modulePreload()

- **Retourwaarde**: `string`

Genereert module preload tags. Laadt verzamelde ESM modules vooraf, optimaliseert laadprestaties van de eerste pagina.

```ts
rc.html = `
  <body>
    ${