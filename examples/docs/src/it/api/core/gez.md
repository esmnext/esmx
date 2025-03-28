---
titleSuffix: Riferimento API delle classi core del framework
description: Documentazione dettagliata delle API delle classi core del framework Esmx, inclusa la gestione del ciclo di vita dell'applicazione, la gestione delle risorse statiche e le capacità di rendering lato server, per aiutare gli sviluppatori a comprendere a fondo le funzionalità core del framework.
head:
  - - meta
    - property: keywords
      content: Esmx, API, gestione ciclo di vita, risorse statiche, rendering lato server, Rspack, framework per applicazioni web
---

# Esmx

## Introduzione

Esmx è un framework per applicazioni web ad alte prestazioni basato su Rspack, che fornisce una gestione completa del ciclo di vita dell'applicazione, la gestione delle risorse statiche e le capacità di rendering lato server.

## Definizioni di tipo

### RuntimeTarget

- **Definizione di tipo**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Tipi di ambiente di runtime dell'applicazione:
- `client`: Eseguito nell'ambiente del browser, supporta operazioni DOM e API del browser
- `server`: Eseguito nell'ambiente Node.js, supporta funzionalità del file system e del server

### ImportMap

- **Definizione di tipo**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

Tipo di mappatura delle importazioni dei moduli ES.

#### SpecifierMap

- **Definizione di tipo**:
```ts
type SpecifierMap = Record<string, string>
```

Tipo di mappatura degli identificatori dei moduli, utilizzato per definire le relazioni di mappatura dei percorsi di importazione dei moduli.

#### ScopesMap

- **Definizione di tipo**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Tipo di mappatura degli ambiti, utilizzato per definire le relazioni di mappatura delle importazioni dei moduli in ambiti specifici.

### COMMAND

- **Definizione di tipo**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Enumerazione dei tipi di comando:
- `dev`: Comando per l'ambiente di sviluppo, avvia il server di sviluppo con supporto per l'aggiornamento in tempo reale
- `build`: Comando di build, genera gli artefatti di build per l'ambiente di produzione
- `preview`: Comando di anteprima, avvia un server di anteprima locale
- `start`: Comando di avvio, esegue il server per l'ambiente di produzione

## Opzioni dell'istanza

Definisce le opzioni di configurazione core del framework Esmx.

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

- **Tipo**: `string`
- **Valore predefinito**: `process.cwd()`

Percorso della directory radice del progetto. Può essere un percorso assoluto o relativo, i percorsi relativi vengono risolti rispetto alla directory di lavoro corrente.

#### isProd

- **Tipo**: `boolean`
- **Valore predefinito**: `process.env.NODE_ENV === 'production'`

Identificatore dell'ambiente.
- `true`: Ambiente di produzione
- `false`: Ambiente di sviluppo

#### basePathPlaceholder

- **Tipo**: `string | false`
- **Valore predefinito**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Configurazione del segnaposto per il percorso base. Utilizzato per sostituire dinamicamente il percorso base delle risorse durante il runtime. Impostare su `false` per disabilitare questa funzionalità.

#### modules

- **Tipo**: `ModuleConfig`

Opzioni di configurazione dei moduli. Utilizzato per configurare le regole di risoluzione dei moduli del progetto, inclusi alias dei moduli, dipendenze esterne, ecc.

#### packs

- **Tipo**: `PackConfig`

Opzioni di configurazione del packaging. Utilizzato per impacchettare gli artefatti di build in pacchetti software .tgz standard npm.

#### devApp

- **Tipo**: `(esmx: Esmx) => Promise<App>`

