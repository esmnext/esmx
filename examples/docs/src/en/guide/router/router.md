---
titleSuffix: "Router API Reference"
description: "Complete API reference for the @esmx/router Router class — the central controller for route management, navigation, micro-app orchestration, and layer routing in both browser and SSR environments."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router, SPA routing, micro-frontend router, SSR router, framework-agnostic router, navigation API, TypeScript router"
---

# Router

Router instance for managing route matching, navigation, micro-app lifecycle, navigation guards, and layer routing. Works in both browser and Node.js (SSR) environments.

## Constructor

### new Router(options)

Creates a new Router instance.

- **Parameters**:
  - `options: RouterOptions` - Router configuration object

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage }
  ]
});
```

## RouterOptions

Options to initialize a Router instance.

### root

- **Type**: `string | HTMLElement`
- **Default**: `'#root'`

The DOM element or CSS selector where micro-apps are mounted. Supports ID, class, or attribute selectors.

```ts
// Using ID selector
new Router({ root: '#app' });

// Using class selector
new Router({ root: '.app-container' });

// Using attribute selector
new Router({ root: '[data-router-mount]' });

// Passing DOM element directly
const element = document.getElementById('app');
new Router({ root: element });
```

### mode

- **Type**: `RouterMode`
- **Default**: `RouterMode.history`

History mode used by the router.

- `RouterMode.history`: Uses browser History API (`pushState`/`popState`). For production apps with server support
- `RouterMode.memory`: In-memory history stack, no URL changes. For SSR, testing, layers

### routes

- **Type**: `RouteConfig[]`
- **Default**: `[]`

Initial list of routes that should be added to the router. See [Route Config](./route-config) for full details.

### base

- **Type**: `URL`

Base URL for route resolution. Optional in the browser (defaults to `window.location`), **required** on the server side.

```ts
// Server-side rendering
const router = new Router({
  base: new URL(`http://localhost${req.url}`),
  mode: RouterMode.memory,
  req,
  res,
  routes,
  apps
});
```

### apps

- **Type**: `RouterMicroApp`

Micro-app factory functions. Maps string keys to factory functions that create micro-app lifecycle handlers. See [MicroApp](./micro-app) for details.

```ts
const router = new Router({
  apps: {
    react: (router) => ({
      mount: (el) => { /* mount React app */ },
      unmount: () => { /* cleanup */ },
      renderToString: async () => '<div>SSR HTML</div>'
    }),
    vue: (router) => createVueApp(router)
  }
});
```

### context

- **Type**: `Record<string | symbol, unknown>`
- **Default**: `{}`

Shared context object accessible from all routes via `router.context`. Useful for dependency injection (services, stores, etc.).

### data

- **Type**: `Record<string | symbol, unknown>`
- **Default**: `{}`

Shared data object accessible via `router.data`. Similar to `context` but intended for mutable shared state.

### req

- **Type**: `IncomingMessage | null`

Node.js HTTP request object. Used during server-side rendering to access request headers, URL, etc.

### res

- **Type**: `ServerResponse | null`

Node.js HTTP response object. Used during server-side rendering to set status codes, headers, etc.

### normalizeURL

- **Type**: `(to: URL, from: URL | null) => URL`

URL normalization function called before route matching. Useful for removing trailing slashes, forcing lowercase paths, or other URL transformations.

```ts
new Router({
  normalizeURL: (to, from) => {
    // Remove trailing slash
    if (to.pathname.endsWith('/') && to.pathname !== '/') {
      to.pathname = to.pathname.slice(0, -1);
    }
    return to;
  }
});
```

### fallback

- **Type**: `RouteHandleHook`

Called when no route matches the target URL, or for `pushWindow`/`replaceWindow` navigation types. Use this to handle 404 pages or external navigation.

```ts
new Router({
  fallback: (to, from, router) => {
    console.log('No route matched:', to.path);
    // You could redirect to a 404 page
  }
});
```

### nextTick

- **Type**: `() => Awaitable<void>`

Custom `nextTick` implementation called after route transition confirms. Useful for framework-specific DOM update timing (e.g., Vue's `nextTick`).

### rootStyle

- **Type**: `Partial<CSSStyleDeclaration> | false | null`

CSS styles applied to the root element when creating layer routers. Set to `false` or `null` to disable automatic styling.

### layer

- **Type**: `boolean`

Internal. Whether this router instance operates as a layer (overlay/modal) router. Set automatically by [`createLayer()`](#createlayer).

### zIndex

- **Type**: `number`
- **Default**: `1000`

Base z-index value for layer overlays. Layers auto-increment from this value.

### handleBackBoundary

- **Type**: `(router: Router) => void`

Called when `back()` is invoked at the beginning of the history stack (no more history to go back to). Useful for closing the app or navigating to a parent context.

### handleLayerClose

- **Type**: `(router: Router, data?: any) => void`

Internal. Called when a layer router is closed. Set automatically by [`createLayer()`](#createlayer).

## Properties

### route

- **Type**: `Route`
- **Read-only**: `true`

The current active [Route](./route). Throws an error if accessed before the first navigation.

```ts
console.log(router.route.path);    // '/about'
console.log(router.route.params);  // { id: '123' }
console.log(router.route.query);   // { page: '1' }
```

### options

- **Type**: `RouterOptions`
- **Read-only**: `true`

The original options passed to the Router constructor.

### parsedOptions

- **Type**: `RouterParsedOptions`
- **Read-only**: `true`

Parsed and compiled options, including `compiledRoutes` (route configs with compiled matchers) and `matcher` function.

### isLayer

- **Type**: `boolean`
- **Read-only**: `true`

Whether this router instance is a layer (overlay/modal) router created via [`createLayer()`](#createlayer).

### navigation

- **Type**: `Navigation`
- **Read-only**: `true`

The internal navigation controller managing the history stack (browser History API or MemoryHistory).

### microApp

- **Type**: `MicroApp`
- **Read-only**: `true`

The internal micro-app lifecycle manager handling mount/unmount transitions between micro-apps.

### mode

- **Type**: `RouterMode`
- **Read-only**: `true`

The current router mode (`'history'` or `'memory'`).

### base

- **Type**: `URL`
- **Read-only**: `true`

The base URL used for route resolution.

### root

- **Type**: `HTMLElement`
- **Read-only**: `true`

The root DOM element where micro-apps are mounted.

### context

- **Type**: `Record<string | symbol, unknown>`
- **Read-only**: `true`

The shared context object provided via [`RouterOptions.context`](#context).

### data

- **Type**: `Record<string | symbol, unknown>`
- **Read-only**: `true`

The shared data object provided via [`RouterOptions.data`](#data).

### req

- **Type**: `IncomingMessage | null`
- **Read-only**: `true`

The HTTP request object (SSR only). `null` in the browser.

### res

- **Type**: `ServerResponse | null`
- **Read-only**: `true`

The HTTP response object (SSR only). `null` in the browser.

## Methods

### push()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to navigate to
- **Returns**: `Promise<Route>`

Programmatically navigate to a new URL by pushing an entry in the history stack. Resolves to the target [Route](./route) after the full [navigation guard pipeline](./navigation-guards) completes.

```ts
// String path
await router.push('/user/123');

