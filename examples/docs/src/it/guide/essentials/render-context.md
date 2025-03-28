---
titleSuffix: Meccanismo di rendering lato server del framework Esmx
description: Descrizione dettagliata del meccanismo del contesto di rendering (RenderContext) del framework Esmx, inclusa la gestione delle risorse, la generazione di HTML e il sistema di moduli ESM, per aiutare gli sviluppatori a comprendere e utilizzare le funzionalità di rendering lato server.
head:
  - - meta
    - property: keywords
      content: Esmx, contesto di rendering, RenderContext, SSR, rendering lato server, ESM, gestione delle risorse
---

# Contesto di Rendering

RenderContext è una classe centrale nel framework Esmx, responsabile principalmente della gestione delle risorse e della generazione di HTML durante il processo di rendering lato server (SSR). Presenta le seguenti caratteristiche principali:

1. **Sistema di moduli basato su ESM**
   - Utilizza lo standard moderno ECMAScript Modules
   - Supporta l'importazione e l'esportazione nativa dei moduli
   - Implementa una migliore suddivisione del codice e caricamento su richiesta

2. **Raccolta intelligente delle dipendenze**
   - Raccoglie dinamicamente le dipendenze in base al percorso di rendering effettivo
   - Evita il caricamento di risorse non necessarie
   - Supporta componenti asincroni e importazione dinamica

3. **Iniezione precisa delle risorse**
   - Controlla rigorosamente l'ordine di caricamento delle risorse
   - Ottimizza le prestazioni di caricamento della prima schermata
   - Garantisce l'affidabilità dell'attivazione lato client (Hydration)

4. **Meccanismo di configurazione flessibile**
   - Supporta la configurazione dinamica del percorso di base
   - Fornisce diverse modalità di mappatura delle importazioni
   - Si adatta a diversi scenari di distribuzione

## Modalità di utilizzo

Nel framework Esmx, gli sviluppatori generalmente non devono creare direttamente un'istanza di RenderContext, ma possono ottenerla tramite il metodo `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Gestione dei file statici
        esmx.middleware(req, res, async () => {
            // Ottieni un'istanza di RenderContext tramite esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Rispondi con il contenuto HTML
            res.end(rc.html);
        });
    });
}
```

## Funzionalità principali

### Raccolta delle dipendenze

RenderContext implementa un meccanismo intelligente di raccolta delle dipendenze, che raccoglie dinamicamente le dipendenze in base ai componenti effettivamente renderizzati, anziché pre-caricare semplicemente tutte le risorse potenzialmente utilizzate:

#### Raccolta su richiesta
- Traccia e registra automaticamente le dipendenze dei moduli durante il rendering effettivo dei componenti
- Raccoglie solo le risorse CSS, JavaScript, ecc., effettivamente utilizzate per il rendering della pagina corrente
- Registra con precisione le relazioni di dipendenza dei moduli di ciascun componente tramite `importMetaSet`
- Supporta la raccolta delle dipendenze per componenti asincroni e importazione dinamica

#### Gestione automatica
- Gli sviluppatori non devono gestire manualmente il processo di raccolta delle dipendenze
- Il framework raccoglie automaticamente le informazioni sulle dipendenze durante il rendering dei componenti
- Gestisce tutte le risorse raccolte tramite il metodo `commit()`
- Gestisce automaticamente i problemi di dipendenze circolari e duplicate

#### Ottimizzazione delle prestazioni
- Evita il caricamento di moduli non utilizzati, riducendo significativamente il tempo di caricamento della prima schermata
- Controlla con precisione l'ordine di caricamento delle risorse, ottimizzando le prestazioni di rendering della pagina
- Genera automaticamente una mappatura delle importazioni (Import Map) ottimale
- Supporta strategie di pre-caricamento e caricamento su richiesta delle risorse

### Iniezione delle risorse

RenderContext fornisce diversi metodi per iniettare diversi tipi di risorse, ciascuno progettato con cura per ottimizzare le prestazioni di caricamento delle risorse:

- `preload()`: Pre-carica risorse CSS e JS, supporta la configurazione della priorità
- `css()`: Inietta i fogli di stile per la prima schermata, supporta l'estrazione del CSS critico
- `importmap()`: Inietta la mappatura delle importazioni dei moduli, supporta la risoluzione dinamica dei percorsi
- `moduleEntry()`: Inietta il modulo di ingresso lato client, supporta la configurazione di più ingressi
- `modulePreload()`: Pre-carica le dipendenze dei moduli, supporta strategie di caricamento su richiesta

### Ordine di iniezione delle risorse

RenderContext controlla rigorosamente l'ordine di iniezione delle risorse, un ordine progettato in base al funzionamento del browser e alle considerazioni di ottimizzazione delle prestazioni:

1. Parte head:
   - `preload()`: Pre-carica risorse CSS e JS, consentendo al browser di individuarle e iniziare a caricarle il prima possibile
   - `css()`: Inietta i fogli di stile per la prima schermata, garantendo che gli stili della pagina siano pronti al momento del rendering del contenuto

2. Parte body:
   - `importmap()`: Inietta la mappatura delle importazioni dei moduli, definendo le regole di risoluzione dei percorsi per i moduli ESM
   - `moduleEntry()`: Inietta il modulo di ingresso lato client, deve essere eseguito dopo importmap
   - `modulePreload()`: Pre-carica le dipendenze dei moduli, deve essere eseguito dopo importmap

## Flusso di rendering completo

Un tipico flusso di utilizzo di RenderContext è il seguente:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Renderizza il contenuto della pagina e raccoglie le dipendenze
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Conferma la raccolta delle dipendenze
    await rc.commit();
    
    // 3. Genera l'HTML completo
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

## Funzionalità avanzate

### Configurazione del percorso di base

RenderContext fornisce un meccanismo flessibile per la configurazione dinamica del percorso di base, supportando l'impostazione dinamica del percorso di base delle risorse statiche in fase di esecuzione:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Imposta il percorso di base
    params: {
        url: req.url
    }
});
```

