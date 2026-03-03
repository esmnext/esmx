---
titleSuffix: "Route API Reference"
description: "Complete API reference for the @esmx/router Route object — represents a resolved route location with path, params, query, meta, and matched config."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx route, route object, route params, route query, route matching, route meta, SSR route"
---

# Route

A Route object represents a resolved route location. It contains parsed URL information, matched route configs, parameters, query strings, and metadata. Route objects are immutable — each navigation creates a new one.

## Properties

### path

- **Type**: `string`
- **Read-only**: `true`

The decoded pathname relative to the router base. For unmatched routes, returns the full `url.pathname`.

```ts
// With base: http://localhost/app/
// URL: http://localhost/app/user/123
route.path // '/user/123'
```

### fullPath

- **Type**: `string`
- **Read-only**: `true`

The full path including search and hash: `path + search + hash`.

```ts
route.fullPath // '/user/123?tab=posts#section'
```

### url

- **Type**: `URL`
- **Read-only**: `true`

The full resolved URL object.

```ts
route.url.href     // 'http://localhost/user/123?tab=posts#section'
route.url.pathname // '/user/123'
route.url.origin   // 'http://localhost'
```

### pathname

- **Type**: `string`
- **Read-only**: `true`

Alias for `url.pathname`. The raw URL pathname (not decoded, not base-stripped).

```ts
route.pathname // '/app/user/123'
route.path     // '/user/123' (base-stripped and decoded)
```

### href

- **Type**: `string`
- **Read-only**: `true`

Alias for `url.href`. The full URL string.

```ts
route.href // 'http://localhost/user/123?tab=posts#section'
```

### params

- **Type**: `Record<string, string>`
- **Read-only**: `true`

Dynamic route parameters extracted from the path. For repeated parameters, returns the first match.

```ts
// Route: /user/:id
// URL: /user/42
route.params.id // '42'

// Route: /blog/:year/:month/:slug
// URL: /blog/2026/02/hello
route.params.year  // '2026'
route.params.month // '02'
route.params.slug  // 'hello'
```

### paramsArray

- **Type**: `Record<string, string[]>`
- **Read-only**: `true`

Same as `params` but always returns arrays. Useful for repeated parameters.

### query

- **Type**: `Record<string, string | undefined>`
- **Read-only**: `true`

Parsed URL query parameters. For repeated keys, returns the first value.

```ts
// URL: /search?q=hello&page=2
route.query.q    // 'hello'
route.query.page // '2'
```

### queryArray

- **Type**: `Record<string, string[] | undefined>`
- **Read-only**: `true`

Same as `query` but always returns arrays. Useful for repeated query keys.

```ts
// URL: /filter?tag=js&tag=ts
route.queryArray.tag // ['js', 'ts']
```

### hash

- **Type**: `string`
- **Read-only**: `true`

The URL hash (including the `#` prefix).

```ts
// URL: /page#section
route.hash // '#section'
```

### meta

- **Type**: `RouteMeta`
- **Read-only**: `true`

Custom metadata from the matched [route config](./route-config#meta). Returns `{}` if no route matched.

```ts
// Route config: { path: '/admin', meta: { requiresAuth: true } }
route.meta.requiresAuth // true
```

### matched

- **Type**: `readonly RouteParsedConfig[]`
- **Read-only**: `true`

Array of all matched route configurations, from parent to child. Empty array if no route matched.

```ts
// URL: /user/123 matching /user/:id
route.matched.length  // 1 (or more with nested routes)
route.matched[0].path // '/user/:id'
```

### config

- **Type**: `RouteParsedConfig | null`
- **Read-only**: `true`

The last (deepest) matched route config, or `null` if no route matched.

### type

- **Type**: `RouteType`
- **Read-only**: `true`

How this route was navigated to. See [`RouteType`](./types#routetype) for all possible values.

- `RouteType.push`: Triggered by `router.push()`
- `RouteType.replace`: Triggered by `router.replace()`
- `RouteType.back`: Triggered by `router.back()`
- `RouteType.forward`: Triggered by `router.forward()`
- `RouteType.go`: Triggered by `router.go(n)`
- `RouteType.restartApp`: Triggered by `router.restartApp()`
- `RouteType.pushWindow`: Triggered by `router.pushWindow()`
- `RouteType.replaceWindow`: Triggered by `router.replaceWindow()`
- `RouteType.pushLayer`: Triggered by `router.pushLayer()`
- `RouteType.unknown`: Triggered by browser popstate event

### state

- **Type**: `RouteState`
- **Read-only**: `true`

Arbitrary state data associated with this navigation, passed via [`RouteLocation.state`](./types#routelocation).

```ts
await router.push({ path: '/page', state: { scrollY: 100 } });
// Next route:
router.route.state.scrollY // 100
```

### statusCode

- **Type**: `number | null`
- **Read-only**: `true`

HTTP status code for SSR responses. Set via [`RouteLocation.statusCode`](./types#routelocation).

```ts
// In a redirect route
{ path: '/old', redirect: { path: '/new', statusCode: 301 } }
```

### isPush

- **Type**: `boolean`
- **Read-only**: `true`

Whether this navigation added a new history entry (type is `'push'`, `'pushWindow'`, or `'pushLayer'`).

### keepScrollPosition

- **Type**: `boolean`
- **Read-only**: `true`

Whether scroll position should be maintained after this navigation. When `true`, the router will not scroll to top.

### layer

- **Type**: `RouteLayerOptions | null`
- **Read-only**: `true`

Layer options if this route was navigated via [`pushLayer()`](./router#pushlayer), otherwise `null`.

### confirm

- **Type**: `RouteConfirmHook | null`
- **Read-only**: `true`

Per-navigation confirm hook passed via [`RouteLocation.confirm`](./types#routelocation).

### req

- **Type**: `IncomingMessage | null`
- **Read-only**: `true`

HTTP request object (SSR only). `null` in the browser.

### res

- **Type**: `ServerResponse | null`
- **Read-only**: `true`

HTTP response object (SSR only). `null` in the browser.

### context

- **Type**: `Record<string | symbol, unknown>`
- **Read-only**: `true`

Router shared context object.

## Methods

### clone()

- **Returns**: `Route`

Create a copy of this route with the same configuration and state.
