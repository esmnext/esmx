---
titleSuffix: "Environment and Compatibility"
description: "Details on Esmx's environment requirements and compatibility, covering prerequisites for both Node.js and browsers."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Node.js, browser compatibility, TypeScript, es-module-shims, environment configuration"
---

# Environment Requirements

This document describes the environment requirements for using this framework, including the Node.js environment and browser compatibility.

## Node.js Environment

Requires Node.js version `>= 24`.

::: warning Warning
Versions below 24 are not supported; installing dependencies will fail.
:::

## Browser Compatibility

The compatibility strategy is divided into two modes:
- Compatibility Mode: Provides backward compatibility for dynamic imports and `import.meta` via es-module-shims.
- Native Import Maps Mode: Relies on the browser's native Import Maps capability.

### Compatibility Mode (Default)

| Browser | Minimum Version |
|-------|----------|
| Chrome | >= 64 |
| Edge   | >= 79 |
| Firefox| >= 67 |
| Safari | >= 11.1 |

Data source: Can I Use (Dynamic Import and `import.meta`), retrieved November 2025.

To enable compatibility mode, you need to add the [es-module-shims](https://github.com/guybedford/es-module-shims) script to your HTML. It polyfills features like dynamic import and `import.meta`.

```html
<script async src="https://unpkg.com/es-module-shims/dist/es-module-shims.js"></script>
```

::: tip Recommendation

- For production stability, we recommend hosting this script on your own server or CDN.
- Before enabling this mode, consider the trade-offs between compatibility and cost, based on your target users' browser demographics.

:::

### Native Import Maps Mode

| Browser | Minimum Version |
|-------|----------|
| Chrome | >= 89 |
| Edge   | >= 89 |
| Firefox| >= 108 |
| Safari | >= 16.4 |

Data source: Can I Use (Import Maps), retrieved November 2025.
