---
titleSuffix: "Introduction to @esmx/router"
description: "A comprehensive introduction to @esmx/router — a framework-agnostic router for micro-frontend applications with SSR support, navigation guards, layer routing, and micro-app orchestration."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router, micro-frontend router, SSR router, framework-agnostic router, navigation guards, layer routing, micro-app routing"
---

# Introduction

`@esmx/router` is a framework-agnostic router built for modern micro-frontend applications. Unlike traditional routers that bind to a single framework, `@esmx/router` works with React, Vue 2, Vue 3, vanilla JavaScript, or any combination of them — all within the same application.

## Why @esmx/router?

Modern web applications face challenges that traditional routers were not designed to solve:

- **Multiple frameworks in one app**: A large organization may have teams using React, Vue 2, and Vue 3. They need one router that governs navigation across all of them.
- **Server-side rendering (SSR) that works everywhere**: The same route configuration should produce server-rendered HTML and then hydrate seamlessly on the client — regardless of which framework renders each route.
- **Overlaying content without destroying state**: Modal dialogs, drawers, and slide-in panels need their own isolated routing context while the parent page continues running behind them.
- **Gradual migration**: Moving from one framework to another should happen route by route, not all at once.

`@esmx/router` was built from the ground up to address all of these.

## Core Concepts

### Framework-Agnostic by Design

The router does not import React, Vue, or any other framework. Instead, routes declare a **micro-app factory** — a function that knows how to mount and unmount a specific framework's component tree into a DOM element:

```ts
const router = new Router({
  routes: [
    {
      path: '/',
      app: 'react-app',       // mount the React micro-app
      component: HomePage
    },
    {
      path: '/dashboard',
      app: 'vue3-app',        // mount the Vue 3 micro-app
      component: DashboardPage
    }
  ],
  apps: {
    'react-app': () => ({
      mount(el, component) { /* ReactDOM.render(...) */ },
      unmount(el) { /* ReactDOM.unmountComponentAtNode(...) */ }
    }),
    'vue3-app': () => ({
      mount(el, component) { /* createApp(component).mount(el) */ },
      unmount(el) { /* app.unmount() */ }
    })
  }
});
```

When the user navigates from `/` to `/dashboard`, the router unmounts the React app, mounts the Vue 3 app, and renders the correct component — all without a full page reload.

### Routing Modes

The router supports two modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `history` | Uses the browser's History API (`pushState`, `popstate`) | Standard web applications |
| `memory` | Keeps routing state entirely in memory, no URL changes | SSR, layer routing, testing |

```ts
import { Router, RouterMode } from '@esmx/router';

// Browser mode (default)
const router = new Router({
  mode: RouterMode.history,
  routes: [/* ... */]
});

// Memory mode (SSR or layer)
const ssrRouter = new Router({
  mode: RouterMode.memory,
  base: new URL('https://example.com/current-page'),
  routes: [/* ... */]
});
```

### Server-Side Rendering (SSR)

The router has first-class SSR support. The same route configuration works on both server and client:

```ts
// Server side (Node.js)
const router = new Router({
  mode: RouterMode.memory,
  base: new URL(req.url, `http://${req.headers.host}`),
  req,
  res,
  routes: [/* ... */]
});

// renderToString() walks the route tree and produces HTML
const html = await router.renderToString();
```

On the server, routes are matched against the incoming request URL. The correct micro-app's `renderToString` method is called, producing HTML that can be sent to the client. On the client, the same router configuration hydrates the rendered content.

### Route Configuration

Routes are defined as a tree of `RouteConfig` objects. Each route can have children (nested routes), guards, redirects, lazy-loaded components, and micro-app bindings:

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'about', component: About },
      {
        path: 'users/:id',
        asyncComponent: () => import('./UserProfile'),
        beforeEnter(to, from, router) {
          if (!isLoggedIn()) return '/login';
        }
      }
    ]
  },
  {
    path: '/admin',
    app: 'admin-app',  // different micro-app
    component: AdminLayout,
    children: [
      { path: '', component: AdminHome },
      { path: 'settings', component: AdminSettings }
    ]
  }
];
```

Key features of route configuration:

- **Dynamic parameters**: `/users/:id` extracts `id` from the URL
- **Nested routes**: Children inherit the parent's path prefix and component tree
- **Async components**: Load components on demand with `asyncComponent`
- **Redirects**: Send users to a different route with `redirect`
- **Per-route guards**: `beforeEnter`, `beforeUpdate`, `beforeLeave`
- **Micro-app binding**: Different routes can mount different framework applications
- **Layer routes**: Routes marked with `layer: true` only activate inside a layer context

### Navigation

The router provides several navigation methods, each with different behavior:

```ts
// Client-side navigation (SPA — no full page reload)
await router.push('/about');
await router.replace('/about');

// Full page navigation (triggers a browser navigation)
await router.pushWindow('/external-page');
await router.replaceWindow('/external-page');

// History navigation
await router.back();
await router.forward();
await router.go(-2);

// Restart the current micro-app
await router.restartApp();
```

The difference between `push`/`replace` and `pushWindow`/`replaceWindow` is critical in micro-frontend applications: SPA navigation keeps the host app running and only swaps the routed content, while window navigation triggers a full browser navigation — useful when navigating to a page outside the current micro-frontend's scope.

### Navigation Guards

Guards allow you to intercept navigation and control whether it should proceed, redirect, or be cancelled:

