---
titleSuffix: Esmx Framework Projectstructuur en Richtlijnenhandleiding
description: Gedetailleerde uitleg over de standaard projectstructuur, ingangsbestandsrichtlijnen en configuratiebestandsrichtlijnen van het Esmx framework, om ontwikkelaars te helpen gestandaardiseerde en onderhoudbare SSR-toepassingen te bouwen.
head:
  - - meta
    - property: keywords
      content: Esmx, projectstructuur, ingangsbestand, configuratierichtlijnen, SSR-framework, TypeScript, projectrichtlijnen, ontwikkelingsstandaarden
---

# Standaardrichtlijnen

Esmx is een modern SSR-framework dat gebruikmaakt van gestandaardiseerde projectstructuren en padresolutiemechanismen om consistentie en onderhoudbaarheid van projecten in ontwikkelings- en productieomgevingen te waarborgen.

## Projectstructuurrichtlijnen

### Standaard mappenstructuur

```txt
root
│─ dist                  # Compilatie-uitvoermap
│  ├─ package.json       # Softwarepakketconfiguratie na compilatie
│  ├─ server             # Server-side compilatie-uitvoer
│  │  └─ manifest.json   # Compilatielijstuitvoer, gebruikt voor het genereren van importmap
│  ├─ node               # Node-serverprogramma compilatie-uitvoer
│  ├─ client             # Client-side compilatie-uitvoer
│  │  ├─ versions        # Versieopslagmap
│  │  │  └─ latest.tgz   # Archiveer de dist-map voor softwarepakketdistributie
│  │  └─ manifest.json   # Compilatielijstuitvoer, gebruikt voor het genereren van importmap
│  └─ src                # Bestandstypes gegenereerd met tsc
├─ src
│  ├─ entry.server.ts    # Server-side applicatie-ingang
│  ├─ entry.client.ts    # Client-side applicatie-ingang
│  └─ entry.node.ts      # Node-serverapplicatie-ingang
├─ tsconfig.json         # TypeScript-configuratie
└─ package.json          # Softwarepakketconfiguratie
```

::: tip Uitbreidingskennis
- `esmx.name` is afkomstig van het `name`-veld in `package.json`
- `dist/package.json` is afkomstig van de `package.json` in de hoofdmap
- Het archief van de `dist`-map wordt alleen gemaakt als `packs.enable` is ingesteld op `true`

:::

## Ingangsbestandsrichtlijnen

### entry.client.ts
Het client-side ingangsbestand is verantwoordelijk voor:
- **Applicatie-initialisatie**: Basisinstellingen van de client-side applicatie configureren
- **Routemanagement**: Client-side routing en navigatie afhandelen
- **Statusmanagement**: Opslag en updates van client-side status implementeren
- **Interactiebeheer**: Gebruikersgebeurtenissen en interface-interacties beheren

### entry.server.ts
Het server-side ingangsbestand is verantwoordelijk voor:
- **Server-side rendering**: SSR-renderproces uitvoeren
- **HTML-generatie**: Initiële paginastructuur bouwen
- **Data prefetching**: Server-side dataverwerking afhandelen
- **Statusinjectie**: Server-side status doorgeven aan de client
- **SEO-optimalisatie**: Zoekmachineoptimalisatie van pagina's waarborgen

### entry.node.ts
Het Node.js server-ingangsbestand is verantwoordelijk voor:
- **Serverconfiguratie**: HTTP-serverparameters instellen
- **Routebehandeling**: Server-side routeringsregels beheren
- **Middleware-integratie**: Server-middleware configureren
- **Omgevingsbeheer**: Omgevingsvariabelen en configuraties afhandelen
- **Verzoek-respons**: HTTP-verzoeken en -responsen afhandelen

## Configuratiebestandsrichtlijnen

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