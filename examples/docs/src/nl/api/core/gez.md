---
titleSuffix: Framework Core Class API Referentie
description: Gedetailleerde uitleg over de core class API van het Esmx framework, inclusief applicatie levenscyclusbeheer, statische resourceverwerking en server-side rendering mogelijkheden, om ontwikkelaars te helpen de kernfunctionaliteiten van het framework beter te begrijpen.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Levenscyclusbeheer, Statische resources, Server-side rendering, Rspack, Web applicatieframework
---

# Esmx

## Introductie

Esmx is een high-performance webapplicatieframework gebaseerd op Rspack, dat volledig levenscyclusbeheer, statische resourceverwerking en server-side rendering mogelijkheden biedt.

## Type Definities

### RuntimeTarget

- **Type definitie**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Applicatie runtime omgeving type:
- `client`: Draait in de browseromgeving, ondersteunt DOM-operaties en browser API's
- `server`: Draait in de Node.js omgeving, ondersteunt bestandssysteem en server-side functionaliteiten

### ImportMap

- **Type definitie**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES module import mapping type.

#### SpecifierMap

- **Type definitie**:
```ts
type SpecifierMap = Record<string, string>
```

Module identifier mapping type, gebruikt om module import paden te mappen.

#### ScopesMap

- **Type definitie**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Scope mapping type, gebruikt om module import mappings binnen specifieke scopes te definiëren.

### COMMAND

- **Type definitie**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Commando type enumeratie:
- `dev`: Ontwikkelomgeving commando, start de ontwikkelserver met hot reload
- `build`: Build commando, genereert productie build artifacts
- `preview`: Preview commando, start een lokale preview server
- `start`: Start commando, draait de productieserver

## Instantie Opties

Definieert de core configuratieopties van het Esmx framework.

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

- **Type**: `string`
- **Standaardwaarde**: `process.cwd()`

Project root directory pad. Kan een absoluut of relatief pad zijn, relatieve paden worden opgelost ten opzichte van de huidige werkdirectory.

#### isProd

- **Type**: `boolean`
- **Standaardwaarde**: `process.env.NODE_ENV === 'production'`

Omgevingsindicator.
- `true`: Productieomgeving
- `false`: Ontwikkelomgeving

#### basePathPlaceholder

- **Type**: `string | false`
- **Standaardwaarde**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Basis pad placeholder configuratie. Gebruikt voor runtime dynamische vervanging van resource basis paden. Stel in op `false` om deze functionaliteit uit te schakelen.

#### modules

- **Type**: `ModuleConfig`

Module configuratieopties. Gebruikt om module resolutie regels te configureren, inclusief module aliassen en externe afhankelijkheden.

#### packs

- **Type**: `PackConfig`

Build configuratieopties. Gebruikt om build artifacts te verpakken in standaard npm .tgz format pakketten.

#### devApp

- **Type**: `(esmx: Esmx) => Promise<App>`

