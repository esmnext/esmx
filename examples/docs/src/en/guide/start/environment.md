---
titleSuffix: "Environment and Compatibility"
description: "Esmx environment requirements and compatibility notes, covering prerequisites and selection strategies for both Node.js and browser sides."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Node.js, browser compatibility, TypeScript, es-module-shims, environment configuration"
---

# Environment Requirements

This document describes the environment requirements for using this framework, including Node.js environment and browser compatibility.

## Node.js Environment

Requires Node.js version `>= 24` to support type imports and runtime capabilities, reducing additional compilation steps.

## Browser Compatibility

The compatibility strategy has two modes:
- Compatibility mode: Provides backward compatibility for dynamic imports and `import.meta` through es-module-shims.
- Native Import Maps mode: Relies on native browser Import Maps capability.

### Compatibility Mode (Default)

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | >= 64 |
| Edge   | >= 79 |
| Firefox| >= 67 |
| Safari | >= 11.1 |

Data sources: Can I Use (Dynamic Import and `import.meta`), retrieval date: 2025-11.

### Native Import Maps Mode

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | >= 89 |
| Edge   | >= 89 |
| Firefox| >= 108 |
| Safari | >= 16.4 |

Data sources: Can I Use (Import Maps), retrieval date: 2025-11.

### Enabling Compatibility Support

::: warning Note

To support older browsers, please add [es-module-shims](https://github.com/guybedford/es-module-shims) to your project.

:::

```html
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>
```

::: tip Recommendation

- In production, deploy scripts to your own server.
- Enable compatibility mode based on your target users' browser distribution.

:::