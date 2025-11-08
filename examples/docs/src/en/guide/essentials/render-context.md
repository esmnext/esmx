---
titleSuffix: "RenderContext (Rendering Context)"
description: "RenderContext's resource management and HTML generation mechanism, covering dependency collection and injection order."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, rendering context, RenderContext, SSR, server-side rendering, ESM, resource management"
---

# Rendering Context

RenderContext is responsible for resource management and HTML generation during server-side rendering, providing module dependency collection and resource injection order constraints.

## Usage

Get an instance through `esmx.render()`:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        esmx.middleware(req, res, async () => {
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            res.end(rc.html);
        });
    });
}
```

## Main Features

### Dependency Collection

RenderContext collects module and resource dependencies during component rendering, avoiding preloading all resources.

#### On-Demand Collection
- Automatically tracks and records module dependencies during actual component rendering
- Only collects CSS, JavaScript, and other resources actually used in the current page rendering
- Precisely records module dependency relationships for each component through `importMetaSet`
- Supports dependency collection for async components and dynamic imports

#### Automated Processing
- Developers don't need to manually manage the dependency collection process
- The framework automatically collects dependency information during component rendering
- Uniformly processes all collected resources through the `commit()` method
- Automatically handles circular dependencies and duplicate dependencies

#### Performance Optimization
- Avoids loading unused modules, significantly reducing first-screen loading time
- Precisely controls resource loading order, optimizing page rendering performance
- Automatically generates optimal Import Maps
- Supports resource preloading and on-demand loading strategies

### Resource Injection

RenderContext provides multiple methods to inject different types of resources, each carefully designed to optimize resource loading performance:

- `preload()`: Preloads CSS and JS resources, supports priority configuration
- `css()`: Injects first-screen stylesheets, supports critical CSS extraction
- `importmap()`: Injects module import maps, supports dynamic path resolution
- `moduleEntry()`: Injects client entry module, supports multi-entry configuration
- `modulePreload()`: Preloads module dependencies, supports on-demand loading strategy

### Resource Injection Order

RenderContext strictly controls resource injection order. This order design is based on browser working principles and performance optimization considerations:

1. head section:
   - `preload()`: Preloads CSS and JS resources, letting the browser discover and start loading these resources as early as possible
   - `css()`: Injects first-screen stylesheets, ensuring page styles are in place when content renders

2. body section:
   - `importmap()`: Injects module import maps, defining ESM module path resolution rules
   - `moduleEntry()`: Injects client entry module, must be executed after importmap
   - `modulePreload()`: Preloads module dependencies, must be executed after importmap

## Complete Rendering Flow

A typical flow is as follows:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });
    await rc.commit();
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
            ${rc.css()}
        </head>
        <body>
            ${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
```

## Advanced Features

### Base Path Configuration

RenderContext provides a flexible dynamic base path configuration mechanism, supporting dynamic setting of static resource base paths at runtime:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',
    params: {
        url: req.url
    }
});
```

This mechanism is particularly suitable for the following scenarios:

1. **Multi-Language Site Deployment**
   ```
   main-domain.com      → Default language
   main-domain.com/cn/  → Chinese site
   main-domain.com/en/  → English site
   ```

2. **Micro-Frontend Applications**
   - Supports flexible deployment of sub-applications under different paths
   - Facilitates integration into different host applications

### Import Map Mode

RenderContext provides two import map modes:

1. **Inline Mode** (default)
   - Embeds import map directly into HTML
   - Suitable for small applications, reduces additional network requests
   - Immediately available when page loads

2. **JS Mode**
   - Loads import map through external JavaScript file
   - Suitable for large applications, can utilize browser caching mechanism
   - Supports dynamic update of mapping content

Can choose appropriate mode through configuration:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',
    params: {
        url: req.url
    }
});
```

### Entry Function Configuration

RenderContext supports specifying the server-side rendering entry function through the `entryName` configuration:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',
    params: {
        url: req.url
    }
});
```

This mechanism is particularly suitable for the following scenarios:

1. **Multi-Template Rendering**
```ts title="src/entry.server.ts"
   // Mobile entry function
   export const mobile = async (rc: RenderContext) => {};

   export const desktop = async (rc: RenderContext) => {};
```

2. **A/B Testing**
   - Supports using different rendering logic for the same page
   - Facilitates user experience experiments
   - Flexibly switch different rendering strategies

3. **Special Rendering Requirements**
   - Supports certain pages using custom rendering processes
   - Adapts to performance optimization needs of different scenarios
   - Implements more fine-grained rendering control

## Best Practices

1. **Get RenderContext Instance**
   - Always get instance through the `esmx.render()` method
   - Pass appropriate parameters as needed
   - Avoid manually creating instances

2. **Dependency Collection**
   - Ensure all modules correctly call `importMetaSet.add(import.meta)`
   - Call `commit()` method immediately after rendering completes
   - Reasonably use async components and dynamic imports to optimize first-screen loading

3. **Resource Injection**
   - Strictly follow resource injection order
   - Don't inject CSS in body
   - Ensure importmap comes before moduleEntry

4. **Performance Optimization**
   - Use preload to preload critical resources
   - Reasonably use modulePreload to optimize module loading
   - Avoid unnecessary resource loading
   - Utilize the browser caching mechanism to optimize loading performance