---
titleSuffix: "Programmatic Navigation"
description: "Complete guide to programmatic navigation in @esmx/router — push, replace, window navigation, history traversal, resolve, and navigation options."
head:
  - - "meta"
    - name: "keywords"
      content: "programmatic navigation, router push, router replace, pushWindow, replaceWindow, history navigation, router.go, router.back, router resolve"
---

# Programmatic Navigation

Aside from using `<RouterLink>` to create anchor tags for declarative navigation, we can do this programmatically using the router's instance methods.

## `router.push`

To navigate to a different URL, use `router.push`. This method adds a new entry to the history stack, so when the user clicks the browser back button, they'll go back to the previous URL.

```ts
// String path
await router.push('/users/42');

// Object with path
await router.push({ path: '/users/42' });

// With query params
await router.push({ path: '/search', query: { q: 'vue', page: '1' } });

// With hash
await router.push({ path: '/docs/intro', hash: '#getting-started' });
```

The method returns a `Promise<Route>` that resolves to the new route after navigation completes (including all guards):

```ts
const route = await router.push('/about');
console.log(route.path); // '/about'
```

## `router.replace`

Acts like `router.push` but does **not** add a new history entry. It replaces the current entry instead:

```ts
// The current history entry is replaced — back button won't return here
await router.replace('/new-location');
```

This is useful when you want to redirect without cluttering the browser history — for example, after form submission or login:

```ts
async function handleLogin() {
  await performLogin();
  await router.replace('/dashboard');
}
```

## Navigation with Objects

Both `push` and `replace` accept a `RouteLocationInput`, which can be a string or an object with these properties:

- **`path`**: `string` — The target path
- **`query`**: `Record<string, string>` — Query parameters
- **`hash`**: `string` — Hash fragment (e.g., `'#section'`)
- **`state`**: `Record<string, unknown>` — State stored in `history.state` (not visible in URL)
- **`params`**: `Record<string, string>` — Dynamic segment values
- **`keepScrollPosition`**: `boolean` — If `true`, don't scroll to top after navigation
- **`statusCode`**: `number` — HTTP status code (useful for SSR)

```ts
await router.push({
  path: '/users/42',
  query: { tab: 'posts' },
  hash: '#latest',
  state: { fromDashboard: true },
  keepScrollPosition: true
});
```

### Using `params`

The `params` option lets you pass dynamic segment values that are applied to the matched route's path pattern:

```ts
// Route: /users/:userId/posts/:postId
await router.push({
  path: '/users/:userId/posts/:postId',
  params: { userId: '42', postId: '7' }
});
// Navigates to /users/42/posts/7
```

### Using `state`

The `state` property stores data in `history.state`. Unlike query params, state is not visible in the URL and is preserved across forward/back navigation:

```ts
await router.push({
  path: '/checkout',
  state: { cartId: 'abc-123', step: 2 }
});

console.log(router.route.state.cartId); // 'abc-123'
```

## Window Navigation

Standard `push`/`replace` perform **SPA navigation** — the page doesn't reload, only the routed content changes. Window navigation methods trigger a **full browser navigation** instead.

### `router.pushWindow`

Opens the target in a new browser tab/window (equivalent to `window.open`):

```ts
await router.pushWindow('/external-report');
```

### `router.replaceWindow`

Navigates the current tab to a new URL (equivalent to `window.location.replace`):

```ts
await router.replaceWindow('/legacy-page');
```

### When to Use Window Navigation

- Navigate within your SPA: use `push` / `replace`
- Navigate to a different micro-frontend: use `pushWindow` / `replaceWindow`
- Open in new tab: use `pushWindow`
- Full page reload / redirect to external URL: use `replaceWindow`
- Navigate to a page outside router scope: use `pushWindow` / `replaceWindow`

### Guard Pipeline Differences

Window navigation methods skip most of the guard pipeline since the browser will perform a full navigation anyway:

