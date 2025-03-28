---
titleSuffix: Esmx Framework Application Abstraction Interface
description: Detailed introduction to the App interface of the Esmx framework, including application lifecycle management, static resource handling, and server-side rendering functionality, helping developers understand and use core application features.
head:
  - - meta
    - property: keywords
      content: Esmx, App, Application Abstraction, Lifecycle, Static Resources, Server-Side Rendering, API
---

# App

`App` is the application abstraction in the Esmx framework, providing a unified interface to manage the application lifecycle, static resources, and server-side rendering.

```ts title="entry.node.ts"
export default {
  // Development environment configuration
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // Custom Rspack configuration
        }
      })
    );
  }
}
```

## Type Definitions
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **Type**: `Middleware`

Static resource handling middleware.

Development environment:
- Handles static resource requests for source code
- Supports real-time compilation and hot updates
- Uses no-cache policy

Production environment:
- Handles built static resources
- Supports long-term caching for immutable files (.final.xxx)
- Optimized resource loading strategy

```ts
server.use(esmx.middleware);
```

#### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Server-side rendering function. Provides different implementations based on the environment:
- Production environment (start): Loads and executes the built server entry file (entry.server) for rendering
- Development environment (dev): Loads and executes the server entry file from the source code for rendering

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Type**: `() => Promise<boolean>`

Production environment build function. Used for resource bundling and optimization. Returns true on successful build, false on failure.

#### destroy

- **Type**: `() => Promise<boolean>`

Resource cleanup function. Used for shutting down servers, disconnecting connections, etc. Returns true on successful cleanup, false on failure.