// Object with query and hash
await router.push({
  path: '/search',
  query: { q: 'hello' },
  hash: '#results'
});

// With route state
await router.push({
  path: '/user/123',
  state: { fromDashboard: true }
});
```

### replace()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to navigate to
- **Returns**: `Promise<Route>`

Programmatically navigate to a new URL by replacing the current entry in the history stack. Unlike `push`, this does not create a new history entry — pressing the back button will not return to the current page.

```ts
// Replace after login (prevents back-to-login)
await router.replace('/dashboard');
```

### back()

- **Returns**: `Promise<Route | null>`

Go back one step in history if possible by calling `navigation.back()`. Equivalent to `router.go(-1)`. If at the beginning of the history stack, calls [`handleBackBoundary`](#handlebackboundary). Returns `null` if navigation didn't happen.

### forward()

- **Returns**: `Promise<Route | null>`

Go forward one step in history if possible. Equivalent to `router.go(1)`. Returns `null` if navigation didn't happen.

### go()

- **Parameters**:
  - `index: number` - Position in the history relative to the current page
- **Returns**: `Promise<Route | null>`

Navigate to a specific position relative to the current page in the history stack. `go(0)` returns `null` (no-op). Negative values go back, positive values go forward.

```ts
await router.go(-2); // Go back 2 steps
await router.go(1);  // Go forward 1 step
```

### pushWindow()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to navigate to
- **Returns**: `Promise<Route>`

Navigate to a route intended for a new window/tab context. Triggers the [`fallback`](#fallback) handler instead of performing in-page navigation.

### replaceWindow()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to navigate to
- **Returns**: `Promise<Route>`

Navigate to a route intended for replacing the current window context. Triggers the [`fallback`](#fallback) handler.

### restartApp()

- **Parameters**:
  - `to: RouteLocationInput` - Optional route location (defaults to current route)
- **Returns**: `Promise<Route>`

Force-restart the current micro-app. Performs a full unmount → mount cycle even if the app key hasn't changed. If `to` is not provided, restarts at the current route.

```ts
// Restart at current route
await router.restartApp();