Questo meccanismo è particolarmente utile nei seguenti scenari:

1. **Distribuzione di siti multilingua**
   ```
   dominio.com      → Lingua predefinita
   dominio.com/cn/  → Sito in cinese
   dominio.com/en/  → Sito in inglese
   ```

2. **Applicazioni micro-frontend**
   - Supporta la distribuzione flessibile delle sotto-applicazioni in percorsi diversi
   - Facilita l'integrazione in diverse applicazioni principali

### Modalità di mappatura delle importazioni

RenderContext fornisce due modalità di mappatura delle importazioni (Import Map):

1. **Modalità Inline** (predefinita)
   - Inserisce la mappatura delle importazioni direttamente nell'HTML
   - Adatta per applicazioni di piccole dimensioni, riducendo le richieste di rete aggiuntive
   - Disponibile immediatamente al caricamento della pagina

2. **Modalità JS**
   - Carica la mappatura delle importazioni tramite un file JavaScript esterno
   - Adatta per applicazioni di grandi dimensioni, sfruttando il meccanismo di cache del browser
   - Supporta l'aggiornamento dinamico del contenuto della mappatura

È possibile scegliere la modalità appropriata tramite configurazione:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Configurazione della funzione di ingresso

RenderContext supporta la configurazione tramite `entryName` per specificare la funzione di ingresso per il rendering lato server:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Specifica l'uso della funzione di ingresso per dispositivi mobili
    params: {
        url: req.url
    }
});
```

Questo meccanismo è particolarmente utile nei seguenti scenari:

1. **Rendering di più template**
   ```ts title="src/entry.server.ts"
   // Funzione di ingresso per dispositivi mobili
   export const mobile = async (rc: RenderContext) => {
       // Logica di rendering specifica per dispositivi mobili
   };

   // Funzione di ingresso per desktop
   export const desktop = async (rc: RenderContext) => {
       // Logica di rendering specifica per desktop
   };
   ```

2. **Test A/B**
   - Supporta l'uso di diverse logiche di rendering per la stessa pagina
   - Facilita gli esperimenti sull'esperienza utente
   - Consente di passare flessibilmente tra diverse strategie di rendering

3. **Requisiti di rendering speciali**
   - Supporta l'uso di flussi di rendering personalizzati per alcune pagine
   - Si adatta alle esigenze di ottimizzazione delle prestazioni in diversi scenari
   - Implementa un controllo più preciso del rendering

## Best practice

1. **Ottenere un'istanza di RenderContext**
   - Ottenere sempre l'istanza tramite il metodo `esmx.render()`
   - Passare i parametri appropriati secondo necessità
   - Evitare di creare manualmente l'istanza

2. **Raccolta delle dipendenze**
   - Assicurarsi che tutti i moduli chiamino correttamente `importMetaSet.add(import.meta)`
   - Chiamare immediatamente il metodo `commit()` dopo il rendering
   - Utilizzare in modo appropriato componenti asincroni e importazione dinamica per ottimizzare il caricamento della prima schermata

3. **Iniezione delle risorse**
   - Seguire rigorosamente l'ordine di iniezione delle risorse
   - Non iniettare CSS nel body
   - Assicurarsi che importmap preceda moduleEntry

4. **Ottimizzazione delle prestazioni**
   - Utilizzare preload per pre-caricare le risorse critiche
   - Utilizzare in modo appropriato modulePreload per ottimizzare il caricamento dei moduli
   - Evitare il caricamento di risorse non necessarie
   - Sfruttare il meccanismo di cache del browser per ottimizzare le prestazioni di caricamento
```