Funzione di creazione dell'applicazione per l'ambiente di sviluppo. Utilizzato solo nell'ambiente di sviluppo, per creare un'istanza dell'applicazione per il server di sviluppo.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Configurazione personalizzata di Rspack
        }
      })
    )
  }
}
```

#### server

- **Tipo**: `(esmx: Esmx) => Promise<void>`

Funzione di configurazione dell'avvio del server. Utilizzato per configurare e avviare il server HTTP, utilizzabile sia in ambiente di sviluppo che di produzione.

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

- **Tipo**: `(esmx: Esmx) => Promise<void>`

Funzione di post-elaborazione della build. Eseguita dopo il completamento della build del progetto, può essere utilizzata per:
- Eseguire ulteriori elaborazioni delle risorse
- Operazioni di deployment
- Generazione di file statici
- Invio di notifiche di build

## Proprietà dell'istanza

### name

- **Tipo**: `string`
- **Sola lettura**: `true`

Nome del modulo corrente, derivato dalla configurazione del modulo.

### varName

- **Tipo**: `string`
- **Sola lettura**: `true`

Nome di variabile JavaScript valido generato dal nome del modulo.

### root

- **Tipo**: `string`
- **Sola lettura**: `true`

Percorso assoluto della directory radice del progetto. Se il `root` configurato è un percorso relativo, viene risolto rispetto alla directory di lavoro corrente.

### isProd

- **Tipo**: `boolean`
- **Sola lettura**: `true`

Determina se l'ambiente corrente è di produzione. Utilizza in priorità l'opzione `isProd` dalla configurazione, se non configurato, determina in base a `process.env.NODE_ENV`.

### basePath

- **Tipo**: `string`
- **Sola lettura**: `true`
- **Eccezione**: `NotReadyError` - Quando il framework non è inizializzato

Ottiene il percorso base del modulo con barre iniziali e finali. Il formato restituito è `/${name}/`, dove name è derivato dalla configurazione del modulo.

### basePathPlaceholder

- **Tipo**: `string`
- **Sola lettura**: `true`

Ottiene il segnaposto per la sostituzione dinamica del percorso base durante il runtime. Può essere disabilitato tramite configurazione.

### middleware

- **Tipo**: `Middleware`
- **Sola lettura**: `true`

Ottiene il middleware per la gestione delle risorse statiche. Fornisce implementazioni diverse in base all'ambiente:
- Ambiente di sviluppo: Supporta la compilazione in tempo reale del codice sorgente e l'aggiornamento in tempo reale
- Ambiente di produzione: Supporta la cache a lungo termine delle risorse statiche

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Tipo**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Sola lettura**: `true`

Ottiene la funzione di rendering lato server. Fornisce implementazioni diverse in base all'ambiente:
- Ambiente di sviluppo: Supporta l'aggiornamento in tempo reale e l'anteprima in tempo reale
- Ambiente di produzione: Fornisce prestazioni di rendering ottimizzate

```ts
// Utilizzo di base
const rc = await esmx.render({
  params: { url: req.url }
});