// Restart at a different route
await router.restartApp('/dashboard');
```

### resolve()

- **Parameters**:
  - `to: RouteLocationInput` - Target route location
  - `toType: RouteType` - Optional route type
- **Returns**: `Route`

Returns the [Route](./route) for a given location without performing navigation. Useful for generating URLs, pre-checking matches, or getting route metadata.

```ts
const route = router.resolve('/user/123');
console.log(route.url.href);     // Full URL
console.log(route.params);       // { id: '123' }
console.log(route.matched);      // Matched route configs
```

### isRouteMatched()

- **Parameters**:
  - `toRoute: Route` - Route to compare against the current route
  - `matchType: RouteMatchType` - Match strategy (default: `'include'`)
- **Returns**: `boolean`

Check if a route matches the current route.

Match types:
- `'route'`: Same route configuration (same `RouteConfig` reference)
- `'exact'`: Exact path match
- `'include'`: Current path starts with target path

```ts
const aboutRoute = router.resolve('/about');

router.isRouteMatched(aboutRoute, 'exact');   // true if at /about
router.isRouteMatched(aboutRoute, 'include'); // true if at /about or /about/team
```

### beforeEach()

- **Parameters**:
  - `guard: RouteConfirmHook` - Navigation guard to add
- **Returns**: `() => void`

Add a navigation guard that executes before any navigation. Returns a function that removes the registered guard.

```ts
const removeGuard = router.beforeEach((to, from, router) => {
  if (!isAuthenticated && to.path !== '/login') {
    return '/login'; // Redirect
  }
  // Return void to continue, false to cancel
});

// Later: remove the guard
removeGuard();
```

### afterEach()

- **Parameters**:
  - `guard: RouteNotifyHook` - Navigation hook to add
- **Returns**: `() => void`

Add a navigation hook that is executed after every navigation. Returns a function that removes the registered hook. Cannot modify navigation.

```ts
router.afterEach((to, from, router) => {
  document.title = to.meta.title || 'My App';
  analytics.trackPageView(to.path);
});
```

See [Navigation Guards](./navigation-guards) for full details on guard types and the navigation pipeline.

### resolveLink()

- **Parameters**:
  - `props: RouterLinkProps` - Link configuration
- **Returns**: `RouterLinkResolved`

Resolve a router link configuration into complete link data including HTML attributes, active states, and event handlers. Used to build framework-specific link components.

See [RouterLink](./router-link) for full details and framework examples.

### createLayer()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to open in the layer
- **Returns**: `Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

Create a layer (overlay/modal) router with its own navigation stack. Returns both the layer router instance and a promise that resolves when the layer closes.

Returns an object with:
- `router` — The layer Router instance
- `promise` — A `Promise<RouteLayerResult>` that resolves when the layer closes

See [Layer System](./layer) for full details.

### pushLayer()

- **Parameters**:
  - `to: RouteLocationInput` - Route location to open in the layer
- **Returns**: `Promise<RouteLayerResult>`

Shorthand for creating a layer and waiting for its result. Combines `createLayer()` into a single call.

```ts
const result = await router.pushLayer('/modal/confirm');

if (result.type === 'success') {
  console.log('User confirmed:', result.data);
} else if (result.type === 'close') {
  console.log('User dismissed');
}
```

### closeLayer()

- **Parameters**:
  - `data: any` - Optional data to return to the parent router. When provided, the layer result type is `'success'`

Close the current layer router. Only works when `router.isLayer` is `true`.

### renderToString()

- **Parameters**:
  - `throwError: boolean` - If `true`, throws errors instead of logging them (default: `false`)
- **Returns**: `Promise<string | null>`

Render the current micro-app to an HTML string for server-side rendering. Calls the matched micro-app's `renderToString()` method. Returns the rendered HTML string, or `null` if no micro-app is mounted.

```ts
// Server-side rendering
await router.push(req.url);
const html = await router.renderToString();
```

### destroy()

Destroy the router instance, cleaning up all event listeners, navigation guards, history state, and micro-app instances. Call this when you no longer need the router.

```ts
router.destroy();
```
