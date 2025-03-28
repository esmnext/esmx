---
titleSuffix: Esmx Framework Compatibiliteitsgids
description: Gedetailleerde uitleg over de omgevingseisen van het Esmx-framework, inclusief Node.js-versievereisten en browsercompatibiliteit, om ontwikkelaars te helpen bij het correct configureren van de ontwikkelomgeving.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, browsercompatibiliteit, TypeScript, es-module-shims, omgevingsconfiguratie
---

# Omgevingseisen

Dit document beschrijft de omgevingseisen die nodig zijn om dit framework te gebruiken, inclusief de Node.js-omgeving en browsercompatibiliteit.

## Node.js-omgeving

Het framework vereist Node.js versie >= 22.6, voornamelijk om TypeScript-type-importen te ondersteunen (via de `--experimental-strip-types` vlag), zonder extra compilatiestappen.

## Browsercompatibiliteit

Het framework gebruikt standaard een compatibiliteitsmodus om een breder scala aan browsers te ondersteunen. Houd er echter rekening mee dat voor volledige browsercompatibiliteit handmatig de [es-module-shims](https://github.com/guybedford/es-module-shims) afhankelijkheid moet worden toegevoegd.

### Compatibiliteitsmodus (standaard)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Volgens de statistieken van [Can I Use](https://caniuse.com/?search=dynamic%20import) bedraagt de browserdekking in de compatibiliteitsmodus 96,81%.

### Native ondersteuningsmodus
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

De native ondersteuningsmodus biedt de volgende voordelen:
- Geen runtime-overhead, geen extra moduleloader nodig
- Native browserparsing, snellere uitvoeringssnelheid
- Betere code-splitsing en mogelijkheden voor on-demand laden

Volgens de statistieken van [Can I Use](https://caniuse.com/?search=importmap) bedraagt de browserdekking in de compatibiliteitsmodus 93,5%.

### Compatibiliteitsondersteuning inschakelen

::: warning Belangrijke opmerking
Hoewel het framework standaard in de compatibiliteitsmodus wordt gebouwd, moet u voor volledige ondersteuning van oudere browsers handmatig de [es-module-shims](https://github.com/guybedford/es-module-shims) afhankelijkheid toevoegen aan uw project.

:::

Voeg het volgende script toe aan uw HTML-bestand:

```html
<!-- Ontwikkelomgeving -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Productieomgeving -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Beste praktijken

1. Aanbevelingen voor de productieomgeving:
   - Implementeer es-module-shims op uw eigen server
   - Zorg voor stabiliteit en toegangssnelheid van bronnen
   - Vermijd mogelijke beveiligingsrisico's
2. Prestatieoverwegingen:
   - De compatibiliteitsmodus brengt een kleine prestatieoverhead met zich mee
   - Beslis op basis van de browserverdeling van uw doelgebruikersgroep of u deze wilt inschakelen

:::