---
titleSuffix: Guida alla compatibilità del framework Esmx
description: Descrizione dettagliata dei requisiti ambientali del framework Esmx, inclusi i requisiti di versione di Node.js e le specifiche di compatibilità del browser, per aiutare gli sviluppatori a configurare correttamente l'ambiente di sviluppo.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Compatibilità browser, TypeScript, es-module-shims, Configurazione ambiente
---

# Requisiti ambientali

Questo documento descrive i requisiti ambientali necessari per utilizzare questo framework, inclusi l'ambiente Node.js e la compatibilità del browser.

## Ambiente Node.js

Il framework richiede Node.js versione >= 22.6, principalmente per supportare l'importazione di tipi TypeScript (tramite il flag `--experimental-strip-types`), senza la necessità di ulteriori passaggi di compilazione.

## Compatibilità del browser

Il framework utilizza per impostazione predefinita una modalità di costruzione compatibile, per supportare una gamma più ampia di browser. Tuttavia, è importante notare che per ottenere un supporto completo alla compatibilità del browser, è necessario aggiungere manualmente la dipendenza [es-module-shims](https://github.com/guybedford/es-module-shims).

### Modalità compatibile (predefinita)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Secondo le statistiche di [Can I Use](https://caniuse.com/?search=dynamic%20import), la copertura del browser in modalità compatibile raggiunge il 96.81%.

### Modalità di supporto nativo
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

La modalità di supporto nativo offre i seguenti vantaggi:
- Nessun sovraccarico di runtime, senza la necessità di ulteriori caricatori di moduli
- Analisi nativa del browser, con velocità di esecuzione più rapida
- Migliore capacità di suddivisione del codice e caricamento su richiesta

Secondo le statistiche di [Can I Use](https://caniuse.com/?search=importmap), la copertura del browser in modalità di supporto nativo raggiunge il 93.5%.

### Abilitare il supporto compatibile

::: warning Nota importante
Sebbene il framework utilizzi per impostazione predefinita una modalità di costruzione compatibile, per ottenere un supporto completo ai browser più vecchi, è necessario aggiungere la dipendenza [es-module-shims](https://github.com/guybedford/es-module-shims) al progetto.

:::

Aggiungere il seguente script nel file HTML:

```html
<!-- Ambiente di sviluppo -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Ambiente di produzione -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Best practice

1. Raccomandazioni per l'ambiente di produzione:
   - Distribuire es-module-shims su un server proprio
   - Garantire la stabilità e la velocità di accesso delle risorse
   - Evitare potenziali rischi di sicurezza
2. Considerazioni sulle prestazioni:
   - La modalità compatibile comporta un leggero sovraccarico delle prestazioni
   - È possibile decidere se abilitarla in base alla distribuzione del browser del gruppo di utenti target

:::