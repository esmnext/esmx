---
titleSuffix: "Router Class API Reference"
description: "Detailed API reference for the @esmx/router Router class, including constructor options, instance properties, navigation methods, guard registration, and lifecycle management."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Router, API, navigation, route guard, SPA routing, history mode, memory mode"
---

# Router

## Introduction

The Router class is the core of `@esmx/router`, providing complete client-side routing capabilities including navigation, route matching, guard management, and layer routing.

## Type Definitions

### RouterMode

- **Type Definition**:
```ts
enum RouterMode {
    history = 'history',
    memory = 'memory'
}
```

Router operation modes:
- `history`: Uses the browser's History API for navigation, suitable for standard web applications
- `memory`: Uses in-memory history, suitable for SSR, testing, or layer routing scenarios

### RouterOptions

- **Type Definition**:
```ts
interface RouterOptions {
    root?: string | HTMLElement;
    context?: Record<string | symbol, unknown>;
    data?: Record<string | symbol, unknown>;
    routes?: RouteConfig[];
    mode?: RouterMode;
    base?: URL;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    fallback?: RouteHandleHook;
    nextTick?: () => Awaitable<void>;
    rootStyle?: Partial<CSSStyleDeclaration> | false | null;
    layer?: boolean;
    zIndex?: number;
    handleBackBoundary?: (router: Router) => void;
    handleLayerClose?: (router: Router, data?: any) => void;
}
```

Router configuration options:
- `root`: Application mounting container, can be a CSS selector string or HTMLElement, defaults to `'#root'`
- `context`: Shared context object accessible across routes
- `data`: Shared data object accessible across routes
- `routes`: Array of route configuration objects
- `mode`: Router mode, defaults to `RouterMode.history` in browsers, `RouterMode.memory` on server
- `base`: Base URL for the application; optional in browser (uses `location.origin`), required on server side
- `req`: Node.js IncomingMessage for server-side routing
- `res`: Node.js ServerResponse for server-side routing
- `apps`: Micro-app configuration for multi-application routing
- `normalizeURL`: Custom URL normalization function
- `fallback`: Fallback handler for unmatched routes or external navigation
- `nextTick`: Custom next-tick function for async scheduling
- `rootStyle`: Custom styles for the root element, set to `false` or `null` to disable
- `layer`: Whether this router instance is a layer router
- `zIndex`: Base z-index for layer routing (default: `10000`)
- `handleBackBoundary`: Handler called when backward navigation has no more history entries
- `handleLayerClose`: Handler called when a layer is closed

## Instance Properties

### route

- **Type**: `Route`
- **Read-only**: `true`
- **Throws**: `Error` — When no active route exists

Gets the current active route object.

```ts
const currentRoute = router.route;
console.log(currentRoute.path);    // '/user/123'
console.log(currentRoute.params);  // { id: '123' }
```

### root

- **Type**: `string | HTMLElement`
- **Read-only**: `true`

Gets the configured root element or selector.

### mode

- **Type**: `RouterMode`
- **Read-only**: `true`

Gets the current router mode (`'history'` or `'memory'`).

### base

- **Type**: `URL`
- **Read-only**: `true`

Gets the base URL object for the router.

### isLayer

- **Type**: `boolean`
- **Read-only**: `true`

Whether this router instance is operating as a layer.

### req

- **Type**: `IncomingMessage | null`
- **Read-only**: `true`

Gets the Node.js request object (server-side only).

### res

- **Type**: `ServerResponse | null`
- **Read-only**: `true`

Gets the Node.js response object (server-side only).

### context

- **Type**: `Record<string | symbol, unknown>`
- **Read-only**: `true`

Gets the shared context object. Useful for passing data across routes without coupling them, such as dependency injection containers or shared services.

```ts
const router = new Router({
    context: { auth: authService, i18n: i18nService },
    routes
});

// Access in guards or components
console.log(router.context.auth);
```

### data

- **Type**: `Record<string | symbol, unknown>`
- **Read-only**: `true`

Gets the shared data object. Similar to `context`, but intended for mutable data shared across routes.

```ts
const router = new Router({
    data: { pageTitle: 'Home' },
    routes
});

router.data.pageTitle = 'About';
```

## Instance Methods

### constructor()

- **Parameters**:
  - `options: RouterOptions` — Router configuration options
- **Returns**: `Router`

Creates a new Router instance.

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
    mode: RouterMode.history,
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
    ]
});
```

### push()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<Route>`

Navigates to a new route, adding an entry to the history stack.

```ts
// Navigate by path string
await router.push('/user/123');

// Navigate with route location object
await router.push({
    path: '/user',
    query: { id: '123' }
});

// Navigate with state
await router.push({
    path: '/dashboard',
    state: { fromLogin: true }
});
```

### replace()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<Route>`

Navigates to a new route, replacing the current history entry.

```ts
await router.replace('/login');
```

### back()

- **Returns**: `Promise<Route | null>`

Navigates backward in history. Returns `null` if no history entries exist. When there is no backward history, `handleBackBoundary` is called.

```ts
await router.back();
```

### forward()

- **Returns**: `Promise<Route | null>`

Navigates forward in history. Returns `null` if no forward history entries exist.

```ts
await router.forward();
```

