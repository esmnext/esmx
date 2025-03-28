---
titleSuffix: Guida alla mappatura dei percorsi di importazione dei moduli del framework Esmx
description: Descrizione dettagliata del meccanismo degli alias di percorso nel framework Esmx, inclusi la semplificazione dei percorsi di importazione, l'evitare annidamenti profondi, la sicurezza dei tipi e l'ottimizzazione della risoluzione dei moduli, per aiutare gli sviluppatori a migliorare la manutenibilità del codice.
head:
  - - meta
    - property: keywords
      content: Esmx, Alias di percorso, Path Alias, TypeScript, Importazione di moduli, Mappatura dei percorsi, Manutenibilità del codice
---

# Alias di percorso

L'alias di percorso (Path Alias) è un meccanismo di mappatura dei percorsi di importazione dei moduli che consente agli sviluppatori di utilizzare identificatori brevi e semantici al posto dei percorsi completi dei moduli. In Esmx, il meccanismo degli alias di percorso offre i seguenti vantaggi:

- **Semplificazione dei percorsi di importazione**: Utilizza alias semantici al posto di percorsi relativi lunghi, migliorando la leggibilità del codice
- **Evitare annidamenti profondi**: Elimina le difficoltà di manutenzione causate da riferimenti a directory multilivello (ad esempio `../../../../`)
- **Sicurezza dei tipi**: Integrazione completa con il sistema di tipi di TypeScript, fornendo completamento del codice e controllo dei tipi
- **Ottimizzazione della risoluzione dei moduli**: Migliora le prestazioni di risoluzione dei moduli attraverso mappature predefinite dei percorsi

## Meccanismo degli alias predefiniti

Esmx utilizza un meccanismo automatico di alias basato sul nome del servizio (Service Name), un design che privilegia le convenzioni rispetto alla configurazione, con le seguenti caratteristiche:

- **Configurazione automatica**: Genera automaticamente alias basati sul campo `name` in `package.json`, senza necessità di configurazione manuale
- **Uniformità delle convenzioni**: Garantisce che tutti i moduli del servizio seguano una nomenclatura e un riferimento coerenti
- **Supporto dei tipi**: In combinazione con il comando `npm run build:dts`, genera automaticamente file di dichiarazione dei tipi, consentendo la deduzione dei tipi tra servizi
- **Prevedibilità**: Consente di dedurre il percorso di riferimento del modulo dal nome del servizio, riducendo i costi di manutenzione

## Configurazione

### Configurazione di package.json

In `package.json`, il nome del servizio viene definito tramite il campo `name`, che fungerà da prefisso predefinito per l'alias del servizio:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### Configurazione di tsconfig.json

Affinché TypeScript possa risolvere correttamente i percorsi degli alias, è necessario configurare la mappatura `paths` in `tsconfig.json`:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## Esempi di utilizzo

### Importazione di moduli interni al servizio

```ts
// Utilizzo di un alias per l'importazione
import { MyComponent } from 'your-app-name/src/components';

// Importazione equivalente con percorso relativo
import { MyComponent } from '../components';
```

### Importazione di moduli da altri servizi

```ts
// Importazione di un componente da un altro servizio
import { SharedComponent } from 'other-service/src/components';

// Importazione di funzioni di utilità da un altro servizio
import { utils } from 'other-service/src/utils';
```

::: tip Best practice
- Preferire l'uso di percorsi con alias rispetto ai percorsi relativi
- Mantenere i percorsi con alias semantici e coerenti
- Evitare l'uso di troppi livelli di directory nei percorsi con alias

:::

``` ts
// Importazione di componenti
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importazione di funzioni di utilità
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importazione di definizioni di tipi
import type { UserInfo } from 'your-app-name/src/types';
```

### Importazione tra servizi

Dopo aver configurato il collegamento dei moduli (Module Link), è possibile importare moduli da altri servizi nello stesso modo:

```ts
// Importazione di un componente da un servizio remoto
import { Header } from 'remote-service/src/components';

// Importazione di funzioni di utilità da un servizio remoto
import { logger } from 'remote-service/src/utils';
```

### Alias personalizzati

Per pacchetti di terze parti o scenari speciali, è possibile definire alias personalizzati tramite il file di configurazione di Esmx:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configurazione di una versione specifica di Vue per la build
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configurazione di alias brevi per directory comuni
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning Avvertenze
1. Per i moduli di business, si consiglia di utilizzare sempre il meccanismo degli alias predefiniti per mantenere la coerenza del progetto
2. Gli alias personalizzati sono principalmente utilizzati per gestire esigenze speciali di pacchetti di terze parti o per ottimizzare l'esperienza di sviluppo
3. L'uso eccessivo di alias personalizzati potrebbe compromettere la manutenibilità del codice e l'ottimizzazione della build

:::