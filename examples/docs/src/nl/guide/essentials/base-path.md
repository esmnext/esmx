---
titleSuffix: Esmx Framework Statische Resource Path Configuratiehandleiding
description: Gedetailleerde uitleg over de basispadconfiguratie van het Esmx framework, inclusief multi-omgeving implementatie, CDN distributie en resource toegangspad instellingen, om ontwikkelaars te helpen bij het realiseren van flexibel statisch resourcebeheer.
head:
  - - meta
    - property: keywords
      content: Esmx, Basis Pad, Base Path, CDN, Statische Resources, Multi-omgeving Implementatie, Resourcebeheer
---

# Basis Pad

Het basispad (Base Path) verwijst naar het voorvoegsel van het toegangspad voor statische resources (zoals JavaScript, CSS, afbeeldingen, etc.) in een applicatie. In Esmx is een juiste configuratie van het basispad cruciaal voor de volgende scenario's:

- **Multi-omgeving Implementatie**: Ondersteuning voor resource toegang in verschillende omgevingen zoals ontwikkelomgeving, testomgeving en productieomgeving
- **Multi-regio Implementatie**: Aanpassing aan clusterimplementatiebehoeften in verschillende regio's of landen
- **CDN Distributie**: Wereldwijde distributie en versnelling van statische resources

## Standaard Pad Mechanisme

Esmx gebruikt een automatisch padgeneratiemechanisme gebaseerd op de servicenaam. Standaard leest het framework het `name` veld in het project `package.json` om het basispad voor statische resources te genereren: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Dit ontwerp, dat conventie boven configuratie verkiest, heeft de volgende voordelen:

- **Consistentie**: Zorgt ervoor dat alle statische resources een uniform toegangspad gebruiken
- **Voorspelbaarheid**: Het toegangspad van resources kan worden afgeleid via het `name` veld in `package.json`
- **Onderhoudbaarheid**: Geen extra configuratie nodig, wat de onderhoudskosten verlaagt

## Dynamische Pad Configuratie

In praktijkprojecten moeten we vaak dezelfde code implementeren in verschillende omgevingen of regio's. Esmx biedt ondersteuning voor dynamische basispaden, waardoor applicaties zich kunnen aanpassen aan verschillende implementatiescenario's.

### Gebruiksscenario's

#### Implementatie in Subdirectory
```
- example.com      -> Standaard hoofdsite
- example.com/cn/  -> Chinese site
- example.com/en/  -> Engelse site
```

#### Implementatie op Onafhankelijk Domein
```
- example.com    -> Standaard hoofdsite
- cn.example.com -> Chinese site
- en.example.com -> Engelse site
```

### Configuratiemethode

Via de `base` parameter van de `esmx.render()` methode kun je het basispad dynamisch instellen op basis van de request context:

```ts
const render = await esmx.render({
    base: '/cn',  // Stel het basispad in
    params: {
        url: req.url
    }
});
```