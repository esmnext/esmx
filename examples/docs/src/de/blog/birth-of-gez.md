---
titleSuffix: "Vom Mikrofrontend-Dilemma zur ESM-Innovation: Der Entwicklungsweg des Esmx-Frameworks"
description: Eine tiefgehende Betrachtung des Esmx-Frameworks, von den Herausforderungen traditioneller Mikrofrontend-Architekturen bis hin zu innovativen Durchbrüchen basierend auf ESM. Es werden technische Praxiserfahrungen in den Bereichen Leistungsoptimierung, Abhängigkeitsmanagement und Auswahl von Build-Tools geteilt.
head:
  - - meta
    - property: keywords
      content: Esmx, Mikrofrontend-Framework, ESM, Import Maps, Rspack, Module Federation, Abhängigkeitsmanagement, Leistungsoptimierung, technische Entwicklung, Server-Side Rendering
sidebar: false
---

# Von der Komponentenfreigabe zur nativen Modularität: Der Entwicklungsweg des Esmx-Mikrofrontend-Frameworks

## Projektkontext

In den letzten Jahren hat die Mikrofrontend-Architektur ständig nach dem richtigen Weg gesucht. Doch was wir sahen, waren verschiedene komplexe technische Lösungen, die mit mehreren Schichten von Verpackungen und künstlicher Isolation eine ideale Mikrofrontend-Welt simulierten. Diese Lösungen brachten erhebliche Leistungseinbußen mit sich, machten einfache Entwicklungen komplex und standardisierte Prozesse undurchsichtig.

### Grenzen traditioneller Lösungen

Bei der praktischen Anwendung der Mikrofrontend-Architektur haben wir die zahlreichen Einschränkungen traditioneller Lösungen deutlich gespürt:

- **Leistungseinbußen**: Laufzeitabhängigkeiten, JS-Sandbox-Proxies – jede Operation verbraucht wertvolle Leistung
- **Fragile Isolation**: Künstlich geschaffene Sandbox-Umgebungen können niemals die native Isolationsfähigkeit des Browsers erreichen
- **Komplexität beim Build**: Um Abhängigkeiten zu handhaben, mussten Build-Tools angepasst werden, was einfache Projekte schwer wartbar machte
- **Angepasste Regeln**: Spezielle Bereitstellungsstrategien, Laufzeitverarbeitung – jeder Schritt entfernte sich von den Standardprozessen der modernen Entwicklung
- **Ökosystembeschränkungen**: Framework-Kopplung, angepasste APIs – die Technologieauswahl wurde an ein bestimmtes Ökosystem gebunden

Diese Probleme traten besonders deutlich in einem unserer Unternehmensprojekte im Jahr 2019 hervor. Damals wurde ein großes Produkt in mehr als zehn unabhängige Geschäftssubsysteme aufgeteilt, die eine Reihe von Basis- und Geschäftskomponenten teilen mussten. Die ursprünglich verwendete Lösung zur Komponentenfreigabe basierend auf npm-Paketen zeigte in der Praxis ernsthafte Wartungseffizienzprobleme: Wenn eine freigegebene Komponente aktualisiert wurde, mussten alle davon abhängigen Subsysteme einen vollständigen Build- und Bereitstellungsprozess durchlaufen.

## Technische Entwicklung

### v1.0: Erkundung von Remote-Komponenten

Um die Effizienzprobleme bei der Komponentenfreigabe zu lösen, führte Esmx v1.0 einen RemoteView-Komponentenmechanismus basierend auf dem HTTP-Protokoll ein. Diese Lösung ermöglichte die dynamische Anforderung von Code zur Laufzeit und löste das Problem zu langer Build-Abhängigkeitsketten. Aufgrund des Mangels an standardisierten Laufzeitkommunikationsmechanismen gab es jedoch weiterhin Effizienzengpässe bei der Zustandssynchronisation und Ereignisübertragung zwischen den Diensten.

### v2.0: Versuch mit Module Federation

