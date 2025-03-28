---
titleSuffix: Esmx Framework Client-Side Rendering Implementation Guide
description: Detailed guide on the client-side rendering mechanism of the Esmx framework, including static build, deployment strategies, and best practices, helping developers achieve efficient front-end rendering in serverless environments.
head:
  - - meta
    - property: keywords
      content: Esmx, Client-Side Rendering, CSR, Static Build, Front-End Rendering, Serverless Deployment, Performance Optimization
---

# Client-Side Rendering

Client-Side Rendering (CSR) is a technique where page rendering is executed in the browser. In Esmx, when your application cannot deploy a Node.js server instance, you can choose to generate a static `index.html` file during the build phase to achieve pure client-side rendering.

## Use Cases

The following scenarios recommend using client-side rendering:

- **Static Hosting Environments**: Such as GitHub Pages, CDN, and other hosting services that do not support server-side rendering
- **Simple Applications**: Small applications with low requirements for first-load speed and SEO
- **Development Environment**: For quick preview and debugging during the development phase

## Configuration Instructions

### HTML Template Configuration

In client-side rendering mode, you need to configure a generic HTML template. This template will serve as the container for your application, including necessary resource references and mounting points.

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // Commit dependency collection
    await rc.commit();
    
    // Configure HTML template
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // Preload resources
    <title>Esmx</title>
    ${rc.css()}               // Inject styles
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // Import map
    ${rc.moduleEntry()}       // Entry module
    ${rc.modulePreload()}     // Module preload
</body>
</html>
`;
};
```

### Static HTML Generation

To use client-side rendering in a production environment, you need to generate a static HTML file during the build phase. Esmx provides a `postBuild` hook function to achieve this:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // Generate static HTML file
        const rc = await esmx.render();
        // Write HTML file
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```