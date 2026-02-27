---
titleSuffix: "MicroApp API Reference"
description: "Complete guide to @esmx/router MicroApp system — framework-agnostic micro-frontend lifecycle management with mount, unmount, and SSR support."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx micro-app, micro-frontend, mount unmount, renderToString, SSR micro-app, framework-agnostic"
---

# MicroApp

The MicroApp system is how `@esmx/router` manages framework-agnostic micro-frontends. Each micro-app provides three lifecycle methods: `mount`, `unmount`, and optionally `renderToString`. The router handles transitions between micro-apps during navigation.

## RouterMicroAppOptions {#routermicroappoptions}

The interface every micro-app must implement.

```ts
interface RouterMicroAppOptions {
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  renderToString?: () => Awaitable<string>;
}
```

### mount {#mount}

```ts
mount: (el: HTMLElement) => void;
```

Mount the application into the given DOM element. Called when the router navigates to a route bound to this micro-app.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| el | `HTMLElement` | The DOM element to mount into (from [`RouterOptions.root`](./router#root)) |

### unmount {#unmount}

```ts
unmount: () => void;
```

Clean up and destroy the application. Called when navigating away to a route bound to a different micro-app.

### renderToString {#rendertostring}

```ts
optional renderToString: () => Awaitable<string>;
```

Return the SSR HTML string for the current state of the application. Called by [`router.renderToString()`](./router#rendertostring) during server-side rendering.

## RouterMicroAppCallback {#routermicroappcallback}

A factory function that creates a micro-app, receiving the router instance.

```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

## RouterMicroApp {#routermicroapp}

The `apps` option in [`RouterOptions`](./router#apps) accepts either a map of named factories or a single factory.

```ts
type RouterMicroApp =
  | Record<string, RouterMicroAppCallback | undefined>
  | RouterMicroAppCallback;
```

## Usage

### Registering Micro-Apps {#registering}

Micro-apps are registered via the `apps` option on the Router and referenced by the `app` property in [route configs](./route-config#app):

```ts
const router = new Router({
  root: '#app',
  routes: [
    {
      path: '/react',
      app: 'react',
      children: [
        { path: '', component: ReactHome },
        { path: 'about', component: ReactAbout }
      ]
    },
    {
      path: '/vue',
      app: 'vue',
      children: [
        { path: '', component: VueHome }
      ]
    }
  ],
  apps: {
    react: (router) => createReactApp(router),
    vue: (router) => createVueApp(router)
  }
});
```

### React Example {#react-example}

```ts
import * as ReactDOM from 'react-dom/client';
import * as ReactDOMServer from 'react-dom/server';

function createReactApp(router: Router): RouterMicroAppOptions {
  let root: ReactDOM.Root | null = null;

  return {
    mount(el: HTMLElement) {
      root = ReactDOM.createRoot(el);
      root.render(<App router={router} />);
    },
    unmount() {
      root?.unmount();
      root = null;
    },
    async renderToString() {
      return ReactDOMServer.renderToString(<App router={router} />);
    }
  };
}
```

### Vue 3 Example {#vue3-example}

```ts
import { createApp, createSSRApp } from 'vue';
import { renderToString as vueRenderToString } from 'vue/server-renderer';

function createVueApp(router: Router): RouterMicroAppOptions {
  let app: VueApp | null = null;

  return {
    mount(el: HTMLElement) {
      app = createApp(App);
      app.provide('router', router);
      app.mount(el);
    },
    unmount() {
      app?.unmount();
      app = null;
    },
    async renderToString() {
      const ssrApp = createSSRApp(App);
      ssrApp.provide('router', router);
      return await vueRenderToString(ssrApp);
    }
  };
}
```

## Lifecycle

### App Selection {#app-selection}

When a route is matched, the router determines which micro-app to use:

1. The **first** matched route config with an `app` property is used
2. If `app` is a `string`, it's looked up in `router.options.apps`
3. If `app` is a function, it's called directly as the factory

### App Transition {#app-transition}

When navigating between routes with **different** `app` values:

```
1. New app factory is called → creates new RouterMicroAppOptions
2. new app.mount(rootElement) → mount into DOM
3. old app.unmount() → clean up previous app
```

When navigating within the **same** app (e.g., `/react` → `/react/about`):
- No mount/unmount occurs
- The app handles internal routing via its own component system

### Force Restart {#force-restart}

[`router.restartApp()`](./router#restartapp) forces a full unmount → mount cycle even if the app key hasn't changed.

## SSR Flow {#ssr-flow}

During server-side rendering:

```ts
// 1. Create router with request context
const router = new Router({
  base: new URL(`http://localhost${req.url}`),
  mode: RouterMode.memory,
  req,
  res,
  routes,
  apps
});

// 2. Navigate to the requested URL
await router.push(req.url);

// 3. Render the micro-app to HTML
const html = await router.renderToString();
// → Calls the matched micro-app's renderToString()
```

## Root Element {#root-element}

The [`root`](./router#root) option in `RouterOptions` determines where micro-apps are mounted:

- If the element exists in the DOM, it's reused
- If it doesn't exist, a `<div>` is created and appended to `document.body`
- [Layer](./layer) routers create their own root elements with overlay styling