### go()

- **Parameters**:
  - `index: number` — Number of steps to go (positive for forward, negative for backward)
- **Returns**: `Promise<Route | null>`

Navigates to a specific position in history. Returns `null` if the position doesn't exist. `go(0)` returns `null` directly without refreshing.

```ts
// Go back 2 steps
await router.go(-2);

// Go forward 1 step
await router.go(1);
```

### pushWindow()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<Route>`

Navigates to a route in a new browser window.

```ts
await router.pushWindow('/external-page');
```

### replaceWindow()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<Route>`

Navigates to a route, replacing the current browser window location.

```ts
await router.replaceWindow('/new-location');
```

### restartApp()

- **Parameters**:
  - `toInput?: RouteLocationInput` — Optional target route, defaults to the current route
- **Returns**: `Promise<Route>`

Restarts the micro-app by reinitializing the route.

```ts
// Restart app at current route
await router.restartApp();

// Restart app at a different route
await router.restartApp('/home');
```

### resolve()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
  - `toType?: RouteType` — Optional route type
- **Returns**: `Route`

Resolves a route location without performing actual navigation. Useful for generating URLs, pre-checking route matching, and retrieving route information.

```ts
// Resolve string path
const route = router.resolve('/user/123');
console.log(route.url.href);

// Check route validity
const testRoute = router.resolve('/some/path');
if (testRoute.matched.length > 0) {
    // Route matched successfully
}
```

### isRouteMatched()

- **Parameters**:
  - `toRoute: Route` — Target route to compare
  - `matchType?: RouteMatchType` — Match type (default: `'include'`)
- **Returns**: `boolean`

Checks whether a route matches the current route.

```ts
const targetRoute = router.resolve('/user');

// Include matching (default)
router.isRouteMatched(targetRoute, 'include');

// Exact path matching
router.isRouteMatched(targetRoute, 'exact');

// Route config matching
router.isRouteMatched(targetRoute, 'route');
```

### resolveLink()

- **Parameters**:
  - `props: RouterLinkProps` — Link configuration properties
- **Returns**: `RouterLinkResolved`

Resolves router link configuration and returns complete link data including attributes, active states, and navigation handlers. See the [RouterLink API](./router-link.md) for details.

```ts
const linkData = router.resolveLink({
    to: '/user/123',
    type: 'push'
});

console.log(linkData.attributes.href);
console.log(linkData.isActive);
```

### beforeEach()

- **Parameters**:
  - `guard: RouteConfirmHook` — Navigation guard function
- **Returns**: `() => void` — Unregister function

Registers a global before-each navigation guard. See [Navigation Guards](./navigation-guards.md) for details.

```ts
const unregister = router.beforeEach((to, from, router) => {
    if (to.meta.requiresAuth && !isLoggedIn()) {
        return '/login';
    }
});

// Later, remove the guard
unregister();
```

### afterEach()

- **Parameters**:
  - `guard: RouteNotifyHook` — Notification hook function
- **Returns**: `() => void` — Unregister function

Registers a global after-each navigation hook. Unlike guards, after-each hooks cannot cancel or redirect navigation.

```ts
const unregister = router.afterEach((to, from, router) => {
    document.title = to.meta.title || 'My App';
});
```

### createLayer()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location for the layer
- **Returns**: `Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

Creates a layer routing instance. Layers provide isolated navigation within an overlay. See [Layer Routing](./layer.md) for details.

```ts
const { promise, router: layerRouter } = await router.createLayer('/dialog');

const result = await promise;
if (result.type === 'success') {
    console.log('Layer returned data:', result.data);
}
```

### pushLayer()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<RouteLayerResult>`

Navigates to a route as a layer and returns the layer result.

```ts
const result = await router.pushLayer({
    path: '/select-user',
    layer: { autoPush: true }
});
```

### closeLayer()

- **Parameters**:
  - `data?: any` — Optional data to return to the parent router
- **Returns**: `void`

Closes the current layer router. Only effective if the router is a layer instance.

```ts
// Close without data
router.closeLayer();

// Close with return data
router.closeLayer({ selectedUserId: 42 });
```

### renderToString()

- **Parameters**:
  - `throwError?: boolean` — Whether to throw errors instead of catching them (default: `false`)
- **Returns**: `Promise<string | null>`

Renders the current route's micro-app to an HTML string for server-side rendering. Returns `null` if no micro-app is mounted or if rendering fails (when `throwError` is `false`).

```ts
// SSR usage
const router = new Router({
    mode: RouterMode.memory,
    base: new URL(req.url, `http://${req.headers.host}`),
    routes,
    apps: (router) => ({
        mount(el) { /* ... */ },
        unmount(el) { /* ... */ },
        async renderToString() {
            const { renderToString } = await import('react-dom/server');
            return renderToString(createElement(App, { router }));
        }
    })
});

await router.push(req.url);
const html = await router.renderToString();
// html contains the rendered HTML string

// With error propagation
try {
    const html = await router.renderToString(true);
} catch (e) {
    console.error('SSR render failed:', e);
}
```

### destroy()

- **Returns**: `void`

Destroys the router instance, cleaning up all resources including navigation listeners, transitions, and micro-app instances.

```ts
router.destroy();
```
