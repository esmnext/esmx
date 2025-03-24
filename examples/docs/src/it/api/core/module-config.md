---
titleSuffix: Riferimento API per la configurazione dei moduli del framework Gez
description: Descrizione dettagliata dell'interfaccia di configurazione ModuleConfig del framework Gez, incluse le regole di importazione/esportazione dei moduli, la configurazione degli alias e la gestione delle dipendenze esterne, per aiutare gli sviluppatori a comprendere a fondo il sistema modulare del framework.
head:
  - - meta
    - property: keywords
      content: Gez, ModuleConfig, configurazione moduli, importazione/esportazione moduli, dipendenze esterne, configurazione alias, gestione dipendenze, framework per applicazioni web
---

# ModuleConfig

ModuleConfig fornisce le funzionalità di configurazione dei moduli per il framework Gez, utilizzate per definire le regole di importazione/esportazione dei moduli, la configurazione degli alias e le dipendenze esterne.

## Definizione dei tipi

### PathType

- **Definizione del tipo**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enumerazione dei tipi di percorso dei moduli:
- `npm`: indica le dipendenze presenti in node_modules
- `root`: indica i file presenti nella directory radice del progetto

### ModuleConfig

- **Definizione del tipo**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Interfaccia di configurazione dei moduli, utilizzata per definire l'esportazione, l'importazione e la configurazione delle dipendenze esterne del servizio.

#### exports

Lista di configurazione delle esportazioni, che espone specifiche unità di codice (come componenti, funzioni di utilità, ecc.) dal servizio in formato ESM.

Supporta due tipi:
- `root:*`: esporta i file sorgenti, ad esempio: `root:src/components/button.vue`
- `npm:*`: esporta dipendenze di terze parti, ad esempio: `npm:vue`

Ogni voce di esportazione contiene i seguenti attributi:
- `name`: percorso di esportazione originale, ad esempio: `npm:vue` o `root:src/components`
- `type`: tipo di percorso (`npm` o `root`)
- `importName`: nome di importazione, formato: `${serviceName}/${type}/${path}`
- `exportName`: percorso di esportazione, relativo alla directory radice del servizio
- `exportPath`: percorso effettivo del file
- `externalName`: nome della dipendenza esterna, utilizzato come identificatore quando altri servizi importano questo modulo

#### links

Mappatura della configurazione delle dipendenze del servizio, utilizzata per configurare altri servizi (locali o remoti) da cui dipende il servizio corrente e i loro percorsi locali. La chiave di ogni voce di configurazione è il nome del servizio e il valore è il percorso locale di tale servizio.

La configurazione varia in base al metodo di installazione:
- Installazione da sorgente (Workspace, Git): deve puntare alla directory dist, poiché è necessario utilizzare i file compilati
- Installazione da pacchetto (Link, server statico, repository privato, File): punta direttamente alla directory del pacchetto, poiché il pacchetto contiene già i file compilati

#### imports

Mappatura delle dipendenze esterne, configura le dipendenze esterne da utilizzare, solitamente dipendenze da moduli remoti.

Ogni dipendenza contiene i seguenti attributi:
- `match`: espressione regolare utilizzata per abbinare le istruzioni di importazione
- `import`: percorso effettivo del modulo

**Esempio**:
```ts title="entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
  modules: {
    // Configurazione delle esportazioni
    exports: [
      'root:src/components/button.vue',  // Esporta file sorgente
      'root:src/utils/format.ts',
      'npm:vue',  // Esporta dipendenza di terze parti
      'npm:vue-router'
    ],

    // Configurazione delle importazioni
    links: {
      // Metodo di installazione da sorgente: deve puntare alla directory dist
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Metodo di installazione da pacchetto: punta direttamente alla directory del pacchetto
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Configurazione delle dipendenze esterne
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies GezOptions;
```

### ParsedModuleConfig

- **Definizione del tipo**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Nome del pacchetto
     */
    name: string
    /**
     * Directory radice del pacchetto
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Configurazione del modulo analizzata, che converte la configurazione originale del modulo in un formato interno standardizzato:

#### name
Nome del servizio corrente
- Utilizzato per identificare il modulo e generare il percorso di importazione

#### root
Percorso della directory radice del servizio corrente
- Utilizzato per risolvere i percorsi relativi e la posizione degli artefatti di compilazione

#### exports
Lista di configurazione delle esportazioni
- `name`: percorso di esportazione originale, ad esempio: 'npm:vue' o 'root:src/components'
- `type`: tipo di percorso (npm o root)
- `importName`: nome di importazione, formato: '${serviceName}/${type}/${path}'
- `exportName`: percorso di esportazione, relativo alla directory radice del servizio
- `exportPath`: percorso effettivo del file
- `externalName`: nome della dipendenza esterna, utilizzato come identificatore quando altri servizi importano questo modulo

#### links
Lista di configurazione delle importazioni
- `name`: nome del pacchetto
- `root`: directory radice del pacchetto

#### imports
Mappatura delle dipendenze esterne
- Mappa il percorso di importazione del modulo alla posizione effettiva del modulo
- `match`: espressione regolare utilizzata per abbinare le istruzioni di importazione
- `import`: percorso effettivo del modulo