In Version v2.0 haben wir die [Module Federation](https://webpack.js.org/concepts/module-federation/)-Technologie von [Webpack 5.0](https://webpack.js.org/) verwendet. Diese Technologie verbesserte die Zusammenarbeit zwischen den Diensten durch einen einheitlichen Modullademechanismus und Laufzeitcontainer erheblich. In der großflächigen Praxis brachte die geschlossene Implementierung von Module Federation jedoch neue Herausforderungen mit sich: Es war schwierig, eine präzise Abhängigkeitsversionsverwaltung zu erreichen, insbesondere bei der Vereinheitlichung gemeinsamer Abhängigkeiten mehrerer Dienste, was häufig zu Versionskonflikten und Laufzeitfehlern führte.

## Die neue Ära von ESM

Bei der Planung von Version v3.0 haben wir die Entwicklungstrends im Frontend-Ökosystem genau beobachtet und festgestellt, dass Fortschritte in den nativen Browserfähigkeiten neue Möglichkeiten für die Mikrofrontend-Architektur eröffnen:

### Standardisiertes Modulsystem

Mit der umfassenden Unterstützung für [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) durch die wichtigsten Browser und der Reifung der [Import Maps](https://github.com/WICG/import-maps)-Spezifikation hat die Frontend-Entwicklung ein echtes modulares Zeitalter erreicht. Laut den Statistiken von [Can I Use](https://caniuse.com/?search=importmap) liegt die native Unterstützung für ESM in den wichtigsten Browsern (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) bei 93,5 %, was uns folgende Vorteile bietet:

- **Standardisiertes Abhängigkeitsmanagement**: Import Maps bieten die Fähigkeit, Modulabhängigkeiten auf Browserebene aufzulösen, ohne komplexe Laufzeiteinschleusungen
- **Optimierung der Ressourcenladung**: Der native Modulcache-Mechanismus des Browsers verbessert die Ressourcenladeeffizienz erheblich
- **Vereinfachung des Build-Prozesses**: Der auf ESM basierende Entwicklungsmodus macht die Build-Prozesse für Entwicklungs- und Produktionsumgebungen konsistenter

Gleichzeitig können wir durch die Unterstützung des Kompatibilitätsmodus (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14) die Browserabdeckung auf 96,81 % erhöhen, was es uns ermöglicht, hohe Leistung beizubehalten, ohne die Unterstützung für ältere Browser zu opfern.

### Durchbrüche bei Leistung und Isolation

Das native Modulsystem bringt nicht nur Standardisierung, sondern auch eine qualitative Verbesserung von Leistung und Isolation:

- **Keine Laufzeitkosten**: Keine JavaScript-Sandbox-Proxies und Laufzeiteinschleusungen mehr wie in traditionellen Mikrofrontend-Lösungen
- **Zuverlässige Isolationsmechanismen**: Die strikten Modulbereiche von ESM bieten von Natur aus die zuverlässigste Isolationsfähigkeit
- **Präzises Abhängigkeitsmanagement**: Statische Importanalysen machen Abhängigkeitsbeziehungen klarer und die Versionskontrolle präziser

### Auswahl der Build-Tools

Bei der Umsetzung der technischen Lösung war die Auswahl der Build-Tools ein entscheidender Punkt. Nach fast einem Jahr technischer Recherche und Praxis hat sich unsere Wahl wie folgt entwickelt:

1. **Erkundung von Vite**
   - Vorteile: Auf ESM basierender Entwicklungsserver, bietet ein hervorragendes Entwicklungserlebnis
   - Herausforderungen: Unterschiede zwischen Entwicklungs- und Produktions-Builds führten zu gewissen Unsicherheiten

2. **[Rspack](https://www.rspack.dev/) etabliert**
   - Leistungsvorteile: Hochleistungs-Kompilierung basierend auf [Rust](https://www.rust-lang.org/), verbesserte die Build-Geschwindigkeit erheblich
   - Ökosystemunterstützung: Hohe Kompatibilität mit dem Webpack-Ökosystem, reduzierte Migrationskosten
   - ESM-Unterstützung: Durch die Praxis des Rslib-Projekts wurde die Zuverlässigkeit bei ESM-Builds bestätigt

Diese Entscheidung ermöglichte es uns, bei gleichbleibendem Entwicklungserlebnis eine stabilere Produktionsumgebung zu erhalten. Basierend auf der Kombination von ESM und Rspack haben wir schließlich eine leistungsstarke, wenig invasive Mikrofrontend-Lösung entwickelt.

## Zukunftsaussichten

In den zukünftigen Entwicklungsplänen wird das Esmx-Framework sich auf die folgenden drei Richtungen konzentrieren:

### Tiefgehende Optimierung von Import Maps

- **Dynamisches Abhängigkeitsmanagement**: Implementierung einer intelligenten Laufzeitabhängigkeitsversionsverwaltung zur Lösung von Abhängigkeitskonflikten zwischen mehreren Anwendungen
- **Vorlade-Strategien**: Intelligentes Vorladen basierend auf Routing-Analysen zur Verbesserung der Ressourcenladeeffizienz
- **Build-Optimierung**: Automatische Generierung optimaler Import Maps-Konfigurationen zur Reduzierung der manuellen Konfigurationskosten für Entwickler

### Framework-unabhängiges Routing

- **Einheitliche Routing-Abstraktion**: Entwurf einer Framework-unabhängigen Routing-Schnittstelle zur Unterstützung von Vue, React und anderen gängigen Frameworks
- **Mikroanwendungs-Routing**: Implementierung von Routing-Interaktionen zwischen Anwendungen zur Konsistenz von URL und Anwendungszustand
- **Routing-Middleware**: Bereitstellung eines erweiterbaren Middleware-Mechanismus zur Unterstützung von Berechtigungskontrolle, Seitenübergängen und anderen Funktionen

### Best Practices für Framework-übergreifende Kommunikation

- **Beispielanwendungen**: Bereitstellung vollständiger Beispiele für Framework-übergreifende Kommunikation, die Vue, React, Preact und andere gängige Frameworks abdecken
- **Status-Synchronisation**: Leichtgewichtige Statusfreigabelösung basierend auf ESM
- **Event-Bus**: Standardisierter Ereigniskommunikationsmechanismus zur Unterstützung entkoppelter Kommunikation zwischen Anwendungen

Durch diese Optimierungen und Erweiterungen streben wir an, Esmx zu einer noch vollständigeren und benutzerfreundlicheren Mikrofrontend-Lösung zu machen, die Entwicklern ein besseres Entwicklungserlebnis und höhere Entwicklungseffizienz bietet.