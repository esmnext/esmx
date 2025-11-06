---
titleSuffix: "Esmx Framework App Interface"
description: "Detailed reference for the Esmx App interface covering lifecycle, static assets handling, and server-side rendering to help developers use core app features."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, App, lifecycle, static assets, SSR, API"
---

# App

`App` is the application abstraction in Esmx, providing a unified interface for lifecycle management, static assets, and server-side rendering.

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

- Type: `Middleware`

Static assets middleware.

Development:
- Serves static assets from source
- Supports on-demand compilation and HMR
- Uses no-cache strategy

Production:
- Serves built static assets
- Supports long-term caching for immutable files (.final.xxx)
- Optimized asset loading strategy

```ts
server.use(esmx.middleware);
```

#### render

- Type: `(options?: RenderContextOptions) => Promise<RenderContext>`

Server-side rendering function with environment-specific behavior:
- Production (start): loads built server entry (entry.server) for rendering
- Development (dev): loads server entry from source

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- Type: `() => Promise<boolean>`

Production build. Handles bundling and optimizations. Resolves to `true` on success, `false` on failure.

#### destroy

- Type: `() => Promise<boolean>`

Resource cleanup. Closes servers and disconnects. Resolves to `true` on success, `false` on failure.
