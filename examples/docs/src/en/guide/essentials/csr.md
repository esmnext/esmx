---
titleSuffix: "Client-Side Rendering (CSR)"
description: "CSR mechanism and build artifact generation in Esmx, suitable for scenarios where a server-side deployment is not available."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Client-side Rendering, CSR, Static Build, Frontend Rendering, Serverless, Performance Optimization"
---

# Client-Side Rendering

Client-Side Rendering (CSR) renders pages in the user's browser. When Node.js services are not available, generate a static `index.html` at build time to enable pure client-side rendering.

## When to Use

Recommended scenarios:

- **Static hosting**: GitHub Pages, CDNs, and other hosts without SSR
- **Simple apps**: small apps with low first-paint and SEO requirements
- **Development**: quick preview and debugging during development

## Configuration

### HTML Template

The template should inject resources in order: `preload` and `css` in `head`, `importmap`, `moduleEntry`, and `modulePreload` in `body`.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}
    <title>Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

### Static HTML Generation

Generate static HTML files during the build with a `postBuild` hook:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        const rc = await esmx.render();
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```
