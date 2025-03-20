---
titleSuffix: Meccanismo di condivisione del codice tra servizi nel framework Gez
description: Descrizione dettagliata del meccanismo di collegamento dei moduli nel framework Gez, inclusa la condivisione del codice tra servizi, la gestione delle dipendenze e l'implementazione delle specifiche ESM, per aiutare gli sviluppatori a costruire applicazioni micro-frontend efficienti.
head:
  - - meta
    - property: keywords
      content: Gez, collegamento moduli, Module Link, ESM, condivisione codice, gestione dipendenze, micro-frontend
---

# Collegamento Moduli

Il framework Gez fornisce un meccanismo completo di collegamento moduli per gestire la condivisione del codice e le relazioni di dipendenza tra i servizi. Questo meccanismo è basato sulle specifiche ESM (ECMAScript Module) e supporta l'esportazione e l'importazione di moduli a livello di codice sorgente, oltre a una completa gestione delle dipendenze.

### Concetti Chiave

#### Esportazione Moduli
L'esportazione di moduli è il processo di esporre unità di codice specifiche (come componenti, funzioni di utilità, ecc.) da un servizio in formato ESM. Sono supportati due tipi di esportazione:
- **Esportazione del codice sorgente**: esporta direttamente i file di codice sorgente del progetto
- **Esportazione delle dipendenze**: esporta i pacchetti di dipendenze di terze parti utilizzati dal progetto

#### Collegamento Moduli
L'importazione di moduli è il processo di riferimento a unità di codice esportate da altri servizi. Sono supportati diversi metodi di installazione:
- **Installazione del codice sorgente**: adatto per ambienti di sviluppo, supporta modifiche in tempo reale e aggiornamenti a caldo
- **Installazione del pacchetto**: adatto per ambienti di produzione, utilizza direttamente i prodotti di build

## Esportazione Moduli

### Configurazione

Configura i moduli da esportare in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Esporta file di codice sorgente
            'root:src/components/button.vue',  // Componente Vue
            'root:src/utils/format.ts',        // Funzione di utilità
            // Esporta dipendenze di terze parti
            'npm:vue',                         // Framework Vue
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

La configurazione dell'esportazione supporta due tipi:
- `root:*`: esporta file di codice sorgente, il percorso è relativo alla directory radice del progetto
- `npm:*`: esporta dipendenze di terze parti, specifica direttamente il nome del pacchetto

## Importazione Moduli

### Configurazione

Configura i moduli da importare in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Configurazione dei collegamenti
        links: {
            // Installazione del codice sorgente: punta alla directory dei prodotti di build
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Installazione del pacchetto: punta alla directory del pacchetto
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Configurazione delle mappature delle importazioni
        imports: {
            // Utilizza le dipendenze dal modulo remoto
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Descrizione delle opzioni di configurazione:
1. **imports**: configura il percorso locale dei moduli remoti
   - Installazione del codice sorgente: punta alla directory dei prodotti di build (dist)
   - Installazione del pacchetto: punta direttamente alla directory del pacchetto

2. **externals**: configura le dipendenze esterne
   - Utilizzato per condividere le dipendenze dai moduli remoti
   - Evita il ripetuto bundling delle stesse dipendenze
   - Supporta la condivisione di dipendenze tra più moduli

### Metodi di Installazione

#### Installazione del Codice Sorgente
Adatto per ambienti di sviluppo, supporta modifiche in tempo reale e aggiornamenti a caldo.

1. **Modalità Workspace**
Consigliato per progetti Monorepo:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Modalità Link**
Utilizzato per il debug e lo sviluppo locale:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Installazione del Pacchetto
Adatto per ambienti di produzione, utilizza direttamente i prodotti di build.

1. **Registro NPM**
Installazione tramite npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Server Statico**
Installazione tramite protocollo HTTP/HTTPS:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Costruzione del Pacchetto

### Configurazione

Configura le opzioni di build in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    // Configurazione dell'esportazione dei moduli
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Configurazione della build
    pack: {
        // Abilita la build
        enable: true,

        // Configurazione degli output
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Personalizzazione di package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Pre-elaborazione della build
        onBefore: async (gez, pkg) => {
            // Genera dichiarazioni di tipo
            // Esegui test case
            // Aggiorna documentazione, ecc.
        },

        // Post-elaborazione della build
        onAfter: async (gez, pkg, file) => {
            // Carica su CDN
            // Pubblica su repository npm
            // Distribuisci in ambiente di test, ecc.
        }
    }
} satisfies GezOptions;
```

### Prodotti della Build

```
your-app-name.tgz
├── package.json        # Informazioni del pacchetto
├── index.js            # Entry per l'ambiente di produzione
├── server/             # Risorse lato server
│   └── manifest.json   # Mappatura delle risorse lato server
├── node/               # Runtime Node.js
└── client/             # Risorse lato client
    └── manifest.json   # Mappatura delle risorse lato client
```

### Processo di Pubblicazione

```bash
# 1. Costruisci la versione di produzione
gez build

# 2. Pubblica su npm
npm publish dist/versions/your-app-name.tgz
```