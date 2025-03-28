---
titleSuffix: Riferimento API del contesto di rendering del framework Esmx
description: Descrizione dettagliata della classe principale RenderContext del framework Esmx, inclusi il controllo del rendering, la gestione delle risorse, la sincronizzazione dello stato e il controllo del routing, per aiutare gli sviluppatori a implementare il rendering lato server in modo efficiente.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, rendering lato server, contesto di rendering, sincronizzazione dello stato, gestione delle risorse, framework per applicazioni web
---

# RenderContext

RenderContext è la classe principale del framework Esmx, responsabile della gestione dell'intero ciclo di vita del rendering lato server (SSR). Fornisce un set completo di API per gestire il contesto di rendering, la gestione delle risorse, la sincronizzazione dello stato e altre attività chiave:

- **Controllo del rendering**: Gestisce il processo di rendering lato server, supportando scenari come il rendering multi-ingresso e il rendering condizionale
- **Gestione delle risorse**: Raccoglie e inietta in modo intelligente risorse statiche come JS, CSS, ottimizzando le prestazioni di caricamento
- **Sincronizzazione dello stato**: Gestisce la serializzazione dello stato lato server, garantendo un'attivazione corretta (hydration) lato client
- **Controllo del routing**: Supporta funzionalità avanzate come reindirizzamenti lato server e impostazione dei codici di stato

## Definizioni di tipo

### ServerRenderHandle

Definizione del tipo per la funzione di gestione del rendering lato server.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

La funzione di gestione del rendering lato server è una funzione asincrona o sincrona che riceve un'istanza di RenderContext come parametro, utilizzata per gestire la logica del rendering lato server.

```ts title="entry.node.ts"
// 1. Funzione asincrona
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Funzione sincrona
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Definizione del tipo per l'elenco dei file di risorse raccolti durante il processo di rendering.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Elenco dei file JavaScript
- **css**: Elenco dei file di fogli di stile
- **modulepreload**: Elenco dei moduli ESM da precaricare
- **resources**: Elenco di altre risorse (immagini, font, ecc.)

```ts
// Esempio di elenco di file di risorse
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

Definisce la modalità di generazione dell'importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Inserisce il contenuto dell'importmap direttamente nell'HTML, adatto per i seguenti scenari:
  - Riduzione del numero di richieste HTTP
  - Contenuto dell'importmap di piccole dimensioni
  - Requisiti di prestazioni di caricamento della prima schermata elevati
- `js`: Genera il contenuto dell'importmap come file JS separato, adatto per i seguenti scenari:
  - Contenuto dell'importmap di grandi dimensioni
  - Utilizzo del meccanismo di cache del browser
  - Condivisione dello stesso importmap tra più pagine

Classe del contesto di rendering, responsabile della gestione delle risorse e della generazione dell'HTML durante il processo di rendering lato server (SSR).
## Opzioni dell'istanza

Definisce le opzioni di configurazione del contesto di rendering.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Tipo**: `string`
- **Valore predefinito**: `''`

Percorso di base per le risorse statiche.
- Tutte le risorse statiche (JS, CSS, immagini, ecc.) vengono caricate in base a questo percorso
- Supporta la configurazione dinamica a runtime, senza necessità di ricompilazione
- Utilizzato comunemente in scenari come siti multilingua, applicazioni micro-frontend, ecc.

#### entryName

- **Tipo**: `string`
- **Valore predefinito**: `'default'`

Nome della funzione di ingresso per il rendering lato server. Utilizzato per specificare la funzione di ingresso da utilizzare durante il rendering lato server, quando un modulo esporta più funzioni di rendering.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Logica di rendering per dispositivi mobili
};

