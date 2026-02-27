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

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| options | [`RouterOptions`](#routeroptions) | Router configuration object |

#### Example

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

## RouterOptions {#routeroptions}

Options to initialize a Router instance.

### root {#root}

```ts
optional root: string | HTMLElement;
```

The DOM element or CSS selector where micro-apps are mounted. Supports ID, class, or attribute selectors.

#### Default Value

`'#root'`

#### Example

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

### mode {#mode}

```ts
optional mode: RouterMode;
```

History mode used by the router.

| Mode | Description | Use Case |
|------|-------------|----------|
| `RouterMode.history` | Uses browser History API (`pushState`/`popState`) | Production apps with server support |
| `RouterMode.memory` | In-memory history stack, no URL changes | SSR, testing, layers |

#### Default Value

`RouterMode.history`

### routes {#routes}

```ts
optional routes: RouteConfig[];
```

Initial list of routes that should be added to the router. See [Route Config](./route-config) for full details.

#### Default Value

`[]`

### base {#base}

```ts
optional base: URL;
```

Base URL for route resolution. Optional in the browser (defaults to `window.location`), **required** on the server side.

#### Example

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

### apps {#apps}

```ts
optional apps: RouterMicroApp;
```

Micro-app factory functions. Maps string keys to factory functions that create micro-app lifecycle handlers. See [MicroApp](./micro-app) for details.

#### Example

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

### context {#context}

```ts
optional context: Record<string | symbol, unknown>;
```

Shared context object accessible from all routes via `router.context`. Useful for dependency injection (services, stores, etc.).

#### Default Value

`{}`

### data {#data}

```ts
optional data: Record<string | symbol, unknown>;
```

Shared data object accessible via `router.data`. Similar to `context` but intended for mutable shared state.

#### Default Value

`{}`

### req {#req-option}

```ts
optional req: IncomingMessage | null;
```

Node.js HTTP request object. Used during server-side rendering to access request headers, URL, etc.

### res {#res-option}

```ts
optional res: ServerResponse | null;
```

Node.js HTTP response object. Used during server-side rendering to set status codes, headers, etc.

### normalizeURL {#normalizeurl}

```ts
optional normalizeURL: (to: URL, from: URL | null) => URL;
```

URL normalization function called before route matching. Useful for removing trailing slashes, forcing lowercase paths, or other URL transformations.

#### Example

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

### fallback {#fallback}

```ts
optional fallback: RouteHandleHook;
```

Called when no route matches the target URL, or for `pushWindow`/`replaceWindow` navigation types. Use this to handle 404 pages or external navigation.

#### Example

```ts
new Router({
  fallback: (to, from, router) => {
    console.log('No route matched:', to.path);
    // You could redirect to a 404 page
  }
});
```

### nextTick {#nexttick}

```ts
optional nextTick: () => Awaitable<void>;
```

Custom `nextTick` implementation called after route transition confirms. Useful for framework-specific DOM update timing (e.g., Vue's `nextTick`).

### rootStyle {#rootstyle}

```ts
optional rootStyle: Partial<CSSStyleDeclaration> | false | null;
```

CSS styles applied to the root element when creating layer routers. Set to `false` or `null` to disable automatic styling.

### layer {#layer-option}

```ts
optional layer: boolean;
```

Internal. Whether this router instance operates as a layer (overlay/modal) router. Set automatically by [`createLayer()`](#createlayer).

### zIndex {#zindex}

```ts
optional zIndex: number;
```

Base z-index value for layer overlays. Layers auto-increment from this value.

#### Default Value

`1000`

### handleBackBoundary {#handlebackboundary}

```ts
optional handleBackBoundary: (router: Router) => void;
```

Called when `back()` is invoked at the beginning of the history stack (no more history to go back to). Useful for closing the app or navigating to a parent context.

### handleLayerClose {#handlelayerclose}

```ts
optional handleLayerClose: (router: Router, data?: any) => void;
```

Internal. Called when a layer router is closed. Set automatically by [`createLayer()`](#createlayer).

## Properties

### route {#route}

```ts
readonly route: Route;
```

The current active [Route](./route). Throws an error if accessed before the first navigation.

#### Example

```ts
console.log(router.route.path);    // '/about'
console.log(router.route.params);  // { id: '123' }
console.log(router.route.query);   // { page: '1' }
```

### options {#options}

```ts
readonly options: RouterOptions;
```

The original options passed to the Router constructor.

### parsedOptions {#parsedoptions}

```ts
readonly parsedOptions: RouterParsedOptions;
```

Parsed and compiled options, including `compiledRoutes` (route configs with compiled matchers) and `matcher` function.

### isLayer {#islayer}

```ts
readonly isLayer: boolean;
```

Whether this router instance is a layer (overlay/modal) router created via [`createLayer()`](#createlayer).

### navigation {#navigation}

```ts
readonly navigation: Navigation;
```

The internal navigation controller managing the history stack (browser History API or MemoryHistory).

### microApp {#microapp}

```ts
readonly microApp: MicroApp;
```

The internal micro-app lifecycle manager handling mount/unmount transitions between micro-apps.

### mode {#mode-prop}

```ts
readonly mode: RouterMode;
```

The current router mode (`'history'` or `'memory'`).

### base {#base-prop}

```ts
readonly base: URL;
```

The base URL used for route resolution.

### root {#root-prop}

```ts
readonly root: HTMLElement;
```

The root DOM element where micro-apps are mounted.

### context {#context-prop}

```ts
readonly context: Record<string | symbol, unknown>;
```

The shared context object provided via [`RouterOptions.context`](#context).

### data {#data-prop}

```ts
readonly data: Record<string | symbol, unknown>;
```

The shared data object provided via [`RouterOptions.data`](#data).

### req {#req}

```ts
readonly req: IncomingMessage | null;
```

The HTTP request object (SSR only). `null` in the browser.

### res {#res}

```ts
readonly res: ServerResponse | null;
```

The HTTP response object (SSR only). `null` in the browser.

## Methods

### push {#push}

```ts
push(to: RouteLocationInput): Promise<Route>;
```

Programmatically navigate to a new URL by pushing an entry in the history stack.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to navigate to |

#### Returns

`Promise<Route>` — Resolves to the target [Route](./route) after the full [navigation guard pipeline](./navigation-guards) completes.

#### Example

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

### replace {#replace}

```ts
replace(to: RouteLocationInput): Promise<Route>;
```

Programmatically navigate to a new URL by replacing the current entry in the history stack. Unlike `push`, this does not create a new history entry — pressing the back button will not return to the current page.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to navigate to |

#### Returns

`Promise<Route>`

#### Example

```ts
// Replace after login (prevents back-to-login)
await router.replace('/dashboard');
```

### back {#back}

```ts
back(): Promise<Route | null>;
```

Go back one step in history if possible by calling `navigation.back()`. Equivalent to `router.go(-1)`. If at the beginning of the history stack, calls [`handleBackBoundary`](#handlebackboundary).

#### Returns

`Promise<Route | null>` — Returns `null` if navigation didn't happen.

### forward {#forward}

```ts
forward(): Promise<Route | null>;
```

Go forward one step in history if possible. Equivalent to `router.go(1)`.

#### Returns

`Promise<Route | null>` — Returns `null` if navigation didn't happen.

### go {#go}

```ts
go(index: number): Promise<Route | null>;
```

Navigate to a specific position relative to the current page in the history stack. `go(0)` returns `null` (no-op). Negative values go back, positive values go forward.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| index | `number` | Position in the history relative to the current page |

#### Returns

`Promise<Route | null>`

#### Example

```ts
await router.go(-2); // Go back 2 steps
await router.go(1);  // Go forward 1 step
```

### pushWindow {#pushwindow}

```ts
pushWindow(to: RouteLocationInput): Promise<Route>;
```

Navigate to a route intended for a new window/tab context. Triggers the [`fallback`](#fallback) handler instead of performing in-page navigation.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to navigate to |

#### Returns

`Promise<Route>`

### replaceWindow {#replacewindow}

```ts
replaceWindow(to: RouteLocationInput): Promise<Route>;
```

Navigate to a route intended for replacing the current window context. Triggers the [`fallback`](#fallback) handler.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to navigate to |

#### Returns

`Promise<Route>`

### restartApp {#restartapp}

```ts
restartApp(to?: RouteLocationInput): Promise<Route>;
```

Force-restart the current micro-app. Performs a full unmount → mount cycle even if the app key hasn't changed. If `to` is not provided, restarts at the current route.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Optional route location (defaults to current route) |

#### Returns

`Promise<Route>`

#### Example

```ts
// Restart at current route
await router.restartApp();

// Restart at a different route
await router.restartApp('/dashboard');
```

### resolve {#resolve}

```ts
resolve(to: RouteLocationInput, toType?: RouteType): Route;
```

Returns the [Route](./route) for a given location without performing navigation. Useful for generating URLs, pre-checking matches, or getting route metadata.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Target route location |
| toType | `RouteType` | Optional route type |

#### Returns

[`Route`](./route) — The resolved route object.

#### Example

```ts
const route = router.resolve('/user/123');
console.log(route.url.href);     // Full URL
console.log(route.params);       // { id: '123' }
console.log(route.matched);      // Matched route configs
```

### isRouteMatched {#isroutematched}

```ts
isRouteMatched(toRoute: Route, matchType?: RouteMatchType): boolean;
```

Check if a route matches the current route.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| toRoute | `Route` | Route to compare against the current route |
| matchType | `RouteMatchType` | Match strategy (default: `'include'`) |

| Match Type | Description |
|------------|-------------|
| `'route'` | Same route configuration (same `RouteConfig` reference) |
| `'exact'` | Exact path match |
| `'include'` | Current path starts with target path |

#### Returns

`boolean`

#### Example

```ts
const aboutRoute = router.resolve('/about');

router.isRouteMatched(aboutRoute, 'exact');   // true if at /about
router.isRouteMatched(aboutRoute, 'include'); // true if at /about or /about/team
```

### beforeEach {#beforeeach}

```ts
beforeEach(guard: RouteConfirmHook): () => void;
```

Add a navigation guard that executes before any navigation. Returns a function that removes the registered guard.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| guard | [`RouteConfirmHook`](./types#routeconfirmhook) | Navigation guard to add |

#### Returns

A function that removes the registered guard.

#### Example

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

### afterEach {#aftereach}

```ts
afterEach(guard: RouteNotifyHook): () => void;
```

Add a navigation hook that is executed after every navigation. Returns a function that removes the registered hook. Cannot modify navigation.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| guard | [`RouteNotifyHook`](./types#routenotifyhook) | Navigation hook to add |

#### Returns

A function that removes the registered hook.

#### Example

```ts
router.afterEach((to, from, router) => {
  document.title = to.meta.title || 'My App';
  analytics.trackPageView(to.path);
});
```

See [Navigation Guards](./navigation-guards) for full details on guard types and the navigation pipeline.

### resolveLink {#resolvelink}

```ts
resolveLink(props: RouterLinkProps): RouterLinkResolved;
```

Resolve a router link configuration into complete link data including HTML attributes, active states, and event handlers. Used to build framework-specific link components.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| props | [`RouterLinkProps`](./types#routerlinkprops) | Link configuration |

#### Returns

[`RouterLinkResolved`](./types#routerlinkresolved) — Complete link data.

See [RouterLink](./router-link) for full details and framework examples.

### createLayer {#createlayer}

```ts
createLayer(to: RouteLocationInput): Promise<{
  promise: Promise<RouteLayerResult>;
  router: Router;
}>;
```

Create a layer (overlay/modal) router with its own navigation stack. Returns both the layer router instance and a promise that resolves when the layer closes.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to open in the layer |

#### Returns

An object with:
- `router` — The layer Router instance
- `promise` — A `Promise<RouteLayerResult>` that resolves when the layer closes

See [Layer System](./layer) for full details.

### pushLayer {#pushlayer}

```ts
pushLayer(to: RouteLocationInput): Promise<RouteLayerResult>;
```

Shorthand for creating a layer and waiting for its result. Combines `createLayer()` into a single call.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Route location to open in the layer |

#### Returns

`Promise<RouteLayerResult>` — Resolves when the layer closes.

#### Example

```ts
const result = await router.pushLayer('/modal/confirm');

if (result.type === 'success') {
  console.log('User confirmed:', result.data);
} else if (result.type === 'close') {
  console.log('User dismissed');
}
```

### closeLayer {#closelayer}

```ts
closeLayer(data?: any): void;
```

Close the current layer router. Only works when `router.isLayer` is `true`.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| data | `any` | Optional data to return to the parent router. When provided, the layer result type is `'success'` |

### renderToString {#rendertostring}

```ts
renderToString(throwError?: boolean): Promise<string | null>;
```

Render the current micro-app to an HTML string for server-side rendering. Calls the matched micro-app's `renderToString()` method.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| throwError | `boolean` | If `true`, throws errors instead of logging them (default: `false`) |

#### Returns

`Promise<string | null>` — The rendered HTML string, or `null` if no micro-app is mounted.

#### Example

```ts
// Server-side rendering
await router.push(req.url);
const html = await router.renderToString();
```

### destroy {#destroy}

```ts
destroy(): void;
```

Destroy the router instance, cleaning up all event listeners, navigation guards, history state, and micro-app instances. Call this when you no longer need the router.

```ts
router.destroy();
```
