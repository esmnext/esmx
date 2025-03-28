---
titleSuffix: Riferimento API per la configurazione del packaging del framework Esmx
description: Descrizione dettagliata dell'interfaccia di configurazione PackConfig del framework Esmx, incluse le regole di packaging dei pacchetti, la configurazione dell'output e gli hook del ciclo di vita, per aiutare gli sviluppatori a implementare flussi di build standardizzati.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, packaging di pacchetti, configurazione di build, hook del ciclo di vita, configurazione del packaging, framework per applicazioni web
---

# PackConfig

`PackConfig` è un'interfaccia di configurazione per il packaging dei pacchetti, utilizzata per impacchettare gli artefatti di build di un servizio in un pacchetto standard npm in formato .tgz.

- **Standardizzazione**: Utilizza il formato di packaging .tgz standard di npm
- **Completezza**: Include tutti i file necessari come il codice sorgente del modulo, le dichiarazioni di tipo e i file di configurazione
- **Compatibilità**: Completamente compatibile con l'ecosistema npm, supporta flussi di lavoro standard di gestione dei pacchetti

## Definizione del tipo

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Abilita o disabilita la funzionalità di packaging. Se abilitata, gli artefatti di build verranno impacchettati in un pacchetto npm standard in formato .tgz.

- Tipo: `boolean`
- Valore predefinito: `false`

#### outputs

Specifica il percorso di output del file del pacchetto. Supporta le seguenti modalità di configurazione:
- `string`: Un singolo percorso di output, ad esempio 'dist/versions/my-app.tgz'
- `string[]`: Più percorsi di output, per generare più versioni contemporaneamente
- `boolean`: Se true, utilizza il percorso predefinito 'dist/client/versions/latest.tgz'

#### packageJson

Funzione di callback per personalizzare il contenuto di package.json. Viene chiamata prima del packaging per personalizzare il contenuto di package.json.

- Parametri:
  - `esmx: Esmx` - Istanza di Esmx
  - `pkg: any` - Contenuto originale di package.json
- Valore restituito: `Promise<any>` - Contenuto modificato di package.json

Utilizzi comuni:
- Modificare il nome e la versione del pacchetto
- Aggiungere o aggiornare le dipendenze
- Aggiungere campi personalizzati
- Configurare informazioni relative alla pubblicazione

Esempio:
```ts
packageJson: async (esmx, pkg) => {
  // Imposta le informazioni del pacchetto
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'La mia applicazione';

  // Aggiunge dipendenze
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Aggiunge configurazione di pubblicazione
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Funzione di callback per le operazioni preliminari al packaging.

- Parametri:
  - `esmx: Esmx` - Istanza di Esmx
  - `pkg: Record<string, any>` - Contenuto di package.json
- Valore restituito: `Promise<void>`

Utilizzi comuni:
- Aggiungere file aggiuntivi (README, LICENSE, ecc.)
- Eseguire test o verifiche di build
- Generare documentazione o metadati
- Pulire file temporanei

Esempio:
```ts
onBefore: async (esmx, pkg) => {
  // Aggiunge documentazione
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Esegue test
  await runTests();

  // Genera documentazione
  await generateDocs();

  // Pulisce file temporanei
  await cleanupTempFiles();
}
```

#### onAfter

Funzione di callback per le operazioni successive al packaging. Viene chiamata dopo la generazione del file .tgz, per elaborare gli artefatti di packaging.

- Parametri:
  - `esmx: Esmx` - Istanza di Esmx
  - `pkg: Record<string, any>` - Contenuto di package.json
  - `file: Buffer` - Contenuto del file impacchettato
- Valore restituito: `Promise<void>`

Utilizzi comuni:
- Pubblicare su un repository npm (pubblico o privato)
- Caricare su un server di risorse statiche
- Gestire il controllo delle versioni
- Attivare flussi CI/CD

Esempio:
```ts
onAfter: async (esmx, pkg, file) => {
  // Pubblica su un repository npm privato
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Carica su un server di risorse statiche
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Crea un tag di versione in Git
  await createGitTag(pkg.version);

  // Attiva il processo di deployment
  await triggerDeploy(pkg.version);
}
```

## Esempio di utilizzo

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configura i moduli da esportare
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Configurazione del packaging
  pack: {
    // Abilita il packaging
    enable: true,

    // Output di più versioni contemporaneamente
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Personalizza package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Operazioni preliminari al packaging
    onBefore: async (esmx, pkg) => {
      // Aggiunge file necessari
      await fs.writeFile('dist/README.md', '# Your App\n\nDescrizione delle esportazioni dei moduli...');
      // Esegue il controllo dei tipi
      await runTypeCheck();
    },

    // Operazioni successive al packaging
    onAfter: async (esmx, pkg, file) => {
      // Pubblica su un repository npm privato
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // O carica su un server statico
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```