```ts
// Global guard — runs for every navigation
router.beforeEach((to, from, router) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';  // redirect
  }
  // return void to allow navigation
});

// After each navigation (notification only — cannot block)
router.afterEach((to, from, router) => {
  analytics.trackPageView(to.path);
});
```

The full navigation pipeline, in order:

1. **`override`** — Route-level override for hybrid app scenarios
2. **`asyncComponent`** — Lazy load the target component
3. **`beforeLeave`** — Guard on the route being left
4. **`beforeEnter`** — Guard on the route being entered (new route only)
5. **`beforeUpdate`** — Guard on the route being updated (same route, different params)
6. **`beforeEach`** — Global guard
7. **Navigation confirmed** → DOM updates, micro-app mount/unmount
8. **`afterEach`** — Global notification hook

Guards can return:
- `void` / `undefined` — allow navigation
- `false` — cancel navigation
- A route location string or object — redirect
- A `RouteHandleHook` function — execute custom logic before proceeding

### Layer Routing

Layers are isolated routing contexts that render on top of the main page — think modals, drawers, or slide-in panels, but with their own full routing support:

```ts
// Open a layer with its own route tree
const result = await router.createLayer({
  routes: [
    { path: '/', component: ModalContent },
    { path: '/step-2', component: ModalStep2 }
  ],
  rootStyle: {
    position: 'fixed',
    inset: '0',
    zIndex: '1000',
    background: 'rgba(0,0,0,0.5)'
  }
});

// result.data contains any data passed to closeLayer()
console.log(result.data);
```

Inside the layer, you can navigate freely (`push`, `replace`, `back`) without affecting the parent page's route. When `closeLayer(data)` is called, the layer's DOM is removed and the promise resolves with the passed data.

For simpler cases, `pushLayer` opens a layer from the current route configuration (routes marked with `layer: true`):

```ts
const result = await router.pushLayer('/confirm-dialog');
```

### RouterLink

`RouterLink` is a framework-agnostic utility for generating navigation links. Instead of providing a React or Vue component, it provides a `resolveLink` function that returns everything needed to render a link in any framework:

```ts
const resolved = router.resolveLink({
  to: '/about',
  activeClass: 'nav-active',
  exact: 'route'
});

// resolved.attributes — { href, class, target?, rel? }
// resolved.isActive — whether the link matches the current route
// resolved.navigate — function to call on click
// resolved.createEventHandlers() — event handlers for the element
```

This approach means the router itself has zero framework dependencies, while framework-specific wrappers (like `@esmx/router-vue`) can use `resolveLink` to build their own `<RouterLink>` components.

### Micro-App Lifecycle

When the router navigates between routes that belong to different micro-apps, it manages a complete lifecycle:

1. **Unmount** the current micro-app (clean up DOM, event listeners, framework state)
2. **Mount** the new micro-app (initialize framework, render component)
3. **On SSR**: Call `renderToString` on the matched micro-app to produce HTML

Each micro-app registers three callbacks:

```ts
router.microApp.on('react-app', (router) => ({
  mount(rootEl, component, route) {
    // Called when this micro-app becomes active
    const root = createRoot(rootEl);
    root.render(createElement(component));
    return root;
  },
  unmount(rootEl, app) {
    // Called when navigating away from this micro-app
    app.unmount();
  },
  async renderToString(component, route) {
    // Called during SSR
    return ReactDOMServer.renderToString(createElement(component));
  }
}));
```

## Quick Start

### Installation

```bash
npm install @esmx/router
```

### Basic Setup

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/users/:id', component: UserPage },
    { path: '/contact', component: ContactPage }
  ]
});

// Navigate
await router.push('/about');

// Access current route
console.log(router.route.path);    // '/about'
console.log(router.route.params);  // {}
console.log(router.route.query);   // {}
```

### With Micro-Apps (Multi-Framework)

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes: [
    { path: '/', app: 'react', component: ReactHome },
    { path: '/admin', app: 'vue3', component: VueAdmin }
  ],
  apps: {
    react: () => ({
      mount(el, component) {
        const root = createRoot(el);
        root.render(createElement(component));
        return root;
      },
      unmount(el, root) { root.unmount(); }
    }),
    vue3: () => ({
      mount(el, component) {
        const app = createApp(component);
        app.mount(el);
        return app;
      },
      unmount(el, app) { app.unmount(); }
    })
  }
});
```

### With SSR

```ts
// entry.server.ts
export default async function render(req, res) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(req.url, `http://${req.headers.host}`),
    req,
    res,
    routes: [/* same routes as client */]
  });

  const html = await router.renderToString();

  res.end(`
    <html>
      <body>
        <div id="app">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
}
```

## Comparison with Other Routers

| Feature | @esmx/router | Vue Router | React Router |
|---------|-------------|------------|-------------|
| Framework-agnostic | ✅ | Vue only | React only |
| Multi-framework apps | ✅ | ❌ | ❌ |
| SSR support | ✅ Built-in | ✅ | ✅ |
| Navigation guards | ✅ Full pipeline | ✅ | Limited |
| Layer routing (modals) | ✅ Built-in | ❌ | ❌ |
| Micro-app lifecycle | ✅ | ❌ | ❌ |
| Memory mode | ✅ | ✅ | ✅ |
| Dynamic route matching | ✅ | ✅ | ✅ |
| Nested routes | ✅ | ✅ | ✅ |
| TypeScript | ✅ Full types | ✅ | ✅ |
