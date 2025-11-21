---
titleSuffix: "CSR Rendering and Static Build"
description: "Esmx's Client-Side Rendering mechanism and build artifact generation method, suitable for scenarios where server-side deployment is not possible."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Client-Side Rendering, CSR, static build, frontend rendering, serverless deployment, performance optimization"
---

# Client-Side Rendering

Client-Side Rendering (CSR) executes page rendering in the browser. When a Node.js service cannot be deployed, static `index.html` can be generated during the build phase to achieve pure Client-Side Rendering.

## Usage Scenarios

The following scenarios are recommended for using Client-Side Rendering:

- **Static Hosting Environments**: Hosting services that don't support Server-Side Rendering, such as GitHub Pages, CDNs, etc.
- **Simple Applications**: Small applications with minimal requirements for first-screen loading speed and SEO
- **Development Environment**: Quickly preview and debug applications during development

## Configuration Instructions

### HTML Template Configuration

The template should include resource injection and entry order: `preload` and `css` in `head`, while `importmap`, `moduleEntry`, and `modulePreload` should be in `body`.

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

Static HTML files can be generated during the build phase through the `postBuild` hook:

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