// Configurazione avanzata
const rc = await esmx.render({
  base: '',                    // Percorso base
  importmapMode: 'inline',     // Modalità di mappatura delle importazioni
  entryName: 'default',        // Punto di ingresso del rendering
  params: {
    url: req.url,
    state: { user: 'admin' }   // Dati di stato
  }
});
```

### COMMAND

- **Tipo**: `typeof COMMAND`
- **Sola lettura**: `true`

Ottiene la definizione del tipo di enumerazione dei comandi.

### moduleConfig

- **Tipo**: `ParsedModuleConfig`
- **Sola lettura**: `true`
- **Eccezione**: `NotReadyError` - Quando il framework non è inizializzato

Ottiene le informazioni complete di configurazione del modulo corrente, inclusa la risoluzione dei moduli, la configurazione degli alias, ecc.

### packConfig

- **Tipo**: `ParsedPackConfig`
- **Sola lettura**: `true`
- **Eccezione**: `NotReadyError` - Quando il framework non è inizializzato

Ottiene la configurazione relativa al packaging del modulo corrente, inclusi i percorsi di output, l'elaborazione di package.json, ecc.

## Metodi dell'istanza

### constructor()

- **Parametri**: 
  - `options?: EsmxOptions` - Opzioni di configurazione del framework
- **Valore restituito**: `Esmx`

Crea un'istanza del framework Esmx.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parametri**: `command: COMMAND`
- **Valore restituito**: `Promise<boolean>`
- **Eccezioni**:
  - `Error`: Quando si tenta di inizializzare più volte
  - `NotReadyError`: Quando si accede a un'istanza non inizializzata

Inizializza l'istanza del framework Esmx. Esegue i seguenti flussi di inizializzazione core:

1. Analisi della configurazione del progetto (package.json, configurazione del modulo, configurazione del packaging, ecc.)
2. Creazione dell'istanza dell'applicazione (ambiente di sviluppo o produzione)
3. Esecuzione dei metodi del ciclo di vita in base al comando

::: warning Attenzione
- L'inizializzazione ripetuta genera un errore
- L'accesso a un'istanza non inizializzata genera `NotReadyError`

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Valore restituito**: `Promise<boolean>`

Distrugge l'istanza del framework Esmx, eseguendo operazioni di pulizia delle risorse e chiusura delle connessioni. Utilizzato principalmente per:
- Chiudere il server di sviluppo
- Pulire file temporanei e cache
- Rilasciare risorse di sistema

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Valore restituito**: `Promise<boolean>`

Esegue il processo di build dell'applicazione, inclusa:
- Compilazione del codice sorgente
- Generazione degli artefatti di build per l'ambiente di produzione
- Ottimizzazione e compressione del codice
- Generazione del manifest delle risorse

::: warning Attenzione
La chiamata su un'istanza del framework non inizializzata genera `NotReadyError`
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Genera HTML statico dopo la build
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

- **Valore restituito**: `Promise<void>`
- **Eccezione**: `NotReadyError` - Quando il framework non è inizializzato

Avvia il server HTTP e configura l'istanza del server. Chiamato nei seguenti cicli di vita:
- Ambiente di sviluppo (dev): Avvia il server di sviluppo, fornendo aggiornamento in tempo reale
- Ambiente di produzione (start): Avvia il server di produzione, fornendo prestazioni di livello produzione

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Gestione delle risorse statiche
      esmx.middleware(req, res, async () => {
        // Rendering lato server
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server in esecuzione su http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Valore restituito**: `Promise<boolean>`

Esegue la logica di post-elaborazione della build, utilizzata per:
- Generare file HTML statici
- Elaborare gli artefatti di build
- Eseguire operazioni di deployment
- Inviare notifiche di build

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Genera HTML statico per più pagine
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

Risolve i percorsi del progetto, convertendo i percorsi relativi in percorsi assoluti.

- **Parametri**:
  - `projectPath: ProjectPath` - Tipo di percorso del progetto
  - `...args: string[]` - Frammenti di percorso
- **Valore restituito**: `string` - Percorso assoluto risolto

- **Esempio**:
```ts
// Risolve il percorso delle risorse statiche
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Scrive in modo sincrono il contenuto di un file.

- **Parametri**:
  - `filepath`: `string` - Percorso assoluto del file
  - `data`: `any` - Dati da scrivere, possono essere stringhe, Buffer o oggetti
- **Valore restituito**: `boolean` - Indica se la scrittura è avvenuta con successo

- **Esempio**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Legge e analizza in modo sincrono un file JSON.

- **Parametri**:
  - `filename`: `string` - Percorso assoluto del file JSON

- **Valore restituito**: `any` - Oggetto JSON analizzato
- **Eccezione**: Generata quando il file non esiste o il formato JSON è errato

- **Esempio**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Utilizzo dell'oggetto manifest
}
```

### readJson()

Legge e analizza in modo asincrono un file JSON.

- **Parametri**:
  - `filename`: `string` - Percorso assoluto del file JSON

- **Valore restituito**: `Promise<any>` - Oggetto JSON analizzato
- **Eccezione**: Generata quando il file non esiste o il formato JSON è errato

- **Esempio**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Utilizzo dell'oggetto manifest
}
```

### getManifestList()

Ottiene l'elenco dei manifest di build.

- **Parametri**:
  - `target`: `RuntimeTarget` - Tipo di ambiente di destinazione
    - `'client'`: Ambiente client
    - `'server'`: Ambiente server

- **Valore restituito**: `Promise<readonly ManifestJson[]>` - Elenco di manifest di build in sola lettura
- **Eccezione**: Generata quando l'istanza del framework non è inizializzata

Questo metodo è utilizzato per ottenere l'elenco dei manifest di build per l'ambiente di destinazione specificato, con le seguenti funzionalità:
1. **Gestione della cache**
   - Utilizza un meccanismo di cache interno per evitare caricamenti ripetuti
   -