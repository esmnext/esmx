---
titleSuffix: Esmx Framework Server-Side Rendering Core Mechanism
description: Detailed explanation of the RenderContext mechanism in the Esmx framework, including resource management, HTML generation, and ESM module system, helping developers understand and utilize server-side rendering capabilities.
head:
  - - meta
    - property: keywords
      content: Esmx, Render Context, RenderContext, SSR, Server-Side Rendering, ESM, Resource Management
---

# Render Context

RenderContext is a core class in the Esmx framework, primarily responsible for resource management and HTML generation during server-side rendering (SSR). It features the following key characteristics:

1. **ESM-Based Module System**
   - Adopts modern ECMAScript Modules standards
   - Supports native module imports and exports
   - Enables better code splitting and on-demand loading

2. **Intelligent Dependency Collection**
   - Dynamically collects dependencies based on actual rendering paths
   - Avoids unnecessary resource loading
   - Supports async components and dynamic imports

3. **Precise Resource Injection**
   - Strictly controls resource loading order
   - Optimizes first-screen loading performance
   - Ensures reliable client-side hydration

4. **Flexible Configuration Mechanism**
   - Supports dynamic base path configuration
   - Provides multiple import mapping modes
   - Adapts to various deployment scenarios

## Usage

In the Esmx framework, developers typically don't need to create RenderContext instances directly. Instead, they obtain instances through the `esmx.render()` method:

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // Static file handling
        esmx.middleware(req, res, async () => {
            // Obtain RenderContext instance via esmx.render()
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // Respond with HTML content
            res.end(rc.html);
        });
    });
}
```

## Core Features

### Dependency Collection

RenderContext implements an intelligent dependency collection mechanism that dynamically gathers dependencies based on actually rendered components rather than preloading all potential resources:

#### On-Demand Collection
- Automatically tracks and records module dependencies during component rendering
- Only collects CSS, JavaScript, and other resources actually used by the current page
- Uses `importMetaSet` to precisely record each component's module dependencies
- Supports dependency collection for async components and dynamic imports

#### Automated Processing
- Developers don't need to manually manage dependency collection
- The framework automatically collects dependency information during component rendering
- Processes all collected resources uniformly via the `commit()` method
- Automatically handles circular and duplicate dependencies

#### Performance Optimization
- Avoids loading unused modules, significantly reducing first-screen load time
- Precisely controls resource loading order to optimize rendering performance
- Automatically generates optimal import maps
- Supports resource preloading and on-demand loading strategies

### Resource Injection

RenderContext provides multiple methods for injecting different types of resources, each carefully designed to optimize loading performance:

- `preload()`: Preloads CSS and JS resources with priority configuration support
- `css()`: Injects first-screen stylesheets with critical CSS extraction support
- `importmap()`: Injects module import maps with dynamic path resolution
- `moduleEntry()`: Injects client entry modules with multi-entry configuration support
- `modulePreload()`: Preloads module dependencies with on-demand loading strategies

### Resource Injection Order

RenderContext strictly controls resource injection order based on browser mechanics and performance optimization considerations:

1. Head section:
   - `preload()`: Preloads CSS and JS resources for early discovery by browsers
   - `css()`: Injects first-screen stylesheets to ensure styling is ready when content renders

2. Body section:
   - `importmap()`: Injects module import maps to define ESM module path resolution rules
   - `moduleEntry()`: Injects client entry modules (must execute after importmap)
   - `modulePreload()`: Preloads module dependencies (must execute after importmap)

## Complete Rendering Workflow

A typical RenderContext usage flow:

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. Render page content and collect dependencies
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. Commit dependency collection
    await rc.commit();
    
    // 3. Generate complete HTML
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

RenderContext provides a flexible dynamic base path configuration mechanism that supports runtime setting of static resource base paths:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // Set base path
    params: {
        url: req.url
    }
});
```

This mechanism is particularly useful for:

1. **Multilingual Site Deployment**
   ```
   main-domain.com      → Default language
   main-domain.com/cn/  → Chinese site
   main-domain.com/en/  → English site
   ```

2. **Micro-Frontend Applications**
   - Supports flexible deployment of sub-applications under different paths
   - Facilitates integration with various host applications

### Import Map Modes

RenderContext offers two import map modes:

1. **Inline Mode** (default)
   - Embeds import maps directly in HTML
   - Ideal for small applications, reducing additional network requests
   - Immediately available when page loads

2. **JS Mode**
   - Loads import maps via external JavaScript files
   - Suitable for large applications, leveraging browser caching
   - Supports dynamic map content updates

Configure the appropriate mode:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### Entry Function Configuration

RenderContext supports specifying server-side rendering entry functions via `entryName`:

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // Specify mobile entry function
    params: {
        url: req.url
    }
});
```

This mechanism is particularly useful for:

1. **Multi-Template Rendering**
   ```ts title="src/entry.server.ts"
   // Mobile entry function
   export const mobile = async (rc: RenderContext) => {
       // Mobile-specific rendering logic
   };

   // Desktop entry function
   export const desktop = async (rc: RenderContext) => {
       // Desktop-specific rendering logic
   };
   ```

2. **A/B Testing**
   - Supports different rendering logic for the same page
   - Facilitates user experience experiments
   - Enables flexible switching between rendering strategies

3. **Special Rendering Requirements**
   - Supports custom rendering flows for specific pages
   - Adapts to performance optimization needs across scenarios
   - Enables finer-grained rendering control

## Best Practices

1. **Obtaining RenderContext Instances**
   - Always obtain instances via `esmx.render()`
   - Pass appropriate parameters as needed
   - Avoid manual instance creation

2. **Dependency Collection**
   - Ensure all modules correctly call `importMetaSet.add(import.meta)`
   - Call `commit()` immediately after rendering completes
   - Use async components and dynamic imports wisely to optimize first-screen loading

3. **Resource Injection**
   - Strictly follow resource injection order
   - Never inject CSS in the body
   - Ensure importmap precedes moduleEntry

4. **Performance Optimization**
   - Use preload for critical resources
   - Apply modulePreload judiciously to optimize module loading
   - Avoid unnecessary resource loading
   - Leverage browser caching mechanisms to optimize loading performance