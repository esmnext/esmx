---
titleSuffix: "Dalle difficoltà del micro-frontend all'innovazione ESM: il percorso evolutivo del framework Esmx"
description: Approfondisci il percorso evolutivo del framework Esmx, dalle difficoltà dell'architettura micro-frontend tradizionale alle innovazioni basate su ESM, condividendo esperienze pratiche su ottimizzazione delle prestazioni, gestione delle dipendenze e scelta degli strumenti di build.
head:
  - - meta
    - property: keywords
      content: Esmx, framework micro-frontend, ESM, Import Maps, Rspack, Module Federation, gestione delle dipendenze, ottimizzazione delle prestazioni, evoluzione tecnologica, rendering lato server
sidebar: false
---

# Dalla condivisione dei componenti alla modularità nativa: il percorso evolutivo del framework micro-frontend Esmx

## Contesto del progetto

Negli ultimi anni, l'architettura micro-frontend ha cercato di trovare la strada giusta. Tuttavia, abbiamo assistito a varie soluzioni tecniche complesse che, attraverso stratificazioni e isolamenti artificiali, cercano di simulare un mondo ideale di micro-frontend. Queste soluzioni hanno portato a un pesante carico sulle prestazioni, rendendo lo sviluppo semplice complesso e i processi standard oscuri.

### Limitazioni delle soluzioni tradizionali

Nella pratica dell'architettura micro-frontend, abbiamo riscontrato numerose limitazioni delle soluzioni tradizionali:

- **Perdita di prestazioni**: l'iniezione delle dipendenze a runtime, il proxy della sandbox JS, ogni operazione consuma preziose risorse di prestazioni
- **Isolamento fragile**: l'ambiente sandbox creato artificialmente non può mai raggiungere le capacità di isolamento nativo del browser
- **Complessità di build**: per gestire le dipendenze, è necessario modificare gli strumenti di build, rendendo i progetti semplici difficili da mantenere
- **Regole personalizzate**: strategie di distribuzione speciali, elaborazione a runtime, ogni passo si allontana dai processi standard di sviluppo moderno
- **Limitazioni dell'ecosistema**: accoppiamento con il framework, API personalizzate, costringendo la scelta tecnologica a legarsi a un ecosistema specifico

Questi problemi sono emersi in modo particolarmente evidente in un progetto aziendale del 2019. All'epoca, un grande prodotto è stato suddiviso in una dozzina di sottosistemi aziendali indipendenti, che dovevano condividere un set di componenti di base e aziendali. La soluzione iniziale basata su pacchetti npm per la condivisione dei componenti ha rivelato gravi problemi di efficienza di manutenzione: quando un componente condiviso veniva aggiornato, tutti i sottosistemi che dipendevano da quel componente dovevano passare attraverso un processo completo di build e distribuzione.

## Evoluzione tecnologica

### v1.0: Esplorazione dei componenti remoti

Per risolvere i problemi di efficienza nella condivisione dei componenti, Esmx v1.0 ha introdotto un meccanismo di componenti RemoteView basato sul protocollo HTTP. Questa soluzione ha implementato l'assemblaggio dinamico del codice tra servizi attraverso richieste runtime, risolvendo con successo il problema delle lunghe catene di dipendenze di build. Tuttavia, a causa della mancanza di un meccanismo standardizzato di comunicazione runtime, la sincronizzazione dello stato e il passaggio di eventi tra servizi rimanevano un collo di bottiglia.

### v2.0: Tentativo di Module Federation