| Stage | push/replace | pushWindow/replaceWindow |
|-------|-------------|------------------------|
| fallback | ✅ | ✅ |
| override | ✅ | ✅ |
| beforeLeave | ✅ | replaceWindow only |
| beforeEach | ✅ | ✅ |
| beforeUpdate | ✅ | ❌ |
| beforeEnter | ✅ | ❌ |
| asyncComponent | ✅ | ❌ |
| confirm | ✅ | ✅ |

## History Navigation

These methods mirror the browser's native history navigation:

### `router.back()`

Go back one step in history. Equivalent to `router.go(-1)`:

```ts
await router.back();
```

Returns `Promise<Route | null>`. Returns `null` if there's no history to go back to (the user is at the start of their session).

### `router.forward()`

Go forward one step. Equivalent to `router.go(1)`:

```ts
await router.forward();
```

Returns `Promise<Route | null>`. Returns `null` if there's no forward history.

### `router.go(n)`

Move `n` steps in history. Positive values go forward, negative values go back:

```ts
// Go back 2 pages
await router.go(-2);

// Go forward 3 pages
await router.go(3);
```

Returns `Promise<Route | null>`. Returns `null` if the target position doesn't exist in history. Note that `router.go(0)` returns `null` immediately without any action (unlike `location.reload()`).

## `router.restartApp`

Remounts the current micro-app without changing the URL. This is useful when you need to reset the application state completely:

```ts
await router.restartApp();
```

You can optionally pass a new route location:

```ts
await router.restartApp('/dashboard');
```

This method runs the full guard pipeline (excluding `override`), unmounts the current micro-app, and remounts it fresh.

## `router.resolve`

Resolves a route location without actually navigating. This is useful for generating URLs, checking if a route exists, or inspecting what a navigation would produce:

```ts
const route = router.resolve('/users/42?tab=posts');

console.log(route.path);           // '/users/42'
console.log(route.params);         // { id: '42' }
console.log(route.query);          // { tab: 'posts' }
console.log(route.matched.length); // number of matched route configs
console.log(route.url.href);       // full URL string
```

Use it to generate link URLs without triggering navigation:

```ts
const resolved = router.resolve('/some/path');
if (resolved.matched.length > 0) {
  console.log('Route exists!');
}

const href = router.resolve({ path: '/about', hash: '#team' }).url.href;
```

## The `keepScrollPosition` Option

By default, `push` and `replace` scroll the page to the top. Pass `keepScrollPosition: true` to prevent this:

```ts
await router.push({
  path: '/dashboard',
  query: { tab: 'analytics' },
  keepScrollPosition: true
});
```

See [Scroll Behavior](./scroll-behavior) for full details on how scrolling works.

## Error Handling

All navigation methods can throw errors. Always handle them appropriately:

```ts
import {
  RouteTaskCancelledError,
  RouteNavigationAbortedError
} from '@esmx/router';

try {
  await router.push('/protected');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    console.log('Navigation was blocked by a guard');
  } else if (error instanceof RouteTaskCancelledError) {
    console.log('Navigation was superseded by a newer one');
  } else {
    throw error;
  }
}
```

See [Error Handling](/api/router/error-types) for more details.

## Summary

| Method | History | Page Reload | Returns |
|--------|---------|-------------|---------|
| `push(to)` | Adds entry | No | `Promise<Route>` |
| `replace(to)` | Replaces current | No | `Promise<Route>` |
| `pushWindow(to)` | Browser handles | Yes (new tab) | `Promise<Route>` |
| `replaceWindow(to)` | Browser handles | Yes (same tab) | `Promise<Route>` |
| `back()` | Goes back 1 | No | `Promise<Route \| null>` |
| `forward()` | Goes forward 1 | No | `Promise<Route \| null>` |
| `go(n)` | Goes ±n | No | `Promise<Route \| null>` |
| `restartApp()` | Replaces current | No (remounts app) | `Promise<Route>` |
| `resolve(to)` | — | — | `Route` (sync) |
