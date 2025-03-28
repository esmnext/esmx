---
titleSuffix: Esmx Framework Module Configuratie API Referentie
description: Gedetailleerde uitleg over de ModuleConfig configuratie-interface van het Esmx framework, inclusief module import/export regels, aliasconfiguratie en extern afhankelijkheidsbeheer, om ontwikkelaars te helpen het modulaire systeem van het framework beter te begrijpen.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, moduleconfiguratie, module import/export, externe afhankelijkheden, aliasconfiguratie, afhankelijkheidsbeheer, webapplicatieframework
---

# ModuleConfig

ModuleConfig biedt de moduleconfiguratiefunctie van het Esmx framework, gebruikt om de import/export regels, aliasconfiguratie en externe afhankelijkheden van modules te definiëren.

## Type Definitie

### PathType

- **Type Definitie**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Enum voor modulepadtype:
- `npm`: Geeft afhankelijkheden in node_modules aan
- `root`: Geeft bestanden in de projectroot aan

### ModuleConfig

- **Type Definitie**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Moduleconfiguratie-interface, gebruikt om de export, import en externe afhankelijkheidsconfiguratie van services te definiëren.

#### exports

Exportconfiguratielijst, die specifieke code-eenheden (zoals componenten, hulpfuncties, etc.) in de service naar buiten beschikbaar stelt in ESM-formaat.

Ondersteunt twee typen:
- `root:*`: Exporteert broncodebestanden, bijv.: `root:src/components/button.vue`
- `npm:*`: Exporteert externe afhankelijkheden, bijv.: `npm:vue`

Elk exportitem bevat de volgende eigenschappen:
- `name`: Origineel exportpad, bijv.: `npm:vue` of `root:src/components`
- `type`: Padtype (`npm` of `root`)
- `importName`: Importnaam, formaat: `${serviceName}/${type}/${path}`
- `exportName`: Exportpad, relatief ten opzichte van de serviceroot
- `exportPath`: Werkelijk bestandspad
- `externalName`: Naam van externe afhankelijkheid, gebruikt als identificatie voor andere services die deze module importeren

#### links

Serviceafhankelijkheidsconfiguratiemapping, gebruikt om andere services (lokaal of extern) waarvan de huidige service afhankelijk is, en hun lokale paden te configureren. De sleutel van elk configuratieitem is de servicenaam, de waarde is het lokale pad van die service.

De configuratie verschilt afhankelijk van de installatiemethode:
- Broncode-installatie (Workspace, Git): Moet naar de dist-directory wijzen, omdat de gebouwde bestanden moeten worden gebruikt
- Pakketinstallatie (Link, statische server, privé mirror, File): Rechtstreeks naar de pakketdirectory wijzen, omdat de pakketten al de gebouwde bestanden bevatten

#### imports

Externe afhankelijkheidsmapping, configureert de te gebruiken externe afhankelijkheden, meestal afhankelijkheden van externe modules.

Elke afhankelijkheid bevat de volgende eigenschappen:
- `match`: Reguliere expressie om importstatements te matchen
- `import`: Werkelijk modulepad

**Voorbeeld**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Exportconfiguratie
    exports: [
      'root:src/components/button.vue',  // Exporteer broncodebestand
      'root:src/utils/format.ts',
      'npm:vue',  // Exporteer externe afhankelijkheid
      'npm:vue-router'
    ],

    // Importconfiguratie
    links: {
      // Broncode-installatiemethode: moet naar dist-directory wijzen
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Pakketinstallatiemethode: rechtstreeks naar pakketdirectory wijzen
      'other-remote': 'root:./node_modules/other-remote'
    },

    // Externe afhankelijkheidsconfiguratie
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Type Definitie**:
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
     * Naam van het pakket
     */
    name: string
    /**
     * Rootdirectory van het pakket
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Geparseerde moduleconfiguratie, die de originele moduleconfiguratie omzet naar een gestandaardiseerd intern formaat:

#### name
Naam van de huidige service
- Gebruikt om de module te identificeren en importpaden te genereren

#### root
Rootdirectorypad van de huidige service
- Gebruikt om relatieve paden en build-output te resolveren

#### exports
Exportconfiguratielijst
- `name`: Origineel exportpad, bijv.: 'npm:vue' of 'root:src/components'
- `type`: Padtype (npm of root)
- `importName`: Importnaam, formaat: '${serviceName}/${type}/${path}'
- `exportName`: Exportpad, relatief ten opzichte van de serviceroot
- `exportPath`: Werkelijk bestandspad
- `externalName`: Naam van externe afhankelijkheid, gebruikt als identificatie voor andere services die deze module importeren

#### links
Importconfiguratielijst
- `name`: Naam van het pakket
- `root`: Rootdirectory van het pakket

#### imports
Externe afhankelijkheidsmapping
- Mapt importpaden van modules naar werkelijke modulelocaties
- `match`: Reguliere expressie om importstatements te matchen
- `import`: Werkelijk modulepad
```