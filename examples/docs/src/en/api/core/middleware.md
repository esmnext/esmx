---
titleSuffix: "@esmx/core HTTP Middleware API"
description: "Reference for @esmx/core middleware: the Middleware type, createMiddleware, mergeMiddlewares, and isImmutableFile for serving module static assets with correct caching."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, middleware, createMiddleware, mergeMiddlewares, isImmutableFile, static assets, cache control, SSR server"
---

# Middleware

`@esmx/core` exposes a small set of connect-style middleware helpers used to serve a module's static assets (the built `dist/client` output) with correct cache headers. These are what `esmx.middleware` is built from, and you can compose them directly when wiring your own HTTP server.

## `Middleware`

```ts
type Middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
) => void;
```

A connect-style middleware: it receives the Node request and response plus a `next` callback, and either handles the request or calls `next()` to pass control on. It is compatible with `http`, Express, Koa (via adapters), and most Node servers.

```ts
const loggerMiddleware: Middleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
```

## `createMiddleware(esmx)`

```ts
function createMiddleware(esmx: Esmx): Middleware;
```

Creates the middleware that serves static resources for every module in the Esmx instance. It:

- builds a static-file handler per module from the module configuration,
- applies cache control per request, and
- serves content-hashed (immutable) files with long-lived caching.

```ts
import { Esmx, createMiddleware } from '@esmx/core';

const esmx = new Esmx();
const middleware = createMiddleware(esmx);

// Use it in any Node HTTP server
server.use(middleware);
```

## `mergeMiddlewares(middlewares)`

```ts
function mergeMiddlewares(middlewares: Middleware[]): Middleware;
```

Composes an array of middlewares into a single middleware, running them in order until one handles the request or the chain ends (calling the outer `next`). Useful for combining `createMiddleware`'s output with your own handlers.

```ts
import { mergeMiddlewares } from '@esmx/core';

const app = mergeMiddlewares([loggerMiddleware, createMiddleware(esmx)]);
```

## `isImmutableFile(filename)`

```ts
function isImmutableFile(filename: string): boolean;
```

Returns `true` when a file path matches Esmx's content-hashed (immutable) asset pattern — i.e. safe to serve with `Cache-Control: immutable, max-age=31536000`. `createMiddleware` uses it internally to decide the cache policy for each asset.

## Related

- [Esmx](/api/core/esmx) — the core class whose `middleware` is composed from these helpers
- [RenderContext](/api/core/render-context) — how rendered HTML references the assets these serve