Ontwikkelomgeving applicatie creatie functie. Alleen gebruikt in de ontwikkelomgeving, om een applicatie-instantie voor de ontwikkelserver te creëren.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Aangepaste Rspack configuratie
        }
      })
    )
  }
}
```

#### server

- **Type**: `(esmx: Esmx) => Promise<void>`

Server start configuratie functie. Gebruikt om de HTTP server te configureren en te starten, zowel in ontwikkel- als productieomgevingen.

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

- **Type**: `(esmx: Esmx) => Promise<void>`

Post-build verwerkingsfunctie. Uitgevoerd na het bouwen van het project, kan gebruikt worden voor:
- Extra resourceverwerking
- Deployment operaties
- Genereren van statische bestanden
- Verzenden van build notificaties

## Instantie Eigenschappen

### name

- **Type**: `string`
- **Alleen-lezen**: `true`

De naam van de huidige module, afkomstig uit de moduleconfiguratie.

### varName

- **Type**: `string`
- **Alleen-lezen**: `true`

Een geldige JavaScript variabelenaam gegenereerd op basis van de modulenaam.

### root

- **Type**: `string`
- **Alleen-lezen**: `true`

Absoluut pad van de project root directory. Als het geconfigureerde `root` een relatief pad is, wordt het opgelost ten opzichte van de huidige werkdirectory.

### isProd

- **Type**: `boolean`
- **Alleen-lezen**: `true`

Bepaalt of de huidige omgeving een productieomgeving is. Prioriteit wordt gegeven aan de `isProd` configuratieoptie, indien niet geconfigureerd wordt `process.env.NODE_ENV` gebruikt.

### basePath

- **Type**: `string`
- **Alleen-lezen**: `true`
- **Gooit**: `NotReadyError` - Wanneer het framework niet geïnitialiseerd is

Haalt het module basis pad op dat begint en eindigt met een slash. Retourneert het formaat `/${name}/`, waarbij name afkomstig is uit de moduleconfiguratie.

### basePathPlaceholder

- **Type**: `string`
- **Alleen-lezen**: `true`

Haalt de basis pad placeholder op die gebruikt wordt voor runtime dynamische vervanging. Kan worden uitgeschakeld via configuratie.

### middleware

- **Type**: `Middleware`
- **Alleen-lezen**: `true`

Haalt de statische resourceverwerkings middleware op. Biedt verschillende implementaties afhankelijk van de omgeving:
- Ontwikkelomgeving: Ondersteunt real-time compilatie en hot reload
- Productieomgeving: Ondersteunt langdurige caching van statische resources

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Alleen-lezen**: `true`

Haalt de server-side rendering functie op. Biedt verschillende implementaties afhankelijk van de omgeving:
- Ontwikkelomgeving: Ondersteunt hot reload en real-time preview
- Productieomgeving: Biedt geoptimaliseerde rendering prestaties

```ts
// Basis gebruik
const rc = await esmx.render({
  params: { url: req.url }
});

// Geavanceerde configuratie
const rc = await esmx.render({
  base: '',                    // Basis pad
  importmapMode: 'inline',     // Import mapping mode
  entryName: 'default',        // Render entry
  params: {
    url: req.url,
    state: { user: 'admin' }   // Status data
  }
});
```

### COMMAND

- **Type**: `typeof COMMAND`
- **Alleen-lezen**: `true`

Haalt de commando enumeratie type definitie op.

### moduleConfig

- **Type**: `ParsedModuleConfig`
- **Alleen-lezen**: `true`
- **Gooit**: `NotReadyError` - Wanneer het framework niet geïnitialiseerd is

Haalt de volledige configuratie-informatie van de huidige module op, inclusief module resolutie regels en alias configuraties.

### packConfig

- **Type**: `ParsedPackConfig`
- **Alleen-lezen**: `true`
- **Gooit**: `NotReadyError` - Wanneer het framework niet geïnitialiseerd is

Haalt de build gerelateerde configuratie van de huidige module op, inclusief output paden en package.json verwerking.

## Instantie Methoden

### constructor()

- **Parameters**: 
  - `options?: EsmxOptions` - Framework configuratieopties
- **Retourwaarde**: `Esmx`

Creëert een Esmx framework instantie.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parameters**: `command: COMMAND`
- **Retourwaarde**: `Promise<boolean>`
- **Gooit**:
  - `Error`: Bij herhaalde initialisatie
  - `NotReadyError`: Bij toegang tot een niet-geïnitialiseerde instantie

Initialiseert de Esmx framework instantie. Voert de volgende core initialisatie stappen uit:

1. Parseert projectconfiguratie (package.json, moduleconfiguratie, build configuratie, etc.)
2. Creëert applicatie-instantie (ontwikkel- of productieomgeving)
3. Voert de bijbehorende levenscyclusmethoden uit op basis van het commando

::: warning Let op
- Herhaalde initialisatie zal een fout veroorzaken
- Toegang tot een niet-geïnitialiseerde instantie zal een `NotReadyError` veroorzaken

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Retourwaarde**: `Promise<boolean>`

Vernietigt de Esmx framework instantie, voert resource opschoning en verbinding sluiting uit. Voornamelijk gebruikt voor:
- Sluiten van de ontwikkelserver
- Opschonen van tijdelijke bestanden en caches
- Vrijgeven van systeembronnen

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Retourwaarde**: `Promise<boolean>`

Voert de applicatie build procedure uit, inclusief:
- Compileren van broncode
- Genereren van productie build artifacts
- Optimaliseren en comprimeren van code
- Genereren van resource manifesten

::: warning Let op
Aanroepen zonder geïnitialiseerde framework instantie zal een `NotReadyError` veroorzaken
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Genereer statische HTML na build
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

- **Retourwaarde**: `Promise<void>`
- **Gooit**: `NotReadyError` - Wanneer het framework niet geïnitialiseerd is

Start de HTTP server en configureert de serverinstantie. Wordt aangeroepen in de volgende levenscycli:
- Ontwikkelomgeving (dev): Start de ontwikkelserver met hot reload
- Productieomgeving (start): Start de productieserver met productieprestaties

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Verwerk statische resources
      esmx.middleware(req, res, async () => {
        // Server-side rendering
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server draait op http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Retourwaarde**: `Promise<boolean>`

Voert post-build verwerkingslogica uit, gebruikt voor:
- Genereren van statische HTML bestanden
- Verwerken van build artifacts
- Uitvoeren van deployment taken
- Verzenden van build notificaties

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Genereer statische HTML voor meerdere pagina's
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

Resolve project paden, converteert relatieve paden naar absolute paden.

- **Parameters**:
  - `projectPath: ProjectPath` - Project pad type
  - `...args: string[]` - Pad fragmenten
- **Retourwaarde**: `string` - Het opgeloste absolute pad

- **Voorbeeld**:
```ts
// Resolve statisch resource pad
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Schrijft bestandsinhoud synchroon.

