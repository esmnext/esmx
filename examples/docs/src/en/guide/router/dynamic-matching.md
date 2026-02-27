---
titleSuffix: "Dynamic Route Matching"
description: "Learn how to use dynamic segments, optional parameters, wildcards, query strings, and hash fragments in @esmx/router route patterns."
head:
  - - "meta"
    - name: "keywords"
      content: "dynamic routes, route params, route parameters, path-to-regexp, wildcard routes, catch-all routes, query params, optional params"
---

# Dynamic Route Matching

Very often we need to map routes with the given pattern to the same component. For example, we may have a `UserProfile` component which should be rendered for all users but with different user IDs. In `@esmx/router`, we can use a dynamic segment in the path to achieve that.

## Route Params

Dynamic segments are denoted by a colon `:`. When a route is matched, the value of the dynamic segments will be exposed as `route.params`:

```ts
const routes: RouteConfig[] = [
  // dynamic segment starts with a colon
  { path: '/users/:id', component: UserProfile }
];
```

Now URLs like `/users/42` and `/users/alice` will both map to the same route:

```ts
// When the URL is /users/42
console.log(route.params.id); // '42'

// When the URL is /users/alice
console.log(route.params.id); // 'alice'
```

:::tip
All param values are strings. Even if the URL contains `/users/42`, `route.params.id` will be the string `'42'`, not the number `42`.
:::

## Multiple Params

You can have multiple dynamic segments in the same route, and they will map to corresponding fields on `route.params`:

```ts
const routes: RouteConfig[] = [
  { path: '/users/:userId/posts/:postId', component: UserPost }
];
```

| Pattern | Matched Path | params |
|---------|-------------|--------|
| `/users/:userId/posts/:postId` | `/users/alice/posts/123` | `{ userId: 'alice', postId: '123' }` |
| `/blog/:year/:month/:slug` | `/blog/2024/01/hello-world` | `{ year: '2024', month: '01', slug: 'hello-world' }` |
| `/:lang/docs/:page` | `/en/docs/intro` | `{ lang: 'en', page: 'intro' }` |

## Optional Params

You can make a parameter optional by adding a `?` after it. Optional parameters will match routes both with and without the segment:

```ts
const routes: RouteConfig[] = [
  { path: '/search/:query?', component: SearchPage }
];
```

| URL | params |
|-----|--------|
| `/search` | `{ query: '' }` |
| `/search/vue-router` | `{ query: 'vue-router' }` |

When an optional parameter is not present in the URL, its value will be an empty string `''`.

## Catch-All / 404 Routes

A wildcard pattern can catch all paths — useful for 404 pages or fallback routes. Use the `(.*)` pattern (or `(.*)*` for capturing the value as an array):

```ts
const routes: RouteConfig[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },

  // This will match everything that didn't match above
  { path: '/:pathMatch(.*)*', component: NotFound }
];
```

```ts
// When the URL is /non-existing-page
console.log(route.params.pathMatch); // 'non-existing-page'

// When the URL is /files/a/b/c
console.log(route.params.pathMatch);      // 'a' (first segment)
console.log(route.paramsArray.pathMatch);  // ['a', 'b', 'c']
```

:::warning
Make sure to place your catch-all route **last** in the routes array. Since routes are evaluated in order, a catch-all at the top would match every URL and prevent specific routes from ever being reached.
:::

## Accessing Params

### `route.params`

An object containing key/value pairs of dynamic segments. Each value is a **string**. For repeating parameters (like `(.*)*`), only the first match is provided:

```ts
// Route: /files/:path*
// URL: /files/a/b/c
route.params.path  // 'a'
```

### `route.paramsArray`

An object containing key/value pairs where each value is a **string array**. This is useful for repeating parameters and ensures you always get all matched values:

```ts
// Route: /files/:path*
// URL: /files/a/b/c
route.paramsArray.path  // ['a', 'b', 'c']

// Route: /users/:id
// URL: /users/42
route.paramsArray.id    // ['42']
```

## Query Params

Query parameters are the key/value pairs after the `?` in a URL. They don't need to be defined in the route pattern — they're always available:

```ts
// URL: /search?q=vue&sort=date&tag=frontend&tag=ssr
route.query.q       // 'vue'
route.query.sort    // 'date'
route.query.tag     // 'frontend' (first value only)
```

### `route.queryArray`

For query parameters that appear multiple times, use `queryArray` to get all values:

```ts
// URL: /search?tag=frontend&tag=ssr
route.query.tag           // 'frontend'
route.queryArray.tag      // ['frontend', 'ssr']
```

| Property | Type | Description |
|----------|------|-------------|
| `route.query` | `Record<string, string \| undefined>` | First value for each query key |
| `route.queryArray` | `Record<string, string[] \| undefined>` | All values for each query key |

## Hash

The hash fragment (everything after `#` in the URL) is available via `route.hash`:

```ts
// URL: /about#team
route.hash  // '#team'
```

The hash always includes the `#` prefix. If there's no hash in the URL, `route.hash` is an empty string.

## Pattern Matching with path-to-regexp

Under the hood, `@esmx/router` uses the [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) library for pattern matching. This gives you access to advanced matching features:

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `:id` | Named parameter | `/users/42` |
| `:id?` | Optional parameter | `/users` or `/users/42` |
| `:path*` | Zero or more segments | `/files` or `/files/a/b` |
| `:path+` | One or more segments | `/files/a` or `/files/a/b` |
| `:id(\\d+)` | Parameter with regex constraint | `/users/42` (not `/users/alice`) |
| `(.*)*` | Catch-all wildcard | Anything |

### Custom Regex Constraints

You can restrict what a parameter matches using inline regex:

```ts
const routes: RouteConfig[] = [
  // Only matches numeric IDs
  { path: '/users/:id(\\d+)', component: UserProfile },

  // Only matches specific values
  { path: '/:lang(en|fr|de)/docs', component: Docs }
];
```

## URL Encoding

Route paths should be URL-encoded. The router handles encoding and decoding automatically — when you define routes and access parameters, you work with decoded values:

```ts
const routes: RouteConfig[] = [
  // Define with encoded path if the literal path contains special chars
  { path: '/docs/:page', component: DocsPage }
];

// URL: /docs/getting%20started
route.params.page  // 'getting started' (decoded)
```

When navigating programmatically, you can pass either encoded or decoded paths:

```ts
router.push('/docs/getting started');   // works — encoded automatically
router.push('/docs/getting%20started'); // also works
```
