---
titleSuffix: Esmx Framework Applicatie Abstractie Interface
description: Gedetailleerde uitleg over de App-interface van het Esmx-framework, inclusief applicatie levenscyclusbeheer, statische bronbehandeling en server-side rendering functionaliteiten, om ontwikkelaars te helpen de kernfunctionaliteiten van de applicatie te begrijpen en te gebruiken.
head:
  - - meta
    - property: keywords
      content: Esmx, App, Applicatie Abstractie, Levenscyclus, Statische Bronnen, Server-side Rendering, API
---

# App

`App` is de applicatie abstractie van het Esmx-framework, dat een uniforme interface biedt voor het beheren van de levenscyclus van de applicatie, statische bronnen en server-side rendering.

```ts title="entry.node.ts"
export default {
  // Ontwikkelomgeving configuratie
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Aangepaste Rspack configuratie
        }
      })
    );
  }
}
```

## Type Definitie
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Type**: `Middleware`

Middleware voor het behandelen van statische bronnen.

Ontwikkelomgeving:
- Behandelt verzoeken voor statische bronnen van de broncode
- Ondersteunt real-time compilatie en hot reload
- Gebruikt no-cache caching strategie

Productieomgeving:
- Behandelt gebouwde statische bronnen
- Ondersteunt langdurige caching van onveranderlijke bestanden (.final.xxx)
- Geoptimaliseerde bron laadstrategie

```ts
server.use(esmx.middleware);
```

#### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Server-side rendering functie. Biedt verschillende implementaties afhankelijk van de omgeving:
- Productieomgeving (start): Laadt het gebouwde server-side ingangsbestand (entry.server) en voert rendering uit
- Ontwikkelomgeving (dev): Laadt het server-side ingangsbestand uit de broncode en voert rendering uit

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Type**: `() => Promise<boolean>`

Productieomgeving bouwfunctie. Gebruikt voor het bundelen en optimaliseren van bronnen. Retourneert true bij succesvolle bouw, false bij falen.

#### destroy

- **Type**: `() => Promise<boolean>`

Bronnen opruimfunctie. Gebruikt voor het afsluiten van de server, verbreken van verbindingen, etc. Retourneert true bij succesvolle opruiming, false bij falen.