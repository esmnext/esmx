---
titleSuffix: "App Core Application Interface"
description: "Detailed introduction to Esmx framework's App interface, including application lifecycle management, static resource handling, and Server-Side Rendering functionality, helping developers understand and use the core application features."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, App, application abstraction, lifecycle, static resources, Server-Side Rendering, API"
---

# App

`App` is the application abstraction for the Esmx framework, providing a unified interface to manage application lifecycle, static resources, and Server-Side Rendering.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
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

Development Environment:
- Handles static resource requests from source code
- Supports real-time compilation and hot reloading
- Uses no-cache caching strategy

Production Environment:
- Handles static resources after building
- Supports long-term caching for immutable files (.final.xxx)
- Optimized resource loading strategy

```ts
server.use(esmx.middleware);
```

#### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Server-Side Rendering function. Provides different implementations based on the runtime environment:
- Production environment (start): Loads the built server entry file (entry.server) to execute rendering
- Development environment (dev): Loads the server entry file from source code to execute rendering

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Type**: `() => Promise<boolean>`

Production environment build function. Used for resource bundling and optimization. Returns true upon successful build, false upon failure.

#### destroy

- **Type**: `() => Promise<boolean>`

Resource cleanup function. Used to close the server, disconnect connections, etc. Returns true upon successful cleanup, false upon failure.
