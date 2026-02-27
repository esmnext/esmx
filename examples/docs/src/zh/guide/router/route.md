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

### path {#path}

```ts
readonly path: string;
```

The decoded pathname relative to the router base. For unmatched routes, returns the full `url.pathname`.

#### Example

```ts
// With base: http://localhost/app/
// URL: http://localhost/app/user/123
route.path // '/user/123'
```

### fullPath {#fullpath}

```ts
readonly fullPath: string;
```

The full path including search and hash: `path + search + hash`.

#### Example

```ts
route.fullPath // '/user/123?tab=posts#section'
```

### url {#url}

```ts
readonly url: URL;
```

The full resolved URL object.

#### Example

```ts
route.url.href     // 'http://localhost/user/123?tab=posts#section'
route.url.pathname // '/user/123'
route.url.origin   // 'http://localhost'
```

### pathname {#pathname}

```ts
readonly pathname: string;
```

Alias for `url.pathname`. The raw URL pathname (not decoded, not base-stripped).

#### Example

```ts
route.pathname // '/app/user/123'
route.path     // '/user/123' (base-stripped and decoded)
```

### href {#href}

```ts
readonly href: string;
```

Alias for `url.href`. The full URL string.

#### Example

```ts
route.href // 'http://localhost/user/123?tab=posts#section'
```

### params {#params}

```ts
readonly params: Record<string, string>;
```

Dynamic route parameters extracted from the path. For repeated parameters, returns the first match.

#### Example

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

### paramsArray {#paramsarray}

```ts
readonly paramsArray: Record<string, string[]>;
```

Same as `params` but always returns arrays. Useful for repeated parameters.

### query {#query}

```ts
readonly query: Record<string, string | undefined>;
```

Parsed URL query parameters. For repeated keys, returns the first value.

#### Example

```ts
// URL: /search?q=hello&page=2
route.query.q    // 'hello'
route.query.page // '2'
```

### queryArray {#queryarray}

```ts
readonly queryArray: Record<string, string[] | undefined>;
```

Same as `query` but always returns arrays. Useful for repeated query keys.

#### Example

```ts
// URL: /filter?tag=js&tag=ts
route.queryArray.tag // ['js', 'ts']
```

### hash {#hash}

```ts
readonly hash: string;
```

The URL hash (including the `#` prefix).

#### Example

```ts
// URL: /page#section
route.hash // '#section'
```

### meta {#meta}

```ts
readonly meta: RouteMeta;
```

Custom metadata from the matched [route config](./route-config#meta). Returns `{}` if no route matched.

#### Example

```ts
// Route config: { path: '/admin', meta: { requiresAuth: true } }
route.meta.requiresAuth // true
```

### matched {#matched}

```ts
readonly matched: readonly RouteParsedConfig[];
```

Array of all matched route configurations, from parent to child. Empty array if no route matched.

#### Example

```ts
// URL: /user/123 matching /user/:id
route.matched.length  // 1 (or more with nested routes)
route.matched[0].path // '/user/:id'
```

### config {#config}

```ts
readonly config: RouteParsedConfig | null;
```

The last (deepest) matched route config, or `null` if no route matched.

### type {#type}

```ts
readonly type: RouteType;
```

How this route was navigated to. See [`RouteType`](./types#routetype) for all possible values.

| Value | Triggered by |
|-------|-------------|
| `RouteType.push` | `router.push()` |
| `RouteType.replace` | `router.replace()` |
| `RouteType.back` | `router.back()` |
| `RouteType.forward` | `router.forward()` |
| `RouteType.go` | `router.go(n)` |
| `RouteType.restartApp` | `router.restartApp()` |
| `RouteType.pushWindow` | `router.pushWindow()` |
| `RouteType.replaceWindow` | `router.replaceWindow()` |
| `RouteType.pushLayer` | `router.pushLayer()` |
| `RouteType.unknown` | Browser popstate event |

### state {#state}

```ts
readonly state: RouteState;
```

Arbitrary state data associated with this navigation, passed via [`RouteLocation.state`](./types#routelocation).

#### Example

```ts
await router.push({ path: '/page', state: { scrollY: 100 } });
// Next route:
router.route.state.scrollY // 100
```

### statusCode {#statuscode}

```ts
readonly statusCode: number | null;
```

HTTP status code for SSR responses. Set via [`RouteLocation.statusCode`](./types#routelocation).

#### Example

```ts
// In a redirect route
{ path: '/old', redirect: { path: '/new', statusCode: 301 } }
```

### isPush {#ispush}

```ts
readonly isPush: boolean;
```

Whether this navigation added a new history entry (type is `'push'`, `'pushWindow'`, or `'pushLayer'`).

### keepScrollPosition {#keepscrollposition}

```ts
readonly keepScrollPosition: boolean;
```

Whether scroll position should be maintained after this navigation. When `true`, the router will not scroll to top.

### layer {#layer}

```ts
readonly layer: RouteLayerOptions | null;
```

Layer options if this route was navigated via [`pushLayer()`](./router#pushlayer), otherwise `null`.

### confirm {#confirm}

```ts
readonly confirm: RouteConfirmHook | null;
```

Per-navigation confirm hook passed via [`RouteLocation.confirm`](./types#routelocation).

### req {#req}

```ts
readonly req: IncomingMessage | null;
```

HTTP request object (SSR only). `null` in the browser.

### res {#res}

```ts
readonly res: ServerResponse | null;
```

HTTP response object (SSR only). `null` in the browser.

### context {#context}

```ts
readonly context: Record<string | symbol, unknown>;
```

Router shared context object.

## Methods

### clone {#clone}

```ts
clone(): Route;
```

Create a copy of this route with the same configuration and state.

#### Returns

A new [`Route`](#) instance with identical properties.