export const desktop = async (rc: RenderContext) => {
  // Logica di rendering per desktop
};
```

#### params

- **Tipo**: `Record<string, any>`
- **Valore predefinito**: `{}`

Parametri di rendering. È possibile passare parametri di qualsiasi tipo alla funzione di rendering, comunemente utilizzati per passare informazioni sulla richiesta (URL, parametri query, ecc.).

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

- **Tipo**: `'inline' | 'js'`
- **Valore predefinito**: `'inline'`

Modalità di generazione dell'import map:
- `inline`: Inserisce il contenuto dell'importmap direttamente nell'HTML
- `js`: Genera il contenuto dell'importmap come file JS separato


## Proprietà dell'istanza

### esmx

- **Tipo**: `Esmx`
- **Sola lettura**: `true`

Riferimento all'istanza di Esmx. Utilizzato per accedere alle funzionalità e alle informazioni di configurazione principali del framework.

### redirect

- **Tipo**: `string | null`
- **Valore predefinito**: `null`

Indirizzo di reindirizzamento. Se impostato, il server può eseguire un reindirizzamento HTTP in base a questo valore, comunemente utilizzato in scenari come la verifica dell'accesso, il controllo delle autorizzazioni, ecc.

```ts title="entry.node.ts"
// Esempio di verifica dell'accesso
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continua il rendering della pagina...
};

// Esempio di controllo delle autorizzazioni
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continua il rendering della pagina...
};
```

### status

- **Tipo**: `number | null`
- **Valore predefinito**: `null`

Codice di stato della risposta HTTP. È possibile impostare qualsiasi codice di stato HTTP valido, comunemente utilizzato in scenari come la gestione degli errori, i reindirizzamenti, ecc.

```ts title="entry.node.ts"
// Esempio di gestione dell'errore 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Rendering della pagina 404...
    return;
  }
  // Continua il rendering della pagina...
};

// Esempio di reindirizzamento temporaneo
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Reindirizzamento temporaneo, mantiene il metodo della richiesta invariato
    return;
  }
  // Continua il rendering della pagina...
};
```

### html

- **Tipo**: `string`
- **Valore predefinito**: `''`

Contenuto HTML. Utilizzato per impostare e ottenere il contenuto HTML finale generato, gestendo automaticamente i segnaposto del percorso di base durante l'impostazione.

```ts title="entry.node.ts"
// Utilizzo di base
export default async (rc: RenderContext) => {
  // Imposta il contenuto HTML
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

// Percorso di base dinamico
const rc = await esmx.render({
  base: '/app',  // Imposta il percorso di base
  params: { url: req.url }
});

// I segnaposto nell'HTML vengono sostituiti automaticamente:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Sostituito con:
// /app/your-app-name/css/style.css
```

### base

- **Tipo**: `string`
- **Sola lettura**: `true`
- **Valore predefinito**: `''`

Percorso di base per le risorse statiche. Tutte le risorse statiche (JS, CSS, immagini, ecc.) vengono caricate in base a questo percorso, supportando la configurazione dinamica a runtime.

```ts
// Utilizzo di base
const rc = await esmx.render({
  base: '/esmx',  // Imposta il percorso di base
  params: { url: req.url }
});

// Esempio di sito multilingua
const rc = await esmx.render({
  base: '/cn',  // Sito in cinese
  params: { lang: 'zh-CN' }
});

// Esempio di applicazione micro-frontend
const rc = await esmx.render({
  base: '/app1',  // Sotto-applicazione 1
  params: { appId: 1 }
});
```

### entryName

- **Tipo**: `string`
- **Sola lettura**: `true`
- **Valore predefinito**: `'default'`

Nome della funzione di ingresso per il rendering lato server. Utilizzato per selezionare la funzione di rendering da utilizzare da entry.server.ts.

```ts title="entry.node.ts"
// Funzione di ingresso predefinita
export default async (rc: RenderContext) => {
  // Logica di rendering predefinita
};

// Funzioni di ingresso multiple
export const mobile = async (rc: RenderContext) => {
  // Logica di rendering per dispositivi mobili
};

export const desktop = async (rc: RenderContext) => {
  // Logica di rendering per desktop
};

// Selezione della funzione di ingresso in base al tipo di dispositivo
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Tipo**: `Record<string, any>`
- **Sola lettura**: `true`
- **Valore predefinito**: `{}`

Parametri di rendering. È possibile passare e accedere ai parametri durante il processo di rendering lato server, comunemente utilizzati per passare informazioni sulla richiesta, configurazioni della pagina, ecc.

```ts
// Utilizzo di base - Passaggio dell'URL e delle impostazioni della lingua
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Configurazione della pagina - Impostazione del tema e del layout
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Configurazione dell'ambiente - Iniezione dell'indirizzo API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Tipo**: `Set<ImportMeta>`

Insieme di raccolta delle dipendenze dei moduli. Durante il rendering dei componenti, traccia e registra automaticamente le dipendenze dei moduli, raccogliendo solo le risorse effettivamente utilizzate durante il rendering della pagina corrente.

```ts
// Utilizzo di base
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Durante il rendering, raccoglie automaticamente le dipendenze dei moduli
  // Il framework chiama automaticamente context.importMetaSet.add(import.meta) durante il rendering dei componenti
  // Gli sviluppatori non devono gestire manualmente la raccolta delle dipendenze
  return '<div id="app">Hello World</div>';
};