Nella versione v2.0, abbiamo adottato la tecnologia [Module Federation](https://webpack.js.org/concepts/module-federation/) di [Webpack 5.0](https://webpack.js.org/). Questa tecnologia, attraverso un meccanismo unificato di caricamento dei moduli e un contenitore runtime, ha migliorato significativamente l'efficienza della collaborazione tra servizi. Tuttavia, nella pratica su larga scala, il meccanismo chiuso di implementazione di Module Federation ha portato nuove sfide: difficoltà nella gestione precisa delle versioni delle dipendenze, specialmente nell'unificazione delle dipendenze condivise tra più servizi, spesso si verificavano conflitti di versione e anomalie runtime.

## Abbracciare la nuova era di ESM

Nella pianificazione della versione v3.0, abbiamo osservato attentamente le tendenze di sviluppo dell'ecosistema frontend, scoprendo che i progressi nelle capacità native del browser hanno portato nuove possibilità all'architettura micro-frontend:

### Sistema di moduli standardizzato

Con il supporto completo dei principali browser per [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) e la maturazione della specifica [Import Maps](https://github.com/WICG/import-maps), lo sviluppo frontend è entrato in una vera era di modularità. Secondo le statistiche di [Can I Use](https://caniuse.com/?search=importmap), il supporto nativo per ESM nei principali browser (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) ha raggiunto il 93.5%, offrendoci i seguenti vantaggi:

- **Gestione delle dipendenze standardizzata**: Import Maps fornisce la capacità di risolvere le dipendenze dei moduli a livello di browser, senza bisogno di complesse iniezioni runtime
- **Ottimizzazione del caricamento delle risorse**: il meccanismo di cache nativo dei moduli del browser migliora significativamente l'efficienza del caricamento delle risorse
- **Semplificazione del processo di build**: il modello di sviluppo basato su ESM rende i processi di build per l'ambiente di sviluppo e produzione più coerenti

Inoltre, attraverso il supporto della modalità di compatibilità (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), possiamo aumentare ulteriormente la copertura del browser al 96.81%, permettendoci di mantenere alte prestazioni senza sacrificare il supporto per i browser più vecchi.

### Progressi nelle prestazioni e nell'isolamento

Il sistema di moduli nativo porta non solo standardizzazione, ma anche un miglioramento qualitativo nelle prestazioni e nell'isolamento:

- **Zero overhead runtime**: addio ai proxy sandbox JavaScript e alle iniezioni runtime delle soluzioni micro-frontend tradizionali
- **Meccanismo di isolamento affidabile**: il rigoroso ambito dei moduli ESM fornisce naturalmente la capacità di isolamento più affidabile
- **Gestione precisa delle dipendenze**: l'analisi statica delle importazioni rende le relazioni di dipendenza più chiare e il controllo delle versioni più preciso

### Scelta degli strumenti di build

Nell'implementazione della soluzione tecnologica, la scelta degli strumenti di build è stata un punto decisionale cruciale. Dopo quasi un anno di ricerca e pratica, la nostra scelta ha attraversato la seguente evoluzione:

1. **Esplorazione di Vite**
   - Vantaggi: server di sviluppo basato su ESM, offre un'esperienza di sviluppo estrema
   - Sfide: le differenze di build tra ambiente di sviluppo e produzione portano a una certa incertezza

2. **Conferma di [Rspack](https://www.rspack.dev/)**
   - Vantaggi prestazionali: compilazione ad alte prestazioni basata su [Rust](https://www.rust-lang.org/), migliora significativamente la velocità di build
   - Supporto dell'ecosistema: alta compatibilità con l'ecosistema Webpack, riduce i costi di migrazione
   - Supporto ESM: attraverso la pratica del progetto Rslib, ha verificato l'affidabilità nella build ESM

Questa decisione ci ha permesso di mantenere un'esperienza di sviluppo eccellente, ottenendo al contempo un supporto più stabile per l'ambiente di produzione. Basandoci sulla combinazione di ESM e Rspack, abbiamo finalmente costruito una soluzione micro-frontend ad alte prestazioni e a bassa invasività.

## Prospettive future

Nel piano di sviluppo futuro, il framework Esmx si concentrerà su tre direzioni principali:

### Ottimizzazione approfondita di Import Maps

- **Gestione dinamica delle dipendenze**: implementazione di uno scheduling intelligente delle versioni delle dipendenze a runtime, risolvendo i conflitti di dipendenza tra più applicazioni
- **Strategie di pre-caricamento**: pre-caricamento intelligente basato sull'analisi delle route, migliorando l'efficienza del caricamento delle risorse
- **Ottimizzazione della build**: generazione automatica della configurazione Import Maps ottimale, riducendo i costi di configurazione manuale per gli sviluppatori

### Soluzione di routing indipendente dal framework

- **Astrazione unificata del routing**: progettazione di un'interfaccia di routing indipendente dal framework, supportando framework principali come Vue, React
- **Routing delle micro-applicazioni**: implementazione del collegamento delle route tra applicazioni, mantenendo la coerenza tra URL e stato dell'applicazione
- **Middleware di routing**: fornitura di un meccanismo di middleware estensibile, supportando il controllo degli accessi, le transizioni di pagina, ecc.

### Migliori pratiche per la comunicazione tra framework

- **Applicazione di esempio**: fornitura di un esempio completo di comunicazione tra framework, coprendo framework principali come Vue, React, Preact
- **Sincronizzazione dello stato**: soluzione di condivisione dello stato leggera basata su ESM
- **Event bus**: meccanismo standardizzato di comunicazione degli eventi, supportando la comunicazione disaccoppiata tra applicazioni

Attraverso queste ottimizzazioni ed estensioni, ci aspettiamo che Esmx diventi una soluzione micro-frontend più completa e facile da usare, offrendo agli sviluppatori una migliore esperienza di sviluppo e una maggiore efficienza.