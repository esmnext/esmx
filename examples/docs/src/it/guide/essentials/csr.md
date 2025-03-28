---
titleSuffix: Guida all'implementazione del rendering lato client con il framework Esmx
description: Una guida dettagliata sul meccanismo di rendering lato client del framework Esmx, inclusa la costruzione statica, le strategie di distribuzione e le migliori pratiche, per aiutare gli sviluppatori a implementare un rendering front-end efficiente in ambienti senza server.
head:
  - - meta
    - property: keywords
      content: Esmx, Rendering lato client, CSR, Costruzione statica, Rendering front-end, Distribuzione senza server, Ottimizzazione delle prestazioni
---

# Rendering lato client

Il rendering lato client (Client-Side Rendering, CSR) è una tecnica di rendering delle pagine eseguita direttamente nel browser. In Esmx, quando non è possibile distribuire un'istanza del server Node.js, è possibile generare un file `index.html` statico durante la fase di costruzione, implementando così un rendering puramente lato client.

## Casi d'uso

Si consiglia di utilizzare il rendering lato client nei seguenti scenari:

- **Ambienti di hosting statico**: come GitHub Pages, CDN e altri servizi di hosting che non supportano il rendering lato server
- **Applicazioni semplici**: piccole applicazioni che non richiedono tempi di caricamento rapidi per la prima schermata o un'ottimizzazione SEO avanzata
- **Ambienti di sviluppo**: per visualizzare e debuggare rapidamente l'applicazione durante la fase di sviluppo

## Configurazione

### Configurazione del template HTML

In modalità di rendering lato client, è necessario configurare un template HTML generico. Questo template fungerà da contenitore per l'applicazione, includendo i riferimenti alle risorse necessarie e il punto di montaggio.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Invia la raccolta delle dipendenze
    await rc.commit();
    
    // Configura il template HTML
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Precarica le risorse
    <title>Esmx</title>
    ${rc.css()}               // Inietta gli stili
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Mappa delle importazioni
    ${rc.moduleEntry()}       // Modulo di ingresso
    ${rc.modulePreload()}     // Precarga dei moduli
</body>
</html>
`;
};
```

### Generazione di HTML statico

Per utilizzare il rendering lato client in un ambiente di produzione, è necessario generare un file HTML statico durante la fase di costruzione. Esmx fornisce una funzione hook `postBuild` per implementare questa funzionalità:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Genera il file HTML statico
        const rc = await esmx.render();
        // Scrive il file HTML
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```