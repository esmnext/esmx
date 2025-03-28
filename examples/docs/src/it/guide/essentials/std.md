---
titleSuffix: Guida alla struttura e alle specifiche del progetto Esmx
description: Una guida dettagliata alla struttura standard del progetto Esmx, alle specifiche dei file di ingresso e alle configurazioni, per aiutare gli sviluppatori a costruire applicazioni SSR standardizzate e mantenibili.
head:
  - - meta
    - property: keywords
      content: Esmx, struttura del progetto, file di ingresso, specifiche di configurazione, framework SSR, TypeScript, standard di progetto, standard di sviluppo
---

# Standard e specifiche

Esmx è un moderno framework SSR che adotta una struttura di progetto standardizzata e un meccanismo di risoluzione dei percorsi per garantire coerenza e manutenibilità del progetto negli ambienti di sviluppo e produzione.

## Specifiche della struttura del progetto

### Struttura delle directory standard

```txt
root
│─ dist                  # Directory di output della compilazione
│  ├─ package.json       # Configurazione del pacchetto dopo la compilazione
│  ├─ server             # Output della compilazione lato server
│  │  └─ manifest.json   # Output del manifest di compilazione, utilizzato per generare l'importmap
│  ├─ node               # Output della compilazione del programma server Node
│  ├─ client             # Output della compilazione lato client
│  │  ├─ versions        # Directory di archiviazione delle versioni
│  │  │  └─ latest.tgz   # Archivia la directory dist per la distribuzione del pacchetto
│  │  └─ manifest.json   # Output del manifest di compilazione, utilizzato per generare l'importmap
│  └─ src                # File generati con tsc
├─ src
│  ├─ entry.server.ts    # Punto di ingresso dell'applicazione lato server
│  ├─ entry.client.ts    # Punto di ingresso dell'applicazione lato client
│  └─ entry.node.ts      # Punto di ingresso del programma server Node
├─ tsconfig.json         # Configurazione TypeScript
└─ package.json          # Configurazione del pacchetto
```

::: tip Informazioni aggiuntive
- `esmx.name` deriva dal campo `name` di `package.json`
- `dist/package.json` deriva da `package.json` nella directory root
- La directory `dist` viene archiviata solo quando `packs.enable` è impostato su `true`

:::

## Specifiche dei file di ingresso

### entry.client.ts
Il file di ingresso lato client è responsabile di:
- **Inizializzazione dell'applicazione**: configurazione delle impostazioni di base dell'applicazione lato client
- **Gestione delle rotte**: gestione delle rotte e della navigazione lato client
- **Gestione dello stato**: memorizzazione e aggiornamento dello stato lato client
- **Gestione delle interazioni**: gestione degli eventi utente e delle interazioni dell'interfaccia

### entry.server.ts
Il file di ingresso lato server è responsabile di:
- **Rendering lato server**: esecuzione del processo di rendering SSR
- **Generazione HTML**: costruzione della struttura iniziale della pagina
- **Pre-fetching dei dati**: gestione del recupero dei dati lato server
- **Iniezione dello stato**: trasferimento dello stato dal server al client
- **Ottimizzazione SEO**: ottimizzazione della pagina per i motori di ricerca

### entry.node.ts
Il file di ingresso del server Node.js è responsabile di:
- **Configurazione del server**: impostazione dei parametri del server HTTP
- **Gestione delle rotte**: gestione delle regole di routing lato server
- **Integrazione dei middleware**: configurazione dei middleware del server
- **Gestione dell'ambiente**: gestione delle variabili d'ambiente e delle configurazioni
- **Gestione delle richieste e risposte**: gestione delle richieste e risposte HTTP

## Specifiche dei file di configurazione

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```