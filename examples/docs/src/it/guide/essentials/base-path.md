---
titleSuffix: Guida alla configurazione del percorso delle risorse statiche nel framework Esmx
description: Descrizione dettagliata della configurazione del percorso di base nel framework Esmx, inclusa la distribuzione in più ambienti, la distribuzione CDN e l'impostazione del percorso di accesso alle risorse, per aiutare gli sviluppatori a gestire in modo flessibile le risorse statiche.
head:
  - - meta
    - property: keywords
      content: Esmx, Percorso di base, Base Path, CDN, Risorse statiche, Distribuzione multi-ambiente, Gestione delle risorse
---

# Percorso di base

Il percorso di base (Base Path) è il prefisso del percorso di accesso alle risorse statiche (come JavaScript, CSS, immagini, ecc.) all'interno di un'applicazione. In Esmx, una configurazione appropriata del percorso di base è fondamentale per i seguenti scenari:

- **Distribuzione multi-ambiente**: supporta l'accesso alle risorse in diversi ambienti come sviluppo, test e produzione
- **Distribuzione multi-regione**: adatta le esigenze di distribuzione in cluster in diverse regioni o paesi
- **Distribuzione CDN**: consente la distribuzione e l'accelerazione globale delle risorse statiche

## Meccanismo del percorso predefinito

Esmx utilizza un meccanismo di generazione automatica del percorso basato sul nome del servizio. Per impostazione predefinita, il framework legge il campo `name` nel file `package.json` del progetto per generare il percorso di base delle risorse statiche: `/your-app-name/`.

```json title="package.json"
{
    "name": "your-app-name"
}
```

Questo design basato su convenzioni piuttosto che su configurazioni offre i seguenti vantaggi:

- **Coerenza**: garantisce che tutte le risorse statiche utilizzino un percorso di accesso uniforme
- **Prevedibilità**: il percorso di accesso alle risorse può essere dedotto dal campo `name` nel `package.json`
- **Manutenibilità**: non richiede configurazioni aggiuntive, riducendo i costi di manutenzione

## Configurazione dinamica del percorso

Nei progetti reali, spesso è necessario distribuire lo stesso codice in ambienti o regioni diversi. Esmx supporta la configurazione dinamica del percorso di base, consentendo all'applicazione di adattarsi a diversi scenari di distribuzione.

### Casi d'uso

#### Distribuzione in sottodirectory
```
- example.com      -> Sito principale predefinito
- example.com/cn/  -> Sito cinese
- example.com/en/  -> Sito inglese
```

#### Distribuzione con domini indipendenti
```
- example.com    -> Sito principale predefinito
- cn.example.com -> Sito cinese
- en.example.com -> Sito inglese
```

### Metodo di configurazione

Attraverso il parametro `base` del metodo `esmx.render()`, è possibile impostare dinamicamente il percorso di base in base al contesto della richiesta:

```ts
const render = await esmx.render({
    base: '/cn',  // Imposta il percorso di base
    params: {
        url: req.url
    }
});
```