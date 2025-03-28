---
titleSuffix: Esmx Framework Compatibility Guide
description: Detailed introduction to the environmental requirements of the Esmx framework, including Node.js version requirements and browser compatibility instructions, helping developers properly configure their development environment.
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, Browser Compatibility, TypeScript, es-module-shims, Environment Configuration
---

# Environmental Requirements

This document outlines the environmental requirements for using this framework, including Node.js environment and browser compatibility.

## Node.js Environment

The framework requires Node.js version >= 22.6, primarily to support TypeScript type imports (via the `--experimental-strip-types` flag) without additional compilation steps.

## Browser Compatibility

The framework is built in compatibility mode by default to support a wider range of browsers. However, to achieve full browser compatibility, you need to manually add the [es-module-shims](https://github.com/guybedford/es-module-shims) dependency.

### Compatibility Mode (Default)
- 🌐 Chrome: >= 87
- 🔷 Edge: >= 88
- 🦊 Firefox: >= 78
- 🧭 Safari: >= 14

According to [Can I Use](https://caniuse.com/?search=dynamic%20import) statistics, the browser coverage in compatibility mode reaches 96.81%.

### Native Support Mode
- 🌐 Chrome: >= 89
- 🔷 Edge: >= 89
- 🦊 Firefox: >= 108
- 🧭 Safari: >= 16.4

Native support mode offers the following advantages:
- Zero runtime overhead, no additional module loader required
- Native browser parsing, faster execution speed
- Better code splitting and on-demand loading capabilities

According to [Can I Use](https://caniuse.com/?search=importmap) statistics, the browser coverage in native support mode reaches 93.5%.

### Enabling Compatibility Support

::: warning Important Note
Although the framework is built in compatibility mode by default, to achieve full support for older browsers, you need to add the [es-module-shims](https://github.com/guybedford/es-module-shims) dependency to your project.

:::

Add the following script to your HTML file:

```html
<!-- Development Environment -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- Production Environment -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip Best Practices

1. Production Environment Recommendations:
   - Deploy es-module-shims to your own server
   - Ensure resource loading stability and access speed
   - Avoid potential security risks
2. Performance Considerations:
   - Compatibility mode incurs a slight performance overhead
   - Decide whether to enable it based on the browser distribution of your target user base

:::