- **Parameters**:
  - `filepath`: `string` - Absoluut pad van het bestand
  - `data`: `any` - Te schrijven data, kan een string, Buffer of object zijn
- **Retourwaarde**: `boolean` - Of het schrijven succesvol was

- **Voorbeeld**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Leest en parseert een JSON bestand synchroon.

- **Parameters**:
  - `filename`: `string` - Absoluut pad van het JSON bestand

- **Retourwaarde**: `any` - Het geparseerde JSON object
- **Excepties**: Gooit een exceptie als het bestand niet bestaat of het JSON formaat ongeldig is

- **Voorbeeld**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Gebruik het manifest object
}
```

### readJson()

Leest en parseert een JSON bestand asynchroon.

- **Parameters**:
  - `filename`: `string` - Absoluut pad van het JSON bestand

- **Retourwaarde**: `Promise<any>` - Het geparseerde JSON object
- **Excepties**: Gooit een exceptie als het bestand niet bestaat of het JSON formaat ongeldig is

- **Voorbeeld**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Gebruik het manifest object
}
```

### getManifestList()

Haalt de build manifest lijst op.

- **Parameters**:
  - `target`: `RuntimeTarget` - Doelomgeving type
    - `'client'`: Clientomgeving
    - `'server'`: Serveromgeving

- **Retourwaarde**: `Promise<readonly ManifestJson[]>` - Een alleen-lezen lijst van build manifesten
- **Excepties**: Gooit een `NotReadyError` als de framework instantie niet geïnitialiseerd is

Deze methode wordt gebruikt om de build manifest lijst voor de gespecificeerde doelomgeving op te halen, met de volgende functionaliteiten:
1. **Cachebeheer**
   - Gebruikt interne cache mechanismen om herhaald laden te voorkomen
   - Retourneert onveranderlijke manifest lijsten

2. **Omgevingsaanpassing**
   - Ondersteunt zowel client- als serveromgevingen
   - Retourneert de bijbehorende manifest informatie op basis van de doelomgeving

3. **Module mapping**
   - Bevat module export informatie
   - Registreert resource afhankelijkheden

- **Voorbeeld**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // Haal client build manifest op
  const manifests = await esmx.getManifestList('client');

  // Zoek build informatie voor een specifieke module
  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

Haalt het import mapping object op.

- **Parameters**:
  - `target`: `RuntimeTarget` - Doelomgeving type
    - `'client'`: Genereert browseromgeving import mapping
    - `'server'