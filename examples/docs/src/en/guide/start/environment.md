---
titleSuffix: "Environment and Compatibility"
description: "Environment requirements and compatibility for Esmx across Node.js and browsers, covering prerequisites and strategy choices."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Node.js, Browser Compatibility, TypeScript, es-module-shims, Environment Config"
---

# Environment Requirements

This document describes the required environment for using the framework, including Node.js and browser compatibility.

## Node.js

Node.js `>= 24` is required to support type imports and runtime features, reducing extra compilation steps.

## Browser Compatibility

Two modes are supported:
- Compatibility mode: backward compatibility for dynamic imports and `import.meta` via es-module-shims.
- Native Import Maps mode: relies on native Import Maps support in browsers.

### Compatibility Mode (default)

| Browser | Min Version |
|-------|----------|
| Chrome | >= 64 |
| Edge   | >= 79 |
| Firefox| >= 67 |
| Safari | >= 11.1 |

Source: Can I Use (Dynamic Import and `import.meta`), retrieved November 2025.

### Native Import Maps Mode

| Browser | Min Version |
|-------|----------|
| Chrome | >= 89 |
| Edge   | >= 89 |
| Firefox| >= 108 |
| Safari | >= 16.4 |

Source: Can I Use (Import Maps), retrieved November 2025.

### Enable Compatibility Support

::: warning
To support older browsers, add [es-module-shims](https://github.com/guybedford/es-module-shims) to the project.
:::

```html
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>
```

::: tip
- Deploy the script to your own server in production.
- Decide whether to enable compatibility mode based on target user browser distribution.
:::
