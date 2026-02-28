---
titleSuffix: "Route Object API Reference"
description: "Detailed API reference for the @esmx/router Route class, including route properties, route types, location interfaces, and route state management."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Route, API, route object, route params, route query, route matching, route meta"
---

# Route

## Introduction

The Route class represents a resolved route object in `@esmx/router`. Each navigation produces a Route instance containing complete information about the matched path, parameters, query strings, and associated metadata.

## Type Definitions

### RouteType

- **Type Definition**:
```ts
enum RouteType {
    push = 'push',
    replace = 'replace',
    restartApp = 'restartApp',
    go = 'go',
    forward = 'forward',
    back = 'back',
    unknown = 'unknown',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow',
    pushLayer = 'pushLayer'
}
```

Indicates how the navigation was triggered:
- `push`: Standard forward navigation (adds history entry)
- `replace`: Replaces current history entry
- `restartApp`: App restart navigation
- `go`: Programmatic history traversal via `router.go()`
- `forward`: Forward navigation via `router.forward()`
- `back`: Backward navigation via `router.back()`
- `unknown`: Navigation triggered by browser popstate events
- `pushWindow`: Opens navigation in a new window
- `replaceWindow`: Replaces current window location
- `pushLayer`: Opens navigation in a layer

### RouteLocation

- **Type Definition**:
```ts
interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[] | undefined>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
    statusCode?: number | null;
    layer?: RouteLayerOptions | null;
    confirm?: RouteConfirmHook | null;
}
```

Route location object used for programmatic navigation:
- `path`: Route path
- `url`: Full URL string or URL object
- `params`: Route parameters for dynamic segments
- `query`: Query string parameters (single values)
- `queryArray`: Query string parameters (array values for repeated keys)
- `hash`: URL hash fragment
- `state`: Custom state data persisted in history
- `keepScrollPosition`: When `true`, maintains current scroll position after navigation
- `statusCode`: HTTP status code for server-side responses
- `layer`: Layer configuration options
- `confirm`: Custom confirm handler overriding default route transition logic

### RouteLocationInput

- **Type Definition**:
```ts
type RouteLocationInput = RouteLocation | string;
```

Input type for navigation methods. Can be a simple path string or a `RouteLocation` object.

```ts
// String shorthand
router.push('/user/123');

// Object form
router.push({
    path: '/user',
    query: { id: '123' },
    hash: '#profile'
});
```

## Instance Properties

### type

- **Type**: `RouteType`
- **Read-only**: `true`

The navigation type that created this route.

### path

- **Type**: `string`
- **Read-only**: `true`

The path relative to the router base. For matched routes, this is the path with the base prefix removed. For unmatched routes, this equals the full pathname.

```ts
// With base URL 'https://example.com/app/'
// Navigating to '/app/user/123'
route.path // '/user/123'
```

### fullPath

- **Type**: `string`
- **Read-only**: `true`

The complete path including query string and hash.

```ts
route.fullPath // '/user/123?tab=profile#bio'
```

### url

- **Type**: `URL`
- **Read-only**: `true`

The full URL object for this route.

```ts
route.url.href     // 'https://example.com/app/user/123?tab=profile#bio'
route.url.pathname // '/app/user/123'
route.url.origin   // 'https://example.com'
```

### params

- **Type**: `Record<string, string>`
- **Read-only**: `true`

Dynamic route parameters extracted from the path. For parameters with multiple matches, contains the first value.

```ts
// Route config: { path: '/user/:id' }
// URL: '/user/123'
route.params // { id: '123' }
```

### paramsArray

- **Type**: `Record<string, string[]>`
- **Read-only**: `true`

Dynamic route parameters in array form, useful for parameters that can match multiple segments.

### query

- **Type**: `Record<string, string | undefined>`
- **Read-only**: `true`

Parsed query string parameters. For repeated keys, contains the first value.

```ts
// URL: '/search?q=vue&page=1'
route.query // { q: 'vue', page: '1' }
```

### queryArray

- **Type**: `Record<string, string[] | undefined>`
- **Read-only**: `true`

Query string parameters in array form, useful for repeated query keys.

```ts
// URL: '/filter?tag=vue&tag=react'
route.queryArray // { tag: ['vue', 'react'] }
```

### hash

- **Type**: `string`
- **Read-only**: `true`

The URL hash fragment (including the `#` prefix).

```ts
// URL: '/page#section-2'
route.hash // '#section-2'
```

### meta

- **Type**: `RouteMeta`
- **Read-only**: `true`

Route metadata from the matched route configuration. Returns an empty object if no route is matched.

```ts
// Route config: { path: '/admin', meta: { requiresAuth: true } }
route.meta // { requiresAuth: true }
```

### matched

- **Type**: `readonly RouteParsedConfig[]`
- **Read-only**: `true`

Array of matched route configurations from parent to child. Empty array if no route matches.

```ts
// Nested routes: /user/profile
route.matched // [userConfig, profileConfig]
route.matched.length // 2
```

### config

- **Type**: `RouteParsedConfig | null`
- **Read-only**: `true`

The last (deepest) matched route configuration. `null` if no route matches.

```ts
if (route.config) {
    console.log('Matched route path:', route.config.path);
}
```

### state

- **Type**: `RouteState`
- **Read-only**: `true`

Custom state data associated with this route, persisted in browser history.

```ts
// Navigation with state
router.push({ path: '/checkout', state: { cartId: 'abc' } });

// Accessing state
route.state // { cartId: 'abc' }
```

### keepScrollPosition

- **Type**: `boolean`
- **Read-only**: `true`

Whether the navigation should maintain the current scroll position rather than scrolling to top.

### isPush

- **Type**: `boolean`
- **Read-only**: `true`

Whether this route was created by a push-type navigation (`push`, `pushWindow`, `pushLayer`).

### statusCode

- **Type**: `number | null`
- **Read-only**: `true`

HTTP status code for server-side rendering redirects.

### req

- **Type**: `IncomingMessage | null`
- **Read-only**: `true`

Node.js HTTP request object (available during SSR).

### res

- **Type**: `ServerResponse | null`
- **Read-only**: `true`

Node.js HTTP response object (available during SSR).

### context

- **Type**: `Record<string | symbol, any>`
- **Read-only**: `true`

Shared context object from the router options.

## Instance Methods

### clone()

- **Returns**: `Route`

Creates a copy of the current route instance with the same configuration and state.

```ts
const routeCopy = route.clone();
```
