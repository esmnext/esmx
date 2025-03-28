---
titleSuffix: Esmx Framework Kompatibilitätsleitfaden
description: Detaillierte Anforderungen an die Umgebung des Esmx-Frameworks, einschließlich Node.js-Versionsanforderungen und Browserkompatibilitätshinweise, um Entwicklern bei der korrekten Konfiguration der Entwicklungsumgebung zu helfen.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Browserkompatibilität, TypeScript, es-module-shims, Umgebungskonfiguration
---

# Umgebungsanforderungen

Dieses Dokument beschreibt die Umgebungsanforderungen für die Verwendung dieses Frameworks, einschließlich der Node.js-Umgebung und der Browserkompatibilität.

## Node.js-Umgebung

Das Framework erfordert Node.js Version >= 22.6, hauptsächlich zur Unterstützung von TypeScript-Typimporten (über das `--experimental-strip-types`-Flag), ohne zusätzliche Kompilierungsschritte.

## Browserkompatibilität

Das Framework wird standardmäßig im Kompatibilitätsmodus erstellt, um eine breitere Browserunterstützung zu gewährleisten. Es ist jedoch zu beachten, dass für die vollständige Browserkompatibilität die manuelle Hinzufügung der [es-module-shims](https://github.com/guybedford/es-module-shims)-Abhängigkeit erforderlich ist.

### Kompatibilitätsmodus (Standard)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

Laut den Statistiken von [Can I Use](https://caniuse.com/?search=dynamic%20import) beträgt die Browserabdeckung im Kompatibilitätsmodus 96,81%.

### Native Unterstützung
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Der native Unterstützungsmodus bietet folgende Vorteile:
- Keine Laufzeitkosten, kein zusätzlicher Modullader erforderlich
- Native Browseranalyse, schnellere Ausführungsgeschwindigkeit
- Bessere Code-Splitting- und On-Demand-Loading-Fähigkeiten

Laut den Statistiken von [Can I Use](https://caniuse.com/?search=importmap) beträgt die Browserabdeckung im nativen Unterstützungsmodus 93,5%.

### Aktivierung der Kompatibilitätsunterstützung

::: warning Wichtiger Hinweis
Obwohl das Framework standardmäßig im Kompatibilitätsmodus erstellt wird, ist für die vollständige Unterstützung älterer Browser die manuelle Hinzufügung der [es-module-shims](https://github.com/guybedford/es-module-shims)-Abhängigkeit in Ihrem Projekt erforderlich.

:::

Fügen Sie das folgende Skript in Ihre HTML-Datei ein:

```html
<!-- Entwicklungsumgebung -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Produktionsumgebung -->
<script async src="/pfad/zu/es-module-shims.js"></script>
```

::: tip Best Practices

1. Empfehlungen für die Produktionsumgebung:
   - Stellen Sie es-module-shims auf Ihrem eigenen Server bereit
   - Stellen Sie die Stabilität und Zugriffsgeschwindigkeit der Ressourcen sicher
   - Vermeiden Sie potenzielle Sicherheitsrisiken
2. Leistungsüberlegungen:
   - Der Kompatibilitätsmodus verursacht geringfügige Leistungseinbußen
   - Entscheiden Sie basierend auf der Browserverteilung Ihrer Zielgruppe, ob Sie ihn aktivieren möchten

:::