---
titleSuffix: Motore di costruzione ad alte prestazioni del framework Esmx
description: Un'analisi approfondita del sistema di costruzione Rspack del framework Esmx, incluse le funzionalità principali come la compilazione ad alte prestazioni, la costruzione multi-ambiente, l'ottimizzazione delle risorse, per aiutare gli sviluppatori a costruire applicazioni Web moderne efficienti e affidabili.
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, sistema di costruzione, compilazione ad alte prestazioni, aggiornamento a caldo, costruzione multi-ambiente, Tree Shaking, suddivisione del codice, SSR, ottimizzazione delle risorse, efficienza di sviluppo, strumenti di costruzione
---

# Rspack

Esmx è basato sul sistema di costruzione [Rspack](https://rspack.dev/), sfruttando appieno le capacità di costruzione ad alte prestazioni di Rspack. Questo documento illustra il ruolo e le funzionalità principali di Rspack all'interno del framework Esmx.

## Caratteristiche

Rspack è il sistema di costruzione principale del framework Esmx e offre le seguenti caratteristiche chiave:

- **Costruzione ad alte prestazioni**: Motore di costruzione implementato in Rust, che fornisce una velocità di compilazione estremamente rapida, migliorando significativamente la velocità di costruzione di progetti di grandi dimensioni.
- **Ottimizzazione dell'esperienza di sviluppo**: Supporta funzionalità di sviluppo moderne come l'aggiornamento a caldo (HMR) e la compilazione incrementale, offrendo un'esperienza di sviluppo fluida.
- **Costruzione multi-ambiente**: Configurazione di costruzione unificata che supporta ambienti client, server e Node.js, semplificando il flusso di sviluppo multi-piattaforma.
- **Ottimizzazione delle risorse**: Capacità integrate di elaborazione e ottimizzazione delle risorse, supportando funzionalità come la suddivisione del codice, Tree Shaking e la compressione delle risorse.

## Costruzione dell'applicazione

Il sistema di costruzione Rspack di Esmx è progettato in modo modulare e include principalmente i seguenti moduli principali:

### @esmx/rspack

Modulo di costruzione di base, che fornisce le seguenti capacità principali:

- **Configurazione di costruzione unificata**: Fornisce una gestione standardizzata della configurazione di costruzione, supportando configurazioni multi-ambiente.
- **Elaborazione delle risorse**: Capacità integrate di elaborazione di risorse come TypeScript, CSS e immagini.
- **Ottimizzazione della costruzione**: Fornisce funzionalità di ottimizzazione delle prestazioni come la suddivisione del codice e Tree Shaking.
- **Server di sviluppo**: Integra un server di sviluppo ad alte prestazioni, supportando HMR.

### @esmx/rspack-vue

Modulo di costruzione dedicato al framework Vue, che fornisce:

- **Compilazione dei componenti Vue**: Supporta la compilazione efficiente dei componenti Vue 2/3.
- **Ottimizzazione SSR**: Ottimizzazioni specifiche per scenari di rendering lato server.
- **Miglioramenti per lo sviluppo**: Funzionalità specifiche per migliorare l'ambiente di sviluppo Vue.

## Flusso di costruzione

Il flusso di costruzione di Esmx è suddiviso principalmente nelle seguenti fasi:

1. **Inizializzazione della configurazione**
   - Caricamento della configurazione del progetto
   - Fusione della configurazione predefinita e della configurazione utente
   - Adeguamento della configurazione in base alle variabili d'ambiente

2. **Compilazione delle risorse**
   - Analisi delle dipendenze del codice sorgente
   - Conversione di vari tipi di risorse (TypeScript, CSS, ecc.)
   - Gestione delle importazioni ed esportazioni dei moduli

3. **Elaborazione dell'ottimizzazione**
   - Esecuzione della suddivisione del codice
   - Applicazione di Tree Shaking
   - Compressione del codice e delle risorse

4. **Generazione dell'output**
   - Generazione dei file di destinazione
   - Output della mappatura delle risorse
   - Generazione del report di costruzione

## Best Practice

### Ottimizzazione dell'ambiente di sviluppo

- **Configurazione della compilazione incrementale**: Configurare correttamente l'opzione `cache` per accelerare la velocità di costruzione sfruttando la cache.
- **Ottimizzazione HMR**: Configurare in modo mirato l'ambito dell'aggiornamento a caldo per evitare aggiornamenti non necessari dei moduli.
- **Ottimizzazione dell'elaborazione delle risorse**: Utilizzare configurazioni appropriate dei loader per evitare elaborazioni ripetute.

### Ottimizzazione dell'ambiente di produzione

- **Strategia di suddivisione del codice**: Configurare correttamente `splitChunks` per ottimizzare il caricamento delle risorse.
- **Compressione delle risorse**: Abilitare configurazioni di compressione appropriate per bilanciare il tempo di costruzione e le dimensioni dei prodotti.
- **Ottimizzazione della cache**: Utilizzare strategie di hash dei contenuti e cache a lungo termine per migliorare le prestazioni di caricamento.

## Esempio di configurazione

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Configurazione di costruzione personalizzata
                config({ config }) {
                    // Aggiungere qui la configurazione Rspack personalizzata
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
Per ulteriori dettagli sulle API e le opzioni di configurazione, consultare la [documentazione API di Rspack](/api/app/rspack.html).
:::