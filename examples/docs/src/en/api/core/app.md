---
titleSuffix: Esmx Framework Application Abstraction Interface
description: Detailed introduction to the App interface in the Esmx framework, covering application lifecycle management, static asset handling, and server-side rendering capabilities to help developers understand and utilize core application functionalities.
head:
  - - meta
    - property: keywords
      content: Esmx, App, Application Abstraction, Lifecycle, Static Assets, Server-Side Rendering, API
---

# App

`App` is the application abstraction in the Esmx framework, providing a unified interface for managing application lifecycle, static assets, and server-side rendering.

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

Static asset handling middleware.

Development environment:
- Processes static asset requests for source code
- Supports real-time compilation and hot module replacement
- Uses no-cache policy

Production environment:
- Handles built static assets
- Supports long-term caching for immutable files (.final.xxx)
- Optimized asset loading strategy

```ts
server.use(esmx.middleware);
```

#### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`

Server-side rendering function. Provides different implementations based on environment:
- Production (start): Loads and executes the built server entry file (entry.server) for rendering
- Development (dev): Loads and executes the source server entry file for rendering

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **Type**: `() => Promise<boolean>`

Production build function. Used for asset bundling and optimization. Returns true on successful build, false on failure.

#### destroy

- **Type**: `() => Promise<boolean>`

Resource cleanup function. Used for server shutdown, connection termination, etc. Returns true on successful cleanup, false on failure.