// Esempio di utilizzo
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Tipo**: `RenderFiles`

Elenco dei file di risorse:
- js: Elenco dei file JavaScript
- css: Elenco dei file di fogli di stile
- modulepreload: Elenco dei moduli ESM da precaricare
- resources: Elenco di altre risorse (immagini, font, ecc.)

```ts
// Raccolta delle risorse
await rc.commit();

// Iniezione delle risorse
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Precarga delle risorse -->
    ${rc.preload()}
    <!-- Iniezione dei fogli di stile -->
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

- **Tipo**: `'inline' | 'js'`
- **Valore predefinito**: `'inline'`

Modalità di generazione dell'import map:
- `inline`: Inserisce il contenuto dell'importmap direttamente nell'HTML
- `js`: Genera il contenuto dell'importmap come file JS separato


## Metodi dell'istanza

### serialize()

- **Parametri**: 
  - `input: any` - Dati da serializzare
  - `options?: serialize.SerializeJSOptions` - Opzioni di serializzazione
- **Valore di ritorno**: `string`

Serializza un oggetto JavaScript in una stringa. Utilizzato durante il processo di rendering lato server per serializzare i dati di stato, garantendo che i dati possano essere incorporati in modo sicuro nell'HTML.

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

- **Parametri**: 
  - `varName: string` - Nome della variabile
  - `data: Record<string, any>` - Dati di stato
- **Valore di ritorno**: `string`

Serializza i dati di stato e li inietta nell'HTML. Utilizza un metodo di serializzazione sicuro per gestire i dati, supportando strutture dati complesse.

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

- **Valore di ritorno**: `Promise<void>`

Conferma la raccolta delle dipendenze e aggiorna l'elenco delle risorse. Raccoglie tutti i moduli utilizzati da importMetaSet, analizzando le risorse specifiche di ciascun modulo in base al file manifest.

```ts
// Rendering e conferma delle dipendenze
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Conferma della raccolta delle dipendenze
await rc.commit();
```

### preload()

- **Valore di ritorno**: `string`

Genera i tag di precaricamento delle risorse. Utilizzato per precaricare risorse CSS e JavaScript, supportando la configurazione della priorità e gestendo automaticamente il percorso di base.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Iniezione dei fogli di stile -->
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

- **Valore di ritorno**: `string`

Genera i tag dei fogli di stile CSS. Inietta i file CSS raccolti, garantendo che i fogli di stile vengano caricati nell'ordine corretto.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Iniezione di tutti i fogli di stile raccolti -->
  </head>
`;
```

### importmap()

- **Valore di ritorno**: `string`

Gener